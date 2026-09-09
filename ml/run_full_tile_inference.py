import numpy as np
import pandas as pd
import json, os
import xgboost as xgb
from features import extract_features_for_point       # reused verbatim from Day 2
from validate_prospectivity import validate            # already built and tested earlier this project

GRID_ROWS, GRID_COLS = 25, 40          # ~1000 points -- tune this once you know your per-call timing
CHECKPOINT_PATH = "probability_grid_progress.npy"

def build_probability_grid(model, bounds, n_rows=GRID_ROWS, n_cols=GRID_COLS):
    lats = np.linspace(bounds["top"], bounds["bottom"], n_rows)
    lons = np.linspace(bounds["left"], bounds["right"], n_cols)
    feature_order = model.get_booster().feature_names   # see Hint 3

    flat_probs = list(np.load(CHECKPOINT_PATH)) if os.path.exists(CHECKPOINT_PATH) else []
    start_at = len(flat_probs)
    total = n_rows * n_cols
    print(f"Resuming at point {start_at}/{total}")

    idx = 0
    for lat in lats:
        for lon in lons:
            if idx < start_at:
                idx += 1
                continue
            feats = extract_features_for_point(lat, lon)          # see Hint 1
            row_df = pd.DataFrame([feats])[feature_order]
            prob = model.predict_proba(row_df)[0, 1]               # see Example 2
            flat_probs.append(prob)
            if idx % 25 == 0:                                       # see Example 3
                np.save(CHECKPOINT_PATH, np.array(flat_probs))
                print(f"  checkpoint saved at {idx}/{total}")
            idx += 1

    np.save(CHECKPOINT_PATH, np.array(flat_probs))
    return np.array(flat_probs).reshape(n_rows, n_cols)


if __name__ == "__main__":
    model = xgb.XGBClassifier()
    model.load_model("gehirn_trained_model.json")   # your own Day 3 output

    bounds = {"left": 78.85, "right": 80.57, "bottom": 21.26, "top": 21.79}
    prob_grid = build_probability_grid(model, bounds)
    print("Probability grid shape:", prob_grid.shape)

    np.save("probability.npy", prob_grid)
    json.dump(bounds, open("bounds.json", "w"))
    if os.path.exists(CHECKPOINT_PATH):
        os.remove(CHECKPOINT_PATH)

    gt_df = pd.read_csv("tile02_jamunjhola_validation_ready.csv")
    gt_df.columns = gt_df.columns.str.lower()
    result = validate(prob_grid, bounds, gt_df)
    print(json.dumps(result, indent=2))

    # sanity check before trusting the number
    if result.get("n_pos", 0) < 30:
        print("WARNING: fewer positives than expected -- verify bbox/CSV alignment before trusting this AUC")