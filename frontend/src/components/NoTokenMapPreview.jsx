// Mapbox GL renders nothing at all -- not even an error, just a blank
// canvas -- when there's no access token. Rather than ship a broken-looking
// blank box, plot the same overlay + ground-truth markers on plain
// absolutely-positioned divs so the interaction (click a marker, see its
// receipt-sheet data) still actually works without one.
export default function NoTokenMapPreview({ probabilityImageUrl, bounds, groundTruthSites, onSelectSite, height = 480 }) {
  function toPercent(site) {
    const x = ((site.lon - bounds.left) / (bounds.right - bounds.left)) * 100;
    const y = ((bounds.top - site.lat) / (bounds.top - bounds.bottom)) * 100;
    return { left: `${x}%`, top: `${y}%` };
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-basalt"
      style={{ height, backgroundImage: `url(${probabilityImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-basalt/30" />

      {groundTruthSites.map((site) => (
        <button
          key={site.site_id}
          onClick={() => onSelectSite(site.site_id)}
          className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-basalt shadow-sm transition hover:scale-125 ${
            site.precision_flag === "mine_level" ? "bg-teal-bright" : "bg-ochre-bright"
          }`}
          style={toPercent(site)}
          title={site.site_id}
        />
      ))}

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-lg bg-basalt/80 px-3 py-2 text-xs text-bone-dim backdrop-blur-sm">
        <span>No VITE_MAPBOX_TOKEN set — showing overlay preview instead of live satellite tiles.</span>
      </div>
    </div>
  );
}
