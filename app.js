// ==========================================
// REMANANCE SIMULATION STATE & LOGIC
// ==========================================

const INITIAL_STATE = {
    simulation: { day: 17, phase: "Phase 2: Urban Collapse", lastContact: generateRandomTime() },
    cities: {
        istanbul: { id: 'istanbul', name: "Istanbul", status: "red", population: 14850230, x: 230, y: 140 },
        ankara: { id: 'ankara', name: "Ankara", status: "red", population: 5320400, x: 420, y: 220 },
        izmir: { id: 'izmir', name: "Izmir", status: "orange", population: 4150600, x: 130, y: 300 },
        antalya: { id: 'antalya', name: "Antalya", status: "green", population: 2610000, x: 330, y: 410 },
        trabzon: { id: 'trabzon', name: "Trabzon", status: "green", population: 810000, x: 750, y: 120 }
    },
    districts: {
        istanbul_fatih: { id: 'istanbul_fatih', city: "istanbul", name: "Fatih", status: "green", population: 380400, dx: 5, dy: 5 },
        istanbul_kucukcekmece: { id: 'istanbul_kucukcekmece', city: "istanbul", name: "Küçükçekmece", status: "green", population: 760100, dx: -10, dy: -5 },
        istanbul_kadikoy: { id: 'istanbul_kadikoy', city: "istanbul", name: "Kadıköy", status: "orange", population: 460800, dx: 15, dy: 10 },
        izmir_alsancak: { id: 'izmir_alsancak', city: "izmir", name: "Alsancak", status: "orange", population: 81000, dx: 0, dy: 5 },
        izmir_cesme: { id: 'izmir_cesme', city: "izmir", name: "Çeşme", status: "orange", population: 42000, dx: -20, dy: 15 },
        izmir_bergama: { id: 'izmir_bergama', city: "izmir", name: "Bergama", status: "green", population: 101000, dx: 10, dy: -30 },
        ankara_cankaya: { id: 'ankara_cankaya', city: "ankara", name: "Çankaya", status: "green", population: 910000, dx: 5, dy: 5 },
        ankara_polatli: { id: 'ankara_polatli', city: "ankara", name: "Polatlı", status: "green", population: 122000, dx: -25, dy: 15 }
    },
    news: [
        { id: 1, text: "Contact lost with central Ankara hospitals.", timestamp: "Day 16 - 14:00" },
        { id: 2, text: "Evacuation of Izmir coastline ordered.", timestamp: "Day 17 - 08:30" },
        { id: 3, text: "Anomalous activity detected in Kadıköy.", timestamp: "Day 17 - 11:15" }
    ],
    citizens: {
        "IST-4821": {
            code: "IST-4821", name: "Ahmet", surname: "Yılmaz", age: 34, gender: "M", profession: "Engineer",
            city: "istanbul", district: "istanbul_kadikoy", status: "Missing",
            timeline: ["Late April 2026 - Joined evacuation convoy", "Early May 2026 - Last radio contact", "Exact time unknown"]
        }
    }
};

let state = {};
let activeEntity = null; // { type: 'city'|'district'|'citizen', id: string }

// --- Storage & Utils ---
function initData() {
    const stored = localStorage.getItem('remananceState');
    if (!stored) {
        state = JSON.parse(JSON.stringify(INITIAL_STATE));
        saveData();
    } else {
        state = JSON.parse(stored);
    }
}

function saveData() {
    localStorage.setItem('remananceState', JSON.stringify(state));
}

function generateRandomTime() {
    return `${Math.floor(Math.random() * 12 + 1)} hours ago`;
}

function formatNumber(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Listen for updates from other tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'remananceState') {
        state = JSON.parse(e.newValue);
        if (document.getElementById('observer-app')) renderObserverUI();
        if (document.getElementById('admin-app')) renderAdminUI();
    }
});

// --- OBSERVER APP ---
if (document.getElementById('observer-app')) {
    
    window.onload = () => {
        initData();
        renderObserverUI();
        setInterval(simulationTick, 4000); // 4 seconds = 1 sim tick
        setupObserverEvents();
    };

    function simulationTick() {
        // Decrease population based on status
        const dropRates = { 'green': 0.00005, 'orange': 0.0005, 'red': 0.002, 'black': 0 };
        
        Object.keys(state.cities).forEach(key => {
            const city = state.cities[key];
            if(dropRates[city.status]) {
                city.population -= city.population * dropRates[city.status];
            }
        });

        Object.keys(state.districts).forEach(key => {
            const dist = state.districts[key];
            if(dropRates[dist.status]) {
                dist.population -= dist.population * dropRates[dist.status];
            }
        });

        saveData();
        renderObserverUI();
    }

    function renderObserverUI() {
        document.getElementById('sim-day').textContent = `Outbreak Day ${state.simulation.day}`;
        document.getElementById('sim-phase').textContent = state.simulation.phase;
        document.getElementById('last-contact').textContent = `Last confirmed sync: ${state.simulation.lastContact}`;

        renderMap();
        
        if (activeEntity) {
            renderRightPanel();
        } else {
            document.getElementById('info-display').innerHTML = `<div class="standby-msg">> AWAITING SELECTION...</div>`;
        }
    }

    function renderMap() {
        const nodesGroup = document.getElementById('map-nodes');
        nodesGroup.innerHTML = ''; // Clear

        Object.values(state.cities).forEach(city => {
            const colorMap = { 'green': 'var(--green)', 'orange': 'var(--orange)', 'red': 'var(--red)', 'black': '#333' };
            
            // Draw City Node
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.innerHTML = `
                <circle cx="${city.x}" cy="${city.y}" r="8" fill="${colorMap[city.status]}" class="map-node" data-id="${city.id}"></circle>
                <text x="${city.x + 12}" y="${city.y + 4}" class="node-label">${city.name.toUpperCase()}</text>
            `;
            nodesGroup.appendChild(g);

            // Click event
            g.querySelector('circle').addEventListener('click', () => {
                activeEntity = { type: 'city', id: city.id };
                document.getElementById('citizen-marker').classList.add('hidden');
                renderObserverUI();
            });
        });

        // Citizen Marker placement
        const marker = document.getElementById('citizen-marker');
        if (activeEntity && activeEntity.type === 'citizen') {
            const citizen = state.citizens[activeEntity.id];
            const city = state.cities[citizen.city];
            const dist = state.districts[citizen.district];
            if (city && dist) {
                marker.setAttribute('transform', `translate(${city.x + dist.dx}, ${city.y + dist.dy})`);
                marker.classList.remove('hidden');
            }
        } else {
            marker.classList.add('hidden');
        }
    }

    function renderRightPanel() {
        const panel = document.getElementById('info-display');
        let html = '';

        if (activeEntity.type === 'city') {
            const city = state.cities[activeEntity.id];
            if (!city) return;
            
            html += `
                <div class="panel-header">
                    <h2 class="panel-title">${city.name}</h2>
                    <span class="status-badge bg-${city.status}">${city.status.toUpperCase()}</span>
                </div>
                <div class="data-row">
                    <span class="label">EST. POPULATION:</span>
                    <span class="value">${formatNumber(city.population)}</span>
                </div>
            `;

            // Districts
            const cityDistricts = Object.values(state.districts).filter(d => d.city === city.id);
            if (cityDistricts.length > 0) {
                html += `<div class="district-list"><h3>> MONITORED DISTRICTS</h3>`;
                cityDistricts.forEach(d => {
                    html += `
                        <div class="district-item" data-id="${d.id}" style="border-left-color: var(--${d.status})">
                            <span class="label">${d.name}</span>
                            <span class="value text-${d.status}">${d.status.toUpperCase()}</span>
                        </div>
                    `;
                });
                html += `</div>`;
            }

            // News
            html += `<div class="news-feed"><h3>> REGIONAL LOG</h3>`;
            const recentNews = [...state.news].reverse().slice(0, 5);
            recentNews.forEach(n => {
                html += `<div class="news-item"><span class="news-time">${n.timestamp}</span>${n.text}</div>`;
            });
            html += `</div>`;

            panel.innerHTML = html;

            // Attach district click listeners
            panel.querySelectorAll('.district-item').forEach(el => {
                el.addEventListener('click', (e) => {
                    activeEntity = { type: 'district', id: e.currentTarget.dataset.id };
                    renderObserverUI();
                });
            });
        } 
        else if (activeEntity.type === 'district') {
            const dist = state.districts[activeEntity.id];
            if (!dist) return;
            const city = state.cities[dist.city];

            html += `
                <div class="panel-header">
                    <div style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 5px;">< ${city.name.toUpperCase()} REGION</div>
                    <h2 class="panel-title">${dist.name} ZONE</h2>
                    <span class="status-badge bg-${dist.status}">${dist.status.toUpperCase()}</span>
                </div>
                <div class="data-row">
                    <span class="label">EST. LOCAL POP:</span>
                    <span class="value">${formatNumber(dist.population)}</span>
                </div>
                <div style="margin-top:20px; color: var(--text-main); font-size: 0.85rem;">
                    > NO FURTHER TELEMETRY AVAILABLE FOR THIS SECTOR.
                </div>
                <button class="action-btn" style="margin-top:20px" onclick="activeEntity = {type: 'city', id: '${city.id}'}; renderObserverUI();">< BACK TO CITY</button>
            `;
            panel.innerHTML = html;
        }
        else if (activeEntity.type === 'citizen') {
            const cit = state.citizens[activeEntity.id];
            if (!cit) return;

            const city = state.cities[cit.city];
            const dist = state.districts[cit.district];

            let statusColor = '#fff';
            if (cit.status === 'Alive') statusColor = 'var(--green)';
            if (cit.status === 'Infected') statusColor = 'var(--orange)';
            if (cit.status === 'Dead') statusColor = 'var(--red)';
            if (cit.status === 'Missing') statusColor = 'var(--text-main)';

            html += `
                <div class="panel-header">
                    <div style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 5px;">> FILE REF: ${cit.code}</div>
                    <h2 class="panel-title">${cit.name} ${cit.surname}</h2>
                    <span class="status-badge" style="background: #111; border: 1px solid ${statusColor}; color: ${statusColor}">${cit.status.toUpperCase()}</span>
                </div>
                <div class="data-row"><span class="label">AGE/GENDER:</span><span class="value">${cit.age} / ${cit.gender}</span></div>
                <div class="data-row"><span class="label">PROFESSION:</span><span class="value">${cit.profession}</span></div>
                <div class="data-row"><span class="label">LAST LOC:</span><span class="value">${dist ? dist.name : 'Unknown'}, ${city ? city.name : 'Unknown'}</span></div>
                
                <div class="timeline" style="margin-top: 20px;">
                    <h3>> CHRONOLOGY LOG</h3>
                    ${cit.timeline.map(t => `<div class="timeline-item">${t}</div>`).join('')}
                </div>
            `;
            panel.innerHTML = html;
        }
    }

    function setupObserverEvents() {
        document.getElementById('btn-search').addEventListener('click', () => {
            const val = document.getElementById('citizen-search').value.trim().toUpperCase();
            const err = document.getElementById('search-error');
            if (!val) return;

            if (state.citizens[val]) {
                err.textContent = '';
                activeEntity = { type: 'citizen', id: val };
                renderObserverUI();
            } else {
                err.textContent = "ERR: RECORD NOT FOUND";
            }
        });
    }
}

// --- ADMIN APP ---
if (document.getElementById('admin-app')) {
    
    window.onload = () => {
        initData();
        renderAdminUI();
        setupAdminEvents();
    };

    function renderAdminUI() {
        // Populate City Selects
        const citySelect = document.getElementById('admin-city-select');
        const distCitySelect = document.getElementById('admin-dist-city-select');
        const citCitySelect = document.getElementById('cit-city');
        
        [citySelect, distCitySelect, citCitySelect].forEach(sel => {
            const currentVal = sel.value;
            sel.innerHTML = `<option value="">Select City...</option>` + 
                Object.values(state.cities).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            sel.value = currentVal;
        });

        renderNewsList();
        renderCitizenList();
    }

    function setupAdminEvents() {
        // CITY MANAGEMENT
        const cSelect = document.getElementById('admin-city-select');
        const cControls = document.getElementById('city-controls');
        cSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                document.getElementById('city-status').value = state.cities[val].status;
                document.getElementById('city-pop').value = Math.floor(state.cities[val].population);
                cControls.style.display = 'block';
            } else {
                cControls.style.display = 'none';
            }
        });

        document.getElementById('btn-update-city').addEventListener('click', () => {
            const id = cSelect.value;
            state.cities[id].status = document.getElementById('city-status').value;
            state.cities[id].population = parseFloat(document.getElementById('city-pop').value);
            saveData();
            alert('City Updated.');
        });

        // DISTRICT MANAGEMENT
        const dcSelect = document.getElementById('admin-dist-city-select');
        const dSelect = document.getElementById('admin-district-select');
        const dControls = document.getElementById('district-controls');

        dcSelect.addEventListener('change', (e) => {
            const cityId = e.target.value;
            dSelect.innerHTML = `<option value="">Select District...</option>`;
            dControls.style.display = 'none';
            if (cityId) {
                const dists = Object.values(state.districts).filter(d => d.city === cityId);
                dSelect.innerHTML += dists.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
            }
        });

        dSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                document.getElementById('district-status').value = state.districts[val].status;
                document.getElementById('district-pop').value = Math.floor(state.districts[val].population);
                dControls.style.display = 'block';
            } else {
                dControls.style.display = 'none';
            }
        });

        document.getElementById('btn-update-district').addEventListener('click', () => {
            const id = dSelect.value;
            state.districts[id].status = document.getElementById('district-status').value;
            state.districts[id].population = parseFloat(document.getElementById('district-pop').value);
            saveData();
            alert('District Updated.');
        });

        // NEWS MANAGEMENT
        document.getElementById('btn-add-news').addEventListener('click', () => {
            const text = document.getElementById('new-news-text').value.trim();
            if(!text) return;
            const newId = state.news.length > 0 ? state.news[state.news.length-1].id + 1 : 1;
            state.news.push({ id: newId, text, timestamp: `Day ${state.simulation.day} - System Time` });
            document.getElementById('new-news-text').value = '';
            saveData();
            renderNewsList();
        });

        // CITIZEN MANAGEMENT
        document.getElementById('cit-city').addEventListener('change', (e) => {
            const cityId = e.target.value;
            const distSel = document.getElementById('cit-district');
            const dists = Object.values(state.districts).filter(d => d.city === cityId);
            distSel.innerHTML = dists.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        });

        document.getElementById('btn-add-citizen').addEventListener('click', () => {
            const name = document.getElementById('cit-name').value;
            const surname = document.getElementById('cit-surname').value;
            const age = document.getElementById('cit-age').value;
            const city = document.getElementById('cit-city').value;
            const district = document.getElementById('cit-district').value;
            
            if (!name || !surname || !city || !district) return alert("Fill required fields.");

            const prefix = city.substring(0,3).toUpperCase();
            const rNum = Math.floor(1000 + Math.random() * 9000);
            const code = `${prefix}-${rNum}`;

            const tlRaw = document.getElementById('cit-timeline').value;
            const timeline = tlRaw.split('\n').filter(t => t.trim() !== '');

            state.citizens[code] = {
                code, name, surname, age,
                gender: document.getElementById('cit-gender').value,
                profession: document.getElementById('cit-profession').value,
                status: document.getElementById('cit-status').value,
                city, district,
                timeline: timeline.length ? timeline : ["Record created."]
            };

            saveData();
            renderCitizenList();
            
            // clear form
            document.querySelectorAll('.citizen-form input, .citizen-form textarea').forEach(el => el.value='');
            alert(`Citizen Generated: ${code}`);
        });
    }

    function renderNewsList() {
        const ul = document.getElementById('admin-news-list');
        ul.innerHTML = '';
        state.news.forEach((n, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>[${n.timestamp}] ${n.text}</span> <button class="del-btn" onclick="deleteNews(${idx})">DEL</button>`;
            ul.appendChild(li);
        });
    }

    window.deleteNews = function(idx) {
        state.news.splice(idx, 1);
        saveData();
        renderNewsList();
    };

    function renderCitizenList() {
        const ul = document.getElementById('admin-citizen-list');
        ul.innerHTML = '';
        Object.values(state.citizens).forEach(c => {
            const li = document.createElement('li');
            li.innerHTML = `<span><strong>${c.code}</strong> | ${c.name} ${c.surname} - ${c.status}</span> <button class="del-btn" onclick="deleteCitizen('${c.code}')">DEL</button>`;
            ul.appendChild(li);
        });
    }

    window.deleteCitizen = function(code) {
        if(confirm(`Delete ${code}?`)){
            delete state.citizens[code];
            saveData();
            renderCitizenList();
        }
    }
}
