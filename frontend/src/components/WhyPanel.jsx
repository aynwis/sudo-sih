// The safe, fast choice this late in the week: a static image embed of
// Sarthak's precomputed SHAP chart rather than a live Recharts re-render.
export default function WhyPanel({ imageSrc }) {
  if (!imageSrc) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
        Feature-importance panel unavailable.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="text-sm text-slate-400 mb-2">What drove this score</div>
      <img src={imageSrc} alt="SHAP feature importance" className="w-full rounded" />
    </div>
  );
}
