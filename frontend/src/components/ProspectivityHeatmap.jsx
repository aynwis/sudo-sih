import { useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import { MapPinned } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { sitesToGeoJson } from "../lib/groundTruthGeoJson";
import ReceiptSheetModal from "./ReceiptSheetModal";

// Esri's World Imagery raster tiles -- free, no API key/account/card
// required, unlike Mapbox. Inlined as a raster style since we don't need
// a vector basemap for a satellite-imagery product anyway.
const SATELLITE_STYLE = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "esri-satellite", type: "raster", source: "esri-satellite" }],
};

// The image-source `coordinates` expects exactly this
// top-left/top-right/bottom-right/bottom-left order -- reversing it flips
// or skews the overlay silently.
function boundsToCorners(bounds) {
  return [
    [bounds.left, bounds.top],
    [bounds.right, bounds.top],
    [bounds.right, bounds.bottom],
    [bounds.left, bounds.bottom],
  ];
}

// Data-driven styling, evaluated per-feature by the GPU -- no per-marker
// React component loop.
const CIRCLE_COLOR = [
  "match",
  ["get", "precision"],
  "mine_level", "#5fb0b0",
  "block_level", "#dba658",
  "#888888",
];

/**
 * `probabilityImageUrl` is a rendered PNG (or data URI) of the probability
 * array. `bounds` is the {left, right, top, bottom} shape from bounds.json.
 */
export default function ProspectivityHeatmap({ probabilityImageUrl, bounds, groundTruthSites, height = 480 }) {
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const geojson = sitesToGeoJson(groundTruthSites);

  function handleMapClick(event) {
    const feature = event.features && event.features[0];
    if (feature) setSelectedSiteId(feature.properties.site_id);
  }

  return (
    <>
      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="panel-eyebrow !mb-0">
            <div className="chip ochre">
              <MapPinned size={15} strokeWidth={2} />
            </div>
            <span className="label !not-italic !font-medium !text-bone">Prospectivity heatmap — tile02_Jamunjhola</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-bone-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-bright" /> mine-level
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ochre-bright" /> block-level
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl">
          <Map
            initialViewState={{
              longitude: (bounds.left + bounds.right) / 2,
              latitude: (bounds.top + bounds.bottom) / 2,
              zoom: 4.3,
            }}
            style={{ width: "100%", height }}
            mapStyle={SATELLITE_STYLE}
            interactiveLayerIds={["ground-truth-circles"]}
            onClick={handleMapClick}
          >
            <Source id="probability-overlay" type="image" url={probabilityImageUrl} coordinates={boundsToCorners(bounds)}>
              <Layer id="probability-layer" type="raster" paint={{ "raster-opacity": 0.65 }} />
            </Source>

            <Source id="ground-truth-points" type="geojson" data={geojson}>
              <Layer
                id="ground-truth-circles"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": CIRCLE_COLOR,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#0b0f14",
                }}
              />
            </Source>
          </Map>
        </div>
      </div>

      <ReceiptSheetModal siteId={selectedSiteId} onClose={() => setSelectedSiteId(null)} />
    </>
  );
}
