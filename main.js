/* ================= VERİ ================= */

const CITY_DATA = {
  "İstanbul": { status: "total", population: 15000000 },
  "Ankara": { status: "total", population: 5500000 },
  "İzmir": { status: "active", population: 4300000 }
};

const NEWS = [
  "İstanbul karantinası çöktü",
  "Ankara'da askeri kontrol sağlandı"
];

/* ================= HARİTA ================= */

const map = L.map("map", {
  center: [39, 35],
  zoom: 6,
  zoomControl: false
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: ""
}).addTo(map);

/* ================= RENKLER ================= */

function getColor(status) {
  if (status === "total") return "#ef4444";
  if (status === "active") return "#f59e0b";
  if (status === "controlled") return "#22c55e";
  return "#111";
}

/* ================= TÜRKİYE HARİTA ================= */

fetch("https://raw.githubusercontent.com/cihadturhan/turkey-geojson/master/tr-cities-utf8.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: feature => {
        const name = feature.properties.name;
        const city = CITY_DATA[name];
        return {
          fillColor: city ? getColor(city.status) : "#22c55e",
          weight: 1,
          color: "#000",
          fillOpacity: 0.85
        };
      },
      onEachFeature: (feature, layer) => {
        layer.on("click", () => selectCity(feature.properties.name));
      }
    }).addTo(map);
  });

/* ================= UI ================= */

function selectCity(name) {
  const panel = document.getElementById("cityPanel");
  const city = CITY_DATA[name];

  panel.style.display = "block";
  document.getElementById("cityName").innerText = name;

  if (!city) {
    document.getElementById("cityStatus").innerText = "CONTROLLED";
    document.getElementById("cityStatus").className = "status controlled";
    document.getElementById("cityPopulation").innerText = "-";
    return;
  }

  document.getElementById("cityStatus").innerText =
    city.status === "total" ? "TOTAL REMANANCE" :
    city.status === "active" ? "ACTIVE REMANANCE" : "CONTROLLED";

  document.getElementById("cityStatus").className =
    "status " + city.status;

  document.getElementById("cityPopulation").innerText =
    city.population.toLocaleString("tr-TR");
}

/* ================= HABERLER ================= */

const newsBox = document.getElementById("news");
NEWS.forEach(n => {
  const div = document.createElement("div");
  div.innerText = n;
  newsBox.appendChild(div);
});

/* ================= CITIZEN ================= */

const DEMO_CITIZENS = [
  { code: "IST-1001", city: "İstanbul", status: "Alive" },
  { code: "ANK-2045", city: "Ankara", status: "Unknown" }
];

function searchCitizen() {
  const code = document.getElementById("citizenInput").value.trim();
  const result = document.getElementById("citizenResult");

  const c = DEMO_CITIZENS.find(x => x.code === code);
  if (!c) {
    result.innerText = "Kayıt bulunamadı";
    return;
  }

  result.innerHTML = `
    <strong>${c.code}</strong><br>
    Şehir: ${c.city}<br>
    Durum: ${c.status}
  `;

  selectCity(c.city);
}
