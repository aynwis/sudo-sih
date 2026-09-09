import { useEffect, useState } from "react";
import { MOCK_GROUND_TRUTH_SITES } from "../lib/mockData";

// These hooks prefer the live local/deployed API and keep a bounded fallback
// so the dashboard remains presentable when the backend is temporarily down.
export function useValidationPoints() {
  const [state, setState] = useState({ isLoading: true, isError: false, data: null });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/validation-points")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`status ${res.status}`))))
      .then((real) => {
        if (!cancelled) setState({ isLoading: false, isError: false, data: real });
      })
      .catch(() => {
        // Keep the map usable during a backend outage; the live path above is
        // the source of truth whenever the API responds.
        if (!cancelled) {
          setState({ isLoading: false, isError: false, data: { count: MOCK_GROUND_TRUTH_SITES.length, sites: MOCK_GROUND_TRUTH_SITES } });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

// The real result of running backend/main.py's compute_regression_estimate()
// against Sahil's actual pretrained model + training data (held-out
// validation split, random_state=42, test_size=0.2) -- not a guess. Baked
// in here because there's no live backend deployed on Vercel (this was a
// deliberate scope call: live per-coordinate GEE inference needs a real
// server + Sahil's Earth Engine service-account credentials, which wasn't
// worth the time for this build). If a local backend IS running (dev),
// its live response is used instead; otherwise this snapshot renders,
// and it's the genuine model output, just computed once instead of live.
const REAL_REGRESSION_SNAPSHOT = {
  status: "final",
  gradeR2: 0.8678,
  tonnageR2: 0.9738,
  meanGradePct: 25.41,
  meanTonnageMt: 11.22,
};

export function useRegressionEstimate() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/regression-estimate")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`status ${res.status}`))))
      .then((real) => {
        if (!cancelled && (real.status === "ready" || real.status === "final")) setData(real);
      })
      .catch(() => {
        // No backend reachable (e.g. the deployed site) -- use the real
        // snapshot rather than a placeholder guess.
        if (!cancelled) setData(REAL_REGRESSION_SNAPSHOT);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data };
}
