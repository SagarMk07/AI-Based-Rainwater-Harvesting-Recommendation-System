"""Supabase and database connection manager with graceful offline fallback."""

from typing import Dict, Any, Optional
from backend.app.config import settings
from backend.app.utils.logger import logger

_supabase_client = None


def get_clean_supabase_url() -> str:
    """Return sanitized Supabase project URL without trailing /rest/v1 paths."""
    if not settings.SUPABASE_URL:
        return ""
    clean = settings.SUPABASE_URL.strip().rstrip('/')
    if clean.endswith('/rest/v1'):
        clean = clean[:-8].rstrip('/')
    return clean


def get_supabase_client():
    """Retrieve or initialize the Supabase client.
    
    Returns:
        Client instance if configured, or None if credentials are missing or connection fails.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    clean_url = get_clean_supabase_url()
    if not clean_url or not settings.SUPABASE_KEY:
        logger.info("Supabase credentials not configured. Running in offline/guest persistence mode.")
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(clean_url, settings.SUPABASE_KEY)
        logger.info(f"Supabase client initialized successfully for {clean_url}")
        return _supabase_client
    except Exception as exc:
        logger.warning(f"Failed to initialize Supabase client: {exc}. Falling back to offline mode.")
        return None


def get_db_status() -> Dict[str, Any]:
    """Check database connection state with actual probe.
    
    Returns:
        Dict with status, provider, configured state, and message.
    """
    clean_url = get_clean_supabase_url()
    is_configured = bool(clean_url and settings.SUPABASE_KEY)
    if not is_configured:
        return {
            "connected": False,
            "status": "unconfigured",
            "provider": "supabase_postgresql",
            "message": "Supabase credentials not provided. Durable local store active.",
        }

    client = get_supabase_client()
    if client is None:
        return {
            "connected": False,
            "status": "connection_error",
            "provider": "supabase_postgresql",
            "message": "Could not connect to Supabase database.",
        }

    # Perform active probe against schema cache
    try:
        client.table("analyses").select("id").limit(1).execute()
        return {
            "connected": True,
            "status": "connected",
            "provider": "supabase_postgresql",
            "message": "Successfully connected to Supabase PostgreSQL database.",
        }
    except Exception as exc:
        err_msg = str(exc)
        if "PGRST205" in err_msg or "schema cache" in err_msg:
            return {
                "connected": True,
                "status": "pending_migration",
                "provider": "supabase_postgresql",
                "message": "Supabase reachable. Analyses table pending migration; durable local store active.",
            }
        return {
            "connected": False,
            "status": "degraded",
            "provider": "supabase_postgresql",
            "message": f"Supabase connection degraded: {err_msg[:80]}. Durable local store active.",
        }
