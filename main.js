const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([39, 35], 6);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
).addTo(map);

// İL DURUMLARI
const statusMap = {
  istanbul: { color: "#7a0000", status: "TOTAL REMANANCE" },
  ankara:   { color: "#ff7a00", status: "ACTIVE REMANANCE" },
  izmir:    { color: "#7a0000", status: "TOTAL REMANANCE" }
};

const DEFAULT = {
  color: "#2ecc71",
  status: "CONTROLLED"
};

// Türkçe karakter normalize
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

// LOCAL GEOJSON
fetch("data/turkey-provinces.geojson")
  .then(r => r.json())
  .then(data => {

    L.geoJSON(data, {
      style: feature => {
        const rawName = feature.properties.name;
        const key = normalize(rawName);
        const cfg = statusMap[key] || DEFAULT;

        return {
          fillColor: cfg.color,
          fillOpacity: 0.7,
          color: cfg.color,
          weight: 0.5
        };
      },
      onEachFeature: (feature, layer) => {
        const rawName = feature.properties.name;
        const key = normalize(rawName);
        const cfg = statusMap[key] || DEFAULT;

        layer.bindPopup(`
          <strong>${rawName}</strong><br>
          Durum: <b>${cfg.status}</b>
        `);
      }
    }).addTo(map);

  });
