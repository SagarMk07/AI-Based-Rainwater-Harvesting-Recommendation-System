"""Deterministic engineering calculations for rainwater runoff and harvest potential."""

from enum import Enum
from typing import Dict


class RoofType(str, Enum):
    RCC = "rcc"
    METAL_SHEET = "metal_sheet"
    CLAY_TILES = "clay_tiles"
    ASBESTOS = "asbestos"
    PAVED_TILES = "paved_tiles"


# Standard civil engineering runoff coefficients (IS 15797 / CPWD RWH manual)
RUNOFF_COEFFICIENTS: Dict[RoofType, float] = {
    RoofType.RCC: 0.85,
    RoofType.METAL_SHEET: 0.90,
    RoofType.CLAY_TILES: 0.80,
    RoofType.ASBESTOS: 0.80,
    RoofType.PAVED_TILES: 0.70,
}

# Default collection and filter efficiency (accounting for gutter overflow and first-flush diversion)
DEFAULT_FILTER_EFFICIENCY = 0.90


def get_runoff_coefficient(roof_type: str) -> float:
    """Retrieve the standard runoff coefficient for a given roof material."""
    cleaned = roof_type.lower().strip()
    for rt, coeff in RUNOFF_COEFFICIENTS.items():
        if rt.value == cleaned:
            return coeff
    # Common aliases
    aliases = {
        "concrete": 0.85,
        "flat roof": 0.85,
        "metal": 0.90,
        "tin": 0.90,
        "sheet": 0.90,
        "tile": 0.80,
        "terracotta": 0.80,
        "slate": 0.80,
        "paved": 0.70,
    }
    for alias_key, coeff in aliases.items():
        if alias_key in cleaned:
            return coeff
    raise ValueError(f"Unknown roof type '{roof_type}'. Supported types: {[r.value for r in RoofType]}")


def calculate_gross_harvest(
    roof_area_sqm: float,
    rainfall_mm: float,
    runoff_coefficient: float,
) -> float:
    """Calculate theoretical gross harvest volume in Litres.
    
    Formula:
        Harvested Water (L) = Rainfall (mm) * Roof Area (m²) * Runoff Coefficient
    
    Explanation:
        1 mm of rainfall over 1 m² = 1 Litre of water.
        
    Args:
        roof_area_sqm: Catchment roof area in square metres (must be > 0).
        rainfall_mm: Rainfall in millimetres (must be >= 0).
        runoff_coefficient: Fraction of water running off (0.0 to 1.0).
        
    Returns:
        Gross harvest in litres.
    """
    if roof_area_sqm < 0:
        raise ValueError("Roof area cannot be negative.")
    if rainfall_mm < 0:
        raise ValueError("Rainfall cannot be negative.")
    if not (0.0 <= runoff_coefficient <= 1.0):
        raise ValueError("Runoff coefficient must be between 0.0 and 1.0.")

    return float(rainfall_mm * roof_area_sqm * runoff_coefficient)


def calculate_collectable_water(
    gross_harvest_litres: float,
    filter_efficiency: float = DEFAULT_FILTER_EFFICIENCY,
    first_flush_mm: float = 1.0,
    roof_area_sqm: float = 0.0,
) -> float:
    """Calculate net collectable water after first-flush diversion and filter losses.
    
    Args:
        gross_harvest_litres: Gross theoretical harvest in litres.
        filter_efficiency: Filter mesh and gutter conveyance efficiency (0.75 - 0.98).
        first_flush_mm: Rainfall depth diverted as first-flush to purge roof dirt (typically 1-2 mm).
        roof_area_sqm: Catchment area for first flush calculation.
        
    Returns:
        Collectable volume in litres.
    """
    if gross_harvest_litres < 0:
        raise ValueError("Gross harvest cannot be negative.")
    if not (0.0 <= filter_efficiency <= 1.0):
        raise ValueError("Filter efficiency must be between 0.0 and 1.0.")

    first_flush_litres = max(0.0, first_flush_mm * roof_area_sqm)
    net_before_filter = max(0.0, gross_harvest_litres - first_flush_litres)
    return float(net_before_filter * filter_efficiency)
