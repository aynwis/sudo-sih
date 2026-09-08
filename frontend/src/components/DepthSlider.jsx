import { useState } from "react";

const LAYERS = [
  {
    name: "Surface — Sentinel-2 optical",
    desc: "True-color and false-color composite, DN-scaled to reflectance before anything downstream touches it.",
    stats: [["Resolution", "10m/px"], ["Bands used", "6"], ["Cloud cover", "<5%"]],
  },
  {
    name: "SAR — Sentinel-1 roughness",
    desc: "Radar backscatter, unaffected by cloud cover — the VV/VH ratio flags surface roughness tied to exposed rock.",
    stats: [["Polarization", "VV, VH"], ["Pass", "descending"], ["Speckle filter", "applied"]],
  },
  {
    name: "Elevation — SRTM DEM",
    desc: "Slope and elevation derived directly from the DEM, feeding the terrain you're standing on right now.",
    stats: [["Source", "SRTM"], ["Slope band", "re-exported, D1"], ["Vertical accuracy", "±16m"]],
  },
  {
    name: "Spectral indices",
    desc: "Fe-oxide ratio, hydroxyl ratio, NDVI, SAR roughness — the actual feature stack the classifier trains on.",
    stats: [["Fe-oxide range", "0.8 – 2.1"], ["NDVI range", "-0.1 – 0.6"], ["Feature count", "13"]],
  },
  {
    name: "Prospectivity output",
    desc: "XGBoost probability surface, validated against 55 tile02 ground-truth sites.",
    stats: [["Validation AUC", "0.87"], ["Method", "single XGBoost"], ["Scope", "tile02_Jamunjhola"]],
  },
];

export default function DepthSlider() {
  const [layerIndex, setLayerIndex] = useState(0);
  const layer = LAYERS[layerIndex];

  return (
    <div className="depth-rig">
      <div className="depth-scale">
        <span>0m</span>
        <span>surface</span>
        <span>subsurface</span>
        <span>bedrock</span>
        <span>output</span>
      </div>
      <div className="depth-track-wrap">
        <input
          type="range"
          min="0"
          max={LAYERS.length - 1}
          value={layerIndex}
          step="1"
          className="depth-track"
          id="depthSlider"
          onChange={(e) => setLayerIndex(Number(e.target.value))}
        />
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
