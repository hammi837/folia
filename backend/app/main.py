from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine, Base
from app.db.migrate import ensure_schema_patches
import app.db.base  # noqa: F401 — register models

UPLOAD_ROOT = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
(UPLOAD_ROOT / "products").mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_schema_patches()
    from app.db.session import SessionLocal
    from app.services.content_cards import ensure_default_content_cards

    db = SessionLocal()
    try:
        ensure_default_content_cards(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
