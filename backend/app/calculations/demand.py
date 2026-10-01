"""Water demand modeling and per-capita requirement estimation."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field

# Standard days per month in a non-leap year (Jan - Dec)
DAYS_IN_MONTHS: List[int] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
MONTH_NAMES: List[str] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

# Standard Indian urban benchmark: 135 LPCD (BIS 1172:1993 standard for domestic consumption)
# Default conservative domestic non-potable or general estimate: 120 LPCD
DEFAULT_LPCD = 120.0


class WaterDemandBreakdown(BaseModel):
    occupants: int = Field(ge=0, description="Number of building occupants")
    lpcd: float = Field(ge=0.0, description="Litres per capita per day")
    daily_demand_litres: float = Field(ge=0.0, description="Total daily demand in litres")
    annual_demand_litres: float = Field(ge=0.0, description="Total annual demand in litres (daily * 365)")
    monthly_demands_litres: List[float] = Field(description="Monthly demands matching month lengths")


def calculate_water_demand(
    occupants: int,
    lpcd: float = DEFAULT_LPCD,
    direct_daily_demand: Optional[float] = None,
) -> WaterDemandBreakdown:
    """Calculate daily, monthly, and annual water demand.
    
    Args:
        occupants: Number of residents/occupants.
        lpcd: Litres per capita per day (default 120 L).
        direct_daily_demand: Optional manual override for total daily demand in litres.
        
    Returns:
        WaterDemandBreakdown with daily, monthly, and annual figures.
    """
    if occupants < 0:
        raise ValueError("Occupant count cannot be negative.")
    if lpcd < 0:
        raise ValueError("LPCD cannot be negative.")

    if direct_daily_demand is not None:
        if direct_daily_demand < 0:
            raise ValueError("Daily demand cannot be negative.")
        daily = float(direct_daily_demand)
    else:
        daily = float(occupants * lpcd)

    annual = float(daily * 365)
    monthly = [float(daily * days) for days in DAYS_IN_MONTHS]

    return WaterDemandBreakdown(
        occupants=occupants,
        lpcd=lpcd if direct_daily_demand is None else (daily / occupants if occupants > 0 else 0.0),
        daily_demand_litres=daily,
        annual_demand_litres=annual,
        monthly_demands_litres=monthly,
    )


def calculate_savings_percentage(
    usable_harvested_litres: float,
    annual_demand_litres: float,
) -> float:
    """Calculate the percentage of total water demand met by usable harvested water.
    
    Formula:
        Savings % = (Usable Harvested Water / Annual Demand) * 100
        
    Guarantees no division by zero.
    """
    if annual_demand_litres <= 0:
        return 0.0
    ratio = (usable_harvested_litres / annual_demand_litres) * 100.0
    return round(min(100.0, max(0.0, ratio)), 2)
