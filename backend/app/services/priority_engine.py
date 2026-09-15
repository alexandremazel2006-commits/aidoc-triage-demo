"""
AI workflow priority — demonstration only.

These thresholds are NOT clinically validated. They exist purely to drive
the demo's queue/dashboard sorting and are intentionally centralized here so
they're easy to find, change, and audit — they must never be presented as a
medical triage standard.
"""

from __future__ import annotations

# Pathologies whose score most directly maps to an urgent, time-sensitive
# finding in a real emergency-radiology workflow (e.g. pneumothorax).
# This list, like the thresholds below, is a demo simplification.
HIGH_URGENCY_CONDITIONS = {"Pneumothorax", "Pneumonia", "Effusion"}

DEMO_THRESHOLDS = {
    "critical": 0.85,
    "high": 0.60,
    "medium": 0.35,
}

PRIORITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]


def compute_priority(predictions: list[dict]) -> str:
    """Demo thresholds — not clinically validated.

    `predictions` is the sorted (desc) list of {"condition", "score"} dicts
    returned by prediction.run_inference.
    """
    if not predictions:
        return "LOW"

    top = predictions[0]
    score = top["score"]
    condition = top["condition"]

    is_urgency_condition = condition in HIGH_URGENCY_CONDITIONS

    if score >= DEMO_THRESHOLDS["critical"] and is_urgency_condition:
        return "CRITICAL"
    if score >= DEMO_THRESHOLDS["high"]:
        return "HIGH"
    if score >= DEMO_THRESHOLDS["medium"]:
        return "MEDIUM"
    return "LOW"
