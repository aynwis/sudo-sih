import { useEffect, useState } from "react";
import { X, FileText, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { MOCK_RECEIPT_SHEET } from "../lib/mockData";

async function fetchReceiptSheet(siteId) {
  try {
    const res = await fetch(`/api/receipt-sheet/${encodeURIComponent(siteId)}`);
    if (res.ok) return res.json();
  } catch {
    // Keep source verification usable during a backend outage by falling
    // through to the small demo lookup below.
  }
  const mock = MOCK_RECEIPT_SHEET[siteId];
  if (!mock) throw new Error(`No receipt-sheet entry for ${siteId}`);
  return mock;
}

export default function ReceiptSheetModal({ siteId, displayName = siteId, onClose }) {
  const [state, setState] = useState({ siteId: null, status: "loading", data: null, error: null });

  useEffect(() => {
    if (!siteId) return;
    let cancelled = false;
    fetchReceiptSheet(siteId)
      .then((data) => {
        if (!cancelled) setState({ siteId, status: "success", data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ siteId, status: "error", data: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  if (!siteId) return null; // selectedId doubles as isOpen

  const visibleState = state.siteId === siteId
    ? state
    : { status: "loading", data: null, error: null };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-basalt/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="panel w-full max-w-md !bg-basalt-2 shadow-xl shadow-black/40" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="panel-eyebrow !mb-0">
            <div className="chip teal">
              <FileText size={15} strokeWidth={2} />
            </div>
            <span className="font-display text-lg text-bone not-italic">Verify source — {displayName}</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-bone-dim transition hover:bg-white/10 hover:text-bone"
          >
            <X size={16} />
          </button>
        </div>

        {visibleState.status === "loading" && (
          <p className="flex items-center gap-2 text-sm text-bone-dim">
            <Loader2 size={14} className="animate-spin" /> Looking up source…
          </p>
        )}
        {visibleState.status === "error" && (
          <p className="flex items-center gap-2 text-sm text-rose-400">
            <AlertCircle size={14} /> Couldn't load: {visibleState.error}
          </p>
        )}
        {visibleState.status === "success" && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-bone">
              <div className="flex justify-between gap-4">
                <span className="text-bone-dim">File</span>
                <span className="text-right">{visibleState.data.source_file}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-bone-dim">Sheet</span>
                <span className="text-right">{visibleState.data.sheet}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-bone-dim">Row</span>
                <span className="text-right">{visibleState.data.row}</span>
              </div>
            </div>
            <a
              href="/api/receipt-sheet/workbook"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-teal-bright/40 px-4 py-2 text-sm text-teal-bright transition hover:bg-teal-bright/10"
            >
              Open source Excel workbook <ExternalLink size={14} />
            </a>
            <p className="text-xs text-bone-dim">
              The workbook opens/downloads from the local backend. Use the sheet and row above to jump to the exact source record.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
