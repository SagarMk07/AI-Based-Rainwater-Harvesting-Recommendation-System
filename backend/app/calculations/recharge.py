"""Groundwater recharge feasibility and engineering structure sizing based on soil permeability."""

from enum import Enum
from typing import Dict, Any
from pydantic import BaseModel, Field


class SoilType(str, Enum):
    SANDY = "sandy"
    LOAMY = "loamy"
    SILTY = "silty"
    CLAY = "clay"
    ROCKY = "rocky"


class SoilCharacteristics(BaseModel):
    soil_type: SoilType
    percolation_rate_mm_hr: float
    drainage_quality: str
    recharge_suitability_score: float  # 0.0 to 1.0 scale
    description: str


SOIL_DATABASE: Dict[SoilType, SoilCharacteristics] = {
    SoilType.SANDY: SoilCharacteristics(
        soil_type=SoilType.SANDY,
        percolation_rate_mm_hr=35.0,
        drainage_quality="High",
        recharge_suitability_score=0.95,
        description="High infiltration velocity and porous texture. Excellent for shallow recharge pits and trenches.",
    ),
    SoilType.LOAMY: SoilCharacteristics(
        soil_type=SoilType.LOAMY,
        percolation_rate_mm_hr=18.0,
        drainage_quality="Moderate-High",
        recharge_suitability_score=0.85,
        description="Balanced percolation and moisture retention. Well suited for recharge pits, trenches, and shafts.",
    ),
    SoilType.SILTY: SoilCharacteristics(
        soil_type=SoilType.SILTY,
        percolation_rate_mm_hr=7.0,
        drainage_quality="Moderate-Low",
        recharge_suitability_score=0.50,
        description="Fine grain texture with slow permeability. Requires larger percolation trench surface area.",
    ),
    SoilType.CLAY: SoilCharacteristics(
        soil_type=SoilType.CLAY,
        percolation_rate_mm_hr=2.0,
        drainage_quality="Very Poor",
        recharge_suitability_score=0.15,
        description="Dense, expansive clay restricts percolation. Shallow pits cause ponding/waterlogging; requires deep recharge borewell or dedicated surface storage.",
    ),
    SoilType.ROCKY: SoilCharacteristics(
        soil_type=SoilType.ROCKY,
        percolation_rate_mm_hr=0.5,
        drainage_quality="Impervious",
        recharge_suitability_score=0.10,
        description="Hard rock strata impedes shallow percolation. Requires fracture-zone injection well or above-ground storage.",
    ),
}


class RechargeStructureDesign(BaseModel):
    structure_type: str
    dimensions: str
    effective_volume_litres: float
    filter_media: str
    suitability_assessment: str
    estimated_cost_inr: float


def size_recharge_structure(
    soil_type_str: str,
    overflow_litres: float,
    open_area_sqm: float,
    roof_area_sqm: float,
    has_existing_borewell: bool = False,
) -> RechargeStructureDesign:
    """Size and design appropriate groundwater recharge structure.
    
    Adheres to Central Ground Water Board (CGWB) guidelines:
    - Pit: roof < 100 m² or small open space
    - Trench: roof 100-300 m² with linear perimeter space
    - Recharge Shaft / Well: roof > 300 m² or clay layers overlying sandy aquifers
    - Borewell Injection: if existing borewell is available and suitable
    """
    cleaned_soil = soil_type_str.lower().strip()
    soil_enum = SoilType.LOAMY
    for st in SoilType:
        if st.value in cleaned_soil:
            soil_enum = st
            break

    soil_info = SOIL_DATABASE[soil_enum]

    # If clay or rocky and no deep borewell injection
    if soil_enum == SoilType.CLAY:
        if has_existing_borewell:
            return RechargeStructureDesign(
                structure_type="Recharge Borewell Injection",
                dimensions="Deep casing pipe with V-wire screen and dual sand-gravel chamber (2m x 2m x 2m)",
                effective_volume_litres=8000.0,
                filter_media="Graded quartz sand, crushed granite gravel (6-12mm), activated charcoal layer",
                suitability_assessment="Clay soil precludes shallow percolation; injecting filtered runoff into deeper permeable aquifers via casing pipe.",
                estimated_cost_inr=35000.0,
            )
        elif open_area_sqm < 20:
            return RechargeStructureDesign(
                structure_type="Surface Storage Prioritization (Minimal Recharge)",
                dimensions="Overflow bypass to stormwater drain; shallow overflow trench (0.5m x 1m)",
                effective_volume_litres=1000.0,
                filter_media="Coarse gravel bed",
                suitability_assessment="Clay soil and confined open area severely restrict groundwater recharge. Priority is maximum above-ground storage tank.",
                estimated_cost_inr=12000.0,
            )
        else:
            return RechargeStructureDesign(
                structure_type="Recharge Shaft with Deep Filter Chamber",
                dimensions="Shaft diameter 0.8m, depth 4.5m with 1.5m x 1.5m desilting chamber",
                effective_volume_litres=6000.0,
                filter_media="Coarse sand (1.5-2mm), pea gravel (5-10mm), boulders (50-100mm)",
                suitability_assessment="Shaft pierces through top clay layer into sub-surface permeable sandy strata.",
                estimated_cost_inr=42000.0,
            )

    # For Sandy or Loamy soils
    if roof_area_sqm > 300 or overflow_litres > 80000:
        if open_area_sqm >= 40:
            return RechargeStructureDesign(
                structure_type="Recharge Trench with Injection Bore",
                dimensions="Length 8.0m, Width 1.2m, Depth 2.0m with 100mm slotted PVC recharge pipe",
                effective_volume_litres=15000.0,
                filter_media="Graded gravel (20-40mm), medium sand bed, geotextile membrane wrapping",
                suitability_assessment="High runoff volume handled via extended trench infiltration and injection pipe directly recharging aquifer.",
                estimated_cost_inr=48000.0,
            )
        else:
            return RechargeStructureDesign(
                structure_type="Compact Recharge Shaft",
                dimensions="Diameter 1.5m, Depth 4.0m with precast RCC rings",
                effective_volume_litres=7000.0,
                filter_media="Graded river pebbles, coarse aggregate, silica sand",
                suitability_assessment="Efficient vertical percolation structure suited for constrained surface footprint.",
                estimated_cost_inr=32000.0,
            )
    elif roof_area_sqm >= 100:
        return RechargeStructureDesign(
            structure_type="Continuous Recharge Trench",
            dimensions="Length 5.0m, Width 1.0m, Depth 1.8m",
            effective_volume_litres=6500.0,
            filter_media="Boulders (50-100mm) at bottom, graded gravel (10-20mm) in middle, coarse sand at top",
            suitability_assessment="Optimal linear infiltration matching medium roof runoff and loamy/sandy soil percolation.",
            estimated_cost_inr=26000.0,
        )
    else:
        return RechargeStructureDesign(
            structure_type="Recharge Pit with Graded Media",
            dimensions="Length 2.0m, Width 2.0m, Depth 2.5m (Circular or Rectangular)",
            effective_volume_litres=4000.0,
            filter_media="Boulder base (40%), coarse aggregate (30%), coarse sand filter bed (30%)",
            suitability_assessment="Standard decentralized recharge pit providing rapid percolation and filtration for residential catchments.",
            estimated_cost_inr=18000.0,
        )
