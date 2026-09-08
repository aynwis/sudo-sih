import { useEffect, useState } from "react";
import { MOCK_GROUND_TRUTH_SITES } from "../lib/mockData";

// Mocks standing in for Syed's validation-points endpoint and the
// regression estimate endpoint until they're live (Day 4). Shape matches
// what a React Query hook would return so swapping the implementation
// later doesn't touch Home.jsx.
export function useValidationPoints() {
  const [state, setState] = useState({ isLoading: true, isError: false, data: null });

  useEffect(() => {
    const timer = setTimeout(() => {
      setState({ isLoading: false, isError: false, data: { count: MOCK_GROUND_TRUTH_SITES.length, sites: MOCK_GROUND_TRUTH_SITES } });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return state;
}

export function useRegressionEstimate() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/regression-estimate")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`status ${res.status}`))))
      .then((real) => {
        if (!cancelled && real.status === "ready") setData(real);
      })
      .catch(() => {
        // Backend not running -- fall back to a mock so the dashboard still renders.
        if (!cancelled) setData({ status: "ready", gradeR2: 0.87, regressionReadySites: 13 });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data };
}
