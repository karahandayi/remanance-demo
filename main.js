// ===============================
// REMANENCE – HARD WIRED GEOJSON
// ===============================

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([39, 35], 6);

// Dark basemap
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
).addTo(map);

// ===============================
// INLINE GEOJSON (NO FETCH)
// ===============================

const turkeyGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Istanbul", "status": "RED" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[28.5,41.4],[29.8,41.4],[29.8,40.7],[28.5,40.7],[28.5,41.4]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Ankara", "status": "ORANGE" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[32.4,40.2],[33.2,40.2],[33.2,39.6],[32.4,39.6],[32.4,40.2]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Izmir", "status": "RED" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[26.8,38.7],[27.6,38.7],[27.6,37.9],[26.8,37.9],[26.8,38.7]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Other", "status": "GREEN" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[25.5,42],[45,42],[45,35],[25.5,35],[25.5,42]]]
      }
    }
  ]
};

// ===============================
// COLOR LOGIC
// ===============================

function getColor(status) {
  if (status === "RED") return "#7a0000";
  if (status === "ORANGE") return "#ff7a00";
  return "#2ecc71";
}

// ===============================
// DRAW
// ===============================

L.geoJSON(turkeyGeoJSON, {
  style: feature => ({
    fillColor: getColor(feature.properties.status),
    fillOpacity: 0.7,
    color: "#000",
    weight: 0.3
  })
}).addTo(map);
