"""Comprehensive unit tests for Core Calculation Engine and Water Demand Modeling.

Tests exact prompt scenarios:
1. Roof 200 m², 900 mm, RCC 0.85 -> 153,000 litres/year.
2. Metal roof (0.90), Tile roof (0.80).
3. Zero/negative inputs & validation exceptions.
4. Water demand: 5 occupants, 600 L/day, 600*365 = 219,000 L/year.
5. Monthly water balance proof: usable water <= harvested water (storage capacity constraints).
"""

import pytest
from backend.app.calculations.runoff import (
    calculate_gross_harvest,
    calculate_collectable_water,
    get_runoff_coefficient,
    RoofType,
)
from backend.app.calculations.demand import (
    calculate_water_demand,
    calculate_savings_percentage,
    DAYS_IN_MONTHS,
)
from backend.app.calculations.water_balance import (
    simulate_water_balance,
    WaterBalanceResult,
)


def test_step3_exact_benchmark_case():
    """Verify exact prompt benchmark:
    Roof area: 200 m²
    Annual rainfall: 900 mm
    RCC roof runoff coefficient: 0.85
    Expected theoretical result: 153,000 litres/year.
    """
    area = 200.0
    rain = 900.0
    coeff = 0.85

    result = calculate_gross_harvest(area, rain, coeff)
    assert result == 153000.0, f"Expected 153,000 litres, got {result}"


def test_roof_materials_runoff_coefficients():
    """Verify runoff coefficients for metal sheet, clay tiles, and RCC."""
    assert get_runoff_coefficient("rcc") == 0.85
    assert get_runoff_coefficient("metal_sheet") == 0.90
    assert get_runoff_coefficient("clay_tiles") == 0.80

    # Test metal roof on 200 m2 with 900 mm rain
    metal_harvest = calculate_gross_harvest(200.0, 900.0, get_runoff_coefficient("metal_sheet"))
    assert metal_harvest == 162000.0  # 200 * 900 * 0.90

    # Test tile roof on 200 m2 with 900 mm rain
    tile_harvest = calculate_gross_harvest(200.0, 900.0, get_runoff_coefficient("clay_tiles"))
    assert tile_harvest == 144000.0  # 200 * 900 * 0.80


def test_calculation_boundary_and_negative_conditions():
    """Test zero, negative, and invalid parameters."""
    # Zero roof area -> 0 harvest
    assert calculate_gross_harvest(0.0, 900.0, 0.85) == 0.0

    # Zero rainfall -> 0 harvest
    assert calculate_gross_harvest(200.0, 0.0, 0.85) == 0.0

    # Negative roof area raises ValueError
    with pytest.raises(ValueError, match="Roof area cannot be negative"):
        calculate_gross_harvest(-10.0, 900.0, 0.85)

    # Negative rainfall raises ValueError
    with pytest.raises(ValueError, match="Rainfall cannot be negative"):
        calculate_gross_harvest(200.0, -50.0, 0.85)

    # Invalid runoff coefficient (> 1.0) raises ValueError
    with pytest.raises(ValueError, match="Runoff coefficient must be between 0.0 and 1.0"):
        calculate_gross_harvest(200.0, 900.0, 1.5)


def test_step4_water_demand_benchmark():
    """Verify Step 4 benchmark:
    5 occupants, 600 litres/day total demand, annual demand = 600 * 365.
    """
    occupants = 5
    direct_daily = 600.0
    expected_annual = 600.0 * 365.0  # 219,000 L

    demand = calculate_water_demand(occupants=occupants, direct_daily_demand=direct_daily)
    assert demand.daily_demand_litres == 600.0
    assert demand.annual_demand_litres == expected_annual
    assert demand.annual_demand_litres == 219000.0

    # Check monthly breakdown accounts for month day lengths
    assert len(demand.monthly_demands_litres) == 12
    assert demand.monthly_demands_litres[0] == 600.0 * 31  # Jan = 18,600
    assert demand.monthly_demands_litres[1] == 600.0 * 28  # Feb = 16,800
    assert sum(demand.monthly_demands_litres) == 219000.0


def test_physical_storage_constraint_usable_water():
    """Demonstrate that not all harvested water automatically becomes usable water.
    
    A 5,000 L tank receiving 153,000 L of seasonal monsoon rainfall cannot capture 
    100% of the water without significant overflow.
    """
    # 900 mm rainfall distributed seasonally (peaking in Jul-Aug)
    monthly_rain = [5.0, 5.0, 10.0, 20.0, 60.0, 150.0, 280.0, 250.0, 100.0, 15.0, 3.0, 2.0]
    assert sum(monthly_rain) == 900.0

    tank_capacity = 5000.0
    daily_demand = 600.0  # Annual 219,000 L
    area = 200.0
    coeff = 0.85
    filter_eff = 0.90

    sim: WaterBalanceResult = simulate_water_balance(
        monthly_rainfall_mm=monthly_rain,
        roof_area_sqm=area,
        runoff_coefficient=coeff,
        filter_efficiency=filter_eff,
        tank_capacity_litres=tank_capacity,
        daily_demand_litres=daily_demand,
    )

    # Inflow after filter = 153,000 * 0.9 = 137,700 L
    assert round(sim.total_inflow_litres) == 137700.0

    # Usable water supplied to the house is bounded by demand and monthly storage
    assert sim.total_supplied_litres < sim.total_inflow_litres
    assert sim.total_overflow_litres > 0.0

    # Verify mass conservation: Inflow + InitialStorage = Supplied + EndingStorage + Overflow
    inflow_accounted = sim.total_supplied_litres + sim.total_overflow_litres + sim.monthly_breakdown[-1].ending_storage_litres
    assert abs(inflow_accounted - sim.total_inflow_litres) < 1.0

    # Water savings % is strictly calculated against annual demand
    savings_pct = calculate_savings_percentage(sim.total_supplied_litres, sim.total_demand_litres)
    assert savings_pct == sim.demand_met_percentage
    assert 0.0 < savings_pct < 100.0
