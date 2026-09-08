import { Sparkles } from "lucide-react";

// The safe, fast choice this late in the week: a static image embed of
// Sarthak's precomputed SHAP chart rather than a live Recharts re-render.
export default function WhyPanel({ imageSrc }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-black/[0.03]">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ochre-soft text-ochre">
          <Sparkles size={16} strokeWidth={2} />
        </div>
        <div className="text-sm font-medium text-ink">What drove this score</div>
      </div>
      {imageSrc ? (
        <img src={imageSrc} alt="SHAP feature importance" className="w-full rounded-xl" />
      ) : (
        <div className="rounded-xl bg-paper-2 p-6 text-center text-sm text-ink-soft">
          Feature-importance panel unavailable.
        </div>
      )}
    </div>
  );
}
