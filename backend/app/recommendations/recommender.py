"""Multi-criteria decision recommendation engine with Hybrid ML-Engineering Decision Layer."""

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
from backend.app.ml.system_predictor import predict_system


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
    model_prediction: Optional[Dict[str, Any]] = None
    alternatives: Optional[List[str]] = None
    engineering_constraints_applied: Optional[List[str]] = None
    sensitivity_analysis: Optional[Dict[str, Any]] = None


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
    drainage_available: bool = True,
    groundwater_recharge_preference: bool = False,
    property_type: str = "residential",
) -> SystemRecommendation:
    """Generate comprehensive, defensible rainwater harvesting recommendation.
    
    Architecture:
    User Input -> Weather Data -> Deterministic Calculations -> ML Recommendation ->
    Engineering Constraint Validation -> Final Recommendation
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

    # 5. Groundwater recharge feasibility (simulate full water balance)
    sim_result: WaterBalanceResult = simulate_water_balance(
        monthly_rainfall_mm=monthly_rainfall_mm,
        roof_area_sqm=roof_area_sqm,
        runoff_coefficient=runoff_coeff,
        filter_efficiency=filter_efficiency,
        tank_capacity_litres=opt_cap,
        daily_demand_litres=demand.daily_demand_litres,
    )

    # 6. ML Model Prediction Layer
    ml_pred = predict_system(
        roof_area_sqm=roof_area_sqm,
        annual_rainfall_mm=annual_rainfall_mm,
        roof_type=roof_type,
        occupants=occupants,
        daily_demand_litres=demand.daily_demand_litres,
        soil_type=soil_type,
        open_area_sqm=open_area_sqm,
        budget_inr=budget_inr,
        drainage_available=drainage_available,
        groundwater_recharge_preference=groundwater_recharge_preference,
        property_type=property_type,
    )

    ml_class = ml_pred.get("predicted_class", "Hybrid System")
    confidence = ml_pred.get("model_confidence", 0.75)
    class_probs = ml_pred.get("class_probabilities", {})

    # 7. Engineering Constraint Validation Layer (The Hybrid Decision Layer)
    engineering_constraints: List[str] = []
    final_system_type: Optional[SystemType] = None
    recharge_design: Optional[RechargeStructureDesign] = None
    explanation_points: List[str] = []

    is_clay_or_rocky = detected_soil in [SoilType.CLAY, SoilType.ROCKY]
    has_tight_space = open_area_sqm < 20.0
    is_small_roof = roof_area_sqm < 70.0
    is_low_rain = annual_rainfall_mm < 500.0
    is_large_catchment = roof_area_sqm >= 350.0

    # Constraint Check 1: Geological or spatial impossibility for shallow recharge
    if has_tight_space or (is_clay_or_rocky and not has_existing_borewell):
        if ml_class in ["Recharge Pit", "Recharge Well", "Hybrid System"]:
            engineering_constraints.append(
                f"Engineering Constraint: Soil ({soil_props.soil_type.value}) or open space ({open_area_sqm:.0f} m²) restricts sub-surface infiltration. "
                "Overridden to Dedicated Storage to prevent surface waterlogging."
            )
        else:
            engineering_constraints.append(
                f"Physical Validation Passed: Soil ({soil_props.soil_type.value}) restricts sub-surface infiltration; confirmed Dedicated Storage."
            )
        final_system_type = SystemType.STORAGE_PRIORITY
        tagline = "Dedicated surface storage optimized for low-permeability ground conditions."
        explanation_points.append(
            f"{soil_props.soil_type.value.capitalize()} soil has very poor percolation ({soil_props.percolation_rate_mm_hr} mm/hr), "
            "making shallow infiltration pits prone to waterlogging."
        )
        explanation_points.append(
            f"Roof catchment ({roof_area_sqm:.0f} m²) yields {int(collectable_water):,} L of collectable water, prioritized for direct storage."
        )
        recharge_design = size_recharge_structure(detected_soil.value, sim_result.total_overflow_litres, open_area_sqm, roof_area_sqm, False)

    # Constraint Check 2: Modest catchment / low rainfall
    elif is_small_roof or is_low_rain:
        if ml_class != "Storage Tank":
            engineering_constraints.append(
                f"Engineering Constraint: Low total harvest volume ({int(gross_harvest):,} L) cannot justify dual-structure civil expenditure. "
                "Adapted to Compact Modular Storage."
            )
        final_system_type = SystemType.COMPACT_RESIDENTIAL
        tagline = "Cost-effective modular rainwater storage designed for light catchments."
        recharge_design = None
        explanation_points.append(
            f"Catchment size ({roof_area_sqm:.0f} m²) and annual rainfall ({annual_rainfall_mm:.0f} mm) produce a modest "
            f"annual gross harvest of {int(gross_harvest):,} L."
        )
        explanation_points.append("Focusing capital on modular above-ground storage yields the highest return on investment.")

    # Constraint Check 3: Budget constraints vs Dual System
    elif budget_inr is not None and budget_inr < 45000.0 and ml_class == "Hybrid System":
        engineering_constraints.append(
            f"Engineering Constraint: Capital budget limit (₹{budget_inr:,.0f}) is insufficient for dual tank and recharge trench deployment. "
            "Prioritized Dedicated Storage Tank."
        )
        final_system_type = SystemType.STORAGE_PRIORITY
        tagline = "Capital-optimized storage system designed within available budget."
        explanation_points.append(
            f"Optimized storage capacity of {int(opt_cap):,} L selected to remain within ₹{budget_inr:,.0f} budget."
        )
        recharge_design = None

    # Constraint Check 4: ML recommendation physically verified
    if final_system_type is None:
        engineering_constraints.append(
            f"Physical Validation Passed: ML recommendation '{ml_class}' matches hydraulic capacity, soil percolation, and budget."
        )
        if ml_class == "Hybrid System":
            final_system_type = SystemType.HYBRID
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
        elif ml_class in ["Recharge Pit", "Recharge Well"]:
            final_system_type = SystemType.RECHARGE_PRIORITY
            tagline = "Aquifer replenishment system prioritizing decentralized groundwater recharge."
            recharge_design = size_recharge_structure(detected_soil.value, sim_result.total_overflow_litres, open_area_sqm, roof_area_sqm, has_existing_borewell)
            explanation_points.append(
                f"Favorable {soil_props.soil_type.value} soil permeability ({soil_props.percolation_rate_mm_hr} mm/hr) and open ground space ({open_area_sqm:.0f} m²) "
                f"support efficient infiltration of {int(sim_result.total_overflow_litres):,} L of seasonal runoff."
            )
            explanation_points.append(f"Recommended structure: {recharge_design.structure_type} ({recharge_design.dimensions}).")
        else:
            final_system_type = SystemType.STORAGE_PRIORITY
            tagline = "Dedicated surface storage system prioritizing domestic water security."
            explanation_points.append(f"Storage capacity of {int(opt_cap):,} L maximizes water availability during dry intervals.")
            recharge_design = None

    # 8. Feasible Alternative Options Formulation
    alternatives: List[str] = []
    for cls_name, prob in sorted(class_probs.items(), key=lambda x: x[1], reverse=True):
        if cls_name != ml_class and prob >= 0.10:
            # Check feasibility
            if cls_name in ["Recharge Pit", "Recharge Well"] and (has_tight_space or is_clay_or_rocky):
                continue  # Physically infeasible
            if cls_name == "Hybrid System" and budget_inr is not None and budget_inr < 40000.0:
                continue  # Financially infeasible
            alternatives.append(cls_name)

    if not alternatives:
        if final_system_type != SystemType.STORAGE_PRIORITY:
            alternatives.append("Storage Tank")
        if final_system_type != SystemType.HYBRID and not has_tight_space and not is_clay_or_rocky:
            alternatives.append("Hybrid System")

    # 9. Sensitivity Analysis (+/- 20% rainfall, +20% demand, +20% roof)
    rain_p20 = annual_rainfall_mm * 1.20
    rain_m20 = annual_rainfall_mm * 0.80
    gross_p20 = rain_p20 * roof_area_sqm * runoff_coeff
    gross_m20 = rain_m20 * roof_area_sqm * runoff_coeff

    sensitivity = {
        "rainfall_plus_20_pct": {
            "rainfall_mm": round(rain_p20, 1),
            "gross_harvest_litres": round(gross_p20, 1),
            "estimated_usable_litres": round(min(gross_p20 * 0.85, demand.annual_demand_litres), 1),
            "impact_note": f"+20% rainfall increases harvest by {int(gross_p20 - gross_harvest):,} L, boosting surplus recharge volume.",
        },
        "rainfall_minus_20_pct": {
            "rainfall_mm": round(rain_m20, 1),
            "gross_harvest_litres": round(gross_m20, 1),
            "estimated_usable_litres": round(min(gross_m20 * 0.85, demand.annual_demand_litres), 1),
            "impact_note": f"-20% rainfall reduces harvest by {int(gross_harvest - gross_m20):,} L; domestic coverage falls by ~{round((1 - gross_m20/gross_harvest)*100, 1)}%.",
        },
        "roof_plus_20_pct": {
            "roof_area_sqm": round(roof_area_sqm * 1.20, 1),
            "gross_harvest_litres": round(gross_harvest * 1.20, 1),
        },
        "demand_plus_20_pct": {
            "daily_demand_litres": round(demand.daily_demand_litres * 1.20, 1),
            "annual_demand_litres": round(demand.annual_demand_litres * 1.20, 1),
        },
    }

    # 10. Cost & Financial Payback
    tank_cost = opt_eval.tank_cost_inr if final_system_type != SystemType.RECHARGE_PRIORITY else 0.0
    recharge_cost = recharge_design.estimated_cost_inr if recharge_design else 0.0
    total_cost = tank_cost + recharge_cost
    annual_financial_savings = opt_eval.annual_savings_inr if final_system_type != SystemType.RECHARGE_PRIORITY else (sim_result.total_supplied_litres * 0.05)
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
        system_type=final_system_type,
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
        model_prediction=ml_pred,
        alternatives=alternatives,
        engineering_constraints_applied=engineering_constraints,
        sensitivity_analysis=sensitivity,
    )
