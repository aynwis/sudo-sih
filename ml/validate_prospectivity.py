import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score


def latlon_to_grid_index(lat, lon, bounds, grid_shape):
    """Inverse of the np.linspace grid used in Day 4's build_probability_grid().

    Must match that forward mapping exactly, or ground-truth sites land on
    the wrong cell silently -- there's no error, just a wrong AUC.
    """
    rows, cols = grid_shape
    frac_x = (lon - bounds["left"]) / (bounds["right"] - bounds["left"])
    frac_y = (bounds["top"] - lat) / (bounds["top"] - bounds["bottom"])
    row = int(round(frac_y * (rows - 1)))
    col = int(round(frac_x * (cols - 1)))
    return max(0, min(rows - 1, row)), max(0, min(cols - 1, col))


def validate(prob_grid, bounds, gt_df, n_pseudo_absence=200, seed=42):
    """AUC + top-10% lift for a probability grid against real ground truth.

    prob_grid : 2D array from Day 4's build_probability_grid()
    bounds    : {"left","right","top","bottom"} -- the same dict used to build the grid
    gt_df     : ground-truth DataFrame with lat/lon (or latitude/longitude) columns
    """
    rows, cols = prob_grid.shape
    lat_col = "lat" if "lat" in gt_df.columns else "latitude"
    lon_col = "lon" if "lon" in gt_df.columns else "longitude"

    pos_scores, pos_indices = [], []
    for _, r in gt_df.iterrows():
        ri, ci = latlon_to_grid_index(r[lat_col], r[lon_col], bounds, (rows, cols))
        pos_scores.append(prob_grid[ri, ci])
        pos_indices.append((ri, ci))

    # pseudo-absence for the validation set -- same idea as Day 1's negative
    # sampling, just at the grid's (much coarser) resolution
    rng = np.random.default_rng(seed)
    pos_set = set(pos_indices)
    neg_scores = []
    attempts = 0
    while len(neg_scores) < n_pseudo_absence:
        attempts += 1
        if attempts > n_pseudo_absence * 200:
            break  # grid too coarse for the requested n -- degrade gracefully, don't hang
        ri, ci = rng.integers(0, rows), rng.integers(0, cols)
        if (ri, ci) not in pos_set:
            neg_scores.append(prob_grid[ri, ci])

    y_true = [1] * len(pos_scores) + [0] * len(neg_scores)
    y_score = pos_scores + neg_scores
    auc = roc_auc_score(y_true, y_score) if len(set(y_true)) > 1 else float("nan")

    threshold = np.percentile(prob_grid.flatten(), 90)
    frac_area_top10 = (prob_grid.flatten() >= threshold).mean()
    frac_pos_top10 = (np.array(pos_scores) >= threshold).mean() if pos_scores else 0.0
    lift = frac_pos_top10 / frac_area_top10 if frac_area_top10 > 0 else float("nan")

    n_unique_cells = len(set(pos_indices))
    return {
        "n_pos": len(pos_scores),
        "n_pos_unique_cells": n_unique_cells,  # see caveat below
        "n_pseudo_absence": len(neg_scores),
        "auc": round(float(auc), 4),
        "lift_at_top10pct": round(float(lift), 3),
    }


if __name__ == "__main__":
    import json

    prob = np.load("probability.npy")
    bounds = json.load(open("bounds.json"))
    gt_df = pd.read_csv("tile02_jamunjhola_validation_ready.csv")

    result = validate(prob, bounds, gt_df)
    print(json.dumps(result, indent=2))

    if result["n_pos_unique_cells"] < result["n_pos"] * 0.8:
        print(
            "WARNING: many ground-truth sites are landing in the same grid "
            "cell -- the grid is coarse relative to how close together your "
            "sites are. AUC is real but weaker/noisier than a full-tile run "
            "would give. Worth disclosing this alongside the number, not "
            "just the number alone."
        )