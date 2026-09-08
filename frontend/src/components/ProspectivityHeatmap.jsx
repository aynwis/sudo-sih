import { useState } from "react";
import Map, { Source, Layer } from "react-map-gl/mapbox";
import { MapPinned } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { sitesToGeoJson } from "../lib/groundTruthGeoJson";
import ReceiptSheetModal from "./ReceiptSheetModal";
import NoTokenMapPreview from "./NoTokenMapPreview";

// Mapbox's image-source `coordinates` expects exactly this
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
export default function ProspectivityHeatmap({ probabilityImageUrl, bounds, groundTruthSites }) {
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const geojson = sitesToGeoJson(groundTruthSites);
  const hasMapboxToken = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

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
          {hasMapboxToken ? (
            <Map
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
              initialViewState={{
                longitude: (bounds.left + bounds.right) / 2,
                latitude: (bounds.top + bounds.bottom) / 2,
                zoom: 9,
              }}
              style={{ width: "100%", height: 480 }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
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
          ) : (
            <NoTokenMapPreview
              probabilityImageUrl={probabilityImageUrl}
              bounds={bounds}
              groundTruthSites={groundTruthSites}
              onSelectSite={setSelectedSiteId}
            />
          )}
        </div>
      </div>

      <ReceiptSheetModal siteId={selectedSiteId} onClose={() => setSelectedSiteId(null)} />
    </>
  );
}
