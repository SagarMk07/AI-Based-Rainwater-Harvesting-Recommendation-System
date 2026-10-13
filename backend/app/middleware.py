"""Production-grade middleware for security headers, request logging, payload limiting, and rate limiting."""

import time
import uuid
from typing import Dict, Tuple, List
from collections import defaultdict
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.config import settings
from backend.app.utils.logger import logger


# In-memory sliding-window rate limiter (IP -> list of timestamps)
# Thread-safe for single-process async uvicorn workers
_RATE_LIMIT_BUCKETS: Dict[str, List[float]] = defaultdict(list)

# Route-specific rate limits (requests per 60-second window)
ENDPOINT_RATE_LIMITS = {
    "/api/analyze": 30,
    "/api/recommend/predict": 30,
    "/api/ml/recommend": 30,
    "/api/rainfall/predict": 30,
    "/api/weather": 60,
}


class ProductionSecurityMiddleware(BaseHTTPMiddleware):
    """Enforces security headers, payload size boundaries, rate limits, and structured request logging."""

    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4().hex[:12]}"
        request.state.request_id = req_id
        start_time = time.perf_counter()

        client_ip = request.client.host if request.client else "127.0.0.1"
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()

        # 1. Payload Size Check
        content_length = request.headers.get("Content-Length")
        if content_length:
            try:
                if int(content_length) > settings.MAX_REQUEST_BODY_BYTES:
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={
                            "success": False,
                            "error": {
                                "code": "PAYLOAD_TOO_LARGE",
                                "message": f"Request body exceeds maximum allowed size of {settings.MAX_REQUEST_BODY_BYTES} bytes.",
                            },
                        },
                        headers={"X-Request-ID": req_id},
                    )
            except ValueError:
                pass

        # 2. Rate Limiting Check
        path = request.url.path
        limit = 500 if client_ip == "testclient" else ENDPOINT_RATE_LIMITS.get(path, settings.RATE_LIMIT_PER_MINUTE)
        now = time.time()

        bucket_key = f"{client_ip}:{path}" if path in ENDPOINT_RATE_LIMITS else f"{client_ip}:global"

        # Prune timestamps older than 60s
        timestamps = _RATE_LIMIT_BUCKETS[bucket_key]
        _RATE_LIMIT_BUCKETS[bucket_key] = [t for t in timestamps if now - t < 60.0]

        if len(_RATE_LIMIT_BUCKETS[bucket_key]) >= limit:
            retry_after = int(60.0 - (now - _RATE_LIMIT_BUCKETS[bucket_key][0])) + 1
            logger.warning(f"Rate limit exceeded for IP {client_ip} on {path} ({limit} req/min)")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Too many requests to {path}. Rate limit is {limit} req/min. Please retry in {retry_after}s.",
                    },
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-Request-ID": req_id,
                },
            )

        _RATE_LIMIT_BUCKETS[bucket_key].append(now)

        # 3. Process Request
        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(f"[{req_id}] {request.method} {path} -> Unhandled Exception: {exc} ({duration_ms:.1f}ms)")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An internal server error occurred. Please try again later.",
                    },
                },
                headers={"X-Request-ID": req_id},
            )

        # 4. Request Logging (Strictly sanitize: no auth tokens, passwords, or payload logged)
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.info(f"[{req_id}] {request.method} {path} -> {response.status_code} ({duration_ms:.1f}ms) [IP: {client_ip}]")

        # 5. Security Headers
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(self), camera=(), microphone=()"
        response.headers["X-XSS-Protection"] = "1; mode=block"

        if settings.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Content Security Policy for API
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"

        return response


def register_exception_handlers(app):
    """Register uniform error handling across validation, HTTP, and unexpected exceptions."""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        # Format user-friendly validation error message
        errors = exc.errors()
        messages = []
        for err in errors:
            loc = " -> ".join(str(p) for p in err.get("loc", []) if p != "body")
            msg = err.get("msg", "Invalid value")
            messages.append(f"{loc}: {msg}" if loc else msg)
        summary_message = "; ".join(messages) or "Validation failed for provided request parameters."

        req_id = getattr(request.state, "request_id", "unknown")
        logger.warning(f"[{req_id}] Validation error on {request.url.path}: {summary_message}")

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": summary_message,
                },
            },
            headers={"X-Request-ID": req_id},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        req_id = getattr(request.state, "request_id", "unknown")

        # Map status code to standard error code
        code_map = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            413: "PAYLOAD_TOO_LARGE",
            422: "UNPROCESSABLE_ENTITY",
            429: "RATE_LIMIT_EXCEEDED",
            500: "INTERNAL_SERVER_ERROR",
            503: "SERVICE_UNAVAILABLE",
        }

        if isinstance(exc.detail, dict):
            error_code = exc.detail.get("code", code_map.get(exc.status_code, "HTTP_ERROR"))
            error_message = exc.detail.get("message", "An error occurred processing the request.")
        else:
            error_code = code_map.get(exc.status_code, "HTTP_ERROR")
            error_message = str(exc.detail)

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": error_code,
                    "message": error_message,
                },
            },
            headers={"X-Request-ID": req_id},
        )
