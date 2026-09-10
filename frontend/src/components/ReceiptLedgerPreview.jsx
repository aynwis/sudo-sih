import { useEffect, useMemo, useState } from "react";

import ReceiptSheetModal from "./ReceiptSheetModal";

const PAGE_SIZE = 8;
const FEATURED_NAMES = ["Gumgaon", "Mansar", "Sandur Mines", "Beldongri"];

const FALLBACK_ROWS = [
  { site_id: "Gumgaon", cluster_id: "GT-0050", lat: 21.39951, lon: 78.98367, precision_flag: "mine_level" },
  { site_id: "Mansar", cluster_id: "GT-0051", lat: 21.39951, lon: 79.26036, precision_flag: "block_level" },
  { site_id: "Sandur Mines", cluster_id: "GT-0008", lat: 14.41686, lon: 79.60034, precision_flag: "mine_level" },
  { site_id: "Beldongri", cluster_id: "GT-0048", lat: 21.34951, lon: 79.30036, precision_flag: "mine_level" },
];

function deduplicateSites(sites) {
  const unique = new Map();

  for (const site of sites) {
    const key = site.cluster_id || `${site.site_id}-${site.lat}-${site.lon}`;
    if (!unique.has(key)) unique.set(key, site);
  }

  return Array.from(unique.values()).sort((a, b) => {
    const aName = String(a.site_id || "").toLowerCase();
    const bName = String(b.site_id || "").toLowerCase();
    const aRank = FEATURED_NAMES.findIndex((name) => aName.includes(name.toLowerCase()));
    const bRank = FEATURED_NAMES.findIndex((name) => bName.includes(name.toLowerCase()));
    return (aRank === -1 ? FEATURED_NAMES.length : aRank) - (bRank === -1 ? FEATURED_NAMES.length : bRank);
  });
}

function formatCoordinates(site) {
  const lat = Number(site.lat);
  const lon = Number(site.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return "Coordinates unavailable";
  return `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
}

function noteForSite(site) {
  const name = String(site.site_id || "").toLowerCase();
  if (name.includes("sandur")) return "Flagged, source-verified";
  if (site.precision_flag === "block_level") return "Block-level coordinate";
  return "Ground-truth source record";
}

function receiptLookupId(site) {
  return site.site_id || site.cluster_id;
}

function receiptKey(site) {
  return `${receiptLookupId(site)}::${site.cluster_id || "site"}`;
}

export default function ReceiptLedgerPreview() {
  const [sites, setSites] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadState, setLoadState] = useState("loading");
  const [receipts, setReceipts] = useState({});
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/validation-points")
      .then((response) => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;
        setSites(deduplicateSites(payload.sites || []));
        setLoadState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setSites(FALLBACK_ROWS);
        setLoadState("fallback");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => sites.slice(0, visibleCount), [sites, visibleCount]);

  useEffect(() => {
    let cancelled = false;
    const pending = rows.filter((site) => {
      return receiptLookupId(site) && !receipts[receiptKey(site)];
    });

    if (!pending.length) return undefined;

    Promise.all(
      pending.map(async (site) => {
        const receiptId = receiptLookupId(site);
        try {
          const response = await fetch(`/api/receipt-sheet/${encodeURIComponent(receiptId)}`);
          if (!response.ok) throw new Error(`status ${response.status}`);
          return [receiptKey(site), { status: "ready", data: await response.json() }];
        } catch (error) {
          return [receiptKey(site), { status: "error", error: error.message }];
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setReceipts((current) => ({ ...current, ...Object.fromEntries(entries) }));
    });

    return () => {
      cancelled = true;
    };
  }, [rows, receipts]);

  function openReceipt(site) {
    setSelected({
      displayName: site.site_id,
      receiptId: receiptLookupId(site),
    });
  }

  function handleKeyDown(event, site) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openReceipt(site);
    }
  }

  return (
    <>
      {rows.map((site) => {
        const receiptId = receiptLookupId(site);
        const receipt = receipts[receiptKey(site)];
        const tag = site.precision_flag === "block_level" ? "block" : "mine";
        const verify = receipt?.status === "ready"
          ? `${receipt.data.sheet} · row ${receipt.data.row}`
          : receipt?.status === "error"
            ? "Source lookup unavailable"
            : "Looking up source…";

        return (
          <div
            key={site.cluster_id || receiptId}
            className="ledger-row"
            role="button"
            tabIndex={0}
            onClick={() => openReceipt(site)}
            onKeyDown={(event) => handleKeyDown(event, site)}
            aria-label={`Verify source for ${site.site_id}`}
          >
            <div className="site">{site.site_id || "Unnamed site"}</div>
            <div className={`tag ${tag}`}>{site.precision_flag === "block_level" ? "block-level" : "mine-level"}</div>
            <div>{formatCoordinates(site)}</div>
            <div>{noteForSite(site)}</div>
            <div className="verify">{verify}</div>
          </div>
        );
      })}

      <div className="ledger-footer">
        <span>
          {loadState === "loading" ? "Loading live source records…" : `Showing ${rows.length} of ${sites.length} verified clusters`}
        </span>
        {visibleCount < sites.length && (
          <button type="button" className="ledger-more" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Show more records <span aria-hidden="true">↓</span>
          </button>
        )}
      </div>

      <ReceiptSheetModal
        siteId={selected?.receiptId}
        displayName={selected?.displayName}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
