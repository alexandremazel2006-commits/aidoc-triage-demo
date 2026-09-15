from __future__ import annotations

import base64
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exam import Exam, Prediction
from app.schemas.exam import (
    AnalyzeResponse,
    ExamDetailOut,
    ExamSummaryOut,
    HeatmapResponse,
    PredictionOut,
)
from app.services.ai_model import get_model
from app.services.gradcam import UnknownConditionError, array_to_grayscale_png, compute_gradcam
from app.services.prediction import run_inference
from app.services.preprocessing import (
    InvalidImageError,
    normalized_array_to_uint8,
    preprocess_image_bytes,
    preprocess_image_bytes_full,
)
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
    db: Session = Depends(get_db),
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

    saved_path = save_upload(file_bytes, file.filename or "upload.png")

    try:
        predictions, elapsed = run_inference(image_tensor)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=f"Model error: {exc}") from exc

    priority = compute_priority(predictions)

    exam = Exam(
        patient_id=patient_id or generate_patient_id(),
        patient_age=patient_age,
        patient_sex=patient_sex,
        clinical_indication=clinical_indication,
        image_path=str(saved_path),
        processing_time=round(elapsed, 3),
        priority=priority,
    )
    exam.predictions = [
        Prediction(condition=p["condition"], score=p["score"]) for p in predictions
    ]
    db.add(exam)
    db.commit()
    db.refresh(exam)

    return AnalyzeResponse(
        exam_id=exam.id,
        patient_id=exam.patient_id,
        patient_age=exam.patient_age,
        patient_sex=exam.patient_sex,
        clinical_indication=exam.clinical_indication,
        predictions=[PredictionOut(**p) for p in predictions],
        priority=priority,
        processing_time_seconds=exam.processing_time,
    )


@router.get("", response_model=list[ExamSummaryOut])
def list_exams(db: Session = Depends(get_db)):
    exams = db.scalars(select(Exam).order_by(Exam.created_at.desc())).all()
    return [
        ExamSummaryOut(
            id=e.id,
            patient_id=e.patient_id,
            created_at=e.created_at,
            priority=e.priority,
            review_status=e.review_status,
            top_finding=e.top_finding,
            top_score=e.top_score,
            processing_time=e.processing_time,
        )
        for e in exams
    ]


@router.get("/{exam_id}", response_model=ExamDetailOut)
def get_exam(exam_id: str, db: Session = Depends(get_db)):
    exam = db.get(Exam, exam_id)
    if exam is None:
        raise HTTPException(status_code=404, detail="Exam not found.")
    return ExamDetailOut(
        id=exam.id,
        patient_id=exam.patient_id,
        patient_age=exam.patient_age,
        patient_sex=exam.patient_sex,
        clinical_indication=exam.clinical_indication,
        image_url=f"/uploads/{Path(exam.image_path).name}",
        created_at=exam.created_at,
        processing_time=exam.processing_time,
        priority=exam.priority,
        review_status=exam.review_status,
        predictions=[
            PredictionOut(condition=p.condition, score=p.score) for p in exam.predictions
        ],
    )


@router.get("/{exam_id}/heatmap", response_model=HeatmapResponse)
def get_heatmap(exam_id: str, condition: str = Query(...), db: Session = Depends(get_db)):
    exam = db.get(Exam, exam_id)
    if exam is None:
        raise HTTPException(status_code=404, detail="Exam not found.")

    try:
        file_bytes = Path(exam.image_path).read_bytes()
    except OSError as exc:
        raise HTTPException(
            status_code=404, detail=f"Original image file is missing: {exc}"
        ) from exc

    image_tensor, normalized_array = preprocess_image_bytes_full(file_bytes)

    try:
        heatmap_png = compute_gradcam(image_tensor, condition)
    except UnknownConditionError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    original_png = array_to_grayscale_png(normalized_array_to_uint8(normalized_array))

    model = get_model()
    return HeatmapResponse(
        condition=condition,
        image_base64=base64.b64encode(original_png).decode("ascii"),
        heatmap_base64=base64.b64encode(heatmap_png).decode("ascii"),
        available_conditions=[p for p in model.pathologies if p],
    )
