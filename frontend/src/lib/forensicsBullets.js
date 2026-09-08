// Same reconciled data drives both the map and this copy, so the numbers
// can't drift apart if they change before the demo.
export function forensicsBullets(reconciledCount, rawRowCount, sandurDistanceKm, duplicateCount) {
  return [
    `${rawRowCount} raw ground-truth rows -> ${reconciledCount} verified unique locations`,
    `Sandur Mines: listed ~${sandurDistanceKm}km from the real Sandur belt -- excluded, source-verified`,
    `${duplicateCount} duplicate-mine rows caught during reconciliation`,
  ];
}
