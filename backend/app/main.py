from fastapi import FastAPI

from app.api.assets import router as assets_router
from app.api.auth import router as auth_router
from app.api.vulnerabilities import router as vulnerabilities_router
from app.api.security_events import router as security_events_router
from app.api.incidents import router as incidents_router


app = FastAPI(
    title="SentinelOps API",
    description="Secure IT Operations & Security Monitoring Platform",
    version="0.1.0",
)


app.include_router(auth_router)
app.include_router(assets_router)
app.include_router(vulnerabilities_router)
app.include_router(security_events_router)
app.include_router(incidents_router)


@app.get("/")
def root():
    return {
        "message": "SentinelOps API is running",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }