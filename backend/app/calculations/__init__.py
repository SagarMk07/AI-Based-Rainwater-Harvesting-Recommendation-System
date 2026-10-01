"""Deterministic engineering calculations package."""

from backend.app.calculations.runoff import (
    RoofType,
    calculate_gross_harvest,
    calculate_collectable_water,
    get_runoff_coefficient,
    RUNOFF_COEFFICIENTS,
)
from backend.app.calculations.demand import (
    calculate_water_demand,
    calculate_savings_percentage,
    WaterDemandBreakdown,
)
from backend.app.calculations.water_balance import (
    simulate_water_balance,
    WaterBalanceResult,
    MonthlyBalanceStep,
)
from backend.app.calculations.recharge import (
    SoilType,
    size_recharge_structure,
    RechargeStructureDesign,
)

__all__ = [
    "RoofType",
    "calculate_gross_harvest",
    "calculate_collectable_water",
    "get_runoff_coefficient",
    "RUNOFF_COEFFICIENTS",
    "calculate_water_demand",
    "calculate_savings_percentage",
    "WaterDemandBreakdown",
    "simulate_water_balance",
    "WaterBalanceResult",
    "MonthlyBalanceStep",
    "SoilType",
    "size_recharge_structure",
    "RechargeStructureDesign",
]
