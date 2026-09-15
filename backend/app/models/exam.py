import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> str:
    return uuid.uuid4().hex


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    patient_id: Mapped[str] = mapped_column(String, index=True)
    patient_age: Mapped[Optional[int]] = mapped_column(nullable=True)
    patient_sex: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    clinical_indication: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image_path: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow, index=True)
    processing_time: Mapped[float] = mapped_column()
    priority: Mapped[str] = mapped_column(String, index=True)
    # "Needs review" | "Reviewed" — demo workflow status, not a clinical record.
    review_status: Mapped[str] = mapped_column(String, default="Needs review")

    predictions: Mapped[list["Prediction"]] = relationship(
        back_populates="exam", cascade="all, delete-orphan"
    )
    report: Mapped[Optional["Report"]] = relationship(
        back_populates="exam", cascade="all, delete-orphan", uselist=False
    )
    review: Mapped[Optional["Review"]] = relationship(
        back_populates="exam", cascade="all, delete-orphan", uselist=False
    )

    @property
    def _top_prediction(self) -> Optional["Prediction"]:
        if not self.predictions:
            return None
        return max(self.predictions, key=lambda p: p.score)

    @property
    def top_finding(self) -> Optional[str]:
        top = self._top_prediction
        return top.condition if top else None

    @property
    def top_score(self) -> Optional[float]:
        top = self._top_prediction
        return top.score if top else None


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    exam_id: Mapped[str] = mapped_column(ForeignKey("exams.id"), index=True)
    condition: Mapped[str] = mapped_column(String)
    score: Mapped[float] = mapped_column()

    exam: Mapped[Exam] = relationship(back_populates="predictions")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    exam_id: Mapped[str] = mapped_column(ForeignKey("exams.id"), unique=True, index=True)
    draft_text: Mapped[str] = mapped_column(String)
    edited_text: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)

    exam: Mapped[Exam] = relationship(back_populates="report")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    exam_id: Mapped[str] = mapped_column(ForeignKey("exams.id"), unique=True, index=True)
    # "confirmed" | "rejected" | "needs_further_review"
    decision: Mapped[str] = mapped_column(String)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(default=_utcnow)

    exam: Mapped[Exam] = relationship(back_populates="review")
