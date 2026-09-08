// Placeholder standing in for Dharti's real StatCard until her component
// lands (Day 4 integration) -- keep the props shape ({label, value, hint})
// matching hers so swapping the import is the only change needed.
const TONES = {
  ochre: "bg-ochre-soft text-ochre",
  teal: "bg-teal-soft text-teal",
};

export default function StatCard({ label, value, hint, icon: Icon, tone = "teal" }) {
  if (tone === "hero") {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-ochre-bright to-ochre p-5 text-white shadow-sm shadow-ochre/20">
        <div className="flex items-start justify-between">
          <div className="text-xs font-medium uppercase tracking-wide text-white/75">{label}</div>
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Icon size={17} strokeWidth={2} />
            </div>
          )}
        </div>
        <div className="mt-2 font-display text-3xl">{value}</div>
        {hint && <div className="mt-1 text-xs text-white/75">{hint}</div>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-black/[0.03] transition hover:shadow-md hover:shadow-black/[0.05]">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</div>
        {Icon && (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
            <Icon size={17} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="mt-2 font-display text-3xl text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-soft">{hint}</div>}
    </div>
  );
}
