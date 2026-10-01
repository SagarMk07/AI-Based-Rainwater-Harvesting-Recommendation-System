"""12-month iterative hydrological water balance simulation engine."""

from typing import List, Dict, Any
from pydantic import BaseModel, Field
from backend.app.calculations.demand import DAYS_IN_MONTHS, MONTH_NAMES


class MonthlyBalanceStep(BaseModel):
    month_index: int = Field(ge=0, le=11)
    month_name: str
    rainfall_mm: float
    inflow_litres: float
    demand_litres: float
    supplied_litres: float
    overflow_litres: float
    deficit_litres: float
    ending_storage_litres: float
    storage_utilization_pct: float


class WaterBalanceResult(BaseModel):
    tank_capacity_litres: float
    total_rainfall_mm: float
    total_inflow_litres: float
    total_demand_litres: float
    total_supplied_litres: float
    total_overflow_litres: float
    total_deficit_litres: float
    demand_met_percentage: float
    overflow_percentage: float
    average_storage_utilization_pct: float
    monthly_breakdown: List[MonthlyBalanceStep]


def simulate_water_balance(
    monthly_rainfall_mm: List[float],
    roof_area_sqm: float,
    runoff_coefficient: float,
    filter_efficiency: float,
    tank_capacity_litres: float,
    daily_demand_litres: float,
    initial_storage_litres: float = 0.0,
) -> WaterBalanceResult:
    """Simulate monthly water balance over an entire 12-month hydrological cycle.
    
    Demonstrates physical storage constraints:
    Inflow that exceeds tank capacity after consumption is diverted as overflow (or recharge).
    Usable water is strictly the water actually supplied from rainfall/storage to meet demand.
    
    Args:
        monthly_rainfall_mm: 12 values representing monthly precipitation in mm.
        roof_area_sqm: Catchment roof area.
        runoff_coefficient: Runoff coefficient (e.g. 0.85).
        filter_efficiency: Filtration/conveyance efficiency (e.g. 0.90).
        tank_capacity_litres: Storage tank size in litres (0 for direct recharge only).
        daily_demand_litres: Daily water requirement in litres.
        initial_storage_litres: Initial water in tank at start of year (default 0).
        
    Returns:
        WaterBalanceResult with detailed monthly tracking and key hydrological metrics.
    """
    if len(monthly_rainfall_mm) != 12:
        raise ValueError(f"Expected 12 monthly rainfall values, got {len(monthly_rainfall_mm)}")
    if roof_area_sqm < 0 or tank_capacity_litres < 0 or daily_demand_litres < 0:
        raise ValueError("Physical parameters (area, capacity, demand) cannot be negative.")

    current_storage = min(initial_storage_litres, tank_capacity_litres)
    monthly_steps: List[MonthlyBalanceStep] = []

    total_inflow = 0.0
    total_demand = 0.0
    total_supplied = 0.0
    total_overflow = 0.0
    total_deficit = 0.0
    utilization_sum = 0.0

    for i in range(12):
        rain = max(0.0, float(monthly_rainfall_mm[i]))
        days = DAYS_IN_MONTHS[i]
        month_demand = float(daily_demand_litres * days)

        # Physical inflow: 1 mm * 1 m² = 1 Litre
        month_inflow = float(rain * roof_area_sqm * runoff_coefficient * filter_efficiency)

        # Available water before supply
        water_available = current_storage + month_inflow

        # Supplied to meet demand
        supplied = min(water_available, month_demand)
        water_after_supply = water_available - supplied

        # Storage capacity constraint
        if tank_capacity_litres > 0:
            ending_storage = min(water_after_supply, tank_capacity_litres)
            overflow = max(0.0, water_after_supply - tank_capacity_litres)
            utilization = (ending_storage / tank_capacity_litres) * 100.0
        else:
            ending_storage = 0.0
            overflow = water_after_supply
            utilization = 0.0

        deficit = max(0.0, month_demand - supplied)
        current_storage = ending_storage

        # Accumulate
        total_inflow += month_inflow
        total_demand += month_demand
        total_supplied += supplied
        total_overflow += overflow
        total_deficit += deficit
        utilization_sum += utilization

        monthly_steps.append(
            MonthlyBalanceStep(
                month_index=i,
                month_name=MONTH_NAMES[i],
                rainfall_mm=round(rain, 1),
                inflow_litres=round(month_inflow, 1),
                demand_litres=round(month_demand, 1),
                supplied_litres=round(supplied, 1),
                overflow_litres=round(overflow, 1),
                deficit_litres=round(deficit, 1),
                ending_storage_litres=round(ending_storage, 1),
                storage_utilization_pct=round(utilization, 1),
            )
        )

    demand_met_pct = (total_supplied / total_demand * 100.0) if total_demand > 0 else 0.0
    overflow_pct = (total_overflow / total_inflow * 100.0) if total_inflow > 0 else 0.0

    return WaterBalanceResult(
        tank_capacity_litres=tank_capacity_litres,
        total_rainfall_mm=round(sum(monthly_rainfall_mm), 1),
        total_inflow_litres=round(total_inflow, 1),
        total_demand_litres=round(total_demand, 1),
        total_supplied_litres=round(total_supplied, 1),
        total_overflow_litres=round(total_overflow, 1),
        total_deficit_litres=round(total_deficit, 1),
        demand_met_percentage=round(demand_met_pct, 2),
        overflow_percentage=round(overflow_pct, 2),
        average_storage_utilization_pct=round(utilization_sum / 12.0, 1),
        monthly_breakdown=monthly_steps,
    )
