// Sahil's ~13 "regression-ready sites" -- known locations with enough real
// satellite coverage for his grade/tonnage model to predict against with
// confidence. This is intentionally separate from MOCK_GROUND_TRUTH_SITES
// (those are occurrence points for the receipt-sheet/verify flow; these are
// specifically the sites his regression model has been run against).
//
// Empty until he sends, per site: name, latitude, longitude, and his
// model's predicted grade % + tonnage MT (run locally on his own
// GEE-authenticated machine -- see the 2026-09-09 plan). No live server
// needed on our end; this is a precomputed lookup baked into the build.
//
// Fill in real entries like:
//   { site_id: "Example Site", lat: 21.4, lon: 79.6, gradePct: 24.8, tonnageMt: 9.6 }
export const REGRESSION_SITES = [];

export function getRegressionSite(siteId) {
  return REGRESSION_SITES.find((s) => s.site_id === siteId) ?? null;
}
