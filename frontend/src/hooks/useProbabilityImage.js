import { useEffect, useState } from "react";
import { mockProbabilityImageUrl, TILE02_BOUNDS } from "../lib/mockData";

async function fetchProbabilityImage(tileId) {
  const res = await fetch(`/api/v1/raster/${tileId}`);
  if (!res.ok) throw new Error(`Raster fetch failed: ${res.status}`);
  const body = await res.json(); // Ayaan's RasterResponse
  return {
    url: `data:image/png;base64,${body.image_base64}`,
    bounds: body.bounds,
  };
}

export function useProbabilityImage(tileId = "tile02_jamunjhola") {
  const [state, setState] = useState({ status: "loading", url: null, bounds: null, error: null });

  useEffect(() => {
    let cancelled = false;

    fetchProbabilityImage(tileId)
      .then(({ url, bounds }) => {
        if (!cancelled) setState({ status: "success", url, bounds, error: null });
      })
      .catch(() => {
        // Ayaan's raster endpoint isn't up yet -- fall back to the mock
        // gradient so the heatmap still renders. Remove this fallback once
        // his endpoint is live.
        if (!cancelled) setState({ status: "success", url: mockProbabilityImageUrl(), bounds: TILE02_BOUNDS, error: null });
      });

    return () => {
      cancelled = true;
    };
  }, [tileId]);

  return state;
}
