"""
Deterministic draft report generation — NOT an LLM.

The text is built entirely from the model's own output scores via string
templates. No radiological observation, anatomical claim, or clinical
interpretation is invented — every line traces back to a
(condition, score) pair the model actually produced. This keeps the
project fully functional without any paid API (see brief section 28).
"""

from __future__ import annotations

from app.models.exam import Exam

ADDITIONAL_FINDINGS_COUNT = 4
CLOSE_SCORE_GAP = 0.15


def generate_draft_report(exam: Exam) -> str:
    predictions = sorted(exam.predictions, key=lambda p: p.score, reverse=True)
    if not predictions:
        return (
            "EXAM\nChest X-ray\n\n"
            "AI FINDINGS\nNo model output available for this exam.\n\n"
            "This automated draft must be reviewed and validated by a "
            "qualified medical professional."
        )

    top = predictions[0]
    additional = predictions[1 : 1 + ADDITIONAL_FINDINGS_COUNT]

    lines: list[str] = []
    lines.append("EXAM")
    lines.append("Chest X-ray")
    lines.append("")
    lines.append("AI FINDINGS")
    lines.append("Highest model score:")
    lines.append(f"{top.condition} — {top.score:.2f}")

    if additional:
        lines.append("")
        lines.append("Additional model outputs:")
        for p in additional:
            lines.append(f"{p.condition} — {p.score:.2f}")

    lines.append("")
    lines.append("AI SUMMARY")
    if len(predictions) > 1 and (top.score - predictions[1].score) < CLOSE_SCORE_GAP:
        summary = (
            f'"The model produced its highest output score for '
            f"{top.condition.lower()}, closely followed by "
            f'{predictions[1].condition.lower()}. Scores were not clearly separated."'
        )
    else:
        summary = (
            f'"The model produced its highest output score for '
            f'{top.condition.lower()}. Other model outputs were substantially lower."'
        )
    lines.append(summary)

    lines.append("")
    lines.append(
        "This automated draft must be reviewed and validated by a "
        "qualified medical professional."
    )

    return "\n".join(lines)
