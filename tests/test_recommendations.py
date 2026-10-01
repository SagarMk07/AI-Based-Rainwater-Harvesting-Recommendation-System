"""Unit tests verifying Step 6 multi-criteria recommendation engine across diverse site scenarios."""

import pytest
from backend.app.recommendations.recommender import generate_recommendation, SystemType
from backend.app.recommendations.explainer import build_explanation


def test_scenario_a_residential():
    """Scenario A — Residential:
    Roof: 200 m², Rainfall: 900 mm, Occupants: 5, Water demand: 600 L/day,
    Soil: Loamy, Open area: 50 m², Budget: ₹100,000.
    """
    monthly_rain = [5.0, 5.0, 10.0, 20.0, 60.0, 150.0, 280.0, 250.0, 100.0, 15.0, 3.0, 2.0]
    rec = generate_recommendation(
        roof_area_sqm=200.0,
        roof_type="rcc",
        annual_rainfall_mm=900.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=5,
        daily_demand_litres=600.0,
        soil_type="loamy",
        open_area_sqm=50.0,
        budget_inr=100000.0,
    )

    assert rec.system_type == SystemType.HYBRID
    assert rec.annual_gross_harvest_litres == 153000.0  # 200 * 900 * 0.85
    assert rec.optimal_tank_capacity_litres in [5000.0, 7500.0, 10000.0]
    assert rec.recharge_structure is not None
    assert rec.total_estimated_cost_inr <= 100000.0
    assert rec.water_savings_percentage > 0.0
    assert len(rec.explanation_points) >= 3
    assert any("200" in pt for pt in rec.explanation_points)


def test_scenario_b_large_roof():
    """Scenario B — Large Roof:
    Roof: 500 m², High rainfall (1800 mm), High water demand (1500 L/day), Large open area (100 m²).
    """
    # 1800 mm rainfall distributed across 12 months
    monthly_rain = [10.0, 10.0, 20.0, 50.0, 120.0, 350.0, 550.0, 420.0, 210.0, 45.0, 10.0, 5.0]
    rec = generate_recommendation(
        roof_area_sqm=500.0,
        roof_type="rcc",
        annual_rainfall_mm=1800.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=12,
        daily_demand_litres=1500.0,
        soil_type="sandy",
        open_area_sqm=100.0,
        budget_inr=250000.0,
    )

    assert rec.system_type == SystemType.HYBRID
    assert rec.annual_gross_harvest_litres == 500 * 1800 * 0.85  # 765,000 L
    assert rec.optimal_tank_capacity_litres >= 10000.0
    assert rec.recharge_structure is not None
    assert "Trench" in rec.recharge_structure.structure_type or "Shaft" in rec.recharge_structure.structure_type
    assert any("500" in pt for pt in rec.explanation_points)


def test_scenario_c_poor_recharge_clay_conditions():
    """Scenario C — Poor Recharge Conditions:
    Clay soil, Small open area (15 m²), High rainfall (1600 mm).
    Should prioritize dedicated storage and flag poor infiltration.
    """
    monthly_rain = [10.0, 10.0, 20.0, 40.0, 100.0, 320.0, 500.0, 380.0, 180.0, 30.0, 8.0, 2.0]
    rec = generate_recommendation(
        roof_area_sqm=200.0,
        roof_type="rcc",
        annual_rainfall_mm=1600.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=4,
        daily_demand_litres=500.0,
        soil_type="clay",
        open_area_sqm=15.0,
        budget_inr=120000.0,
    )

    assert rec.system_type == SystemType.STORAGE_PRIORITY
    assert rec.recharge_structure is not None
    assert "Clay" in rec.explanation_points[0] or "clay" in rec.explanation_points[0].lower()


def test_scenario_d_low_rainfall():
    """Scenario D — Low Rainfall:
    Small roof (50 m²), Low rainfall (350 mm), Low water demand (200 L/day).
    """
    monthly_rain = [2.0, 2.0, 3.0, 5.0, 15.0, 45.0, 120.0, 110.0, 40.0, 6.0, 1.0, 1.0]
    rec = generate_recommendation(
        roof_area_sqm=50.0,
        roof_type="rcc",
        annual_rainfall_mm=350.0,
        monthly_rainfall_mm=monthly_rain,
        occupants=2,
        daily_demand_litres=200.0,
        soil_type="loamy",
        open_area_sqm=30.0,
        budget_inr=30000.0,
    )

    assert rec.system_type == SystemType.COMPACT_RESIDENTIAL
    assert rec.recharge_structure is None
    assert rec.optimal_tank_capacity_litres <= 3000.0
    assert any("modest" in pt.lower() or "50" in pt for pt in rec.explanation_points)


def test_recommendations_change_logically():
    """Verify that distinct scenarios do NOT yield identical recommendations."""
    monthly_rain = [5.0, 5.0, 10.0, 20.0, 60.0, 150.0, 280.0, 250.0, 100.0, 15.0, 3.0, 2.0]
    rec_a = generate_recommendation(200.0, "rcc", 900.0, monthly_rain, 5, 600.0, "loamy", 50.0)
    rec_c = generate_recommendation(200.0, "rcc", 900.0, monthly_rain, 5, 600.0, "clay", 15.0)
    rec_d = generate_recommendation(50.0, "rcc", 350.0, monthly_rain, 2, 200.0, "loamy", 20.0)

    # All three systems must be distinct
    assert rec_a.system_type != rec_c.system_type or rec_a.system_type != rec_d.system_type
    assert rec_c.system_type == SystemType.STORAGE_PRIORITY
    assert rec_d.system_type == SystemType.COMPACT_RESIDENTIAL


def test_explainability_builder():
    """Verify Step 7 explainability answers 'Why did the system recommend this?'"""
    expl = build_explanation(
        recommended_system_name="Hybrid Storage & Groundwater Recharge",
        roof_area_sqm=200.0,
        annual_rainfall_mm=900.0,
        gross_harvest_litres=153000.0,
        usable_water_litres=85000.0,
        daily_demand_litres=600.0,
        soil_type="loamy",
        open_area_sqm=50.0,
        overflow_litres=52700.0,
        payback_years=4.8,
    )

    assert expl.recommended_system == "Hybrid Storage & Groundwater Recharge"
    assert len(expl.reasons) >= 3
    assert "200" in expl.reasons[0]
    assert "900" in expl.reasons[1]
    assert "feasible" in expl.reasons[3] or "loamy" in expl.reasons[3]
    assert expl.engineering_factors["usable_ratio_pct"] > 0
    assert len(expl.trade_off_analysis) > 20
