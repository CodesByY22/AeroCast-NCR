from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.forecast_router import router as forecast_router

app = FastAPI(
    title="AeroCast NCR API",
    description="Air Pollution-Weather Coupled Forecasting System (Delhi NCR Focus)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast_router)

@app.get("/")
def read_root():
    return {
        "system": "AeroCast NCR API",
        "status": "operational",
        "benchmark": "Inspired by IITM/IMD 400m WRF-Chem system (Scientific Reports, 2021)",
        "disclaimer": "All derived indices (Inversion/Ventilation) are Proxy metrics."
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
