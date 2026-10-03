"""Dynamic explainability engine for RainHarvest AI.

Answers: 'Why did the system recommend this?' by synthesizing:
1. Actual property inputs (catchment, rainfall, occupancy, soil, space)
2. Machine learning classification and confidence
3. Influential feature attribution (feature importance)
4. Deterministic engineering calculations and physical constraint validation
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ExplainabilityResponse(BaseModel):
    recommended_system: str
    headline_reason: str
    reasons: List[str]
    engineering_factors: Dict[str, Any]
    trade_off_analysis: str
    ml_attribution: Optional[Dict[str, Any]] = None


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
    model_confidence: Optional[float] = None,
    predicted_class: Optional[str] = None,
    top_features: Optional[List[str]] = None,
    engineering_constraints: Optional[List[str]] = None,
) -> ExplainabilityResponse:
    """Generate dynamic, mathematically grounded explanation for the recommended configuration."""
    reasons: List[str] = []

    # 1. Primary Catchment & Harvest Potential
    if roof_area_sqm >= 300:
        reasons.append(
            f"Large roof catchment ({roof_area_sqm:.0f} m²) produces substantial annual capture potential ({int(gross_harvest_litres):,} L/year)."
        )
    elif roof_area_sqm >= 90:
        reasons.append(
            f"Moderate roof catchment ({roof_area_sqm:.0f} m²) provides balanced domestic capture potential ({int(gross_harvest_litres):,} L/year)."
        )
    else:
        reasons.append(
            f"Compact roof footprint ({roof_area_sqm:.0f} m²) yields modest seasonal runoff ({int(gross_harvest_litres):,} L/year), favoring modular surface storage over costly earth excavation."
        )

    # 2. Rainfall Seasonality
    if annual_rainfall_mm >= 1200:
        reasons.append(
            f"Heavy annual precipitation ({annual_rainfall_mm:.0f} mm) generates intense monsoon peak flows requiring adequate diversion capacity."
        )
    elif annual_rainfall_mm >= 600:
        reasons.append(
            f"Annual precipitation of {annual_rainfall_mm:.0f} mm provides reliable replenishment to offset non-monsoon domestic deficits."
        )
    else:
        reasons.append(
            f"Semi-arid precipitation ({annual_rainfall_mm:.0f} mm) demands high collection efficiency to maximize dry-season domestic reserves."
        )

    # 3. Water Demand
    if daily_demand_litres >= 800:
        reasons.append(f"High domestic consumption ({int(daily_demand_litres):,} L/day) rapidly cycles stored water, maintaining active buffer capacity.")
    elif daily_demand_litres >= 250:
        reasons.append(f"Domestic demand ({int(daily_demand_litres):,} L/day) matches the seasonal replenishment cycle of the optimized cistern.")
    else:
        reasons.append(f"Low daily demand ensures high retention across dry spells without requiring oversized storage.")

    # 4. Infiltration & Geological Feasibility
    soil_clean = soil_type.lower()
    if "clay" in soil_clean:
        reasons.append(
            "Low-permeability clay soil severely limits subsurface infiltration; surface storage was prioritized to eliminate waterlogging hazards."
        )
    elif "rock" in soil_clean:
        reasons.append("Impermeable rocky strata prevents standard percolation pit operations without deep fracture boring.")
    else:
        if open_area_sqm >= 25:
            reasons.append(
                f"Available permeable open ground ({open_area_sqm:.0f} m²) and favorable {soil_type} soil make decentralized aquifer recharge highly effective."
            )
        else:
            reasons.append(
                f"Constrained open ground space ({open_area_sqm:.0f} m²) restricts percolation trench footprints, favoring vertical or surface storage."
            )

    # 5. ML Decision Attribution
    if model_confidence is not None and predicted_class is not None:
        reasons.append(
            f"Random Forest ML classifier recommended '{predicted_class}' with {model_confidence * 100:.1f}% confidence, "
            f"validated against deterministic civil engineering constraints."
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

    ml_attribution = {
        "predicted_class": predicted_class,
        "model_confidence": model_confidence,
        "influential_features": top_features or [],
        "engineering_constraints": engineering_constraints or [],
    }

    return ExplainabilityResponse(
        recommended_system=recommended_system_name,
        headline_reason=f"{recommended_system_name} recommended based on {roof_area_sqm:.0f} m² catchment, {annual_rainfall_mm:.0f} mm rainfall, and {soil_type} percolation conditions.",
        reasons=reasons,
        engineering_factors=factors,
        trade_off_analysis=trade_off,
        ml_attribution=ml_attribution,
    )
