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
    const timer = setTimeout(() => {
      setData({ status: "ready", auc: 0.87, regressionReadySites: 13 });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return { data };
}
