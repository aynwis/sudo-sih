from pydantic import BaseModel
from typing import Literal

#Contract definition for Raster JSON
class Bounds(BaseModel):
    left: float
    right: float
    top: float
    bottom: float

class RasterResponse(BaseModel):
    tile_id: str
    image_base64: str
    bounds: Bounds
    source: Literal['mock', 'real']

#Contract definition for Validation Points
class ValidationPoint(BaseModel):
    site_id: str
    lat: float
    lon: float
    precision_flag: Literal['mine-level', 'district-level', 'state-level']
    #Possible expansion to cover other minerals in the future
    commodity: str = 'Manganese'

class ValidationPointsResponse(BaseModel):
    tile_id: str
    count: int
    points: list[ValidationPoint]

#Contract Definition for Regression Estimation
class RegressionEstimate(BaseModel):
    site_id: str
    grade_pct_estimate: float
    tonnage_estimate: float
    #Only one confidence level defined due to mock dataset
    confidence: Literal['preliminary'] = 'preliminary'

class RegressionResponse(BaseModel):
    #Only one confidence level defined due to mock dataset
    status: Literal['preliminary']
    #Possible addition of other regression methods
    method: str
    n_training_points: int
    estimates: list[RegressionEstimate]

#API Receipt lookup helpers
class ReceiptSource(BaseModel):
    file: str
    sheet: str
    row: int

class ReceiptResponse(BaseModel):
    metric_id: str
    value: str
    source: ReceiptSource
