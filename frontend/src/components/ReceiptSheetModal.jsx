import { useEffect, useState } from "react";
import { X, FileText, Loader2, AlertCircle } from "lucide-react";
import { MOCK_RECEIPT_SHEET } from "../lib/mockData";

async function fetchReceiptSheet(siteId) {
  try {
    const res = await fetch(`/api/receipt-sheet/${encodeURIComponent(siteId)}`);
    if (res.ok) return res.json();
  } catch {
    // Ayaan's endpoint isn't up yet -- fall through to the mock lookup
    // below. Remove the fallback once Day 3/4's real endpoint is live.
  }
  const mock = MOCK_RECEIPT_SHEET[siteId];
  if (!mock) throw new Error(`No receipt-sheet entry for ${siteId}`);
  return mock;
}

export default function ReceiptSheetModal({ siteId, onClose }) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    if (!siteId) return;
    setState({ status: "loading", data: null, error: null });
    fetchReceiptSheet(siteId)
      .then((data) => setState({ status: "success", data, error: null }))
      .catch((err) => setState({ status: "error", data: null, error: err.message }));
  }, [siteId]);

  if (!siteId) return null; // selectedId doubles as isOpen

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl shadow-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-soft text-teal">
              <FileText size={16} strokeWidth={2} />
            </div>
            <h3 className="font-display text-lg text-ink">Verify source — {siteId}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {state.status === "loading" && (
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Looking up source…
          </p>
        )}
        {state.status === "error" && (
          <p className="flex items-center gap-2 text-sm text-rose">
            <AlertCircle size={14} /> Couldn't load: {state.error}
          </p>
        )}
        {state.status === "success" && (
          <div className="space-y-2 rounded-xl bg-paper-2 p-4 text-sm text-ink">
            <div className="flex justify-between gap-4">
              <span className="text-ink-soft">File</span>
              <span className="text-right">{state.data.source_file}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ink-soft">Sheet</span>
              <span className="text-right">{state.data.sheet}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ink-soft">Row</span>
              <span className="text-right">{state.data.row}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
