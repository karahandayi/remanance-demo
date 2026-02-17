// ===============================
// REMANANCE MAP INITIALIZATION
// ===============================

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false
}).setView([41.03, 28.95], 10);

// ===============================
// DARK MAP TILE
// ===============================

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
).addTo(map);

// ===============================
// ISTANBUL PROVINCE (BACKGROUND)
// ===============================

const istanbulProvince = {
  type: "Feature",
  properties: {
    name: "İstanbul",
    status: "TOTAL REMANANCE"
  },
  geometry: {
    type: "Polygon",
    coordinates: [[
      [28.45, 41.40],
      [29.10, 41.55],
      [29.80, 41.25],
      [29.60, 40.75],
      [28.90, 40.70],
      [28.45, 41.40]
    ]]
  }
};

L.geoJSON(istanbulProvince, {
  style: {
    color: "#ff2e2e",
    weight: 2,
    fillColor: "#ff2e2e",
    fillOpacity: 0.25
  }
}).addTo(map);

// ===============================
// SELECTED DISTRICTS (SIMPLIFIED)
// ===============================

const districts = [
  {
    name: "Fatih",
    status: "TOTAL REMANANCE",
    color: "#b30000",
    coords: [[
      [28.93, 41.03],
      [28.98, 41.05],
      [29.02, 41.02],
      [28.98, 41.00],
      [28.93, 41.03]
    ]]
  },
  {
    name: "Kadıköy",
    status: "ACTIVE REMANANCE",
    color: "#ff9900",
    coords: [[
      [29.02, 40.99],
      [29.06, 41.02],
      [29.10, 40.99],
      [29.06, 40.96],
      [29.02, 40.99]
    ]]
  },
  {
    name: "Beşiktaş",
    status: "UNSTABLE ZONE",
    color: "#ffd000",
    coords: [[
      [29.00, 41.05],
      [29.04, 41.07],
      [29.07, 41.04],
      [29.03, 41.02],
      [29.00, 41.05]
    ]]
  },
  {
    name: "Esenyurt",
    status: "TOTAL REMANANCE",
    color: "#8b0000",
    coords: [[
      [28.65, 41.02],
      [28.72, 41.05],
      [28.78, 41.02],
      [28.72, 40.99],
      [28.65, 41.02]
    ]]
  },
  {
    name: "Küçükçekmece",
    status: "ACTIVE REMANANCE",
    color: "#ff6600",
    coords: [[
      [28.76, 41.00],
      [28.82, 41.03],
      [28.88, 41.00],
      [28.82, 40.97],
      [28.76, 41.00]
    ]]
  }
];

// ===============================
// DRAW DISTRICTS
// ===============================

districts.forEach(district => {
  L.geoJSON(
    {
      type: "Feature",
      properties: {
        name: district.name,
        status: district.status
      },
      geometry: {
        type: "Polygon",
        coordinates: [district.coords]
      }
    },
    {
      style: {
        color: district.color,
        weight: 2,
        fillColor: district.color,
        fillOpacity: 0.55
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <strong>${feature.properties.name}</strong><br/>
          Status: <b>${feature.properties.status}</b>
        `);
      }
    }
  ).addTo(map);
});
