import { useState } from "react";

const LAYERS = [
  {
    name: "Surface — Sentinel-2 optical",
    short: "Surface",
    desc: "True-color and false-color composite, DN-scaled to reflectance before anything downstream touches it.",
    stats: [["Resolution", "10m/px"], ["Bands used", "6"], ["Cloud cover", "<5%"]],
  },
  {
    name: "SAR — Sentinel-1 roughness",
    short: "SAR",
    desc: "Radar backscatter, unaffected by cloud cover — the VV/VH ratio flags surface roughness tied to exposed rock.",
    stats: [["Polarization", "VV, VH"], ["Pass", "descending"], ["Speckle filter", "applied"]],
  },
  {
    name: "Elevation — SRTM DEM",
    short: "Elevation",
    desc: "Slope and elevation derived directly from the DEM, feeding the terrain you're standing on right now.",
    stats: [["Source", "SRTM"], ["Slope band", "re-exported, D1"], ["Vertical accuracy", "±16m"]],
  },
  {
    name: "Spectral indices",
    short: "Spectral",
    desc: "Fe-oxide ratio, hydroxyl ratio, NDVI, SAR roughness — the actual feature stack the classifier trains on.",
    stats: [["Fe-oxide range", "0.8 – 2.1"], ["NDVI range", "-0.1 – 0.6"], ["Feature count", "13"]],
  },
  {
    name: "Prospectivity output",
    short: "Output",
    desc: "XGBoost probability surface, validated against 55 tile02 ground-truth sites.",
    stats: [["Validation AUC", "0.87"], ["Method", "single XGBoost"], ["Scope", "tile02_Jamunjhola"]],
  },
];

export default function DepthSlider() {
  const [layerIndex, setLayerIndex] = useState(0);
  const layer = LAYERS[layerIndex];
  const fillPercent = (layerIndex / (LAYERS.length - 1)) * 100;

  return (
    <div className="depth-rig">
      <div
        className="depth-track-wrap"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={LAYERS.length - 1}
        aria-valuenow={layerIndex}
        aria-label="Raster stack depth"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") setLayerIndex((i) => Math.min(LAYERS.length - 1, i + 1));
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") setLayerIndex((i) => Math.max(0, i - 1));
        }}
      >
        <div className="depth-track-line">
          <div className="depth-track-fill" style={{ height: `${fillPercent}%` }} />
        </div>
        {LAYERS.map((l, i) => (
          <button
            key={l.short}
            type="button"
            className={`depth-stop${i === layerIndex ? " active" : ""}`}
            style={{ top: `${(i / (LAYERS.length - 1)) * 100}%` }}
            onClick={() => setLayerIndex(i)}
          >
            <span className="depth-stop-dot" />
            <span className="depth-stop-label">{l.short}</span>
          </button>
        ))}
      </div>
      <div className="depth-readout" id="depthReadout">
        <div>
          <div className="layer-name">{layer.name}</div>
          <div className="layer-desc">{layer.desc}</div>
        </div>
        <div>
          {layer.stats.map(([k, v]) => (
            <div className="stat" key={k}>
              <span>{k}</span>
              <span className="v">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
