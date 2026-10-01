"""Machine Learning inference engine for rainfall prediction and regime classification."""

import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
import joblib

from backend.app.config import settings
from backend.app.utils.logger import logger
from backend.app.calculations.demand import MONTH_NAMES

_regressor_model = None
_classifier_model = None
_model_metadata = None


def load_models():
    """Load serialized ML models from disk."""
    global _regressor_model, _classifier_model, _model_metadata
    if _regressor_model is not None and _classifier_model is not None:
        return _regressor_model, _classifier_model, _model_metadata

    model_dir = os.path.join(settings.BASE_DIR, settings.MODEL_DIR)
    reg_path = os.path.join(model_dir, "rainfall_regressor.joblib")
    clf_path = os.path.join(model_dir, "rainfall_classifier.joblib")
    meta_path = os.path.join(model_dir, "model_metadata.json")

    if not os.path.exists(reg_path) or not os.path.exists(clf_path):
        logger.warning("ML models not found on disk. Initializing pipeline...")
        from ml.training.train_pipeline import train_and_evaluate_pipeline
        train_and_evaluate_pipeline()

    _regressor_model = joblib.load(reg_path)
    _classifier_model = joblib.load(clf_path)

    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            _model_metadata = json.load(f)
    else:
        _model_metadata = {}

    logger.info("Rainfall ML models loaded successfully.")
    return _regressor_model, _classifier_model, _model_metadata


def predict_month_rainfall(
    month: int,
    latitude: float,
    longitude: float,
    elevation_m: float,
    temperature_c: float,
    relative_humidity_pct: float,
    lag_1_rainfall_mm: float,
    lag_2_rainfall_mm: float,
    rolling_3m_avg_mm: float,
) -> Dict[str, Any]:
    """Execute end-to-end inference for a single month: input -> preprocessing -> model -> prediction."""
    regressor, classifier, _ = load_models()

    m_sin = float(np.sin(2 * np.pi * month / 12.0))
    m_cos = float(np.cos(2 * np.pi * month / 12.0))

    features = np.array([
        m_sin,
        m_cos,
        latitude,
        longitude,
        elevation_m,
        temperature_c,
        relative_humidity_pct,
        lag_1_rainfall_mm,
        lag_2_rainfall_mm,
        rolling_3m_avg_mm,
    ], dtype=np.float64).reshape(1, -1)

    predicted_mm = max(0.0, float(round(float(regressor.predict(features)[0]), 1)))
    predicted_regime = classifier.predict(features)[0]

    return {
        "month": month,
        "month_name": MONTH_NAMES[month - 1],
        "predicted_rainfall_mm": predicted_mm,
        "predicted_regime": predicted_regime,
    }


def predict_12_months_series(
    latitude: float = 12.97,
    longitude: float = 77.59,
    elevation_m: float = 900.0,
    annual_estimate_mm: Optional[float] = None,
) -> Dict[str, Any]:
    """Generate sequential 12-month rainfall forecast with autoregressive lag updates."""
    regressor, classifier, metadata = load_models()

    predictions = []
    lag1 = 15.0
    lag2 = 20.0
    history = [lag2, lag1]

    for m in range(1, 13):
        # Climatic seasonal adjustment for temperature & humidity
        is_summer = m in [3, 4, 5]
        is_monsoon = m in [6, 7, 8, 9]
        temp = 32.0 if is_summer else (27.0 if is_monsoon else 24.0)
        humid = 78.0 if is_monsoon else (45.0 if is_summer else 60.0)

        rolling_3m = float(np.mean(history[-3:])) if len(history) >= 3 else float(np.mean(history))

        step = predict_month_rainfall(
            month=m,
            latitude=latitude,
            longitude=longitude,
            elevation_m=elevation_m,
            temperature_c=temp,
            relative_humidity_pct=humid,
            lag_1_rainfall_mm=lag1,
            lag_2_rainfall_mm=lag2,
            rolling_3m_avg_mm=rolling_3m,
        )

        pred_val = step["predicted_rainfall_mm"]
        lag2 = lag1
        lag1 = pred_val
        history.append(pred_val)
        predictions.append(step)

    monthly_rainfall = [p["predicted_rainfall_mm"] for p in predictions]
    total_predicted = sum(monthly_rainfall)

    # If user provided a specific annual rainfall estimate, scale shape proportionately
    if annual_estimate_mm is not None and annual_estimate_mm > 0 and total_predicted > 0:
        scale = annual_estimate_mm / total_predicted
        for i, p in enumerate(predictions):
            scaled_val = round(p["predicted_rainfall_mm"] * scale, 1)
            p["predicted_rainfall_mm"] = scaled_val
            monthly_rainfall[i] = scaled_val

    return {
        "monthly_forecast": predictions,
        "total_annual_rainfall_mm": round(sum(monthly_rainfall), 1),
        "model_performance": metadata.get("regression_metrics", {}).get("random_forest_regressor", {}),
        "classification_performance": metadata.get("classification_metrics", {}),
        "features_used": metadata.get("features", []),
    }
