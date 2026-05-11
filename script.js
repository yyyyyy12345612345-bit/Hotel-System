// ========== SUPREME 3D VISUAL ENGINE & DASHBOARD LOGIC ==========
let hotels = [];
let guests = [];
let starSpeed = 0.5;
let currentDeleteTarget = null;

// --- 3D ENVIRONMENT ---
let scene, camera, renderer, starField, planetCore, rings;

function init3D() {
    try {
        const canvas = document.getElementById('canvas-3d');
        if(!canvas) return;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // --- CYBER CORE ---
        const coreGeo = new THREE.IcosahedronGeometry(45, 1);
        const coreMat = new THREE.MeshPhongMaterial({ 
            color: 0x00d2ff, wireframe: true, transparent: true, opacity: 0.8,
            emissive: 0x00d2ff, emissiveIntensity: 1.0
        });
        planetCore = new THREE.Mesh(coreGeo, coreMat);
        scene.add(planetCore);

        // Data Rings
        const ringGeo = new THREE.TorusGeometry(80, 0.6, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff00c8, transparent: true, opacity: 0.6, wireframe: true });
        rings = new THREE.Mesh(ringGeo, ringMat);
        rings.rotation.x = Math.PI / 2.2;
        scene.add(rings);

        // --- BRIGHT STAR CLOUD ---
        const starGeo = new THREE.BufferGeometry();
        const starCount = 2500; 
        const pos = new Float32Array(starCount * 3);
        for(let i=0; i<starCount; i++) {
            pos[i*3] = (Math.random()-0.5) * 3000;
            pos[i*3+1] = (Math.random()-0.5) * 3000;
            pos[i*3+2] = (Math.random()-0.5) * 4000;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const starMat = new THREE.PointsMaterial({ size: 2.2, color: 0xffffff, transparent: true, opacity: 1 });
        starField = new THREE.Points(starGeo, starMat);
        scene.add(starField);

        // ULTRA LIGHTING
        const lightA = new THREE.PointLight(0x00d2ff, 25, 1000);
        lightA.position.set(0, 0, 200);
        scene.add(lightA);
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));

        camera.position.z = 450;

        function animate() {
            requestAnimationFrame(animate);
            if(planetCore) planetCore.rotation.y += 0.006;
            if(rings) rings.rotation.z -= 0.012;

            const p = starField.geometry.attributes.position.array;
            for(let i=0; i<starCount; i++) {
                p[i*3+2] += starSpeed * 12;
                if(p[i*3+2] > 500) p[i*3+2] = -3500;
            }
            starField.geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        }
        animate();
    } catch(e) { console.error("3D Space Engine Failure", e); }
}

// --- LOGIN LOGIC ---
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    // Credentials provided by USER
    if (email === "Youssefosama@gmail.com" && pass === "01020451206") {
        gsap.to('#login-screen', { opacity: 0, duration: 0.5, onComplete: () => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('intro').style.display = 'flex';
            startBootSequence();
        }});
    } else {
        errorDiv.textContent = "Invalid credentials. Access Denied.";
        gsap.fromTo('.login-card', { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
    }
}

// --- BOOT & INTRO SEQUENCES ---
function startBootSequence() {
    const tl = gsap.timeline();
    tl.to('#loader-bar', { width: "100%", duration: 0.8, ease: "power4.inOut" })
      .to('#boot-loader', { opacity: 0, scale: 0.5, duration: 0.5 })
      .set('.intro-panel', { display: 'flex' })
      .fromTo('.intro-panel', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" })
      .call(() => {
          starSpeed = 8;
          gsap.to({v: 8}, {v: 0.5, duration: 1.5, onUpdate: function() { starSpeed = this.targets()[0].v; } });
      })
      .to('.enter-btn', { opacity: 1, scale: 1, duration: 0.4 }, "-=0.2");
}

function dismissIntro() {
    gsap.to(camera.position, { z: -100, duration: 0.6, ease: "power4.in" });
    gsap.to('#intro', { opacity: 0, duration: 0.4, onComplete: () => document.getElementById('intro').remove() });
    gsap.to('.app-container', { opacity: 1, duration: 0.8, delay: 0.1 });
}

// Global Start
document.addEventListener('DOMContentLoaded', () => {
    init3D();
    
    // Listen for Enter key on login
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') {
            handleLogin();
        }
    });

    // Initialize data engine
    if (window.firebaseReady) {
        console.log("🔥 Firebase already ready, initializing data engine...");
        initSystem();
    } else {
        window.addEventListener('firebase-ready', () => {
            console.log("🔥 Firebase ready event received, initializing data engine...");
            initSystem();
        });
    }
    
    setInterval(() => {
        const c = document.getElementById('side-clock');
        if(c) c.textContent = new Date().toLocaleTimeString();
    }, 1000);
    
    window.addEventListener('resize', () => {
        if(camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });
});

// ========== DATA MANAGEMENT ENGINE (CRUD) ==========

function initSystem() {
    if (!window.db || !window.firebaseMethods) return;
    const { onSnapshot, collection } = window.firebaseMethods;
    const db = window.db;

    // Listen for Hotels (real-time sync)
    onSnapshot(collection(db, "hotels"), (snapshot) => {
        hotels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderHotelsTable();
        renderRoomsTable();
        updateStats();
        updateSelects();
        console.log("✅ Hotels synced:", hotels.length);
    });

    // Listen for Guests (real-time sync)
    onSnapshot(collection(db, "guests"), (snapshot) => {
        guests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderGuestsTable();
        updateStats();
        console.log("✅ Guests synced:", guests.length);
    });
}

// --- HOTEL ACTIONS ---
async function addHotel() {
    const name = document.getElementById('h-name').value;
    const loc = document.getElementById('h-loc').value;
    const editId = document.getElementById('h-edit-id').value;

    if(!name || !loc) return toast("Fields cannot be empty!", "error");

    const { addDoc, updateDoc, doc, collection } = window.firebaseMethods;
    try {
        if (editId) {
            await updateDoc(doc(window.db, "hotels", editId), { name, location: loc });
            toast("Hotel updated successfully.");
            cancelHotelEdit();
        } else {
            await addDoc(collection(window.db, "hotels"), { name, location: loc, rooms: [] });
            toast(`Hotel '${name}' deployed.`);
        }
        clearInputs(['h-name', 'h-loc']);
    } catch(e) { toast("Firebase Error: " + e.message, "error"); }
}

function editHotel(id) {
    const hotel = hotels.find(h => h.id === id);
    if(!hotel) return;
    
    document.getElementById('h-name').value = hotel.name;
    document.getElementById('h-loc').value = hotel.location;
    document.getElementById('h-edit-id').value = id;
    
    const form = document.getElementById('hotel-form');
    form.classList.add('editing');
    document.getElementById('hotel-form-title').textContent = "📝 Edit Hotel";
    document.getElementById('hotel-submit-btn').textContent = "UPDATE";
    document.getElementById('hotel-cancel-btn').style.display = "inline-block";
    
    gsap.from(form, { backgroundColor: "rgba(255, 179, 0, 0.1)", duration: 0.5 });
}

function cancelHotelEdit() {
    document.getElementById('h-edit-id').value = "";
    document.getElementById('hotel-form').classList.remove('editing');
    document.getElementById('hotel-form-title').textContent = "➕ Add New Hotel";
    document.getElementById('hotel-submit-btn').textContent = "ADD";
    document.getElementById('hotel-cancel-btn').style.display = "none";
    clearInputs(['h-name', 'h-loc']);
}

// --- ROOM ACTIONS ---
async function addRoom() {
    const hIdx = document.getElementById('r-hotel').value;
    const num = parseInt(document.getElementById('r-num').value);
    const floor = parseInt(document.getElementById('r-floor').value);
    const view = document.getElementById('r-view').value;
    const price = parseFloat(document.getElementById('r-price').value);
    const avail = document.getElementById('r-avail').value === "true";

    if(isNaN(num) || isNaN(price)) return toast("Invalid numerical data!", "error");
    if(!hotels[hIdx]) return toast("Select a hotel!", "error");

    const { updateDoc, doc } = window.firebaseMethods;
    const hotel = hotels[hIdx];
    const newRooms = [...(hotel.rooms || []), { number: num, floor, view, price, available: avail }];

    try {
        await updateDoc(doc(window.db, "hotels", hotel.id), { rooms: newRooms });
        toast(`Room ${num} initialized in ${hotel.name}.`);
        clearInputs(['r-num', 'r-floor', 'r-view', 'r-price']);
    } catch(e) { toast("Firebase Error: " + e.message, "error"); }
}

// --- GUEST ACTIONS ---
async function addGuest() {
    const num = parseInt(document.getElementById('g-num').value);
    const name = document.getElementById('g-name').value;
    const phone = document.getElementById('g-phone').value;
    const ssd = document.getElementById('g-ssd').value;

    if(!num || !name) return toast("Missing guest identity!", "error");

    const { addDoc, collection } = window.firebaseMethods;
    try {
        await addDoc(collection(window.db, "guests"), { number: num, name, phone, ssd });
        toast(`Guest '${name}' registered.`);
        clearInputs(['g-num', 'g-name', 'g-phone', 'g-ssd']);
    } catch(e) { toast("Firebase Error: " + e.message, "error"); }
}

// --- DELETE OPERATIONS ---
function openDeleteModal(type, id, extra = null) {
    currentDeleteTarget = { type, id, extra };
    const modal = document.getElementById('delete-modal');
    const msg = document.getElementById('delete-modal-msg');
    
    if (type === 'hotel') msg.textContent = "Are you sure you want to delete this hotel and all its data?";
    else if (type === 'room') msg.textContent = "Remove this room from the hotel records?";
    else if (type === 'guest') msg.textContent = "Delete this guest registration permanently?";
    
    modal.classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
    currentDeleteTarget = null;
}

async function confirmDelete() {
    if (!currentDeleteTarget) return;
    const { type, id, extra } = currentDeleteTarget;
    const { deleteDoc, doc, updateDoc } = window.firebaseMethods;

    try {
        if (type === 'hotel') {
            await deleteDoc(doc(window.db, "hotels", id));
            toast("Hotel deleted successfully.");
        } else if (type === 'guest') {
            await deleteDoc(doc(window.db, "guests", id));
            toast("Guest record removed.");
        } else if (type === 'room') {
            const hotel = hotels.find(h => h.id === id);
            const updatedRooms = hotel.rooms.filter((_, idx) => idx !== extra);
            await updateDoc(doc(window.db, "hotels", id), { rooms: updatedRooms });
            toast("Room removed from hotel.");
        }
    } catch(e) { toast("Delete failed: " + e.message, "error"); }
    closeDeleteModal();
}

// --- RENDER TABLES ---
function renderHotelsTable() {
    const tbody = document.getElementById('hotels-tbody');
    if (hotels.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hotels found. Add your first hotel above.</td></tr>';
        return;
    }
    tbody.innerHTML = hotels.map((h, i) => `
        <tr>
            <td>${i+1}</td>
            <td><strong>${h.name}</strong></td>
            <td>${h.location}</td>
            <td><span class="badge badge-online">${h.rooms ? h.rooms.length : 0} Rooms</span></td>
            <td>
                <div class="row-actions">
                    <button class="action-btn edit-btn" onclick="editHotel('${h.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="openDeleteModal('hotel', '${h.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function renderRoomsTable() {
    const tbody = document.getElementById('rooms-tbody');
    if (!tbody) return;
    
    let allRooms = [];
    hotels.forEach(h => {
        if(h.rooms && Array.isArray(h.rooms)) {
            h.rooms.forEach((r, idx) => {
                allRooms.push({ ...r, hotelName: h.name, hotelId: h.id, roomIdx: idx });
            });
        }
    });

    if (allRooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No rooms found. Add rooms to hotels first.</td></tr>';
        return;
    }

    tbody.innerHTML = allRooms.map((r, i) => `
        <tr style="animation: slideUp 0.3s ease forwards; animation-delay: ${i * 0.05}s;">
            <td>${i+1}</td>
            <td style="color:var(--accent)">${r.hotelName}</td>
            <td><strong>#${r.number || 'N/A'}</strong></td>
            <td>Floor ${r.floor || '0'}</td>
            <td>${r.view || 'Standard'}</td>
            <td style="color:var(--success)">$${r.price || '0'}</td>
            <td><span class="status-badge ${r.available ? 'status-available' : 'status-occupied'}">${r.available ? 'Available' : 'Occupied'}</span></td>
            <td>
                <button class="action-btn delete-btn" onclick="openDeleteModal('room', '${r.hotelId}', ${r.roomIdx})">Remove</button>
            </td>
        </tr>
    `).join("");
}

function renderGuestsTable() {
    const tbody = document.getElementById('guests-tbody');
    if (guests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No guests registered yet.</td></tr>';
        return;
    }
    tbody.innerHTML = guests.map((g, i) => `
        <tr>
            <td>${i+1}</td>
            <td>#${g.number}</td>
            <td><strong>${g.name}</strong></td>
            <td>${g.phone}</td>
            <td>${g.ssd}</td>
            <td>
                <button class="action-btn delete-btn" onclick="openDeleteModal('guest', '${g.id}')">Delete</button>
            </td>
        </tr>
    `).join("");
}

// --- ALGORITHMS ---
function runSort(type, algo) {
    const start = performance.now();
    let data = [];
    let boxId = "";

    if(type === 'hotels') {
        data = [...hotels];
        boxId = "hotels-sort-box";
        if(algo === 1) bubbleSort(data, 'name');
        else if(algo === 2) insertionSort(data, 'name');
        else selectionSort(data, 'name');
    } else if(type === 'guests') {
        data = [...guests];
        boxId = "guests-sort-box";
        if(algo === 1) bubbleSort(data, 'number');
        else if(algo === 2) insertionSort(data, 'number');
        else selectionSort(data, 'number');
    }

    const end = performance.now();
    const time = (end - start).toFixed(4);
    const algoName = ["Bubble", "Insertion", "Selection"][algo-1];
    
    let html = `<strong style="color:#fff">${algoName} Sort Completed in ${time}ms</strong><br>`;
    html += data.map(i => `• ${i.name || "Guest #"+i.number}`).join("<br>");
    document.getElementById(boxId).innerHTML = html;
    toast(`${algoName} sort finished.`);
}

function bubbleSort(arr, key) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j][key] > arr[j + 1][key]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
    }
}

function insertionSort(arr, key) {
    for (let i = 1; i < arr.length; i++) {
        let keyItem = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j][key] > keyItem[key]) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = keyItem;
    }
}

function selectionSort(arr, key) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j][key] < arr[minIdx][key]) minIdx = j;
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
}

// --- UI HELPERS ---
function refreshAllData() {
    const btn = document.querySelector('.refresh-btn');
    if(btn) btn.classList.add('spinning');
    
    toast("Synchronizing with Firebase...");
    setTimeout(() => {
        initSystem();
        if(btn) btn.classList.remove('spinning');
        toast("Data synchronized successfully ✓");
    }, 1000);
}

function switchSection(id, btn) {
    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if(id === 'display-all') displayAll();
}

function updateStats() {
    const h = document.getElementById('stat-hotels');
    const r = document.getElementById('stat-rooms');
    const g = document.getElementById('stat-guests');
    const a = document.getElementById('stat-avail');
    
    if(h) h.textContent = hotels.length;
    if(g) g.textContent = guests.length;
    
    let totalRooms = 0;
    let availableRooms = 0;
    hotels.forEach(hotel => {
        if(hotel.rooms) {
            totalRooms += hotel.rooms.length;
            availableRooms += hotel.rooms.filter(rm => rm.available).length;
        }
    });
    
    if(r) r.textContent = totalRooms;
    if(a) a.textContent = availableRooms;
}

function updateSelects() {
    const sel = document.getElementById('r-hotel');
    if(!sel) return;
    
    if (hotels.length === 0) {
        sel.innerHTML = '<option value="" disabled selected>No hotels available</option>';
        return;
    }
    
    let html = '<option value="" disabled selected>Select a Hotel...</option>';
    html += hotels.map((h,i) => `<option value="${i}">${h.name}</option>`).join("");
    sel.innerHTML = html;
}

function displayAll() {
    let html = "<h3>DATABASE GLOBAL DUMP</h3>";
    html += "<h4>HOTELS & ROOMS</h4>";
    hotels.forEach(h => {
        html += `<div style="margin-bottom:1rem; padding:0.5rem; border-left:2px solid var(--accent)">
            <strong>${h.name}</strong> (${h.location})<br>`;
        if(!h.rooms || h.rooms.length === 0) html += "<small>No rooms registered.</small>";
        else html += h.rooms.map(r => `  - Room ${r.number} | Floor ${r.floor} | ${r.view} | $${r.price} | ${r.available ? '🟢' : '🔴'}`).join("<br>");
        html += "</div>";
    });
    html += "<h4>REGISTERED GUESTS</h4>";
    html += guests.map(g => `• #${g.number} | ${g.name} | ${g.phone}`).join("<br>");
    document.getElementById('all-data-dump').innerHTML = html;
}

function toast(msg, type = "success") {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.background = type === "success" ? "rgba(0, 210, 255, 0.8)" : "rgba(255, 75, 43, 0.8)";
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// --- SEARCH ENGINE ---
function searchGuest() {
    const val = document.getElementById('search-guest-id').value;
    if(!val) return toast("Please enter a Guest ID!", "error");
    
    const id = parseInt(val);
    // Use flexible comparison (==) to find the guest regardless of type
    const result = guests.find(g => g.number == id); 
    const box = document.getElementById('search-guest-box');
    
    if(result) {
        box.innerHTML = `
            <div style="border-left: 3px solid var(--success); padding-left: 1rem; animation: slideUp 0.3s ease;">
                <h4 style="color:var(--success); margin-bottom:0.5rem;">✅ GUEST FOUND</h4>
                <p><strong>Name:</strong> ${result.name}</p>
                <p><strong>Phone:</strong> ${result.phone}</p>
                <p><strong>SSD:</strong> ${result.ssd}</p>
            </div>`;
        toast("Guest record located.");
    } else {
        box.innerHTML = `<div style="color:var(--danger); animation: slideUp 0.3s ease;">❌ ERROR: Guest ID ${id} not found in database.</div>`;
        toast("Search failed.", "error");
    }
}

function searchAvailable() {
    let available = [];
    hotels.forEach(h => {
        if(h.rooms && Array.isArray(h.rooms)) {
            h.rooms.forEach(r => {
                if(r.available) available.push({ hName: h.name, ...r });
            });
        }
    });
    
    const box = document.getElementById('search-room-box');
    if(available.length > 0) {
        box.innerHTML = `
            <h4 style="color:var(--accent); margin-bottom:0.8rem;">🏨 AVAILABLE ROOMS (${available.length})</h4>
            <div style="display:grid; gap:0.5rem; animation: slideUp 0.3s ease;">
                ${available.map(r => `
                    <div style="background:rgba(255,255,255,0.05); padding:0.6rem; border-radius:8px; font-size:0.8rem; border-left: 2px solid var(--accent);">
                        <span style="color:var(--accent)">${r.hName}</span>: 
                        <strong>Room ${r.number}</strong> (${r.view}) — 
                        <span style="color:var(--success)">$${r.price}</span>
                    </div>
                `).join("")}
            </div>`;
        toast(`${available.length} available rooms found.`);
    } else {
        box.innerHTML = `<div style="color:var(--warning); animation: slideUp 0.3s ease;">⚠️ No available rooms found across all hotels.</div>`;
        toast("No rooms found.", "warning");
    }
}

function clearSearchResults() {
    document.getElementById('search-guest-id').value = "";
    document.getElementById('search-guest-box').innerHTML = "Guest results...";
    document.getElementById('search-room-box').innerHTML = "Room results...";
    toast("Search results cleared.");
}

function clearInputs(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = "";
    });
}
