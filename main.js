// ===============================
// REMANENCE – TURKEY (GADM FIXED)
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
// UTILS
// ===============================

// Türkçe karakter normalize (İ → I, ı → i vs.)
function normalizeName(str) {
  return str
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

// ===============================
// STATUS DEFINITIONS
// ===============================

const provinceStatus = {
  istanbul: { status: "TOTAL REMANANCE", color: "#7a0000" },
  ankara:   { status: "ACTIVE REMANANCE", color: "#ff7a00" },
  izmir:    { status: "TOTAL REMANANCE", color: "#7a0000" }
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
        const rawName = feature.properties.NAME_1;
        const key = normalizeName(rawName);
        const cfg = provinceStatus[key] || DEFAULT_STATUS;

        return {
          color: "transparent",   // sınır çizgisi yok
          weight: 0,
          fillColor: cfg.color,
          fillOpacity: 0.65
        };
      },
      onEachFeature: (feature, layer) => {
        const rawName = feature.properties.NAME_1;
        const key = normalizeName(rawName);
        const cfg = provinceStatus[key] || DEFAULT_STATUS;

        layer.bindPopup(`
          <strong>${rawName}</strong><br/>
          Status: <b>${cfg.status}</b>
        `);
      }
    }).addTo(map);

  });
