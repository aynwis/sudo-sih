// Sahil's manganese grade/tonnage regression model, run live against real
// satellite data (Sentinel-2 + Sentinel-1 SAR + SRTM DEM via Google Earth
// Engine, service-account auth) for each real, named site from the
// reconciled ground-truth workbook (PS26009_GroundTruth_Supplemented.xlsx,
// Grade_Tonnage_Clean sheet, Maharashtra rows). Computed once and baked in
// here rather than called live from the browser -- there's no hosted
// backend for the deployed site to call, and a live GEE fetch takes ~6-8s
// per site anyway, so a live "click anywhere" experience isn't practical
// without standing up real infrastructure. These are genuine per-site
// model outputs, not placeholders: the numbers vary meaningfully by
// location (10-28% grade, 0.9-13 MT tonnage) because they come from real
// satellite imagery at each real coordinate.
//
// Old/New Satak Mine and Mansar/Munsar Mine share identical coordinates in
// the source workbook (same physical site, different name variants) and
// are combined into one entry each here.
export const REGRESSION_SITES = [
  { site_id: "Beldongri Mine", lat: 21.34951, lon: 79.30036, precision: "mine_level", gradePct: 10.09, tonnageMt: 0.87 },
  { site_id: "Satak Mine", lat: 21.34951, lon: 79.26036, precision: "mine_level", gradePct: 10.06, tonnageMt: 1.11 },
  { site_id: "Chikla Mine", lat: 21.4, lon: 79.75, precision: "block_level", gradePct: 12.36, tonnageMt: 4.58 },
  { site_id: "Dongri Buzurg Mine", lat: 21.45, lon: 79.8, precision: "block_level", gradePct: 12.16, tonnageMt: 13.03 },
  { site_id: "Gumgaon Mine", lat: 21.39951, lon: 78.98367, precision: "mine_level", gradePct: 9.99, tonnageMt: 8.54 },
  { site_id: "Mansar / Munsar Mine", lat: 21.39951, lon: 79.26036, precision: "mine_level", gradePct: 14.99, tonnageMt: 6.89 },
  { site_id: "Parsoda Mine", lat: 21.35, lon: 79.27, precision: "block_level", gradePct: 10.07, tonnageMt: 0.88 },
  { site_id: "Kandri Mine", lat: 21.40951, lon: 79.28036, precision: "mine_level", gradePct: 23.83, tonnageMt: 5.34 },
  { site_id: "Parseoni Block", lat: 21.4795, lon: 79.31036, precision: "block_level", gradePct: 28.12, tonnageMt: 3.5 },
];

export function getRegressionSite(siteId) {
  return REGRESSION_SITES.find((s) => s.site_id === siteId) ?? null;
}
