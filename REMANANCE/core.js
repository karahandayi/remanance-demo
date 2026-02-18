/* --- REMANANCE CORE SYSTEM --- */

// 1. DATA INITIALIZATION (LOCAL STORAGE CHECK)
const DEFAULT_CITIES = {
    '34': { name: 'İSTANBUL', status: 'total', population: 15462452, districts: [
        {name: 'Fatih', status: 'safe'}, {name: 'Kadıköy', status: 'active'}, 
        {name: 'Beşiktaş', status: 'total'}, {name: 'Esenyurt', status: 'total'}
    ]},
    '06': { name: 'ANKARA', status: 'total', population: 5663322, districts: [
        {name: 'Çankaya', status: 'safe'}, {name: 'Keçiören', status: 'total'}, {name: 'Mamak', status: 'active'}
    ]},
    '35': { name: 'İZMİR', status: 'active', population: 4367251, districts: [
        {name: 'Alsancak', status: 'active'}, {name: 'Karşıyaka', status: 'safe'}, {name: 'Çeşme', status: 'active'}
    ]},
    '01': { name: 'ADANA', status: 'safe', population: 2258718 },
    '07': { name: 'ANTALYA', status: 'safe', population: 2548308 },
    // Diğer iller varsayılan olarak 'safe' dönecek
};

const DEFAULT_NEWS = [
    { time: '10:42', text: 'İSTANBUL: Boğaziçi köprülerinde bağlantı koptu.' },
    { time: '09:15', text: 'ANKARA: Kızılay bölgesinde tam karantina ilan edildi.' },
    { time: '08:00', text: 'GENELKURMAY: 81 ilde sokağa çıkma yasağı genişletildi.' }
];

// Basit veri tabanı başlatıcı
function initDB() {
    if (!localStorage.getItem('remanance_cities')) {
        localStorage.setItem('remanance_cities', JSON.stringify(DEFAULT_CITIES));
    }
    if (!localStorage.getItem('remanance_news')) {
        localStorage.setItem('remanance_news', JSON.stringify(DEFAULT_NEWS));
    }
    if (!localStorage.getItem('remanance_citizens')) {
        localStorage.setItem('remanance_citizens', JSON.stringify([]));
    }
}

// Veri Çekme Fonksiyonları
function getCityData(id) {
    const cities = JSON.parse(localStorage.getItem('remanance_cities'));
    // Eğer özel verisi yoksa varsayılan döndür
    return cities[id] || { name: `BÖLGE #${id}`, status: 'safe', population: 500000, districts: [] };
}

function getNews() {
    return JSON.parse(localStorage.getItem('remanance_news'));
}

function getCitizens() {
    return JSON.parse(localStorage.getItem('remanance_citizens'));
}

// Vatandaş Ekleme
function addCitizen(citizenObj) {
    const citizens = getCitizens();
    citizens.unshift(citizenObj); // En başa ekle
    localStorage.setItem('remanance_citizens', JSON.stringify(citizens));
}

// Haber Ekleme
function addNews(text) {
    const news = getNews();
    const time = new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    news.unshift({ time, text });
    localStorage.setItem('remanance_news', JSON.stringify(news));
}

// Şehir Güncelleme
function updateCityStatus(id, status) {
    const cities = JSON.parse(localStorage.getItem('remanance_cities'));
    if(!cities[id]) cities[id] = { name: `IL-${id}`, status: 'safe', population: 100000 }; // Create if not exists
    cities[id].status = status;
    localStorage.setItem('remanance_cities', JSON.stringify(cities));
}

// --- HARİTA ÇİZİM VERİSİ (BASİTLEŞTİRİLMİŞ SVG PATHLERİ) ---
// Not: Tam 81 ilin path verisi çok uzun olduğu için burada demo amaçlı 
// ana illeri detaylı, diğerlerini stilize edilmiş kutular olarak çizeceğiz.
// Ancak ID'ler (plaka kodları) doğrudur.
const TURKEY_PATHS = {
    '34': "M 180,80 L 220,80 L 210,120 L 170,110 Z", // ISTANBUL (Abstract)
    '06': "M 300,100 L 360,100 L 350,160 L 290,150 Z", // ANKARA (Abstract)
    '35': "M 160,160 L 200,160 L 200,210 L 150,200 Z", // IZMIR (Abstract)
    '07': "M 250,220 L 310,220 L 300,260 L 240,250 Z", // ANTALYA
    '01': "M 320,200 L 350,200 L 340,230 L 310,220 Z", // ADANA
    // Diğer iller için bir grid oluşturacağız
};

// Haritayı Render Etme (Index sayfasında çalışır)
function renderMap() {
    const svg = document.getElementById('turkey-map');
    if (!svg) return;

    // 1. Ana İlleri Çiz
    for (const [id, pathData] of Object.entries(TURKEY_PATHS)) {
        createPath(svg, id, pathData);
    }

    // 2. Geri kalan illeri "Sanal Grid" olarak doldur (Görsel bütünlük için)
    // Gerçek projede buraya tam SVG path'leri yapıştırılmalıdır.
    let counter = 0;
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 5; y++) {
            const tempId = (counter + 1).toString().padStart(2, '0');
            // Zaten çizdiklerimizi atla
            if (!TURKEY_PATHS[tempId]) {
                const rectPath = `M ${100 + x * 60},${50 + y * 40} h 50 v 30 h -50 Z`;
                createPath(svg, tempId, rectPath);
            }
            counter++;
            if (counter > 81) break;
        }
    }
}

function createPath(svg, id, d) {
    const data = getCityData(id);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("id", `city-${id}`);
    path.setAttribute("data-id", id);
    path.setAttribute("class", `status-${data.status}`);
    
    // Eventler
    path.addEventListener('click', () => selectCity(id));
    path.addEventListener('mouseenter', (e) => showTooltip(e, data.name, data.status));
    path.addEventListener('mousemove', moveTooltip);
    path.addEventListener('mouseleave', hideTooltip);

    svg.appendChild(path);
}

// UI Yardımcıları
const STATUS_LABELS = {
    'safe': 'KONTROLLÜ',
    'active': 'AKTİF REMANANCE',
    'total': 'TAM REMANANCE',
    'unknown': 'VERİ YOK'
};

initDB(); // Başlat