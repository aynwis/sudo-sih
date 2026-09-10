import { useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import { MapPinned } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { sitesToGeoJson } from "../lib/groundTruthGeoJson";
import { REGRESSION_SITES } from "../lib/regressionSites";
import ReceiptSheetModal from "./ReceiptSheetModal";
import RegressionSitePopup from "./RegressionSitePopup";

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

function regressionSitesToGeoJson(sites) {
  return {
    type: "FeatureCollection",
    features: sites.map((s) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
      properties: { site_id: s.site_id },
    })),
  };
}

/**
 * `probabilityImageUrl` is a rendered PNG (or data URI) of the probability
 * array. `bounds` is the {left, right, top, bottom} shape from bounds.json.
 */
// The real regression sites cluster tightly (all within ~50km, around the
// Nagpur/Bhandara manganese belt) -- at the wide India-overview zoom they
// collapse into a single unclickable pixel, so default there instead of
// `bounds`'s center when we have real sites to show.
const REGRESSION_CLUSTER_VIEW =
  REGRESSION_SITES.length > 0
    ? {
        longitude: REGRESSION_SITES.reduce((sum, s) => sum + s.lon, 0) / REGRESSION_SITES.length,
        latitude: REGRESSION_SITES.reduce((sum, s) => sum + s.lat, 0) / REGRESSION_SITES.length,
        zoom: 9.3,
      }
    : null;

export default function ProspectivityHeatmap({ probabilityImageUrl, bounds, groundTruthSites, rasterSource = "mock", height = 520 }) {
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [selectedRegressionSiteId, setSelectedRegressionSiteId] = useState(null);
  const geojson = sitesToGeoJson(groundTruthSites);
  const regressionGeojson = regressionSitesToGeoJson(REGRESSION_SITES);
  const initialView = REGRESSION_CLUSTER_VIEW ?? {
    longitude: (bounds.left + bounds.right) / 2,
    latitude: (bounds.top + bounds.bottom) / 2,
    zoom: 5,
  };

  function handleMapClick(event) {
    const feature = event.features && event.features[0];
    if (!feature) return;
    if (feature.layer.id === "regression-site-circles") {
      setSelectedRegressionSiteId(feature.properties.site_id);
    } else {
      setSelectedSiteId(feature.properties.site_id);
    }
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
          <span className="pill-badge pending">{rasterSource === "real" ? "live raster" : "demo raster"}</span>
          <div className="flex items-center gap-4 text-xs text-bone-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-bright" /> mine-level
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ochre-bright" /> block-level
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-400" /> predicted reserve
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl">
          <Map
            initialViewState={initialView}
            style={{ width: "100%", height }}
            mapStyle={SATELLITE_STYLE}
            interactiveLayerIds={["ground-truth-circles", "regression-site-circles"]}
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

            {/* Sahil's precomputed regression-ready sites; see regressionSites.js. */}
            <Source id="regression-site-points" type="geojson" data={regressionGeojson}>
              <Layer
                id="regression-site-circles"
                type="circle"
                paint={{
                  "circle-radius": 7,
                  "circle-color": "#c084fc",
                  "circle-stroke-width": 1.5,
                  "circle-stroke-color": "#0b0f14",
                }}
              />
            </Source>
          </Map>
        </div>
      </div>

      <ReceiptSheetModal siteId={selectedSiteId} onClose={() => setSelectedSiteId(null)} />
      <RegressionSitePopup siteId={selectedRegressionSiteId} onClose={() => setSelectedRegressionSiteId(null)} />
    </>
  );
}
