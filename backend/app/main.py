from fastapi import FastAPI
from app.routers import raster

app = FastAPI(
    title="Mineral Prospectivity API",
    description="Backend API serving raster heatmaps and deposit validation points.",
    version="1.0.0",
)

app.include_router(raster.router)