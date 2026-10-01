"""Supabase and database connection manager with graceful offline fallback."""

from typing import Dict, Any, Optional
from backend.app.config import settings
from backend.app.utils.logger import logger

_supabase_client = None


def get_supabase_client():
    """Retrieve or initialize the Supabase client.
    
    Returns:
        Client instance if configured, or None if credentials are missing or connection fails.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.info("Supabase credentials not configured. Running in offline/guest persistence mode.")
        return None

    try:
        from supabase import create_client, Client
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info(f"Supabase client initialized successfully for {settings.SUPABASE_URL}")
        return _supabase_client
    except Exception as exc:
        logger.warning(f"Failed to initialize Supabase client: {exc}. Falling back to offline mode.")
        return None


def get_db_status() -> Dict[str, Any]:
    """Check database connection state.
    
    Returns:
        Dict with status, provider, configured state, and message.
    """
    is_configured = bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
    if not is_configured:
        return {
            "connected": False,
            "status": "unconfigured",
            "provider": "supabase_postgresql",
            "message": "Supabase credentials not provided. Offline guest mode enabled.",
        }

    client = get_supabase_client()
    if client is None:
        return {
            "connected": False,
            "status": "connection_error",
            "provider": "supabase_postgresql",
            "message": "Could not connect to Supabase database.",
        }

    return {
        "connected": True,
        "status": "connected",
        "provider": "supabase_postgresql",
        "message": "Successfully connected to Supabase PostgreSQL database.",
    }
