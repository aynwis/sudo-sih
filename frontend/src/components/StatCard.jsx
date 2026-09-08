// Placeholder standing in for Dharti's real StatCard until her component
// lands (Day 4 integration) -- keep the props shape ({label, value, hint})
// matching hers so swapping the import is the only change needed.
export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-100 mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
