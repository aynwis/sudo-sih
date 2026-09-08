import { useState } from "react";

// A static preview of the receipt-sheet pattern for the intro narrative --
// the click just gives a visual acknowledgment. The live version (click a
// marker, see a real fetch) is ReceiptSheetModal in the dashboard below.
const ROWS = [
  { site: "Gumgaon", tag: "mine", tagLabel: "mine-level", coords: "21.35°N, 79.62°E", note: "Grade regression: included", verify: "Ground_Truth_Clean · row 12" },
  { site: "Mansar / Munsar", tag: "block", tagLabel: "block-level", coords: "21.41°N, 79.55°E", note: "Linked duplicate, merged", verify: "Ground_Truth_Clean · row 47" },
  { site: "Sandur Mines", tag: "block", tagLabel: "flagged", coords: "~380km off in MRDS", note: "Excluded, source-verified", verify: "USGS_MRDS · row 231" },
  { site: "Beldongri", tag: "mine", tagLabel: "mine-level", coords: "21.29°N, 79.71°E", note: "Grade regression: included", verify: "Tonnage_Supplement · row 3" },
];

export default function ReceiptLedgerPreview() {
  const [flashed, setFlashed] = useState(null);

  function handleClick(site) {
    setFlashed(site);
    setTimeout(() => setFlashed((cur) => (cur === site ? null : cur)), 400);
  }

  return (
    <>
      {ROWS.map((row) => (
        <div
          key={row.site}
          className={`ledger-row${flashed === row.site ? " flash" : ""}`}
          onClick={() => handleClick(row.site)}
        >
          <div className="site">{row.site}</div>
          <div className={`tag ${row.tag}`}>{row.tagLabel}</div>
          <div>{row.coords}</div>
          <div>{row.note}</div>
          <div className="verify">{row.verify}</div>
        </div>
      ))}
    </>
  );
}
