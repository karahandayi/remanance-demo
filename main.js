// ===============================
// REMANENCE – TURKEY PROVINCES (LOCAL FILE)
// ===============================

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([39, 35], 6);

// Dark map
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
).addTo(map);

// ===============================
// PROVINCE STATUS
// ===============================

const provinceStatus = {
  istanbul: { color: "#7a0000", status: "TOTAL REMANANCE" },
  ankara:   { color: "#ff7a00", status: "ACTIVE REMANANCE" },
  izmir:    { color: "#7a0000", status: "TOTAL REMANANCE" }
};

const DEFAULT = {
  color: "#2ecc71",
  status: "CONTROLLED"
};

// ===============================
// HELPER
// ===============================

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

// ===============================
// LOAD LOCAL GEOJSON
// ===============================

fetch("data/turkey-provinces.geojson")
  .then(res => res.json())
  .then(data => {

    L.geoJSON(data, {
      style: feature => {
        const rawName = feature.properties.name || feature.properties.NAME_1;
        const key = normalize(rawName);
        const cfg = provinceStatus[key] || DEFAULT;

        return {
          fillColor: cfg.color,
          fillOpacity: 0.65,
          color: cfg.color,   // sınır rengi dolgu ile aynı
          weight: 0.4
        };
      },
      onEachFeature: (feature, layer) => {
        const rawName = feature.properties.name || feature.properties.NAME_1;
        const key = normalize(rawName);
        const cfg = provinceStatus[key] || DEFAULT;

        layer.bindPopup(`
          <strong>${rawName}</strong><br/>
          Durum: <b>${cfg.status}</b>
        `);
      }
    }).addTo(map);

  })
  .catch(err => {
    console.error("GeoJSON yüklenemedi:", err);
  });
