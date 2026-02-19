/**
 * REMANANCE SIMULATION ENGINE
 * Handles data synchronization, UI rendering, and the simulation loop.
 */

const STORAGE_KEY = 'remanance_simulation_data';

// Base map coordinates for generating the SVG
const MAP_COORDS = {
    "Istanbul": { x: 250, y: 120 },
    "Ankara": { x: 400, y: 200 },
    "Izmir": { x: 150, y: 250 },
    "Bursa": { x: 280, y: 160 },
    "Antalya": { x: 320, y: 350 },
    "Adana": { x: 550, y: 320 },
    "Trabzon": { x: 650, y: 100 },
    "Diyarbakir": { x: 700, y: 280 }
};

// Initial state builder
function getDefaultData() {
    return {
        day: 17,
        phase: "Phase 2: Urban Collapse",
        cities: {
            "Istanbul": { status: "RED", population: 15460000, districts: {
                "Fatih": { status: "GREEN", population: 396000 },
                "Küçükçekmece": { status: "GREEN", population: 805000 },
                "Kadıköy": { status: "ORANGE", population: 483000 }
            }},
            "Ankara": { status: "RED", population: 5660000, districts: {
                "Çankaya": { status: "GREEN", population: 925000 },
                "Polatlı": { status: "GREEN", population: 125000 }
            }},
            "Izmir": { status: "ORANGE", population: 4367000, districts: {
                "Alsancak": { status: "ORANGE", population: 85000 },
                "Çeşme": { status: "ORANGE", population: 46000 },
                "Bergama": { status: "GREEN", population: 104000 }
            }},
            "Bursa": { status: "GREEN", population: 3100000, districts: {} },
            "Antalya": { status: "GREEN", population: 2548000, districts: {} },
            "Adana": { status: "GREEN", population: 2200000, districts: {} },
            "Trabzon": { status: "GREEN", population: 810000, districts: {} },
            "Diyarbakir": { status: "GREEN", population: 1780000, districts: {} }
        },
        news: [
            "14:00 - Communication lost with central Ankara.",
            "11:30 - Military quarantine established around Izmir outer perimeter.",
            "09:15 - Subject sightings reported in Kadıköy district."
        ],
        citizens: [
            { 
                code: "IST-4821", name: "Ahmet", surname: "Yılmaz", age: 34, 
                gender: "Male", profession: "Engineer", city: "Istanbul", 
                district: "Kadıköy", status: "Missing", 
                timeline: ["Late April 2026 – Joined evacuation convoy", "Early May 2026 – Last radio contact"] 
            },
            {
                code: "ANK-7394", name: "Ayşe", surname: "Kaya", age: 28,
                gender: "Female", profession: "Medical Staff", city: "Ankara",
                district: "Çankaya", status: "Alive",
                timeline: ["Day 5 - Assigned to Çankaya Field Hospital", "Day 16 - Shift extended indefinitely"]
            }
        ]
    };
}

// Data Management
function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const defaultData = getDefaultData();
        saveData(defaultData);
        return defaultData;
    }
    return JSON.parse(raw);
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let simData = loadData();

// Format numbers
const formatPop = (num) => Math.floor(num).toLocaleString('en-US');

// ==========================================
// MONITOR VIEW LOGIC (index.html)
// ==========================================
if (document.getElementById('monitor-view')) {
    
    let activeSelection = { type: null, city: null, district: null };
    let searchedCitizen = null;

    function initMonitor() {
        renderHeader();
        renderMap();
        renderNews();
        startSimulationTick();

        // Listen for storage changes from admin panel
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) {
                simData = JSON.parse(e.newValue);
                updateMonitorUI();
            }
        });

        document.getElementById('btn-search-citizen').addEventListener('click', handleSearch);
        document.getElementById('citizen-code-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    function renderHeader() {
        document.getElementById('sim-day').innerText = `OUTBREAK DAY ${simData.day}`;
        document.getElementById('sim-phase').innerText = simData.phase.toUpperCase();
    }

    function renderMap() {
        const container = document.getElementById('map-container');
        let svgHTML = `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">`;
        
        // Faint connection lines to look like a network
        svgHTML += `<path d="M250,120 L400,200 L700,280 M400,200 L320,350 M250,120 L150,250 M400,200 L650,100" stroke="#222" stroke-width="2" fill="none"/>`;

        // Render cities
        for (const [cityName, cityData] of Object.entries(simData.cities)) {
            const coords = MAP_COORDS[cityName] || { x: 0, y: 0 };
            const colorClass = cityData.status.toLowerCase();
            
            svgHTML += `
                <circle cx="${coords.x}" cy="${coords.y}" r="8" class="city-node ${colorClass}" 
                        onclick="window.selectCity('${cityName}')" />
                <circle cx="${coords.x}" cy="${coords.y}" r="12" fill="none" stroke="currentColor" 
                        class="city-node ${colorClass}" opacity="0.3" pointer-events="none" />
                <text x="${coords.x + 15}" y="${coords.y + 4}" class="city-label">${cityName.toUpperCase()}</text>
            `;
        }

        // Render Citizen Marker if active
        if (searchedCitizen) {
            const cCity = MAP_COORDS[searchedCitizen.city];
            if (cCity) {
                // Offset slightly to simulate district positioning
                const ox = cCity.x - 10;
                const oy = cCity.y - 10;
                svgHTML += `
                    <circle cx="${ox}" cy="${oy}" r="4" fill="#fff" />
                    <circle cx="${ox}" cy="${oy}" r="10" fill="none" stroke="#fff" class="citizen-marker" />
                    <text x="${ox - 10}" y="${oy - 15}" class="city-label" fill="#fff" style="font-size:10px;">TARGET: ${searchedCitizen.code}</text>
                `;
            }
        }

        svgHTML += `</svg>`;
        container.innerHTML = svgHTML;
    }

    window.selectCity = function(cityName) {
        activeSelection = { type: 'city', city: cityName, district: null };
        searchedCitizen = null; // Clear citizen search visually
        renderRightPanel();
    };

    window.selectDistrict = function(cityName, districtName) {
        activeSelection = { type: 'district', city: cityName, district: districtName };
        renderRightPanel();
    };

    function renderRightPanel() {
        const panel = document.getElementById('details-panel');
        
        if (searchedCitizen) {
            // Display Citizen Data
            let timelineHTML = searchedCitizen.timeline.map(t => `<li>- ${t}</li>`).join('');
            panel.innerHTML = `
                <div class="data-row">
                    <div class="data-label">SUBJECT IDENTIFICATION</div>
                    <div class="data-value">${searchedCitizen.code}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">NAME</div>
                    <div class="data-value">${searchedCitizen.name.toUpperCase()} ${searchedCitizen.surname.toUpperCase()}</div>
                </div>
                <div class="grid-layout" style="padding:0; height:auto; gap:10px; border:none;">
                    <div>
                        <div class="data-label">AGE</div>
                        <div class="data-value">${searchedCitizen.age}</div>
                    </div>
                    <div>
                        <div class="data-label">GENDER</div>
                        <div class="data-value">${searchedCitizen.gender.toUpperCase()}</div>
                    </div>
                </div>
                <div class="data-row mt-20">
                    <div class="data-label">LAST KNOWN LOCATION</div>
                    <div class="data-value">${searchedCitizen.district.toUpperCase()}, ${searchedCitizen.city.toUpperCase()}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">CURRENT STATUS</div>
                    <div class="data-value status-${searchedCitizen.status}">${searchedCitizen.status.toUpperCase()}</div>
                </div>
                <div class="data-row mt-20" style="border:none;">
                    <div class="data-label">CHRONOLOGICAL LOG</div>
                    <ul class="district-list" style="color:#aaa; font-size:12px;">${timelineHTML}</ul>
                </div>
            `;
            return;
        }

        if (activeSelection.type === 'city') {
            const city = simData.cities[activeSelection.city];
            let districtsHTML = '';
            
            if (Object.keys(city.districts).length > 0) {
                districtsHTML = `<div class="data-label mt-20">SUB-REGIONS (DISTRICTS)</div><ul class="district-list">`;
                for (const [dName, dData] of Object.entries(city.districts)) {
                    districtsHTML += `
                        <li class="district-item" onclick="window.selectDistrict('${activeSelection.city}', '${dName}')">
                            <span>${dName.toUpperCase()}</span>
                            <span class="${dData.status.toLowerCase()}">${dData.status}</span>
                        </li>`;
                }
                districtsHTML += `</ul>`;
            }

            panel.innerHTML = `
                <div class="data-row">
                    <div class="data-label">REGION DESIGNATION</div>
                    <div class="data-value">${activeSelection.city.toUpperCase()}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">CONTAINMENT STATUS</div>
                    <div class="data-value ${city.status.toLowerCase()}">${city.status}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">ESTIMATED SURVIVING POPULATION</div>
                    <div class="data-value">${formatPop(city.population)}</div>
                </div>
                ${districtsHTML}
            `;
        } else if (activeSelection.type === 'district') {
            const district = simData.cities[activeSelection.city].districts[activeSelection.district];
            panel.innerHTML = `
                <button onclick="window.selectCity('${activeSelection.city}')" style="margin-bottom:15px; font-size:10px;">&larr; BACK TO CITY</button>
                <div class="data-row">
                    <div class="data-label">SUB-REGION DESIGNATION</div>
                    <div class="data-value">${activeSelection.district.toUpperCase()}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">PARENT REGION</div>
                    <div class="data-value">${activeSelection.city.toUpperCase()}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">CONTAINMENT STATUS</div>
                    <div class="data-value ${district.status.toLowerCase()}">${district.status}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">ESTIMATED POPULATION</div>
                    <div class="data-value">${formatPop(district.population)}</div>
                </div>
            `;
        } else {
            panel.innerHTML = '<div class="idle-text">SELECT A REGION OR QUERY CITIZEN CODE TO VIEW DATA.</div>';
        }
    }

    function renderNews() {
        const container = document.getElementById('news-feed');
        container.innerHTML = simData.news.map(n => `<div class="news-item">> ${n}</div>`).join('');
    }

    function handleSearch() {
        const input = document.getElementById('citizen-code-input').value.trim().toUpperCase();
        const feedback = document.getElementById('search-feedback');
        
        if (!input) return;

        const citizen = simData.citizens.find(c => c.code === input);
        if (citizen) {
            searchedCitizen = citizen;
            activeSelection = { type: null, city: null, district: null }; // Override region selection
            feedback.innerText = "SUBJECT FOUND.";
            feedback.style.color = "var(--color-green)";
            renderRightPanel();
            renderMap(); // update marker
        } else {
            feedback.innerText = "RECORD NOT FOUND OR CLASSIFIED.";
            feedback.style.color = "var(--color-red)";
        }
    }

    function updateMonitorUI() {
        renderHeader();
        renderMap();
        renderRightPanel();
        renderNews();
    }

    // Population Decrease Simulation Loop
    function startSimulationTick() {
        setInterval(() => {
            let dataChanged = false;
            for (const cKey in simData.cities) {
                const city = simData.cities[cKey];
                let decreaseRate = getRate(city.status);
                
                if (city.population > 0) {
                    city.population -= city.population * decreaseRate;
                    if(city.population < 0) city.population = 0;
                    dataChanged = true;
                }

                for (const dKey in city.districts) {
                    const district = city.districts[dKey];
                    let dRate = getRate(district.status);
                    if (district.population > 0) {
                        district.population -= district.population * dRate;
                        if(district.population < 0) district.population = 0;
                    }
                }
            }

            if (dataChanged) {
                saveData(simData);
                // Only update specific panel parts so we don't disrupt user clicks constantly
                if (activeSelection.type) renderRightPanel(); 
            }
        }, 5000); // Ticks every 5 seconds
    }

    function getRate(status) {
        switch(status) {
            case 'RED': return 0.0005;   // Faster drop
            case 'ORANGE': return 0.0001; // Moderate drop
            case 'GREEN': return 0.00001; // Slow drop
            case 'BLACK': return 0.001;   // Unknown/massive drop
            default: return 0;
        }
    }

    initMonitor();
}

// ==========================================
// ADMIN VIEW LOGIC (admin.html)
// ==========================================
if (document.getElementById('admin-view')) {

    function initAdmin() {
        populateSelects();
        renderAdminNews();
        renderAdminCitizens();

        document.getElementById('admin-city-select').addEventListener('change', populateAdminDistricts);
        document.getElementById('btn-update-region').addEventListener('click', updateRegion);
        document.getElementById('btn-add-news').addEventListener('click', addNews);
        document.getElementById('btn-add-citizen').addEventListener('click', addCitizen);
        document.getElementById('btn-reset-sim').addEventListener('click', () => {
            if(confirm("Wipe all data and reset simulation?")) {
                saveData(getDefaultData());
                location.reload();
            }
        });
        
        // Auto-update form values when city/district is selected
        document.getElementById('admin-city-select').addEventListener('change', fillPopStatus);
        document.getElementById('admin-district-select').addEventListener('change', fillPopStatus);

        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) simData = JSON.parse(e.newValue);
        });
        
        // Initial populate
        fillPopStatus();
    }

    function populateSelects() {
        const citySelect = document.getElementById('admin-city-select');
        const cCitySelect = document.getElementById('c-city');
        
        citySelect.innerHTML = ''; cCitySelect.innerHTML = '';
        
        for (const city in simData.cities) {
            const opt = `<option value="${city}">${city}</option>`;
            citySelect.innerHTML += opt;
            cCitySelect.innerHTML += opt;
        }
        populateAdminDistricts();
        populateCitizenDistricts();
        
        cCitySelect.addEventListener('change', populateCitizenDistricts);
    }

    function populateAdminDistricts() {
        const city = document.getElementById('admin-city-select').value;
        const distSelect = document.getElementById('admin-district-select');
        distSelect.innerHTML = '<option value="">-- Apply to Entire City --</option>';
        
        if (city && simData.cities[city].districts) {
            for (const dist in simData.cities[city].districts) {
                distSelect.innerHTML += `<option value="${dist}">${dist}</option>`;
            }
        }
    }

    function populateCitizenDistricts() {
        const city = document.getElementById('c-city').value;
        const distSelect = document.getElementById('c-district');
        distSelect.innerHTML = '<option value="">N/A</option>';
        
        if (city && simData.cities[city].districts) {
            for (const dist in simData.cities[city].districts) {
                distSelect.innerHTML += `<option value="${dist}">${dist}</option>`;
            }
        }
    }

    function fillPopStatus() {
        const city = document.getElementById('admin-city-select').value;
        const dist = document.getElementById('admin-district-select').value;
        const popInput = document.getElementById('admin-pop-input');
        const statusSelect = document.getElementById('admin-status-select');

        if (!city) return;

        if (dist && dist !== "") {
            popInput.value = Math.floor(simData.cities[city].districts[dist].population);
            statusSelect.value = simData.cities[city].districts[dist].status;
        } else {
            popInput.value = Math.floor(simData.cities[city].population);
            statusSelect.value = simData.cities[city].status;
        }
    }

    function updateRegion() {
        const city = document.getElementById('admin-city-select').value;
        const dist = document.getElementById('admin-district-select').value;
        const status = document.getElementById('admin-status-select').value;
        const pop = parseInt(document.getElementById('admin-pop-input').value);

        if (dist && dist !== "") {
            simData.cities[city].districts[dist].status = status;
            simData.cities[city].districts[dist].population = pop;
        } else {
            simData.cities[city].status = status;
            simData.cities[city].population = pop;
        }
        
        saveData(simData);
        alert('System data updated successfully.');
    }

    function renderAdminNews() {
        const list = document.getElementById('admin-news-list');
        list.innerHTML = simData.news.map((n, i) => `
            <li>
                <span>${n}</span>
                <button class="btn-danger" onclick="window.deleteNews(${i})">DEL</button>
            </li>
        `).join('');
    }

    function addNews() {
        const input = document.getElementById('admin-news-input');
        if (input.value.trim() === '') return;
        
        simData.news.unshift(input.value.trim());
        if (simData.news.length > 10) simData.news.pop(); // Keep array small
        
        saveData(simData);
        input.value = '';
        renderAdminNews();
    }

    window.deleteNews = function(index) {
        simData.news.splice(index, 1);
        saveData(simData);
        renderAdminNews();
    }

    function renderAdminCitizens() {
        const tbody = document.querySelector('#admin-citizen-table tbody');
        tbody.innerHTML = simData.citizens.map((c, i) => `
            <tr>
                <td><strong>${c.code}</strong></td>
                <td>${c.name} ${c.surname}</td>
                <td>${c.city} ${c.district !== 'N/A' ? `(${c.district})` : ''}</td>
                <td class="status-${c.status}">${c.status}</td>
                <td>
                    <button class="btn-danger" onclick="window.deleteCitizen(${i})">DEL</button>
                </td>
            </tr>
        `).join('');
    }

    function addCitizen() {
        const name = document.getElementById('c-name').value.trim();
        const surname = document.getElementById('c-surname').value.trim();
        const age = document.getElementById('c-age').value;
        const gender = document.getElementById('c-gender').value;
        const profession = document.getElementById('c-profession').value;
        const city = document.getElementById('c-city').value;
        const district = document.getElementById('c-district').value || "N/A";
        const status = document.getElementById('c-status').value;
        const timelineRaw = document.getElementById('c-timeline').value;

        if(!name || !surname || !age) {
            alert("Name, Surname, and Age are required fields.");
            return;
        }

        // Generate Code: FIRST 3 LETTERS OF CITY + "-" + 4 RANDOM DIGITS
        const prefix = city.substring(0,3).toUpperCase();
        const num = Math.floor(1000 + Math.random() * 9000);
        const code = `${prefix}-${num}`;

        const timeline = timelineRaw.split(',').map(item => item.trim()).filter(item => item !== "");

        simData.citizens.push({
            code, name, surname, age, gender, profession, city, district, status, timeline
        });

        saveData(simData);
        renderAdminCitizens();
        
        // Reset basic fields
        document.getElementById('c-name').value = '';
        document.getElementById('c-surname').value = '';
        document.getElementById('c-timeline').value = '';
        
        alert(`Citizen Generated. Code: ${code}`);
    }

    window.deleteCitizen = function(index) {
        if(confirm("Delete this citizen record permanently?")) {
            simData.citizens.splice(index, 1);
            saveData(simData);
            renderAdminCitizens();
        }
    }

    initAdmin();
}