"""Durable repository for Hydrological Analyses with multi-tier persistence.

Provides:
1. File-backed durable local storage (persisting across server restarts).
2. Live Supabase PostgreSQL synchronization when configured.
3. Server-side pagination, newest-first sorting, and query limiting.
4. Strict cross-user isolation and guest session boundaries.
5. Full immutable result snapshot storage for zero-recalculation reopening.
"""

import os
import json
import threading
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel

from backend.app.schemas.analysis import AnalysisResponse, AnalysisRequest
from backend.app.database.connection import get_supabase_client
from backend.app.utils.logger import logger
from backend.app.config import settings


class AnalysisRecord:
    """Container tracking analysis data, owner user ID, guest state, and input snapshot."""
    def __init__(
        self,
        analysis: AnalysisResponse,
        user_id: Optional[str] = None,
        is_guest: bool = False,
        input_snapshot: Optional[Dict[str, Any]] = None,
        status: str = "completed",
        remote_id: Optional[str] = None,
    ):
        self.analysis = analysis
        self.user_id = user_id
        self.is_guest = is_guest
        self.input_snapshot = input_snapshot or {}
        self.status = status
        self.remote_id = remote_id

    def to_dict(self) -> Dict[str, Any]:
        return {
            "request_id": self.analysis.request_id,
            "timestamp": self.analysis.timestamp,
            "user_id": self.user_id,
            "is_guest": self.is_guest,
            "status": self.status,
            "remote_id": self.remote_id,
            "input_snapshot": self.input_snapshot,
            "result_snapshot": self.analysis.model_dump(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AnalysisRecord":
        result_snapshot = data.get("result_snapshot") or data
        analysis_obj = AnalysisResponse.model_validate(result_snapshot)
        input_snap = data.get("input_snapshot") or {}
        if not analysis_obj.input_snapshot and input_snap:
            analysis_obj.input_snapshot = input_snap
        return cls(
            analysis=analysis_obj,
            user_id=data.get("user_id"),
            is_guest=data.get("is_guest", False),
            input_snapshot=input_snap,
            status=data.get("status", "completed"),
            remote_id=data.get("remote_id"),
        )


class AnalysisRepository:
    """Thread-safe persistent repository managing analyses storage."""

    def __init__(self, storage_path: Optional[str] = None):
        self._lock = threading.RLock()
        self._cache: Dict[str, AnalysisRecord] = {}

        if storage_path:
            self._storage_path = storage_path
        else:
            base_dir = settings.BASE_DIR
            data_dir = os.path.join(base_dir, "data", "processed")
            os.makedirs(data_dir, exist_ok=True)
            self._storage_path = os.path.join(data_dir, "analyses_store.json")

        self._load_from_disk()

    def _load_from_disk(self) -> None:
        """Load persisted analyses from local durable file store on initialization."""
        with self._lock:
            if not os.path.exists(self._storage_path):
                return
            try:
                with open(self._storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        for item in data:
                            try:
                                rec = AnalysisRecord.from_dict(item)
                                self._cache[rec.analysis.request_id] = rec
                            except Exception as parse_err:
                                logger.debug(f"Skipping malformed analysis entry: {parse_err}")
                logger.info(f"Loaded {len(self._cache)} persisted analyses from {self._storage_path}")
            except Exception as e:
                logger.warning(f"Could not load local analyses store: {e}")

    def _flush_to_disk(self) -> None:
        """Flush in-memory analyses to disk store atomically."""
        with self._lock:
            try:
                records = [rec.to_dict() for rec in self._cache.values()]
                temp_path = f"{self._storage_path}.tmp"
                with open(temp_path, "w", encoding="utf-8") as f:
                    json.dump(records, f, indent=2, ensure_ascii=False)
                os.replace(temp_path, self._storage_path)
            except Exception as e:
                logger.warning(f"Could not flush analyses to disk store: {e}")

    def save(
        self,
        analysis: AnalysisResponse,
        user_id: Optional[str] = None,
        is_guest: bool = False,
        input_payload: Optional[AnalysisRequest] = None,
    ) -> AnalysisRecord:
        """Persist a completed analysis to memory cache, durable local storage, and Supabase."""
        with self._lock:
            input_dict = input_payload.model_dump() if input_payload else {}
            if not analysis.input_snapshot and input_dict:
                analysis.input_snapshot = input_dict
            record = AnalysisRecord(
                analysis=analysis,
                user_id=user_id,
                is_guest=is_guest,
                input_snapshot=input_dict,
                status="completed",
            )
            self._cache[analysis.request_id] = record
            self._flush_to_disk()

        # Synchronize with Supabase if configured and reachable
        sb_client = get_supabase_client()
        if sb_client is not None:
            try:
                rec_model = analysis.recommendation
                sb_payload = {
                    "id": analysis.request_id if len(analysis.request_id) == 36 and "-" in analysis.request_id else None,
                    "user_id": user_id,
                    "city": analysis.weather.city,
                    "annual_rainfall_mm": analysis.weather.annual_rainfall_mm,
                    "gross_harvest_litres": rec_model.annual_gross_harvest_litres,
                    "collectable_litres": rec_model.annual_collectable_litres,
                    "usable_litres": rec_model.annual_usable_litres,
                    "demand_met_percentage": rec_model.water_savings_percentage,
                    "optimal_tank_capacity_litres": rec_model.optimal_tank_capacity_litres,
                    "recommended_system": rec_model.system_type.value,
                    "total_estimated_cost_inr": rec_model.total_estimated_cost_inr,
                    "payback_years": rec_model.payback_years or 0.0,
                    "water_balance_breakdown": analysis.water_balance.model_dump(),
                    "explainability_rationale": analysis.explainability.model_dump(),
                    "is_offline_guest": is_guest,
                    "model_version": analysis.model_version or "2.0.0",
                }
                # Remove None id so database generates gen_random_uuid() if request_id is not a UUID
                if sb_payload["id"] is None:
                    del sb_payload["id"]

                insert_res = sb_client.table("analyses").insert(sb_payload).execute()
                if insert_res.data and len(insert_res.data) > 0:
                    remote_uuid = insert_res.data[0].get("id")
                    if remote_uuid:
                        with self._lock:
                            record.remote_id = str(remote_uuid)
                            self._flush_to_disk()
                logger.info(f"Persisted analysis {analysis.request_id} to Supabase successfully.")
            except Exception as sb_err:
                logger.debug(f"Supabase sync note for {analysis.request_id}: {sb_err}")

        return record

    def get_by_id(self, analysis_id: str) -> Optional[AnalysisRecord]:
        """Retrieve an analysis record by unique request ID."""
        with self._lock:
            # 1. Check in-memory cache
            if analysis_id in self._cache:
                return self._cache[analysis_id]

        # 2. Check Supabase if connected
        sb_client = get_supabase_client()
        if sb_client is not None:
            try:
                res = sb_client.table("analyses").select("*").eq("id", analysis_id).limit(1).execute()
                if res.data and len(res.data) > 0:
                    row = res.data[0]
                    # If full result snapshot exists
                    if row.get("result_snapshot"):
                        rec = AnalysisRecord.from_dict(row)
                        with self._lock:
                            self._cache[rec.analysis.request_id] = rec
                        return rec
            except Exception as e:
                logger.debug(f"Supabase lookup exception: {e}")

        return None

    def list_analyses(
        self,
        user_id: Optional[str] = None,
        is_guest: bool = False,
        limit: Optional[int] = None,
        page: Optional[int] = None,
        page_size: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Query stored analyses with strict user isolation, newest-first sorting, and pagination.
        
        Args:
            user_id: Authenticated user ID (if authenticated)
            is_guest: Whether requester is a guest
            limit: Return top N newest records (used for Dashboard Recent Analyses)
            page: 1-indexed page number for pagination
            page_size: Number of items per page for pagination
        """
        with self._lock:
            # Filter records strictly by ownership
            if user_id:
                matching = [rec for rec in self._cache.values() if rec.user_id == user_id]
            else:
                matching = [rec for rec in self._cache.values() if rec.is_guest and rec.user_id is None]

            # Server-side sorting: newest first by ISO timestamp, with request_id as stable tiebreaker
            def sort_key(rec: AnalysisRecord) -> Tuple[str, str]:
                ts = rec.analysis.timestamp or ""
                return (ts, rec.analysis.request_id)

            sorted_records = sorted(matching, key=sort_key, reverse=True)
            total = len(sorted_records)

            # Apply limit if requested (e.g. limit=5 for dashboard)
            if limit is not None and limit > 0:
                sliced = sorted_records[:limit]
                items = [rec.analysis for rec in sliced]
                return {
                    "analyses": items,
                    "count": len(items),
                    "total": total,
                    "page": 1,
                    "page_size": limit,
                    "total_pages": 1 if total <= limit else (total + limit - 1) // limit,
                    "has_more": total > limit,
                }

            # Apply page / page_size pagination if requested
            if page is not None and page_size is not None and page > 0 and page_size > 0:
                total_pages = max(1, (total + page_size - 1) // page_size)
                start_idx = (page - 1) * page_size
                end_idx = start_idx + page_size
                sliced = sorted_records[start_idx:end_idx]
                items = [rec.analysis for rec in sliced]
                return {
                    "analyses": items,
                    "count": len(items),
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": total_pages,
                    "has_more": page < total_pages,
                }

            # Default: return all records for user (sorted newest first)
            items = [rec.analysis for rec in sorted_records]
            return {
                "analyses": items,
                "count": len(items),
                "total": total,
                "page": 1,
                "page_size": total,
                "total_pages": 1,
                "has_more": False,
            }

    def delete(self, analysis_id: str, user_id: Optional[str] = None) -> Tuple[bool, Dict[str, Any]]:
        """Delete an analysis from memory, local store, and Supabase.
        
        Returns:
            Tuple[bool, Dict[str, Any]]: (success, metadata)
        """
        remote_uuid = None
        deleted_local = False

        with self._lock:
            if analysis_id in self._cache:
                rec = self._cache[analysis_id]
                # Enforce ownership if owned by an authenticated user
                if rec.user_id and rec.user_id != user_id:
                    return False, {"error": "unauthorized", "message": "Cross-user deletion forbidden"}
                remote_uuid = rec.remote_id
                del self._cache[analysis_id]
                self._flush_to_disk()
                deleted_local = True
            else:
                return False, {"error": "not_found", "message": f"Analysis '{analysis_id}' not found"}

        deleted_remote = False
        remote_status = "offline_mode"

        sb_client = get_supabase_client()
        if sb_client is not None and user_id:
            target_id = remote_uuid if remote_uuid else (analysis_id if (len(analysis_id) == 36 and "-" in analysis_id) else None)
            if target_id:
                try:
                    sb_client.table("analyses").delete().eq("id", target_id).eq("user_id", user_id).execute()
                    deleted_remote = True
                    remote_status = "deleted"
                    logger.info(f"Deleted analysis {analysis_id} (remote: {target_id}) from Supabase.")
                except Exception as e:
                    logger.debug(f"Supabase delete exception for {analysis_id}: {e}")
                    remote_status = "remote_error"
            else:
                remote_status = "no_remote_uuid"

        return True, {
            "deleted_local": deleted_local,
            "deleted_remote": deleted_remote,
            "remote_status": remote_status,
        }

    def claim(self, analysis_id: str, user_id: str) -> Optional[AnalysisRecord]:
        """Claim an anonymous guest analysis to an authenticated user's account."""
        with self._lock:
            if analysis_id not in self._cache:
                return None
            rec = self._cache[analysis_id]
            if rec.user_id and rec.user_id != user_id:
                return None  # Cannot claim another user's record

            rec.user_id = user_id
            rec.is_guest = False
            rec.analysis.user_id = user_id
            rec.analysis.is_guest = False
            self._flush_to_disk()

        sb_client = get_supabase_client()
        if sb_client is not None:
            try:
                target_id = rec.remote_id if rec.remote_id else (analysis_id if (len(analysis_id) == 36 and "-" in analysis_id) else None)
                if target_id:
                    sb_client.table("analyses").update({
                        "user_id": user_id,
                        "is_offline_guest": False,
                    }).eq("id", target_id).execute()
            except Exception as e:
                logger.debug(f"Supabase claim update exception: {e}")

        return rec

    def clear_for_user(self, user_id: str) -> int:
        """Clear all analyses belonging to a specific user across all storage tiers."""
        with self._lock:
            to_delete = [aid for aid, rec in self._cache.items() if rec.user_id == user_id]
            for aid in to_delete:
                del self._cache[aid]
            if to_delete:
                self._flush_to_disk()

        sb_client = get_supabase_client()
        if sb_client is not None and user_id:
            try:
                sb_client.table("analyses").delete().eq("user_id", user_id).execute()
                logger.info(f"Cleared remote analyses for user {user_id}")
            except Exception as e:
                logger.debug(f"Supabase clear exception for user {user_id}: {e}")

        return len(to_delete)


# Global singleton repository instance
analysis_repo = AnalysisRepository()
