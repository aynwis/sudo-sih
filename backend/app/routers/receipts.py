from fastapi import APIRouter, HTTPException
from app.api_contracts import ReceiptResponse
from app.services.receipt_service import lookup_receipt

router = APIRouter(prefix="/api/v1", tags=["receipts"])


@router.get("/receipts/{metric_id}", response_model=ReceiptResponse)
def get_receipt(metric_id: str):
    if not metric_id.strip():
        raise HTTPException(status_code=400, detail="metric_id cannot be empty")

    return lookup_receipt(metric_id)