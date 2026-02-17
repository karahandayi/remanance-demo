// ===============================
// REMANENCE - MAP INIT
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
// PROVINCE STATUS DEFINITIONS
// ===============================

const provinceStatus = {
  "Istanbul": "TOTAL REMANANCE",
  "Ankara": "ACTIVE REMANANCE",
  "Izmir": "STABLE ZONE"
};

// Status colors
const statusColors = {
  "TOTAL REMANANCE": "#8b0000",   // dark red
  "ACTIVE REMANANCE": "#ff7a00",  // orange
  "STABLE ZONE": "#2ecc71",       // green
  "DEFAULT": "#2ecc71"            // other cities -> green
};

// ===============================
// LOAD TURKEY PROVINCES (REAL DATA)
// ===============================

fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson")
  .then(res => res.json())
  .then(data => {

    const turkey = {
      type: "FeatureCollection",
      features: data.features.filter(
        f => f.properties.admin === "Turkey"
      )
    };

    L.geoJSON(turkey, {
      style: feature => {
        const name = feature.properties.name;
        const status = provinceStatus[name] || "DEFAULT";
        const color = statusColors[status];

        return {
          color: "#555",          // border
          weight: 1,
          fillColor: color,
          fillOpacity: 0.55
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name;
        const status = provinceStatus[name] || "CONTROLLED";

        layer.bindPopup(`
          <strong>${name}</strong><br/>
          Status: <b>${status}</b>
        `);
      }
    }).addTo(map);

  });
