// ===============================
// REMANENCE – TURKEY (GADM ONLY)
// ===============================

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([39.0, 35.0], 6);

// Dark basemap
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
).addTo(map);

// ===============================
// STATUS DEFINITIONS
// ===============================

const provinceStatus = {
  "İstanbul": { status: "TOTAL REMANANCE", color: "#7a0000" },
  "Ankara":   { status: "ACTIVE REMANANCE", color: "#ff7a00" },
  "İzmir":    { status: "TOTAL REMANANCE", color: "#7a0000" }
};

const DEFAULT_STATUS = {
  status: "CONTROLLED",
  color: "#2ecc71"
};

// ===============================
// LOAD GADM LEVEL-1 (REAL BORDERS)
// ===============================

fetch("https://raw.githubusercontent.com/geodata/gadm-data/master/geojson/gadm41_TUR_1.json")
  .then(res => res.json())
  .then(data => {

    L.geoJSON(data, {
      style: feature => {
        const name = feature.properties.NAME_1;
        const cfg = provinceStatus[name] || DEFAULT_STATUS;

        return {
          color: "transparent",   // ❌ beyaz sınır YOK
          weight: 0,
          fillColor: cfg.color,
          fillOpacity: 0.65
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.NAME_1;
        const cfg = provinceStatus[name] || DEFAULT_STATUS;

        layer.bindPopup(`
          <strong>${name}</strong><br/>
          Status: <b>${cfg.status}</b>
        `);
      }
    }).addTo(map);

  });
