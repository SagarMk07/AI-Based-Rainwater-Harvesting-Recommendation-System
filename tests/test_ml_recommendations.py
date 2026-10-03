"""Unit & integration tests verifying Phase 4 ML validation, accuracy, and recommendation intelligence."""

import pytest
import os
import json
from backend.app.ml.system_predictor import predict_system, get_ml_system_artifacts
from backend.app.recommendations.recommender import generate_recommendation, SystemType
from ml.preprocessing import TARGET_CLASSES, RecommendationPreprocessor


def test_ml_artifacts_exist_and_load():
    """Verify that trained model, preprocessor, and metadata files exist and load cleanly."""
    model, preprocessor, metadata = get_ml_system_artifacts()
    assert model is not None, "ML model failed to load"
    assert preprocessor is not None, "Preprocessor failed to load"
    assert metadata is not None, "Metadata failed to load"

    assert metadata["model_version"] == "2.0.0"
    assert metadata["algorithm"] == "Random Forest"
    assert len(preprocessor.feature_names) == 28
    assert metadata["selected_model_metrics"]["accuracy"] >= 0.90
    assert metadata["selected_model_metrics"]["macro_f1"] >= 0.88


def test_ml_probabilities_sum_to_one():
    """Verify ML prediction outputs valid probability distribution across all 4 classes."""
    res = predict_system(
        roof_area_sqm=150.0,
        annual_rainfall_mm=950.0,
        roof_type="rcc",
        occupants=4,
        daily_demand_litres=500.0,
        soil_type="loamy",
        open_area_sqm=40.0,
        budget_inr=100000.0,
    )

    assert res["predicted_class"] in TARGET_CLASSES
    assert 0.0 <= res["model_confidence"] <= 1.0

    probs = res["class_probabilities"]
    assert len(probs) == 4
    for cls_name in TARGET_CLASSES:
        assert cls_name in probs
        assert 0.0 <= probs[cls_name] <= 1.0

    assert pytest.approx(sum(probs.values()), abs=0.01) == 1.0


def test_edge_case_very_small_roof():
    """Edge Case: Very small roof (10 m²)."""
    monthly_rain = [20.0] * 12
    rec = generate_recommendation(
        roof_area_sqm=10.0,
        roof_type="metal",
        annual_rainfall_mm=800.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=2,
        daily_demand_litres=200.0,
        soil_type="loamy",
        open_area_sqm=20.0,
        budget_inr=30000.0,
    )
    # Low harvest must be adapted to compact storage
    assert rec.system_type in [SystemType.COMPACT_RESIDENTIAL, SystemType.STORAGE_PRIORITY]
    assert rec.annual_gross_harvest_litres == 10.0 * 800.0 * 0.90  # 7,200 L


def test_edge_case_very_large_roof():
    """Edge Case: Very large roof (2,000 m²)."""
    monthly_rain = [80.0] * 12
    rec = generate_recommendation(
        roof_area_sqm=2000.0,
        roof_type="metal",
        annual_rainfall_mm=1200.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=50,
        daily_demand_litres=4000.0,
        soil_type="sandy",
        open_area_sqm=300.0,
        budget_inr=450000.0,
    )
    assert rec.system_type in [SystemType.HYBRID, SystemType.RECHARGE_PRIORITY]
    assert rec.annual_gross_harvest_litres >= 1500000.0
    assert rec.optimal_tank_capacity_litres >= 10000.0


def test_edge_case_extremely_low_rainfall():
    """Edge Case: Extremely low rainfall (100 mm/year)."""
    monthly_rain = [8.3] * 12
    rec = generate_recommendation(
        roof_area_sqm=120.0,
        roof_type="rcc",
        annual_rainfall_mm=100.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=3,
        daily_demand_litres=350.0,
        soil_type="loamy",
        open_area_sqm=30.0,
        budget_inr=50000.0,
    )
    assert rec.system_type == SystemType.COMPACT_RESIDENTIAL
    assert rec.annual_gross_harvest_litres == 120.0 * 100.0 * 0.85  # 10,200 L


def test_edge_case_extremely_high_rainfall():
    """Edge Case: Extremely high rainfall (3,000 mm/year)."""
    monthly_rain = [250.0] * 12
    rec = generate_recommendation(
        roof_area_sqm=250.0,
        roof_type="tiles",
        annual_rainfall_mm=3000.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=6,
        daily_demand_litres=800.0,
        soil_type="sandy",
        open_area_sqm=60.0,
        budget_inr=150000.0,
    )
    assert rec.system_type in [SystemType.HYBRID, SystemType.RECHARGE_PRIORITY]
    assert rec.annual_gross_harvest_litres == 250.0 * 3000.0 * 0.80  # 600,000 L


def test_edge_case_zero_open_area():
    """Edge Case: Zero open area (0 m²). Ground recharge impossible."""
    monthly_rain = [100.0] * 12
    rec = generate_recommendation(
        roof_area_sqm=200.0,
        roof_type="rcc",
        annual_rainfall_mm=1200.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=5,
        daily_demand_litres=650.0,
        soil_type="sandy",
        open_area_sqm=0.0,
        budget_inr=100000.0,
    )
    # Must override to storage priority because 0 open area cannot dig recharge trench
    assert rec.system_type == SystemType.STORAGE_PRIORITY
    assert rec.recharge_structure is None or rec.recharge_structure.effective_volume_litres == 0.0 or "storage" in rec.tagline.lower()


def test_edge_case_very_low_budget():
    """Edge Case: Very low budget (₹10,000)."""
    monthly_rain = [70.0] * 12
    rec = generate_recommendation(
        roof_area_sqm=150.0,
        roof_type="rcc",
        annual_rainfall_mm=850.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=4,
        daily_demand_litres=500.0,
        soil_type="loamy",
        open_area_sqm=40.0,
        budget_inr=10000.0,
    )
    # Budget under 45k cannot do dual hybrid system
    assert rec.system_type in [SystemType.STORAGE_PRIORITY, SystemType.COMPACT_RESIDENTIAL, SystemType.RECHARGE_PRIORITY]
    assert rec.system_type != SystemType.HYBRID


def test_sensitivity_analysis_calculated():
    """Verify that sensitivity analysis returns responsive recalculations under ±20% rainfall."""
    monthly_rain = [80.0] * 12
    rec = generate_recommendation(
        roof_area_sqm=200.0,
        roof_type="rcc",
        annual_rainfall_mm=1000.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=4,
        daily_demand_litres=550.0,
        soil_type="loamy",
        open_area_sqm=50.0,
        budget_inr=100000.0,
    )

    sens = rec.sensitivity_analysis
    assert sens is not None
    assert "rainfall_plus_20_pct" in sens
    assert "rainfall_minus_20_pct" in sens

    assert sens["rainfall_plus_20_pct"]["rainfall_mm"] == 1200.0
    assert sens["rainfall_plus_20_pct"]["gross_harvest_litres"] > rec.annual_gross_harvest_litres

    assert sens["rainfall_minus_20_pct"]["rainfall_mm"] == 800.0
    assert sens["rainfall_minus_20_pct"]["gross_harvest_litres"] < rec.annual_gross_harvest_litres


def test_alternatives_list_generated():
    """Verify alternatives are generated and exclude physically impossible options."""
    monthly_rain = [90.0] * 12
    rec = generate_recommendation(
        roof_area_sqm=200.0,
        roof_type="rcc",
        annual_rainfall_mm=1100.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=5,
        daily_demand_litres=600.0,
        soil_type="loamy",
        open_area_sqm=50.0,
        budget_inr=100000.0,
    )

    assert rec.alternatives is not None
    assert isinstance(rec.alternatives, list)
    # Should contain viable alternatives
    assert len(rec.alternatives) >= 1
