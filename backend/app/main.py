from fastapi import FastAPI

app = FastAPI(
    title="SentinelOps API",
    description="Secure IT Operations & Security Monitoring Platform",
    version="0.1.0",
)


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