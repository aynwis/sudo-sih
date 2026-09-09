from fastapi import APIRouter, HTTPException
from app.api_contracts import ReceiptResponse
from app.services.receipt_service import lookup_receipt

router = APIRouter(tags=["receipts"])


@router.get("/api/v1/receipt-sheet/{site_id}", response_model=ReceiptResponse)
@router.get("/api/receipt-sheet/{site_id}", response_model=ReceiptResponse)
@router.get("/api/v1/receipts/{site_id}", response_model=ReceiptResponse)
def get_receipt(site_id: str):
  if not site_id.strip():
    raise HTTPException(status_code=400, detail="site_id cannot be empty")

  return lookup_receipt(site_id)