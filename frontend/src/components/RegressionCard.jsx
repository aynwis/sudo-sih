import StatusBadge from "../components/StatusBadge";

function formatPct(value) {
  // See Example 1 for the crash this guards against, and Example 2 for the fix.
  return typeof value === "number" ? `${value.toFixed(1)}%` : "—";
}

function formatRange(range) {
  // See Example 3 -- same early-return shape, applied to the real field.
  if (!Array.isArray(range) || range.length !== 2) return null;
  const [low, high] = range;
  return `${low.toFixed(1)}% – ${high.toFixed(1)}%`;
}

/**
 * `data` is exactly the JSON from GET /api/regression-estimate -- see the
 * dependency box above for the full shape. Every field here is optional on
 * purpose: this renders sensibly whether it's fed the mock (all nulls), the
 * real Day 5 output, or a `served_from_cache` fallback response.
 */
export default function RegressionCard({ data }) {
  if (!data) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-4 text-slate-500 text-sm">
        Regression estimate unavailable.
      </div>
    );
  }

  const range = formatRange(data.confidence_interval_pct);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">Grade / tonnage estimate</div>
        <StatusBadge status={data.status} />
      </div>

      <div className="text-3xl font-semibold text-slate-100">
        {formatPct(data.predicted_grade_pct)}
      </div>

      {range && <div className="text-sm text-slate-400">95% interval: {range}</div>}

      <div className="text-xs text-slate-500 pt-1">
        {data.method}
        {typeof data.n_training_points === "number" &&
          ` · ${data.n_training_points} training points`}
      </div>
    </div>
  );
}
