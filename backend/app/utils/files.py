from __future__ import annotations

import random
import string
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import settings

ALLOWED_MIME_TYPES = {"image/png", "image/jpeg"}


class UploadValidationError(ValueError):
    pass


def generate_patient_id() -> str:
    return "RX-" + "".join(random.choices(string.digits, k=5))


def validate_upload(file: UploadFile, size_bytes: int) -> None:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in settings.allowed_upload_extensions:
        raise UploadValidationError(
            f"Unsupported file extension '{extension}'. "
            f"Allowed: {', '.join(settings.allowed_upload_extensions)}"
        )

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise UploadValidationError(
            f"Unsupported content type '{file.content_type}'."
        )

    if size_bytes == 0:
        raise UploadValidationError("Uploaded file is empty.")

    if size_bytes > settings.max_upload_size_bytes:
        max_mb = settings.max_upload_size_bytes / (1024 * 1024)
        raise UploadValidationError(f"File too large — limit is {max_mb:.0f} MB.")


def save_upload(file_bytes: bytes, original_filename: str) -> Path:
    extension = Path(original_filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{extension}"
    destination = settings.upload_dir / unique_name
    destination.write_bytes(file_bytes)
    return destination
