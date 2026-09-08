import pandas as pd


def reconcile(master_path, tile_map_path, out_path):
    master = pd.read_excel(master_path)      # the 143-unique canonical list
    tile_map = pd.read_excel(tile_map_path)  # the 148-site tile mapping

    merged = master.merge(tile_map, on="site_id", how="outer", indicator=True)

    unmatched = merged[merged["_merge"] != "both"]
    if len(unmatched) > 0:
        print(f"WARNING: {len(unmatched)} rows didn't match cleanly -- reconcile by hand:")
        print(unmatched[["site_id", "_merge"]])

    reconciled = merged[merged["_merge"] == "both"].drop(columns=["_merge"])
    reconciled.to_excel(out_path, index=False)
    print(f"Wrote {len(reconciled)} reconciled rows to {out_path}")
    return reconciled


if __name__ == "__main__":
    reconcile(
        "PS26009_GroundTruth_Master143.xlsx",
        "tile_mapping_148sites.xlsx",
        "PS26009_GroundTruth_Reconciled.xlsx",
    )
