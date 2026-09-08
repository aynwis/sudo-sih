"""Proves reconcile_ground_truth.reconcile() actually works, using small
synthetic fixtures -- NOT the real 143/148-site workbooks, which aren't
available in this environment. Run this after any change to the merge
logic before trusting it against the real files.
"""
import os

import pandas as pd

from reconcile_ground_truth import reconcile

FIXTURE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")


def make_fixtures():
    os.makedirs(FIXTURE_DIR, exist_ok=True)
    master = pd.DataFrame({"site_id": ["A1", "A2", "A3"], "mine_name": ["Gumgaon", "Mansar", "Ukwa"]})
    tile_map = pd.DataFrame({"site_id": ["A1", "A2", "A4"], "tile": ["tile02", "tile02", "tile05"]})
    master.to_excel(f"{FIXTURE_DIR}/master.xlsx", index=False)
    tile_map.to_excel(f"{FIXTURE_DIR}/tile_map.xlsx", index=False)


if __name__ == "__main__":
    make_fixtures()
    reconciled = reconcile(
        f"{FIXTURE_DIR}/master.xlsx",
        f"{FIXTURE_DIR}/tile_map.xlsx",
        f"{FIXTURE_DIR}/reconciled.xlsx",
    )
    assert len(reconciled) == 2, "expected exactly the 2 rows that matched on site_id"
    print("Demo reconciliation confirmed working.")
