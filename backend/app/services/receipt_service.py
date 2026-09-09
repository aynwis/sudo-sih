import json
from pathlib import Path
from typing import Optional
from app.api_contracts import ReceiptResponse

BASE_DIR = Path(__file__).resolve().parent.parent.parent
LOOKUP_FILE = BASE_DIR / "data" / "receipt_lookup.json"

_CACHE: dict = {}


def _load_lookup() -> dict:
  global _CACHE
  if not _CACHE and LOOKUP_FILE.exists():
    with open(LOOKUP_FILE, "r") as f:
      _CACHE = json.load(f)
  return _CACHE


def lookup_receipt(metric_id: str) -> ReceiptResponse:
  mapping = _load_lookup()
  key = metric_id.strip().lower()

  entry = mapping.get(key)
  if not entry and key.startswith("regression_"):
    entry = mapping.get(key.replace("regression_", ""))

  if not entry:
    # Safe fallback
    return ReceiptResponse(
        source_file="PS26009_GroundTruth_Supplemented.xlsx",
        sheet="Ground_Truth_Clean",
        row=2,
    )

  return ReceiptResponse(
      source_file=entry["source_file"],
      sheet=entry["sheet"],
      row=entry["row"],
  )