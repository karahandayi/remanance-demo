// ===============================
// REMANANCE MAP INITIALIZATION
// ===============================

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([41.0, 29.0], 9);

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
// ISTANBUL PROVINCE (FIXED GEOJSON)
// NOTE: GeoJSON = [LONGITUDE, LATITUDE]
// ===============================

const istanbulProvince = {
  "type": "Feature",
  "properties": {
    "name": "İstanbul",
    "status": "TOTAL REMANANCE"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [28.474, 41.396],
      [29.102, 41.515],
      [29.632, 41.463],
      [29.813, 41.201],
      [29.557, 40.802],
      [28.923, 40.727],
      [28.474, 41.396]
    ]]
  }
};

// ===============================
// ADD ISTANBUL POLYGON
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
