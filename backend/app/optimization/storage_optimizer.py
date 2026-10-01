"""Storage tank capacity simulation and multi-objective optimization."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.app.calculations.water_balance import simulate_water_balance, WaterBalanceResult


class CandidateEvaluation(BaseModel):
    capacity_litres: float
    total_supplied_litres: float
    total_overflow_litres: float
    demand_met_percentage: float
    overflow_percentage: float
    average_storage_utilization_pct: float
    tank_cost_inr: float
    annual_savings_inr: float
    payback_years: float
    optimization_score: float  # Normalized composite score (0-100)


class OptimizationSummary(BaseModel):
    optimal_capacity_litres: float
    optimal_evaluation: CandidateEvaluation
    all_candidates: List[CandidateEvaluation]
    recommendation_note: str


# Commercial pricing estimate in India (polyethylene / modular roto-molded tanks with plumbing)
BASE_TANK_RATE_PER_LITRE = 6.5  # INR per Litre for standard food-grade HDPE/triple-layer tank
INSTALLATION_OVERHEAD_INR = 5000.0  # Base concrete pad, piping, inlet filter, overflow plumbing
MUNICIPAL_WATER_COST_PER_KL = 75.0  # INR per 1,000 Litres (average blended tanker / municipal rate in urban India)


def estimate_tank_cost(capacity_litres: float) -> float:
    """Estimate capital expenditure for tank and basic foundation plumbing."""
    if capacity_litres <= 0:
        return 0.0
    return float(INSTALLATION_OVERHEAD_INR + (capacity_litres * BASE_TANK_RATE_PER_LITRE))


def find_optimal_storage(
    monthly_rainfall_mm: List[float],
    roof_area_sqm: float,
    runoff_coefficient: float,
    filter_efficiency: float,
    daily_demand_litres: float,
    budget_inr: Optional[float] = None,
    candidate_capacities: Optional[List[float]] = None,
) -> OptimizationSummary:
    """Evaluate candidate storage tank capacities to find the cost-benefit optimum.
    
    Balances:
    1. Maximizing usable water supplied (higher demand coverage).
    2. Minimizing unutilized capacity and excessive capital cost.
    3. Respecting user budget constraints.
    """
    if candidate_capacities is None:
        # Standard residential and commercial commercial modular sizes
        candidate_capacities = [
            1000.0, 2000.0, 3000.0, 5000.0, 7500.0, 
            10000.0, 15000.0, 20000.0, 30000.0, 50000.0
        ]

    evaluations: List[CandidateEvaluation] = []
    water_rate_per_litre = MUNICIPAL_WATER_COST_PER_KL / 1000.0

    for cap in candidate_capacities:
        sim: WaterBalanceResult = simulate_water_balance(
            monthly_rainfall_mm=monthly_rainfall_mm,
            roof_area_sqm=roof_area_sqm,
            runoff_coefficient=runoff_coefficient,
            filter_efficiency=filter_efficiency,
            tank_capacity_litres=cap,
            daily_demand_litres=daily_demand_litres,
        )

        cost = estimate_tank_cost(cap)
        annual_savings = sim.total_supplied_litres * water_rate_per_litre
        payback = (cost / annual_savings) if annual_savings > 0 else 99.0

        # Engineering multi-objective scoring:
        # 1. Coverage benefit: Up to 40 pts for percentage of annual demand satisfied
        coverage_score = (sim.demand_met_percentage / 100.0) * 40.0
        
        # 2. Water Security & Autonomy: Reward systems providing 7 to 20 days of household autonomy
        autonomy_days = cap / daily_demand_litres if daily_demand_litres > 0 else 0.0
        if autonomy_days < 3.0:
            autonomy_score = max(0.0, autonomy_days * 3.0)  # Heavy penalty for under 3 days (too small to provide resilience)
        elif autonomy_days <= 20.0:
            autonomy_score = 15.0 + ((autonomy_days - 3.0) / 17.0) * 15.0  # Sweet spot (15 to 30 pts)
        else:
            autonomy_score = max(15.0, 30.0 - (autonomy_days - 20.0) * 0.5)  # Diminishing returns for oversized tanks

        # 3. Payback & Economic Return: Up to 20 pts for reasonable payback (< 10 yrs)
        payback_score = max(0.0, min(20.0, 20.0 * (1.0 - (payback / 12.0))))

        # 4. Budget penalty if exceeding user budget
        budget_penalty = 0.0
        if budget_inr is not None and budget_inr > 0 and cost > budget_inr:
            budget_penalty = 50.0 * ((cost - budget_inr) / budget_inr)

        composite_score = round(max(0.0, coverage_score + autonomy_score + payback_score - budget_penalty), 2)

        evaluations.append(
            CandidateEvaluation(
                capacity_litres=cap,
                total_supplied_litres=sim.total_supplied_litres,
                total_overflow_litres=sim.total_overflow_litres,
                demand_met_percentage=sim.demand_met_percentage,
                overflow_percentage=sim.overflow_percentage,
                average_storage_utilization_pct=sim.average_storage_utilization_pct,
                tank_cost_inr=round(cost, 2),
                annual_savings_inr=round(annual_savings, 2),
                payback_years=round(payback, 1),
                optimization_score=composite_score,
            )
        )

    # Filter within budget if specified, otherwise best score
    valid_candidates = evaluations
    if budget_inr is not None and budget_inr > 0:
        within_budget = [c for c in evaluations if c.tank_cost_inr <= budget_inr]
        if within_budget:
            valid_candidates = within_budget

    best_candidate = max(valid_candidates, key=lambda c: c.optimization_score)

    note = (
        f"Capacity of {int(best_candidate.capacity_litres):,} L yields the highest composite efficiency "
        f"meeting {best_candidate.demand_met_percentage}% of annual demand with an estimated "
        f"{best_candidate.payback_years}-year payback."
    )

    return OptimizationSummary(
        optimal_capacity_litres=best_candidate.capacity_litres,
        optimal_evaluation=best_candidate,
        all_candidates=evaluations,
        recommendation_note=note,
    )
