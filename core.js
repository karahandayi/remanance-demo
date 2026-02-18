/* ================== VERİ TABANI ================== */

const DEFAULT_CITIES = {
  "34": { name: "İSTANBUL", status: "total", population: 15000000 },
  "06": { name: "ANKARA", status: "total", population: 5500000 },
  "35": { name: "İZMİR", status: "active", population: 4300000 }
};

const DEFAULT_NEWS = [
  { id: 1, text: "İstanbul karantinası çöktü" },
  { id: 2, text: "Ankara'da askeri kontrol sağlandı" }
];

function initDB() {
  if (!localStorage.cities) {
    localStorage.cities = JSON.stringify(DEFAULT_CITIES);
  }
  if (!localStorage.news) {
    localStorage.news = JSON.stringify(DEFAULT_NEWS);
  }
  if (!localStorage.citizens) {
    localStorage.citizens = JSON.stringify([]);
  }
}
initDB();

function getCities() {
  return JSON.parse(localStorage.cities);
}
function saveCities(cities) {
  localStorage.cities = JSON.stringify(cities);
}

function getNews() {
  return JSON.parse(localStorage.news);
}
function saveNews(news) {
  localStorage.news = JSON.stringify(news);
}

function getCitizens() {
  return JSON.parse(localStorage.citizens);
}
function saveCitizens(list) {
  localStorage.citizens = JSON.stringify(list);
}

/* ================== HARİTA ================== */

const PATHS = {
  "34": "M 180 90 L 240 90 L 230 140 L 170 130 Z",
  "06": "M 300 130 L 360 130 L 350 190 L 290 180 Z",
  "35": "M 140 190 L 190 190 L 180 240 L 130 230 Z"
};

function renderMap() {
  const svg = document.getElementById("turkey-map");
  if (!svg) return; // ⬅️ KRİTİK SATIR

  svg.innerHTML = "";
  const cities = getCities();

  Object.keys(PATHS).forEach(id => {
    if (!cities[id]) {
      cities[id] = {
        name: "BÖLGE " + id,
        status: "safe",
        population: 500000
      };
    }

    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", PATHS[id]);
    p.setAttribute("class", "status-" + cities[id].status);
    p.onclick = () => selectCity(id);
    svg.appendChild(p);
  });

  saveCities(cities);
}

/* ================== UI ================== */

function selectCity(id) {
  const c = getCities()[id];
  if (!c) return;

  const panel = document.getElementById("city-info");
  if (!panel) return;

  panel.style.display = "block";
  document.getElementById("cityName").innerText = c.name;
  document.getElementById("cityStatus").innerText = c.status.toUpperCase();
  document.getElementById("cityPop").innerText =
    c.population.toLocaleString("tr-TR");
}

function loadNews() {
  const box = document.getElementById("news");
  if (!box) return;

  box.innerHTML = "";
  getNews().forEach(n => {
    const d = document.createElement("div");
    d.className = "news-item";
    d.innerText = n.text;
    box.appendChild(d);
  });
}

function searchCitizen() {
  const input = document.getElementById("citizenInput");
  const result = document.getElementById("citizenResult");
  if (!input || !result) return;

  const code = input.value.trim();
  const citizens = getCitizens();
  const found = citizens.find(c => c.code === code);

  result.innerHTML = found
    ? `${found.name} ${found.surname} – ${found.city}`
    : "Kayıt bulunamadı";
}

/* ================== SİMÜLASYON ================== */

setInterval(() => {
  const cities = getCities();
  let changed = false;

  Object.values(cities).forEach(c => {
    if (c.status !== "safe" && c.population > 0) {
      c.population = Math.max(0, Math.floor(c.population * 0.999));
      changed = true;
    }
  });

  if (changed) saveCities(cities);
}, 10000);


