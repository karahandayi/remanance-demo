const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([41.03, 28.95], 10);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
).addTo(map);

// STATUS COLOR MAP
const statusColors = {
  "TOTAL REMANANCE": "#8b0000",
  "ACTIVE REMANANCE": "#ff6600",
  "UNSTABLE ZONE": "#ffd000"
};

// LOAD GEOJSON
fetch("data/istanbul.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: feature => {
        if (feature.properties.level === "province") {
          return {
            color: "#ff2e2e",
            weight: 2,
            fillColor: "#ff2e2e",
            fillOpacity: 0.25
          };
        }

        return {
          color: statusColors[feature.properties.status] || "#999",
          weight: 2,
          fillColor: statusColors[feature.properties.status] || "#999",
          fillOpacity: 0.55
        };
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          `<strong>${feature.properties.name}</strong><br>
           Status: ${feature.properties.status || "TOTAL REMANANCE"}`
        );
      }
    }).addTo(map);
  });
