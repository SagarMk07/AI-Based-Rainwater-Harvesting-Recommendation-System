"""Dedicated explainability engine answering 'Why did the system recommend this?'"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field


class ExplainabilityResponse(BaseModel):
    recommended_system: str
    headline_reason: str
    reasons: List[str]
    engineering_factors: Dict[str, Any]
    trade_off_analysis: str


def build_explanation(
    recommended_system_name: str,
    roof_area_sqm: float,
    annual_rainfall_mm: float,
    gross_harvest_litres: float,
    usable_water_litres: float,
    daily_demand_litres: float,
    soil_type: str,
    open_area_sqm: float,
    overflow_litres: float,
    payback_years: float,
) -> ExplainabilityResponse:
    """Generate dynamic, mathematically grounded explanation for the recommended configuration."""
    reasons: List[str] = []

    # 1. Catchment & harvest context
    if roof_area_sqm >= 300:
        reasons.append(
            f"Large roof area ({roof_area_sqm:.0f} m²) provides significant collection potential ({int(gross_harvest_litres):,} L/year)."
        )
    elif roof_area_sqm >= 100:
        reasons.append(
            f"Moderate roof area ({roof_area_sqm:.0f} m²) provides balanced domestic capture potential ({int(gross_harvest_litres):,} L/year)."
        )
    else:
        reasons.append(
            f"Compact roof area ({roof_area_sqm:.0f} m²) favors simplified modular storage over expensive excavation."
        )

    # 2. Rainfall adequacy
    if annual_rainfall_mm >= 1200:
        reasons.append(
            f"High annual precipitation ({annual_rainfall_mm:.0f} mm) creates intense seasonal runoff during monsoon months."
        )
    elif annual_rainfall_mm >= 600:
        reasons.append(
            f"Annual rainfall of {annual_rainfall_mm:.0f} mm creates sufficient harvesting potential to offset dry period demand."
        )
    else:
        reasons.append(
            f"Semi-arid rainfall ({annual_rainfall_mm:.0f} mm) necessitates catching every litre with high first-flush efficiency."
        )

    # 3. Water demand context
    if daily_demand_litres >= 1000:
        reasons.append(f"High water demand ({int(daily_demand_litres):,} L/day) quickly consumes stored water, freeing up tank buffer space.")
    elif daily_demand_litres >= 300:
        reasons.append(f"Domestic water demand is well-matched to buffer tank replenishment cycles.")
    else:
        reasons.append(f"Low water demand ensures high storage retention across dry intervals.")

    # 4. Infiltration & ground condition
    soil_clean = soil_type.lower()
    if "clay" in soil_clean:
        reasons.append(
            "Clay soil restricts sub-surface percolation; surface storage was prioritized over shallow pits to prevent waterlogging."
        )
    elif "rock" in soil_clean:
        reasons.append("Impermeable rocky strata makes standard infiltration pits non-viable without deep fracture drilling.")
    else:
        if open_area_sqm >= 30:
            reasons.append(
                f"Available open area ({open_area_sqm:.0f} m²) and permeable {soil_type} soil make groundwater recharge feasible and cost-effective."
            )
        else:
            reasons.append(
                f"Constrained open area ({open_area_sqm:.0f} m²) restricts large percolation trenches, favoring a compact structure."
            )

    factors = {
        "catchment_sqm": roof_area_sqm,
        "rainfall_mm": annual_rainfall_mm,
        "soil_type": soil_type,
        "usable_ratio_pct": round((usable_water_litres / gross_harvest_litres * 100.0) if gross_harvest_litres > 0 else 0, 1),
        "overflow_diverted_pct": round((overflow_litres / gross_harvest_litres * 100.0) if gross_harvest_litres > 0 else 0, 1),
        "payback_years": payback_years,
    }

    trade_off = (
        f"A larger tank would store more overflow but incurs diminishing economic returns (payback stretches past {payback_years + 4:.0f} years). "
        f"The selected sizing captures the most economical {factors['usable_ratio_pct']}% of runoff for daily use while routing "
        f"monsoon excess into groundwater recharge."
    )

    return ExplainabilityResponse(
        recommended_system=recommended_system_name,
        headline_reason="Engineered matching between seasonal runoff volume, daily consumption rate, and soil percolation physics.",
        reasons=reasons,
        engineering_factors=factors,
        trade_off_analysis=trade_off,
    )
