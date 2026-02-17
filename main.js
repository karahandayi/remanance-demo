// ===============================
// REMANANCE – TURKEY PROVINCES
// ===============================

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
});

// Dark base map
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
).addTo(map);

// ===============================
// STATUS DEFINITIONS
// ===============================

const STATUS = {
  istanbul: { color: "#7a0000", label: "TOTAL REMANANCE" },
  ankara:   { color: "#ff7a00", label: "ACTIVE REMANANCE" },
  izmir:    { color: "#7a0000", label: "TOTAL REMANANCE" }
};

const DEFAULT_STATUS = {
  color: "#2ecc71",
  label: "CONTROLLED"
};

// ===============================
// HELPERS
// ===============================

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

// ===============================
// LOAD PROVINCES (LOCAL FILE)
// ===============================

fetch("data/tr-cities.json")
  .then(res => res.json())
  .then(data => {

    const layer = L.geoJSON(data, {
      style: feature => {
        const rawName = feature.properties.name;
        const key = normalize(rawName);
        const cfg = STATUS[key] || DEFAULT_STATUS;

        return {
          fillColor: cfg.color,
          fillOpacity: 0.7,
          color: cfg.color,
          weight: 0.6
        };
      },
      onEachFeature: (feature, layer) => {
        const rawName = feature.properties.name;
        const key = normalize(rawName);
        const cfg = STATUS[key] || DEFAULT_STATUS;

        layer.bindPopup(`
          <strong>${rawName}</strong><br>
          Durum: <b>${cfg.label}</b>
        `);
      }
    }).addTo(map);

    // 🔥 HARİTAYI TÜRKİYE’YE OTURT
    map.fitBounds(layer.getBounds());

  })
  .catch(err => {
    console.error("GeoJSON yüklenemedi:", err);
  });
