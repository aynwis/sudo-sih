from fastapi import APIRouter
from app.api_contracts import Bounds, RasterResponse

#Create a router for map rastering
router = APIRouter(prefix='/api', tags=['/raster'])

@router.get('/raster', response_model=RasterResponse)
def get_raster(tile_id: str = "tile02_Jamunjhola", source: str = "mock"):
    return RasterResponse(
        tile_id=tile_id,
        image_base64="data:image/png;base64,placeholder",

        bounds=Bounds(
            left=78.85,
            right=80.57,
            top=21.79,
            bottom=21.26,
        ),

        source="mock",
    )