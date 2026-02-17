// ===============================
// REMANANCE MAP INITIALIZATION
// ===============================

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([39.0, 35.0], 6);

// ===============================
// DARK MAP TILE (CARTO DARK)
// ===============================

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19
  }
).addTo(map);

// ===============================
// CITY DATA
// ===============================

const cities = [
  {
    name: "İstanbul",
    coords: [41.0082, 28.9784],
    status: "TOTAL REMANANCE",
    color: "#ff3b3b"
  },
  {
    name: "Ankara",
    coords: [39.9334, 32.8597],
    status: "ACTIVE REMANANCE",
    color: "#ffb300"
  },
  {
    name: "İzmir",
    coords: [38.4237, 27.1428],
    status: "STABLE ZONE",
    color: "#2ecc71"
  }
];

// ===============================
// ADD MARKERS TO MAP
// ===============================

cities.forEach(city => {
  const marker = L.circleMarker(city.coords, {
    radius: 10,
    fillColor: city.color,
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.9
  }).addTo(map);

  marker.bindPopup(`
    <strong>${city.name}</strong><br/>
    Status: <b>${city.status}</b>
  `);
});
