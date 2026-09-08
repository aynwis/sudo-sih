import { useEffect, useState } from "react";
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Verify source — {siteId}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>

        {state.status === "loading" && <p className="text-slate-400 text-sm">Looking up source…</p>}
        {state.status === "error" && <p className="text-rose-400 text-sm">Couldn't load: {state.error}</p>}
        {state.status === "success" && (
          <div className="space-y-2 text-sm text-slate-200">
            <div><span className="text-slate-500">File:</span> {state.data.source_file}</div>
            <div><span className="text-slate-500">Sheet:</span> {state.data.sheet}</div>
            <div><span className="text-slate-500">Row:</span> {state.data.row}</div>
          </div>
        )}
      </div>
    </div>
  );
}
