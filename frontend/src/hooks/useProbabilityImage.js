import { useEffect, useState } from "react";
import { mockProbabilityImageUrl, TILE02_BOUNDS } from "../lib/mockData";

async function fetchProbabilityImage(tileId) {
  const res = await fetch(`/api/v1/raster/${tileId}`);
  if (!res.ok) throw new Error(`Raster fetch failed: ${res.status}`);
  const body = await res.json(); // Ayaan's RasterResponse
  return {
    url: `data:image/png;base64,${body.image_base64}`,
    bounds: body.bounds,
    source: body.source,
  };
}

export function useProbabilityImage(tileId = "tile02_jamunjhola") {
  const [state, setState] = useState({ status: "loading", url: null, bounds: null, source: null, error: null });

  useEffect(() => {
    let cancelled = false;

    fetchProbabilityImage(tileId)
      .then(({ url, bounds, source }) => {
        if (!cancelled) setState({ status: "success", url, bounds, source, error: null });
      })
      .catch(() => {
        // Keep the walkthrough usable during a backend outage. This is
        // explicitly marked as a demo source in the dashboard.
        if (!cancelled) setState({ status: "success", url: mockProbabilityImageUrl(), bounds: TILE02_BOUNDS, source: "mock", error: null });
      });

    return () => {
      cancelled = true;
    };
  }, [tileId]);

  return state;
}
