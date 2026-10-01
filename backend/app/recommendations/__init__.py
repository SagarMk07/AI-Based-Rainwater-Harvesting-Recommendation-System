"""Multi-criteria recommendation and explainability package."""

from backend.app.recommendations.recommender import (
    generate_recommendation,
    SystemType,
    SystemRecommendation,
)
from backend.app.recommendations.explainer import (
    build_explanation,
    ExplainabilityResponse,
)

__all__ = [
    "generate_recommendation",
    "SystemType",
    "SystemRecommendation",
    "build_explanation",
    "ExplainabilityResponse",
]
