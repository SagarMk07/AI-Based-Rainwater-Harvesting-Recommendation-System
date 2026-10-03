"""Dataset generation for rainwater harvesting system recommendation classification.

Generates 5,400 realistic property records spanning multiple climate zones,
roof types, occupancy rates, soil permeabilities, and financial constraints.
Labels are assigned using transparent civil engineering criteria (IS 15797 / CGWB).
"""

import os
import csv
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
os.makedirs(DATA_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(DATA_DIR, "recommendations_dataset.csv")

RUNOFF_COEFFICIENTS = {
    "rcc": 0.85,
    "metal": 0.90,
    "tiles": 0.80,
    "pavers": 0.70,
}

SOIL_PERCOLATION = {
    "sandy": 35.0,  # mm/hr
    "loamy": 20.0,
    "silty": 10.0,
    "clay": 2.5,
    "rocky": 1.0,
}


def assign_engineering_label(
    roof_area: float,
    rainfall: float,
    open_area: float,
    soil: str,
    occupants: int,
    daily_demand: float,
    budget: float,
    recharge_pref: bool,
    drainage: bool,
    harvest_l: float,
    demand_l: float,
) -> str:
    """Assign ground-truth system recommendation based on civil hydrology constraints.
    
    Classes:
    1. Storage Tank: Tight space (<15m²), impermeable soil (clay/rocky), or modest budget for surface storage only.
    2. Recharge Pit: Permeable soil, modest catchment (<280m²), moderate budget, or recharge preference.
    3. Recharge Well: Large catchment (>=280m²), high runoff (>=180,000L), permeable soil, deep recharge shaft.
    4. Hybrid System: Substantial harvest (>=50,000L), high demand, ample open space, permeable soil, and sufficient budget (>=60,000 INR).
    """
    soil_rate = SOIL_PERCOLATION.get(soil, 15.0)
    has_tight_space = open_area < 15.0
    is_impermeable = soil in ["clay", "rocky"]
    is_large_catchment = roof_area >= 280.0
    is_high_harvest = harvest_l >= 55000.0
    is_high_demand = demand_l >= 95000.0
    has_sufficient_budget = budget >= 60000.0
    permeable_ground = (open_area >= 18.0) and (soil_rate >= 10.0)

    # Rule 1: Physical constraint against underground recharge -> Storage Tank
    if has_tight_space or (is_impermeable and not recharge_pref) or budget < 25000.0:
        return "Storage Tank"

    # Rule 2: Dedicated Recharge Preference
    if permeable_ground and recharge_pref:
        if is_large_catchment or open_area >= 120.0 or harvest_l >= 180000.0:
            return "Recharge Well"
        else:
            return "Recharge Pit"

    # Rule 3: Budget constraints favoring recharge pit over expensive storage/hybrid
    if permeable_ground and budget < 55000.0:
        if not is_large_catchment and harvest_l < 150000.0:
            return "Recharge Pit"
        else:
            return "Recharge Well"

    # Rule 4: Balanced Dual Need & Capacity -> Hybrid System
    if is_high_harvest and is_high_demand and permeable_ground and has_sufficient_budget:
        return "Hybrid System"

    # Rule 5: Low demand or surplus runoff relative to domestic use
    if permeable_ground and (demand_l < (harvest_l * 0.85)):
        if is_large_catchment or harvest_l >= 150000.0:
            return "Recharge Well"
        else:
            return "Recharge Pit"

    # Rule 6: Moderate catchment with permeable ground and open space
    if permeable_ground and open_area >= 20.0:
        if not is_high_demand:
            return "Recharge Pit"

    return "Storage Tank"


def generate_dataset(n_samples: int = 5400, seed: int = 42):
    """Generate 5,400 multi-criteria records with realistic hydrological distributions."""
    np.random.seed(seed)
    records = []

    roof_types = ["rcc", "metal", "tiles", "pavers"]
    roof_probs = [0.55, 0.20, 0.15, 0.10]

    soil_types = ["sandy", "loamy", "silty", "clay", "rocky"]
    soil_probs = [0.25, 0.35, 0.15, 0.15, 0.10]

    property_types = ["residential", "commercial", "institutional", "industrial"]
    prop_probs = [0.55, 0.22, 0.13, 0.10]

    for _ in range(n_samples):
        # 1. Geographic Rainfall (India range: semi-arid 300mm to coastal 3200mm)
        rain_zone = np.random.choice(["semi_arid", "moderate", "high", "extreme"], p=[0.25, 0.40, 0.25, 0.10])
        if rain_zone == "semi_arid":
            rainfall = float(round(np.random.uniform(300.0, 650.0), 1))
        elif rain_zone == "moderate":
            rainfall = float(round(np.random.uniform(650.0, 1200.0), 1))
        elif rain_zone == "high":
            rainfall = float(round(np.random.uniform(1200.0, 2200.0), 1))
        else:
            rainfall = float(round(np.random.uniform(2200.0, 3200.0), 1))

        # 2. Property & Roof
        prop_type = np.random.choice(property_types, p=prop_probs)
        roof_type = np.random.choice(roof_types, p=roof_probs)
        runoff_c = RUNOFF_COEFFICIENTS[roof_type]

        if prop_type == "residential":
            roof_area = float(round(np.random.uniform(30.0, 320.0), 1))
            occupants = int(np.random.randint(2, 9))
            daily_demand = float(round(occupants * np.random.uniform(110.0, 160.0), 1))
            open_area = float(round(np.random.uniform(0.0, 120.0), 1))
            budget = float(round(np.random.uniform(20000.0, 150000.0), -3))
        elif prop_type == "commercial":
            roof_area = float(round(np.random.uniform(150.0, 1000.0), 1))
            occupants = int(np.random.randint(10, 40))
            daily_demand = float(round(occupants * np.random.uniform(35.0, 80.0), 1))
            open_area = float(round(np.random.uniform(20.0, 350.0), 1))
            budget = float(round(np.random.uniform(70000.0, 350000.0), -3))
        elif prop_type == "institutional":
            roof_area = float(round(np.random.uniform(350.0, 1800.0), 1))
            occupants = int(np.random.randint(20, 70))
            daily_demand = float(round(occupants * np.random.uniform(25.0, 60.0), 1))
            open_area = float(round(np.random.uniform(40.0, 500.0), 1))
            budget = float(round(np.random.uniform(100000.0, 450000.0), -3))
        else:  # industrial
            roof_area = float(round(np.random.uniform(500.0, 2500.0), 1))
            occupants = int(np.random.randint(15, 50))
            daily_demand = float(round(occupants * np.random.uniform(40.0, 100.0), 1))
            open_area = float(round(np.random.uniform(40.0, 600.0), 1))
            budget = float(round(np.random.uniform(140000.0, 500000.0), -3))

        annual_demand = float(round(daily_demand * 365.0, 1))

        # 3. Soil & Site conditions
        soil_type = np.random.choice(soil_types, p=soil_probs)
        drainage_available = bool(np.random.choice([True, False], p=[0.75, 0.25]))
        recharge_pref = bool(np.random.choice([True, False], p=[0.45, 0.55]))

        # 4. Deterministic engineering calculations (IS 15797: 1mm over 1m2 = 1L)
        filter_eff = 0.90
        gross_harvest = rainfall * roof_area * runoff_c
        estimated_harvest_l = float(round(gross_harvest * filter_eff, 1))

        # 5. Derived Features
        harvest_to_demand_ratio = float(round(estimated_harvest_l / max(1.0, annual_demand), 3))
        roof_to_open_area_ratio = float(round(roof_area / max(1.0, open_area), 3))
        estimated_monthly_harvest = float(round(estimated_harvest_l / 12.0, 1))
        # Municipal avoided cost assumed ₹50 / 1,000 L (₹0.05 / L)
        estimated_annual_savings = float(round(min(estimated_harvest_l, annual_demand) * 0.05, 1))

        # 6. Assign Label
        system_label = assign_engineering_label(
            roof_area=roof_area,
            rainfall=rainfall,
            open_area=open_area,
            soil=soil_type,
            occupants=occupants,
            daily_demand=daily_demand,
            budget=budget,
            recharge_pref=recharge_pref,
            drainage=drainage_available,
            harvest_l=estimated_harvest_l,
            demand_l=annual_demand,
        )

        records.append({
            "annual_rainfall_mm": rainfall,
            "roof_area_m2": roof_area,
            "roof_type": roof_type,
            "runoff_coefficient": runoff_c,
            "occupants": occupants,
            "daily_water_demand_l": daily_demand,
            "annual_water_demand_l": annual_demand,
            "soil_type": soil_type,
            "open_area_m2": open_area,
            "drainage_available": drainage_available,
            "groundwater_recharge_preference": recharge_pref,
            "property_type": prop_type,
            "budget": budget,
            "estimated_harvest_l": estimated_harvest_l,
            "harvest_to_demand_ratio": harvest_to_demand_ratio,
            "roof_to_open_area_ratio": roof_to_open_area_ratio,
            "estimated_monthly_harvest": estimated_monthly_harvest,
            "estimated_annual_savings": estimated_annual_savings,
            "recommended_system": system_label,
        })

    # Save to CSV
    fieldnames = list(records[0].keys())
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"Generated {len(records)} records at: {OUTPUT_FILE}")

    # Class balance inspection
    from collections import Counter
    counts = Counter(r["recommended_system"] for r in records)
    print("\nClass Distribution:")
    for cls_name, cnt in sorted(counts.items()):
        pct = (cnt / len(records)) * 100
        print(f"  {cls_name:16s}: {cnt:4d} ({pct:.2f}%)")


if __name__ == "__main__":
    generate_dataset()
