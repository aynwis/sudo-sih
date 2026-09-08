import { Sparkles } from "lucide-react";

// The safe, fast choice this late in the week: a static image embed of
// Sarthak's precomputed SHAP chart rather than a live Recharts re-render.
export default function WhyPanel({ imageSrc }) {
  return (
    <div className="panel">
      <div className="panel-eyebrow">
        <div className="chip ochre">
          <Sparkles size={15} strokeWidth={2} />
        </div>
        <span className="label">What drove this score</span>
      </div>
      {imageSrc ? (
        <img src={imageSrc} alt="SHAP feature importance" className="mx-auto max-h-[340px] w-auto rounded-xl object-contain" />
      ) : (
        <div className="rounded-xl border border-white/10 p-6 text-center text-sm text-bone-dim">
          Feature-importance panel unavailable.
        </div>
      )}
    </div>
  );
}
