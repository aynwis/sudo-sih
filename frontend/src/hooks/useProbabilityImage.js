import { useEffect, useState } from "react";
import { mockProbabilityImageUrl } from "../lib/mockData";

async function fetchProbabilityImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Raster fetch failed: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function useProbabilityImage(endpointUrl) {
  const [state, setState] = useState({ status: "loading", url: null, error: null });

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    fetchProbabilityImage(endpointUrl)
      .then((url) => {
        if (cancelled) return;
        objectUrl = url;
        setState({ status: "success", url, error: null });
      })
      .catch(() => {
        // Ayaan's raster endpoint isn't up yet -- fall back to the mock
        // gradient so the heatmap still renders. Remove this fallback once
        // Day 4's real endpoint is live.
        if (!cancelled) setState({ status: "success", url: mockProbabilityImageUrl(), error: null });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [endpointUrl]);

  return state;
}
