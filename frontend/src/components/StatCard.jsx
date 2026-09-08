// Placeholder standing in for Dharti's real StatCard until her component
// lands (Day 4 integration) -- keep the props shape ({label, value, hint})
// matching hers so swapping the import is the only change needed.
export default function StatCard({ label, value, hint, icon: Icon, tone = "teal" }) {
  const isHero = tone === "hero";
  return (
    <div className={`panel${isHero ? " hero-panel" : ""}`}>
      <div className="panel-eyebrow">
        {Icon && (
          <div className={`chip ${isHero ? "" : tone}`}>
            <Icon size={15} strokeWidth={2} />
          </div>
        )}
        <span className="label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
