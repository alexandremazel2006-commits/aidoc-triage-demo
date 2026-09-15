from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.exam import AnalyzeResponse, PredictionOut
from app.services.prediction import run_inference
from app.services.preprocessing import InvalidImageError, preprocess_image_bytes
from app.services.priority_engine import compute_priority
from app.utils.files import (
    UploadValidationError,
    generate_patient_id,
    save_upload,
    validate_upload,
)

router = APIRouter(prefix="/api/exams", tags=["exams"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_exam(
    file: UploadFile = File(...),
    patient_id: str | None = Form(default=None),
    patient_age: int | None = Form(default=None),
    patient_sex: str | None = Form(default=None),
    clinical_indication: str | None = Form(default=None),
):
    file_bytes = await file.read()

    try:
        validate_upload(file, len(file_bytes))
    except UploadValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        image_tensor = preprocess_image_bytes(file_bytes)
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    save_upload(file_bytes, file.filename or "upload.png")

    try:
        predictions, elapsed = run_inference(image_tensor)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=f"Model error: {exc}") from exc

    priority = compute_priority(predictions)

    return AnalyzeResponse(
        patient_id=patient_id or generate_patient_id(),
        patient_age=patient_age,
        patient_sex=patient_sex,
        clinical_indication=clinical_indication,
        predictions=[PredictionOut(**p) for p in predictions],
        priority=priority,
        processing_time_seconds=round(elapsed, 3),
    )
