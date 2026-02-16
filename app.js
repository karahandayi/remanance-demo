const map = L.map("map", {
  zoomControl: false
}).setView([39.0, 35.0], 6); // Türkiye merkez

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap"
}).addTo(map);
