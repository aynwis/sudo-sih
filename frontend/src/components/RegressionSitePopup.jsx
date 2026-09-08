import { X, TrendingUp } from "lucide-react";
import { getRegressionSite } from "../lib/regressionSites";

// Shown when a "predicted reserve" marker is clicked -- distinct from
// ReceiptSheetModal (which verifies a ground-truth occurrence point's
// source file/row). This shows the regression model's actual predicted
// grade/tonnage for that specific site, baked in from regressionSites.js.
export default function RegressionSitePopup({ siteId, onClose }) {
  if (!siteId) return null;
  const site = getRegressionSite(siteId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-basalt/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="panel w-full max-w-md !bg-basalt-2 shadow-xl shadow-black/40" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="panel-eyebrow !mb-0">
            <div className="chip ochre">
              <TrendingUp size={15} strokeWidth={2} />
            </div>
            <span className="font-display text-lg text-bone not-italic">Predicted reserve — {siteId}</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-bone-dim transition hover:bg-white/10 hover:text-bone"
          >
            <X size={16} />
          </button>
        </div>

        {site ? (
          <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-bone">
            <div className="flex justify-between gap-4">
              <span className="text-bone-dim">Predicted grade</span>
              <span className="text-right">{site.gradePct}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-bone-dim">Predicted tonnage</span>
              <span className="text-right">{site.tonnageMt} MT</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-bone-dim">No regression prediction on file for this site yet.</p>
        )}
      </div>
    </div>
  );
}
