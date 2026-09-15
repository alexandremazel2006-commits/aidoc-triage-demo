from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PredictionOut(BaseModel):
    condition: str
    score: float = Field(..., ge=0.0, le=1.0, description="Raw model output score, not a calibrated clinical probability.")


class AnalyzeResponse(BaseModel):
    exam_id: str
    patient_id: str
    patient_age: int | None = None
    patient_sex: str | None = None
    clinical_indication: str | None = None
    predictions: list[PredictionOut]
    priority: str
    processing_time_seconds: float


class ExamSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    created_at: datetime
    priority: str
    review_status: str
    top_finding: str | None
    top_score: float | None = None
    processing_time: float


class ExamDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    patient_id: str
    patient_age: int | None
    patient_sex: str | None
    clinical_indication: str | None
    image_url: str
    created_at: datetime
    processing_time: float
    priority: str
    review_status: str
    predictions: list[PredictionOut]
