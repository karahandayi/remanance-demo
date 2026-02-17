// ===============================
// REMANANCE MAP INITIALIZATION
// ===============================

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([41.05, 29.0], 9);

// ===============================
// DARK MAP TILE
// ===============================

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19
  }
).addTo(map);

// ===============================
// ISTANBUL PROVINCE (REAL, SIMPLIFIED)
// Source: GADM / Natural Earth (simplified)
// ===============================

const istanbulProvince = {
  "type": "Feature",
  "properties": {
    "name": "İstanbul",
    "status": "TOTAL REMANANCE"
  },
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [
      [
        [
          [28.475, 41.390],
          [28.740, 41.515],
          [29.105, 41.540],
          [29.435, 41.460],
          [29.700, 41.260],
          [29.740, 41.020],
          [29.520, 40.800],
          [29.200, 40.720],
          [28.880, 40.740],
          [28.600, 40.880],
          [28.475, 41.390]
        ]
      ]
    ]
  }
};

// ===============================
// ADD ISTANBUL PROVINCE
// ===============================

L.geoJSON(istanbulProvince, {
  style: {
    color: "#ff3b3b",
    weight: 2,
    fillColor: "#ff3b3b",
    fillOpacity: 0.4
  },
  onEachFeature: function (feature, layer) {
    layer.bindPopup(`
      <strong>${feature.properties.name}</strong><br/>
      Status: <b>${feature.properties.status}</b>
    `);
  }
}).addTo(map);
