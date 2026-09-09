export async function fetchValidationPoints() {
  const res = await fetch("/api/validation-points");
  if (!res.ok) throw new Error(`validation-points: ${res.status}`);
  return res.json();
}

export async function fetchRegressionEstimate() {
  const res = await fetch("/api/regression-estimate");
  if (!res.ok) throw new Error(`regression-estimate: ${res.status}`);
  return res.json();
}
