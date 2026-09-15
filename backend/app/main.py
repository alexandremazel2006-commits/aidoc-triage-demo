from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.exams import router as exams_router
from app.config import settings
from app.database import Base, engine
from app.models import exam as _exam_models  # noqa: F401 — registers tables
from app.services.ai_model import get_loaded_device, load_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Load the model exactly once, at process startup — never per-request.
    load_model()
    print(f"[RadioCheck AI] Model loaded on device: {get_loaded_device()}")
    yield


app = FastAPI(
    title=settings.app_name,
    description="Research & educational use only — Not intended for clinical diagnosis.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exams_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.environment,
    }
