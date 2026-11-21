import sys
import os
import logging
from contextlib import asynccontextmanager

file_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(file_dir, "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

try:
    from backend.app.config import settings
    from backend.app.database import engine, Base, SessionLocal, get_db
    from backend.app.schemas.api_schemas import LocationRiskInput, LocationRiskOut
    from backend.app.services.location_risk_service import evaluate_location_risk
    from backend.app.services.ml_risk_engine import get_model_artifact
    from backend.app.services.rainfall_data_service import get_last_rainfall_fetch_status

    from backend.app.routers import (
        auth_router,
        wards_router,
        alerts_router,
        shelters_router,
        relief_router,
        telemetry_router
    )
except ImportError:
    from app.config import settings
    from app.database import engine, Base, SessionLocal, get_db
    from app.schemas.api_schemas import LocationRiskInput, LocationRiskOut
    from app.services.location_risk_service import evaluate_location_risk
    from app.services.ml_risk_engine import get_model_artifact
    from app.services.rainfall_data_service import get_last_rainfall_fetch_status
    from app.routers import (
        auth_router,
        wards_router,
        alerts_router,
        shelters_router,
        relief_router,
        telemetry_router
    )

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

# Auto-create DB tables on startup
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} in '{settings.ENVIRONMENT}' environment...")
    logger.info(f"Risk Engine Mode: '{settings.RISK_ENGINE_MODE}'")
    try:
        from backend.seed_data import ensure_migrations_and_admin
        db = SessionLocal()
        ensure_migrations_and_admin(db)
        db.close()
    except Exception as e:
        logger.warning(f"Startup migration check: {e}")
    yield
    logger.info("Shutting down Flood-Flash Early Warning Backend...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Authorized telemetry bridge & early warning emergency portal for Uttarakhand SDMA/DDMA.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(wards_router)
app.include_router(alerts_router)
app.include_router(shelters_router)
app.include_router(relief_router)
app.include_router(telemetry_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": "2.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.APP_NAME}

@app.get("/system-health")
def system_health_check(db=Depends(get_db)):
    # 1. DB Ping
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        db_connected = False

    # 2. ML Model file loaded
    model_loaded = False
    try:
        artifact = get_model_artifact()
        model_loaded = artifact is not None and "model" in artifact
    except Exception as e:
        logger.warning(f"ML model health check failed: {e}")
        model_loaded = False

    # 3. Last rainfall fetch status
    rainfall_status = get_last_rainfall_fetch_status()

    is_healthy = db_connected and model_loaded

    return {
        "status": "healthy" if is_healthy else "degraded",
        "database_connected": db_connected,
        "model_loaded": model_loaded,
        "last_rainfall_fetch": rainfall_status,
        "risk_engine": settings.RISK_ENGINE_MODE,
        "version": "2.0.0"
    }

@app.get("/risk-thresholds")
def get_risk_thresholds():
    return {
        "safe": {"min_score": 0.0, "max_score": 34.9, "color": "emerald"},
        "watch": {"min_score": 35.0, "max_score": 59.9, "color": "blue"},
        "warning": {"min_score": 60.0, "max_score": 81.9, "color": "amber"},
        "critical": {"min_score": 82.0, "max_score": 100.0, "color": "red"}
    }

@app.post("/location-risk", response_model=LocationRiskOut, tags=["Location Risk"])
def root_check_location_risk(payload: LocationRiskInput, db=Depends(get_db)):
    return evaluate_location_risk(payload, db)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
