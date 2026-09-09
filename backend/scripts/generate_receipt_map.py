import json
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
EXCEL_PATH = DATA_DIR / "PS26009_GroundTruth_Supplemented.xlsx"
OUTPUT_JSON = DATA_DIR / "receipt_lookup.json"


def generate_map():
  if not EXCEL_PATH.exists():
    raise FileNotFoundError(f"Workbook not found at {EXCEL_PATH}")

  lookup = {}
  source_filename = EXCEL_PATH.name

  # 1. Index Ground_Truth_Clean (143 unique clusters)
  gt_df = pd.read_excel(EXCEL_PATH, sheet_name="Ground_Truth_Clean")
  for idx, row in gt_df.iterrows():
    excel_row = idx + 2  # Excel 1-based indexing + header row
    cluster_id = str(row.get("cluster_id", "")).strip().lower()
    name = str(row.get("name", "")).strip().lower()

    entry = {
        "source_file": source_filename,
        "sheet": "Ground_Truth_Clean",
        "row": excel_row,
        "site_name": str(row.get("name", "")),
        "cluster_id": str(row.get("cluster_id", "")),
        "latitude": row.get("latitude"),
        "longitude": row.get("longitude"),
        "coord_precision": str(row.get("coord_precision", "")),
    }

    if cluster_id:
      lookup[cluster_id] = entry
    if name:
      lookup[name] = entry

  # 2. Index Grade_Tonnage_Clean (Regression Points)
  tonnage_df = pd.read_excel(EXCEL_PATH, sheet_name="Grade_Tonnage_Clean")
  for idx, row in tonnage_df.iterrows():
    excel_row = idx + 2
    name = str(row.get("name", "")).strip().lower()
    source_id = str(row.get("source_id", "")).strip().lower()

    entry = {
        "source_file": source_filename,
        "sheet": "Grade_Tonnage_Clean",
        "row": excel_row,
        "site_name": str(row.get("name", "")),
        "source_id": str(row.get("source_id", "")),
        "latitude": row.get("latitude"),
        "longitude": row.get("longitude"),
        "grade": str(row.get("grade", "")),
        "tonnage_mt": row.get("tonnage_mt"),
        "coord_precision": str(row.get("coord_precision", "")),
    }

    if name:
      lookup[f"regression_{name}"] = entry
      if name not in lookup:
        lookup[name] = entry
    if source_id:
      lookup[f"source_{source_id}"] = entry

  # 3. Add explicit canonical anchors
  lookup["143_ground_truth_count"] = {
      "source_file": source_filename,
      "sheet": "Ground_Truth_Clean",
      "row": 1,
      "description": (
          "143 unique cluster representatives deduped from 231 records"
      ),
  }
  lookup["13_regression_points"] = {
      "source_file": source_filename,
      "sheet": "Grade_Tonnage_Clean",
      "row": 1,
      "description": (
          "13 unique locations with genuine mine-level coordinate precision"
      ),
  }

  with open(OUTPUT_JSON, "w") as f:
    json.dump(lookup, f, indent=2)

  print(
      f" Successfully generated {len(lookup)} receipt mappings ->"
      f" {OUTPUT_JSON}"
  )


if __name__ == "__main__":
  generate_map()