const map = L.map("map").setView([39, 35], 6);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
).addTo(map);

fetch("data/turkey-provinces.geojson")
  .then(r => {
    console.log("Fetch status:", r.status);
    return r.json();
  })
  .then(data => {
    console.log("GeoJSON loaded:", data);

    L.geoJSON(data, {
      style: {
        fillColor: "red",
        fillOpacity: 0.6,
        color: "red",
        weight: 1
      }
    }).addTo(map);

  })
  .catch(err => {
    console.error("HATA:", err);
  });
