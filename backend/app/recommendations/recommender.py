"""Multi-criteria decision recommendation engine for rainwater harvesting architectures."""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.app.calculations.runoff import calculate_gross_harvest, calculate_collectable_water, get_runoff_coefficient
from backend.app.calculations.demand import calculate_water_demand, calculate_savings_percentage
from backend.app.calculations.water_balance import simulate_water_balance, WaterBalanceResult
from backend.app.calculations.recharge import (
    SoilType, SOIL_DATABASE, size_recharge_structure, RechargeStructureDesign
)
from backend.app.optimization.storage_optimizer import (
    find_optimal_storage, OptimizationSummary, MUNICIPAL_WATER_COST_PER_KL
)


class SystemType(str, Enum):
    HYBRID = "Hybrid Storage & Groundwater Recharge"
    STORAGE_PRIORITY = "Dedicated Rooftop Storage System"
    RECHARGE_PRIORITY = "Groundwater Recharge System"
    COMPACT_RESIDENTIAL = "Compact Modular Rain Barrel / Mini Storage"


class SystemRecommendation(BaseModel):
    system_type: SystemType
    tagline: str
    annual_gross_harvest_litres: float
    annual_collectable_litres: float
    annual_usable_litres: float
    annual_demand_litres: float
    water_savings_percentage: float
    overflow_diverted_to_recharge_litres: float
    optimal_tank_capacity_litres: float
    tank_design_summary: str
    recharge_structure: Optional[RechargeStructureDesign]
    total_estimated_cost_inr: float
    annual_financial_savings_inr: float
    payback_years: float
    explanation_points: List[str]
    engineering_rationale: str
    suitability_score: float  # 0 to 100


def generate_recommendation(
    roof_area_sqm: float,
    roof_type: str,
    annual_rainfall_mm: float,
    monthly_rainfall_mm: List[float],
    occupants: int,
    daily_demand_litres: Optional[float] = None,
    soil_type: str = "loamy",
    open_area_sqm: float = 40.0,
    budget_inr: Optional[float] = None,
    has_existing_borewell: bool = False,
    filter_efficiency: float = 0.90,
) -> SystemRecommendation:
    """Generate comprehensive, defensible rainwater harvesting recommendation.
    
    Dynamically assesses catchment size, rainfall patterns, demand, soil percolation,
    site footprint, and financial constraints.
    """
    runoff_coeff = get_runoff_coefficient(roof_type)
    
    # 1. Deterministic hydrology
    gross_harvest = calculate_gross_harvest(roof_area_sqm, annual_rainfall_mm, runoff_coeff)
    collectable_water = calculate_collectable_water(
        gross_harvest, filter_efficiency=filter_efficiency, first_flush_mm=1.0, roof_area_sqm=roof_area_sqm
    )
    
    # 2. Demand modeling
    demand = calculate_water_demand(occupants=occupants, direct_daily_demand=daily_demand_litres)
    
    # 3. Soil characterization
    cleaned_soil = soil_type.lower().strip()
    detected_soil = SoilType.LOAMY
    for st in SoilType:
        if st.value in cleaned_soil:
            detected_soil = st
            break
    soil_props = SOIL_DATABASE[detected_soil]

    # 4. Storage tank simulation & optimization
    opt_summary: OptimizationSummary = find_optimal_storage(
        monthly_rainfall_mm=monthly_rainfall_mm,
        roof_area_sqm=roof_area_sqm,
        runoff_coefficient=runoff_coeff,
        filter_efficiency=filter_efficiency,
        daily_demand_litres=demand.daily_demand_litres,
        budget_inr=budget_inr,
    )
    opt_cap = opt_summary.optimal_capacity_litres
    opt_eval = opt_summary.optimal_evaluation

    # 5. Groundwater recharge feasibility
    # Run full water balance for optimal capacity
    sim_result: WaterBalanceResult = simulate_water_balance(
        monthly_rainfall_mm=monthly_rainfall_mm,
        roof_area_sqm=roof_area_sqm,
        runoff_coefficient=runoff_coeff,
        filter_efficiency=filter_efficiency,
        tank_capacity_litres=opt_cap,
        daily_demand_litres=demand.daily_demand_litres,
    )

    recharge_design: Optional[RechargeStructureDesign] = None
    system_type: SystemType
    explanation_points: List[str] = []
    
    # Multi-criteria decision branches:
    is_clay_or_rocky = detected_soil in [SoilType.CLAY, SoilType.ROCKY]
    has_tight_space = open_area_sqm < 25.0
    is_small_roof = roof_area_sqm < 70.0
    is_low_rain = annual_rainfall_mm < 500.0
    is_large_catchment = roof_area_sqm >= 350.0

    if is_small_roof or is_low_rain:
        system_type = SystemType.COMPACT_RESIDENTIAL
        tagline = "Cost-effective modular rainwater storage designed for light catchments."
        recharge_design = None
        explanation_points.append(
            f"Catchment size ({roof_area_sqm:.0f} m²) and annual rainfall ({annual_rainfall_mm:.0f} mm) produce a modest "
            f"annual gross harvest of {int(gross_harvest):,} L."
        )
        explanation_points.append("Focusing capital on modular above-ground storage yields the highest return on investment.")
        explanation_points.append("Groundwater recharge structures are omitted to avoid unnecessary excavation costs for small runoff volumes.")

    elif is_clay_or_rocky and not has_existing_borewell:
        system_type = SystemType.STORAGE_PRIORITY
        tagline = "Dedicated surface storage optimized for low-permeability clay ground conditions."
        explanation_points.append(
            f"{soil_props.soil_type.value.capitalize()} soil has very poor percolation ({soil_props.percolation_rate_mm_hr} mm/hr), "
            "making shallow infiltration pits prone to waterlogging."
        )
        explanation_points.append(
            f"Roof catchment ({roof_area_sqm:.0f} m²) yields {int(collectable_water):,} L of collectable water, which is prioritized for direct storage."
        )
        if has_tight_space:
            explanation_points.append(f"Limited open space ({open_area_sqm:.0f} m²) also constrains excavation of percolation trenches.")
        explanation_points.append(
            f"Recommended an optimized storage capacity of {int(opt_cap):,} L to maximize daily domestic replacement."
        )
        recharge_design = size_recharge_structure(detected_soil.value, sim_result.total_overflow_litres, open_area_sqm, roof_area_sqm, False)

    elif is_large_catchment and open_area_sqm >= 60.0 and detected_soil in [SoilType.SANDY, SoilType.LOAMY]:
        system_type = SystemType.HYBRID
        tagline = "High-capacity hybrid harvesting: domestic storage plus dedicated aquifer recharge."
        recharge_design = size_recharge_structure(detected_soil.value, sim_result.total_overflow_litres, open_area_sqm, roof_area_sqm, has_existing_borewell)
        explanation_points.append(
            f"Substantial roof catchment ({roof_area_sqm:.0f} m²) generates massive harvest potential ({int(collectable_water):,} L)."
        )
        explanation_points.append(
            f"High daily water demand ({int(demand.daily_demand_litres):,} L/day) is actively supported by a {int(opt_cap):,} L buffer storage tank."
        )
        explanation_points.append(
            f"Favorable {soil_props.soil_type.value} soil permeability ({soil_props.percolation_rate_mm_hr} mm/hr) and open area ({open_area_sqm:.0f} m²) "
            f"allow {int(sim_result.total_overflow_litres):,} L of seasonal monsoon overflow to replenish local groundwater."
        )

    else:
        # Standard balanced scenario (e.g. Scenario A)
        system_type = SystemType.HYBRID
        tagline = "Dual-purpose system balancing daily household reuse with groundwater replenishment."
        recharge_design = size_recharge_structure(detected_soil.value, sim_result.total_overflow_litres, open_area_sqm, roof_area_sqm, has_existing_borewell)
        explanation_points.append(
            f"Roof area ({roof_area_sqm:.0f} m²) with {annual_rainfall_mm:.0f} mm annual rainfall provides {int(gross_harvest):,} L theoretical runoff."
        )
        explanation_points.append(
            f"Optimized {int(opt_cap):,} L storage tank meets {sim_result.demand_met_percentage}% of annual domestic requirements."
        )
        explanation_points.append(
            f"{soil_props.soil_type.value.capitalize()} soil ({soil_props.percolation_rate_mm_hr} mm/hr percolation rate) "
            f"and available open space ({open_area_sqm:.0f} m²) make decentralized recharge highly effective for overflow water."
        )

    # Cost calculations
    tank_cost = opt_eval.tank_cost_inr
    recharge_cost = recharge_design.estimated_cost_inr if recharge_design else 0.0
    total_cost = tank_cost + recharge_cost
    
    # Financial savings
    annual_financial_savings = opt_eval.annual_savings_inr
    # Payback
    payback = round((total_cost / annual_financial_savings), 1) if annual_financial_savings > 0 else 99.0

    tank_summary = (
        f"{int(opt_cap):,} Litres ({'Triple-layer Food-grade Polyethylene' if opt_cap <= 10000 else 'Modular Reinforced Concrete / Modular Panel Tank'}) "
        f"with integrated leaf-screen and 100-micron silt filter."
    )

    rationale = (
        f"Based on hydrological simulation of {annual_rainfall_mm:.0f} mm precipitation on a {roof_area_sqm:.0f} m² {roof_type} catchment, "
        f"the system achieves {int(sim_result.total_supplied_litres):,} L of usable domestic water and directs {int(sim_result.total_overflow_litres):,} L "
        f"towards aquifer conservation."
    )

    savings_pct = calculate_savings_percentage(sim_result.total_supplied_litres, demand.annual_demand_litres)

    return SystemRecommendation(
        system_type=system_type,
        tagline=tagline,
        annual_gross_harvest_litres=round(gross_harvest, 1),
        annual_collectable_litres=round(collectable_water, 1),
        annual_usable_litres=round(sim_result.total_supplied_litres, 1),
        annual_demand_litres=round(demand.annual_demand_litres, 1),
        water_savings_percentage=savings_pct,
        overflow_diverted_to_recharge_litres=round(sim_result.total_overflow_litres, 1),
        optimal_tank_capacity_litres=opt_cap,
        tank_design_summary=tank_summary,
        recharge_structure=recharge_design,
        total_estimated_cost_inr=round(total_cost, 2),
        annual_financial_savings_inr=round(annual_financial_savings, 2),
        payback_years=payback,
        explanation_points=explanation_points,
        engineering_rationale=rationale,
        suitability_score=round(min(100.0, max(20.0, (sim_result.demand_met_percentage * 0.5) + (soil_props.recharge_suitability_score * 50.0))), 1),
    )
