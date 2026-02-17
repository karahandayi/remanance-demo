// ===============================
// REMANENCE – TURKEY MAP
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
// STATUS DEFINITIONS
// ===============================

// Özel şehirler
const focusProvinces = {
  "Istanbul": "TOTAL REMANANCE",
  "Ankara": "ACTIVE REMANANCE",
  "Izmir": "TOTAL REMANANCE"
};

// Renkler
const statusColors = {
  "TOTAL REMANANCE": "#8b0000",   // koyu kırmızı
  "ACTIVE REMANANCE": "#ff7a00",  // turuncu
  "CONTROLLED": "#2ecc71"         // yeşil
};

// ===============================
// LOAD TURKEY PROVINCES
// ===============================

fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson")
  .then(res => res.json())
  .then(data => {

    const turkeyProvinces = data.features.filter(
      f => f.properties.admin === "Turkey"
    );

    // 1️⃣ TÜM İLLER – YEŞİL (ARKA KATMAN)
    L.geoJSON(turkeyProvinces, {
      style: {
        color: "#444",
        weight: 0.8,
        fillColor: statusColors["CONTROLLED"],
        fillOpacity: 0.45
      }
    }).addTo(map);

    // 2️⃣ ODAK İLLER – ÜST KATMAN (DAHA DETAYLI HİSSİ)
    turkeyProvinces.forEach(feature => {
      const name = feature.properties.name;

      if (focusProvinces[name]) {
        const status = focusProvinces[name];

        L.geoJSON(feature, {
          style: {
            color: "#ffffff",              // daha net sınır
            weight: 2.2,                   // kalın çizgi
            fillColor: statusColors[status],
            fillOpacity: 0.75              // daha baskın
          },
          onEachFeature: (f, layer) => {
            layer.bindPopup(`
              <strong>${name}</strong><br/>
              Status: <b>${status}</b>
            `);
          }
        }).addTo(map);
      }
    });

  });
