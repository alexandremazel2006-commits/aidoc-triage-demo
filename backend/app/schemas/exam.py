from __future__ import annotations

from pydantic import BaseModel, Field


class PredictionOut(BaseModel):
    condition: str
    score: float = Field(..., ge=0.0, le=1.0, description="Raw model output score, not a calibrated clinical probability.")


class AnalyzeResponse(BaseModel):
    patient_id: str
    patient_age: int | None = None
    patient_sex: str | None = None
    clinical_indication: str | None = None
    predictions: list[PredictionOut]
    priority: str
    processing_time_seconds: float
