from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "RadioCheck AI"
    environment: str = "development"

    upload_dir: Path = BACKEND_DIR / "uploads"
    database_url: str = f"sqlite:///{BACKEND_DIR / 'radiocheck.db'}"

    # Comma-separated list of allowed frontend origins for CORS.
    cors_origins: list[str] = ["http://localhost:3000"]

    max_upload_size_bytes: int = 15 * 1024 * 1024  # 15 MB
    allowed_upload_extensions: tuple[str, ...] = (".png", ".jpg", ".jpeg")

    # Research & educational use only — not intended for clinical diagnosis.
    # See /about-ai and the README for the full disclaimer.


settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
