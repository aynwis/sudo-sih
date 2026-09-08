// GeoJSON coordinates are [lon, lat] -- the reverse of how the data is
// usually described out loud. Get this order right or markers land in
// the wrong hemisphere-adjacent spot, silently.
export function sitesToGeoJson(sites) {
  return {
    type: "FeatureCollection",
    features: sites.map((s) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
      properties: { site_id: s.site_id, precision: s.precision_flag },
    })),
  };
}
