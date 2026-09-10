// Stand-ins for teammates' real outputs, used until their endpoints/files
// land (Ayaan's raster + receipt-sheet endpoint, Sahil's bounds.json,
// Syed's validation-points endpoint). Swap each on Day 4 per the guide --
// nothing here should still be imported once real data is wired in.

export const TILE02_BOUNDS = { left: 78.85, right: 80.57, top: 21.79, bottom: 21.26 };

export const MOCK_GROUND_TRUTH_SITES = [
  { site_id: "Gumgaon", lat: 21.35, lon: 79.62, precision_flag: "mine_level" },
  { site_id: "Mansar / Munsar", lat: 21.41, lon: 79.55, precision_flag: "block_level" },
  { site_id: "Beldongri", lat: 21.29, lon: 79.71, precision_flag: "mine_level" },
];

export const MOCK_RECEIPT_SHEET = {
  "gt-0050": { source_file: "PS26009_GroundTruth_Supplemented.xlsx", sheet: "Ground_Truth_Clean", row: 103 },
  "gt-0051": { source_file: "PS26009_GroundTruth_Supplemented.xlsx", sheet: "Ground_Truth_Clean", row: 123 },
  "gt-0008": { source_file: "PS26009_GroundTruth_Supplemented.xlsx", sheet: "Ground_Truth_Clean", row: 89 },
  "gt-0048": { source_file: "PS26009_GroundTruth_Supplemented.xlsx", sheet: "Ground_Truth_Clean", row: 96 },
};

// A rendered probability surface -- a mock gradient standing in for Ayaan's
// mock probability array (Day 1) / Sahil's real probability.npy -> PNG
// pipeline (Day 4). Encoded as an SVG data URI so no build step or binary
// asset is needed to get the overlay rendering.
export function mockProbabilityImageUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <defs>
        <radialGradient id="p" cx="35%" cy="60%" r="75%">
          <stop offset="0%" stop-color="#d89344" stop-opacity="0.95" />
          <stop offset="45%" stop-color="#b8752e" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#3d7068" stop-opacity="0.05" />
        </radialGradient>
      </defs>
      <rect width="256" height="256" fill="url(#p)" />
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
