// ===============================
// REMANENCE – TURKEY MAP (PRO)
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
// STATUS & COLORS
// ===============================

const focusProvinces = {
  "Istanbul": { status: "TOTAL REMANANCE", color: "#8b0000" },
  "Ankara":   { status: "ACTIVE REMANANCE", color: "#ff7a00" },
  "Izmir":    { status: "TOTAL REMANANCE", color: "#8b0000" }
};

const CONTROLLED_COLOR = "#2ecc71";

// ===============================
// 1) BASE LAYER – ALL TURKEY (LIGHT)
// ===============================

fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson")
  .then(res => res.json())
  .then(data => {

    const turkey = data.features.filter(
      f => f.properties.admin === "Turkey"
    );

    L.geoJSON(turkey, {
      style: {
        color: "#444",
        weight: 0.8,
        fillColor: CONTROLLED_COLOR,
        fillOpacity: 0.45
      }
    }).addTo(map);
  });

// ===============================
// 2) HIGH DETAIL LAYER – 3 PROVINCES
// Source: GADM Level-1 (much sharper)
// ===============================

fetch("https://raw.githubusercontent.com/geodata/gadm-data/master/geojson/gadm41_TUR_1.json")
  .then(res => res.json())
  .then(data => {

    data.features.forEach(feature => {
      const name = feature.properties.NAME_1;

      if (focusProvinces[name]) {
        const cfg = focusProvinces[name];

        L.geoJSON(feature, {
          style: {
            color: "#ffffff",          // keskin sınır
            weight: 2.8,               // kalın çizgi
            fillColor: cfg.color,
            fillOpacity: 0.85          // çok baskın
          },
          onEachFeature: (f, layer) => {
            layer.bindPopup(`
              <strong>${name}</strong><br/>
              Status: <b>${cfg.status}</b>
            `);
          }
        }).addTo(map);
      }
    });
  });
