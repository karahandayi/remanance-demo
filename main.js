// ===============================
// REMANANCE – TURKEY PROVINCES
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

// Example province status map (demo logic)
const provinceStatus = {
  "Istanbul": "TOTAL REMANANCE",
  "Ankara": "ACTIVE REMANANCE",
  "Izmir": "STABLE ZONE"
};

const statusColors = {
  "TOTAL REMANANCE": "#8b0000",
  "ACTIVE REMANANCE": "#ff6600",
  "STABLE ZONE": "#2ecc71",
  "DEFAULT": "#444"
};

// Load REAL Turkey provinces (Natural Earth Admin-1)
fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson")
  .then(res => res.json())
  .then(data => {

    const turkeyOnly = {
      type: "FeatureCollection",
      features: data.features.filter(
        f => f.properties.admin === "Turkey"
      )
    };

    L.geoJSON(turkeyOnly, {
      style: feature => {
        const name = feature.properties.name;
        const status = provinceStatus[name] || "DEFAULT";
        const color = statusColors[status];

        return {
          color: color,
          weight: 1,
          fillColor: color,
          fillOpacity: 0.45
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name;
        const status = provinceStatus[name] || "NO DATA";

        layer.bindPopup(`
          <strong>${name}</strong><br>
          Status: <b>${status}</b>
        `);
      }
    }).addTo(map);

  });
