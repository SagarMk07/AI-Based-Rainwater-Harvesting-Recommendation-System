"""Reproducible Feature Engineering and Preprocessing Pipeline for RainHarvest AI.

Transforms raw property, site, meteorological, and economic attributes into
standardized numerical vectors for multi-class model training and inference.
Guarantees identical feature ordering, encoding, and scaling between training and production.
"""

import math
from typing import List, Dict, Any, Optional, Tuple, Union
import numpy as np


RUNOFF_COEFFICIENTS = {
    "rcc": 0.85,
    "metal": 0.90,
    "tiles": 0.80,
    "pavers": 0.70,
}

NUMERICAL_FEATURES = [
    "annual_rainfall_mm",
    "roof_area_m2",
    "runoff_coefficient",
    "occupants",
    "daily_water_demand_l",
    "annual_water_demand_l",
    "open_area_m2",
    "budget",
    "estimated_harvest_l",
    "harvest_to_demand_ratio",
    "roof_to_open_area_ratio",
    "estimated_monthly_harvest",
    "estimated_annual_savings",
]

CATEGORICAL_FEATURES = {
    "roof_type": ["rcc", "metal", "tiles", "pavers"],
    "soil_type": ["sandy", "loamy", "silty", "clay", "rocky"],
    "property_type": ["residential", "commercial", "institutional", "industrial"],
}

BOOLEAN_FEATURES = [
    "drainage_available",
    "groundwater_recharge_preference",
]

TARGET_CLASSES = [
    "Hybrid System",
    "Recharge Pit",
    "Recharge Well",
    "Storage Tank",
]


class RecommendationPreprocessor:
    """Production-grade feature transformer with stateful scaling and encoding."""

    def __init__(self):
        self.num_means: Dict[str, float] = {}
        self.num_stds: Dict[str, float] = {}
        self.num_medians: Dict[str, float] = {}
        self.feature_names: List[str] = []
        self.classes: List[str] = TARGET_CLASSES
        self.is_fitted: bool = False

    def fit(self, records: List[Dict[str, Any]]) -> "RecommendationPreprocessor":
        """Compute training distributions (means, standard deviations, medians)."""
        if not records:
            raise ValueError("Cannot fit preprocessor on empty dataset.")

        # Compute numerical statistics
        for feat in NUMERICAL_FEATURES:
            vals = [float(r[feat]) for r in records if r.get(feat) is not None]
            if not vals:
                mean, std, median = 0.0, 1.0, 0.0
            else:
                arr = np.array(vals, dtype=np.float64)
                mean = float(np.mean(arr))
                std = float(np.std(arr))
                std = std if std > 1e-6 else 1.0
                median = float(np.median(arr))
            self.num_means[feat] = mean
            self.num_stds[feat] = std
            self.num_medians[feat] = median

        # Construct explicit feature names list
        feat_names = list(NUMERICAL_FEATURES)
        for cat_feat, categories in CATEGORICAL_FEATURES.items():
            for cat_val in categories:
                feat_names.append(f"{cat_feat}_{cat_val}")
        for b_feat in BOOLEAN_FEATURES:
            feat_names.append(b_feat)

        self.feature_names = feat_names
        self.is_fitted = True
        return self

    def _extract_record_features(self, r: Dict[str, Any]) -> List[float]:
        """Convert a single property record dictionary into an engineered feature vector."""
        vec = []

        # 1. Standardized numerical features
        for feat in NUMERICAL_FEATURES:
            val = r.get(feat)
            if val is None or math.isnan(float(val)):
                val = self.num_medians.get(feat, 0.0)
            else:
                val = float(val)
            mean = self.num_means.get(feat, 0.0)
            std = self.num_stds.get(feat, 1.0)
            scaled = (val - mean) / std
            vec.append(scaled)

        # 2. One-hot encoded categorical features
        for cat_feat, categories in CATEGORICAL_FEATURES.items():
            raw_val = str(r.get(cat_feat, "")).lower().strip()
            for cat_val in categories:
                vec.append(1.0 if raw_val == cat_val else 0.0)

        # 3. Binary boolean features
        for b_feat in BOOLEAN_FEATURES:
            raw_b = r.get(b_feat, False)
            is_true = True if raw_b in [True, 1, "true", "True", "1"] else False
            vec.append(1.0 if is_true else 0.0)

        return vec

    def transform(self, records: List[Dict[str, Any]]) -> np.ndarray:
        """Transform batch of records into NumPy feature matrix (N x M)."""
        if not self.is_fitted:
            raise RuntimeError("RecommendationPreprocessor must be fitted before calling transform.")
        matrix = [self._extract_record_features(r) for r in records]
        return np.array(matrix, dtype=np.float64)

    def fit_transform(self, records: List[Dict[str, Any]]) -> np.ndarray:
        return self.fit(records).transform(records)

    def encode_labels(self, labels: List[str]) -> np.ndarray:
        """Map class label strings to integer indices [0..3]."""
        return np.array([self.classes.index(lbl) for lbl in labels], dtype=np.int64)

    def decode_label(self, idx: int) -> str:
        """Convert integer class index back to system recommendation string."""
        return self.classes[idx]

    def to_dict(self) -> Dict[str, Any]:
        """Serialize transformer state to JSON-serializable dictionary."""
        return {
            "num_means": self.num_means,
            "num_stds": self.num_stds,
            "num_medians": self.num_medians,
            "feature_names": self.feature_names,
            "classes": self.classes,
            "is_fitted": self.is_fitted,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RecommendationPreprocessor":
        """Instantiate preprocessor from serialized dictionary."""
        preprocessor = cls()
        preprocessor.num_means = {k: float(v) for k, v in data.get("num_means", {}).items()}
        preprocessor.num_stds = {k: float(v) for k, v in data.get("num_stds", {}).items()}
        preprocessor.num_medians = {k: float(v) for k, v in data.get("num_medians", {}).items()}
        preprocessor.feature_names = data.get("feature_names", [])
        preprocessor.classes = data.get("classes", TARGET_CLASSES)
        preprocessor.is_fitted = data.get("is_fitted", True)
        return preprocessor
