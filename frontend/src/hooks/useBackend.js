import { useQuery } from "@tanstack/react-query";
import {
  fetchValidationPoints,
  fetchRegressionEstimate,
} from "../lib/api";

export function useValidationPoints() {
  const query = useQuery({
    queryKey: ["validation-points"],
    queryFn: fetchValidationPoints,
  });

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data ?? null,
    error: query.error,
  };
}

export function useRegressionEstimate() {
  const query = useQuery({
    queryKey: ["regression-estimate"],
    queryFn: fetchRegressionEstimate,
  });

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data ?? null,
    error: query.error,
  };
}