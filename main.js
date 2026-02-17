// ===============================
// REMANENCE – LOCAL GEOJSON TEST
// ===============================

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([39, 35], 6);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
).addTo(map);

// STATUS COLORS
const colors = {
  Istanbul: "#7a0000",
  Ankara: "#ff7a00",
  Izmir: "#7a0000",
  Other: "#2ecc71"
};

// LOAD LOCAL GEOJSON (NO CORS)
fetch("data/turkey-provinces.geojson")
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: feature => ({
        fillColor: colors[feature.properties.name] || "#2ecc71",
        fillOpacity: 0.65,
        color: "#111",
        weight: 0.5
      })
    }).addTo(map);
  });
