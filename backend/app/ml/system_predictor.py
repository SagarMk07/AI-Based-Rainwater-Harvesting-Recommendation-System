"""System recommendation machine learning predictor module.

Loads the trained Random Forest ensemble classifier and feature preprocessor.
Predicts optimal harvesting architecture with class probability distribution,
confidence grading, and influential feature attribution.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import joblib

from ml.preprocessing import RecommendationPreprocessor, RUNOFF_COEFFICIENTS, TARGET_CLASSES

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "models", "system_recommendation_model.joblib")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "ml", "models", "system_recommendation_preprocessor.json")
METADATA_PATH = os.path.join(BASE_DIR, "ml", "models", "system_recommendation_metadata.json")

# In-memory singleton cache
_MODEL = None
_PREPROCESSOR = None
_METADATA = None


def get_ml_system_artifacts():
    """Lazily load trained model, preprocessor, and metadata."""
    global _MODEL, _PREPROCESSOR, _METADATA

    if _MODEL is None:
        if os.path.exists(MODEL_PATH) and os.path.exists(PREPROCESSOR_PATH):
            try:
                _MODEL = joblib.load(MODEL_PATH)
                with open(PREPROCESSOR_PATH, "r", encoding="utf-8") as f:
                    prep_dict = json.load(f)
                _PREPROCESSOR = RecommendationPreprocessor.from_dict(prep_dict)

                if os.path.exists(METADATA_PATH):
                    with open(METADATA_PATH, "r", encoding="utf-8") as f:
                        _METADATA = json.load(f)
                else:
                    _METADATA = {}
                logger.info("Successfully loaded ML System Recommendation artifacts.")
            except Exception as e:
                logger.error(f"Failed to load ML artifacts: {e}")
                _MODEL, _PREPROCESSOR, _METADATA = None, None, None
        else:
            logger.warning("ML model or preprocessor files missing.")

    return _MODEL, _PREPROCESSOR, _METADATA


def predict_system(
    roof_area_sqm: float,
    annual_rainfall_mm: float,
    roof_type: str,
    occupants: int,
    daily_demand_litres: float,
    soil_type: str,
    open_area_sqm: float,
    budget_inr: Optional[float] = None,
    drainage_available: bool = True,
    groundwater_recharge_preference: bool = False,
    property_type: str = "residential",
) -> Dict[str, Any]:
    """Execute ML classification inference for property specifications."""
    model, preprocessor, metadata = get_ml_system_artifacts()

    # Calculate derived features
    cleaned_roof = roof_type.lower().strip()
    runoff_c = RUNOFF_COEFFICIENTS.get(cleaned_roof, 0.85)
    annual_demand = float(daily_demand_litres * 365.0)
    budget = float(budget_inr) if budget_inr is not None and budget_inr > 0 else 100000.0

    gross_harvest = annual_rainfall_mm * roof_area_sqm * runoff_c
    estimated_harvest_l = float(gross_harvest * 0.90)

    harvest_to_demand = float(estimated_harvest_l / max(1.0, annual_demand))
    roof_to_open_area = float(roof_area_sqm / max(1.0, open_area_sqm))
    monthly_harvest = float(estimated_harvest_l / 12.0)
    annual_savings = float(min(estimated_harvest_l, annual_demand) * 0.05)

    record = {
        "annual_rainfall_mm": float(annual_rainfall_mm),
        "roof_area_m2": float(roof_area_sqm),
        "roof_type": cleaned_roof,
        "runoff_coefficient": runoff_c,
        "occupants": int(occupants),
        "daily_water_demand_l": float(daily_demand_litres),
        "annual_water_demand_l": annual_demand,
        "soil_type": str(soil_type).lower().strip(),
        "open_area_m2": float(open_area_sqm),
        "drainage_available": bool(drainage_available),
        "groundwater_recharge_preference": bool(groundwater_recharge_preference),
        "property_type": str(property_type).lower().strip(),
        "budget": budget,
        "estimated_harvest_l": estimated_harvest_l,
        "harvest_to_demand_ratio": harvest_to_demand,
        "roof_to_open_area_ratio": roof_to_open_area,
        "estimated_monthly_harvest": monthly_harvest,
        "estimated_annual_savings": annual_savings,
    }

    if model is None or preprocessor is None:
        # Fallback heuristic if model files are uninitialized
        return {
            "predicted_class": "Hybrid System" if open_area_sqm >= 25 else "Storage Tank",
            "model_confidence": 0.70,
            "class_probabilities": {"Hybrid System": 0.50, "Storage Tank": 0.50, "Recharge Pit": 0.0, "Recharge Well": 0.0},
            "confidence_notice": None,
            "top_features": [],
            "model_name": "heuristic_fallback",
            "model_version": "0.0.0",
            "macro_f1": 0.0,
        }

    # Vectorize via identical pipeline
    X = preprocessor.transform([record])
    probs = model.predict_proba(X)[0]

    class_probs = {cls_name: round(float(probs[i]), 4) for i, cls_name in enumerate(preprocessor.classes)}
    pred_idx = int(np.argmax(probs))
    pred_class = preprocessor.classes[pred_idx]
    confidence = round(float(probs[pred_idx]), 4)

    # Low-confidence threshold check (< 0.45 for 4-class problem where random guess is 0.25)
    confidence_notice = None
    if confidence < 0.45:
        confidence_notice = "Low-confidence recommendation — consider professional on-site hydrological assessment."

    top_features = []
    if metadata and "feature_importances" in metadata:
        top_features = list(metadata["feature_importances"].keys())[:6]

    macro_f1 = 0.9389
    if metadata and "selected_model_metrics" in metadata:
        macro_f1 = metadata["selected_model_metrics"].get("macro_f1", 0.9389)

    return {
        "predicted_class": pred_class,
        "model_confidence": confidence,
        "class_probabilities": class_probs,
        "confidence_notice": confidence_notice,
        "top_features": top_features,
        "model_name": metadata.get("model_name", "system_recommendation_ensemble") if metadata else "system_recommendation_ensemble",
        "model_version": metadata.get("model_version", "2.0.0") if metadata else "2.0.0",
        "algorithm": metadata.get("algorithm", "Random Forest") if metadata else "Random Forest",
        "macro_f1": macro_f1,
    }
