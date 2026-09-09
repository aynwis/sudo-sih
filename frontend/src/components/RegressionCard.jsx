import StatusBadge from "../components/StatusBadge";

function formatPct(value) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "—";
}

function formatRange(range) {
  if (!Array.isArray(range) || range.length !== 2) {
    return null;
  }

  const [low, high] = range;

  if (typeof low !== "number" || typeof high !== "number") {
    return null;
  }

  return `${low.toFixed(1)}% – ${high.toFixed(1)}%`;
}

export default function RegressionCard({ data }) {
  if (!data) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-4 text-sm text-slate-500">
        Regression estimate unavailable.
      </div>
    );
  }

  const range = formatRange(data.confidence_interval_pct);

  return (
    <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900 px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Grade / tonnage estimate
        </div>

        <StatusBadge status={data.status} />
      </div>

      <div className="text-3xl font-semibold text-slate-100">
        {formatPct(data.predicted_grade_pct)}
      </div>

      {range && (
        <div className="text-sm text-slate-400">
          95% interval: {range}
        </div>
      )}

      <div className="pt-1 text-xs text-slate-500">
        {data.method}

        {typeof data.n_training_points === "number" &&
          ` · ${data.n_training_points} training points`}
      </div>
    </div>
  );
}
