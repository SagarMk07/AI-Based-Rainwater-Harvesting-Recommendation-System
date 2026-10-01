"""Complete reproducible Machine Learning pipeline for rainfall forecasting and regime classification.

Native NumPy ensemble execution (bypassing DLL security blocks).
Performs:
1. Generation of multi-year meteorological time-series for 15 Indian climatic zones (2005-2024).
2. Genuine feature engineering (cyclical month encoding, elevation, humidity, lags, rolling averages).
3. Chronological train/test split (Train: 2005-2019, Test: 2020-2024) preventing future data leakage.
4. Training RandomForestRegressor and RandomForestClassifier with LinearRegression baseline.
5. Rigorous metric reporting (MAE, RMSE, R2, Accuracy, Precision, Recall, F1-Score, Confusion Matrix).
6. Model persistence using joblib and JSON metadata.
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import csv
import json
import numpy as np
import joblib

from ml.training.ensemble_ml import (
    LinearRegressionBaseline,
    RandomForestRegressor,
    RandomForestClassifier,
    calc_mae,
    calc_rmse,
    calc_r2,
    calc_confusion_matrix,
    calc_classification_metrics,
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODEL_DIR = os.path.join(BASE_DIR, "ml", "models")

STATIONS = [
    {"name": "Bengaluru", "lat": 12.97, "lon": 77.59, "elev": 920, "base_annual": 924, "monsoon_type": "peninsular"},
    {"name": "Mumbai", "lat": 18.92, "lon": 72.83, "elev": 14, "base_annual": 2213, "monsoon_type": "coastal_heavy"},
    {"name": "Delhi", "lat": 28.61, "lon": 77.20, "elev": 216, "base_annual": 797, "monsoon_type": "northern_plains"},
    {"name": "Chennai", "lat": 13.08, "lon": 80.27, "elev": 7, "base_annual": 1382, "monsoon_type": "northeast_retreating"},
    {"name": "Hyderabad", "lat": 17.38, "lon": 78.48, "elev": 542, "base_annual": 812, "monsoon_type": "deccan"},
    {"name": "Pune", "lat": 18.52, "lon": 73.85, "elev": 560, "base_annual": 741, "monsoon_type": "rainshadow"},
    {"name": "Jaipur", "lat": 26.91, "lon": 75.78, "elev": 431, "base_annual": 602, "monsoon_type": "semi_arid"},
    {"name": "Kolkata", "lat": 22.57, "lon": 88.36, "elev": 9, "base_annual": 1735, "monsoon_type": "eastern"},
    {"name": "Kochi", "lat": 9.93, "lon": 76.26, "elev": 4, "base_annual": 3014, "monsoon_type": "western_ghats"},
    {"name": "Ahmedabad", "lat": 23.02, "lon": 72.57, "elev": 53, "base_annual": 782, "monsoon_type": "western"},
    {"name": "Bhopal", "lat": 23.25, "lon": 77.41, "elev": 527, "base_annual": 1120, "monsoon_type": "central"},
    {"name": "Lucknow", "lat": 26.84, "lon": 80.94, "elev": 123, "base_annual": 990, "monsoon_type": "gangetic"},
    {"name": "Guwahati", "lat": 26.14, "lon": 91.73, "elev": 55, "base_annual": 1820, "monsoon_type": "northeast"},
    {"name": "Nagpur", "lat": 21.14, "lon": 79.08, "elev": 310, "base_annual": 1050, "monsoon_type": "vidarbha"},
    {"name": "Patna", "lat": 25.59, "lon": 85.13, "elev": 53, "base_annual": 1080, "monsoon_type": "bihar"},
]


def generate_climate_dataset(start_year: int = 2005, end_year: int = 2024):
    """Generate multi-year time-series meteorological dataset across 15 climate regions."""
    np.random.seed(42)
    records = []

    for station in STATIONS:
        base_annual = station["base_annual"]
        mtype = station["monsoon_type"]
        
        if mtype == "coastal_heavy":
            dist = [0.001, 0.001, 0.001, 0.001, 0.01, 0.22, 0.38, 0.26, 0.11, 0.04, 0.005, 0.001]
        elif mtype == "northeast_retreating":
            dist = [0.01, 0.005, 0.005, 0.01, 0.03, 0.04, 0.07, 0.09, 0.09, 0.23, 0.28, 0.14]
        elif mtype == "western_ghats":
            dist = [0.01, 0.01, 0.02, 0.05, 0.13, 0.24, 0.20, 0.14, 0.10, 0.07, 0.04, 0.01]
        elif mtype == "semi_arid":
            dist = [0.01, 0.01, 0.01, 0.01, 0.03, 0.10, 0.35, 0.32, 0.13, 0.02, 0.005, 0.005]
        else:
            dist = [0.01, 0.01, 0.02, 0.03, 0.07, 0.16, 0.27, 0.24, 0.14, 0.03, 0.015, 0.005]
        
        dist = np.array(dist) / sum(dist)

        for year in range(start_year, end_year + 1):
            annual_factor = float(np.random.normal(1.0, 0.14))
            station_year_rain = base_annual * annual_factor

            for month in range(1, 13):
                expected_rain = station_year_rain * dist[month - 1]
                monthly_noise = float(np.random.normal(0, max(2.0, expected_rain * 0.18)))
                actual_rain = max(0.0, float(round(expected_rain + monthly_noise, 1)))

                is_monsoon = month in [6, 7, 8, 9]
                if is_monsoon:
                    temp = float(round(np.random.normal(28.0, 2.5), 1))
                    humidity = float(round(min(98.0, max(60.0, np.random.normal(82.0, 6.0))), 1))
                else:
                    temp = float(round(np.random.normal(25.0, 4.0), 1))
                    humidity = float(round(min(80.0, max(30.0, np.random.normal(52.0, 10.0))), 1))

                records.append({
                    "station": station["name"],
                    "year": year,
                    "month": month,
                    "latitude": station["lat"],
                    "longitude": station["lon"],
                    "elevation_m": station["elev"],
                    "temperature_c": temp,
                    "relative_humidity_pct": humidity,
                    "rainfall_mm": actual_rain,
                })

    # Sort
    records.sort(key=lambda r: (r["station"], r["year"], r["month"]))

    # Feature engineering: Lags and rolling means strictly per station
    by_station = {}
    for r in records:
        st = r["station"]
        if st not in by_station:
            by_station[st] = []
        by_station[st].append(r)

    processed_records = []
    for st, st_recs in by_station.items():
        for i, rec in enumerate(st_recs):
            lag1 = st_recs[i - 1]["rainfall_mm"] if i >= 1 else 0.0
            lag2 = st_recs[i - 2]["rainfall_mm"] if i >= 2 else 0.0
            
            # rolling 3 month prior average
            window = [st_recs[k]["rainfall_mm"] for k in range(max(0, i - 3), i)]
            rolling_3m = float(np.mean(window)) if window else 0.0

            m = rec["month"]
            m_sin = float(np.sin(2 * np.pi * m / 12.0))
            m_cos = float(np.cos(2 * np.pi * m / 12.0))

            rain = rec["rainfall_mm"]
            if rain < 40.0:
                regime = "Deficit"
            elif rain <= 150.0:
                regime = "Normal"
            else:
                regime = "Excess"

            enriched = dict(rec)
            enriched.update({
                "month_sin": m_sin,
                "month_cos": m_cos,
                "lag_1_month_rainfall": lag1,
                "lag_2_month_rainfall": lag2,
                "rolling_3m_avg_rainfall": rolling_3m,
                "rainfall_regime": regime,
            })
            processed_records.append(enriched)

    return processed_records


def train_and_evaluate_pipeline():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)

    records = generate_climate_dataset()
    csv_path = os.path.join(DATA_DIR, "rainfall_climate_dataset.csv")

    keys = list(records[0].keys())
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(records)

    feature_cols = [
        "month_sin",
        "month_cos",
        "latitude",
        "longitude",
        "elevation_m",
        "temperature_c",
        "relative_humidity_pct",
        "lag_1_month_rainfall",
        "lag_2_month_rainfall",
        "rolling_3m_avg_rainfall",
    ]

    # Chronological Split (Train: 2005-2019, Test: 2020-2024)
    train_recs = [r for r in records if r["year"] <= 2019]
    test_recs = [r for r in records if r["year"] >= 2020]

    def extract_X(recs):
        return np.array([[r[col] for col in feature_cols] for r in recs], dtype=np.float64)

    X_train = extract_X(train_recs)
    y_train_reg = np.array([r["rainfall_mm"] for r in train_recs], dtype=np.float64)
    y_train_clf = [r["rainfall_regime"] for r in train_recs]

    X_test = extract_X(test_recs)
    y_test_reg = np.array([r["rainfall_mm"] for r in test_recs], dtype=np.float64)
    y_test_clf = [r["rainfall_regime"] for r in test_recs]

    # 1. Baseline Linear Regression
    baseline_lr = LinearRegressionBaseline()
    baseline_lr.fit(X_train, y_train_reg)
    y_pred_baseline = baseline_lr.predict(X_test)
    base_mae = calc_mae(y_test_reg, y_pred_baseline)
    base_rmse = calc_rmse(y_test_reg, y_pred_baseline)
    base_r2 = calc_r2(y_test_reg, y_pred_baseline)

    # 2. Random Forest Regressor
    rf_reg = RandomForestRegressor(n_estimators=30, max_depth=10, min_samples_split=4, random_state=42)
    rf_reg.fit(X_train, y_train_reg)
    y_pred_reg = rf_reg.predict(X_test)
    rf_mae = calc_mae(y_test_reg, y_pred_reg)
    rf_rmse = calc_rmse(y_test_reg, y_pred_reg)
    rf_r2 = calc_r2(y_test_reg, y_pred_reg)

    # 3. Random Forest Classifier (Rainfall Regime)
    rf_clf = RandomForestClassifier(n_estimators=30, max_depth=8, min_samples_split=4, random_state=42)
    rf_clf.fit(X_train, y_train_clf)
    y_pred_clf = rf_clf.predict(X_test)

    classes = sorted(list(set(y_train_clf)))
    cm = calc_confusion_matrix(y_test_clf, y_pred_clf, classes)
    clf_metrics = calc_classification_metrics(y_test_clf, y_pred_clf, classes)

    # Feature Importances
    feat_importances = dict(zip(feature_cols, [round(float(v), 4) for v in rf_reg.feature_importances_raw]))

    # Save Models with joblib
    reg_path = os.path.join(MODEL_DIR, "rainfall_regressor.joblib")
    clf_path = os.path.join(MODEL_DIR, "rainfall_classifier.joblib")
    joblib.dump(rf_reg, reg_path)
    joblib.dump(rf_clf, clf_path)

    metadata = {
        "dataset_size": len(records),
        "train_size": len(train_recs),
        "test_size": len(test_recs),
        "train_years": "2005-2019",
        "test_years": "2020-2024",
        "features": feature_cols,
        "target_regression": "rainfall_mm",
        "target_classification": "rainfall_regime",
        "classes": classes,
        "regression_metrics": {
            "baseline_linear_regression": {
                "mae": round(base_mae, 2),
                "rmse": round(base_rmse, 2),
                "r2": round(base_r2, 4),
            },
            "random_forest_regressor": {
                "mae": round(rf_mae, 2),
                "rmse": round(rf_rmse, 2),
                "r2": round(rf_r2, 4),
            },
        },
        "classification_metrics": {
            "accuracy": clf_metrics["accuracy"],
            "precision": clf_metrics["precision"],
            "recall": clf_metrics["recall"],
            "f1_score": clf_metrics["f1_score"],
            "confusion_matrix": cm,
        },
        "feature_importances": feat_importances,
    }

    with open(os.path.join(MODEL_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata


if __name__ == "__main__":
    results = train_and_evaluate_pipeline()
    print("--- ML PIPELINE EXECUTION SUCCESSFUL ---")
    print(json.dumps(results, indent=2))
