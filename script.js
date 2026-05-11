// ========== SUPREME 3D VISUAL ENGINE v10.0 (STABLE & BRIGHT) ==========
let hotels = [];
let guests = [];
let starSpeed = 0.5;

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

// --- BOOT & INTRO SEQUENCES ---
function startBootSequence() {
    const tl = gsap.timeline();
    tl.to('#loader-bar', { width: "100%", duration: 0.6, ease: "power4.inOut" })
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
    startBootSequence();

    // Wait for Firebase to be ready before initializing the data system
    function startWhenFirebaseReady() {
        if (window.firebaseReady) {
            console.log("🔥 Firebase detected, starting data system...");
            initSystem();
        } else {
            console.log("⏳ Waiting for Firebase to load...");
            window.addEventListener('firebase-ready', () => {
                console.log("🔥 Firebase ready event received, starting data system...");
                initSystem();
            });
        }
    }
    startWhenFirebaseReady();
    
    // Live Clock Engine
    setInterval(() => {
        const c = document.getElementById('side-clock');
        if(c) c.textContent = new Date().toLocaleTimeString();
    }, 1000);
    
    // Resize fix
    window.addEventListener('resize', () => {
        if(camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });
});

// ========== DATA MANAGEMENT ENGINE (FUNCTIONAL) ==========

/**
 * Initializes the system (Empty for Firebase transition)
 */
function initSystem() {
    if (!window.db || !window.firebaseMethods) {
        console.error("❌ Firebase not available! Cannot initialize data system.");
        toast("Firebase connection failed. Check console.", "error");
        return;
    }

    const { onSnapshot, collection } = window.firebaseMethods;
    const db = window.db;

    // Listen for Hotels (real-time sync)
    onSnapshot(collection(db, "hotels"), (snapshot) => {
        hotels = snapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, name: data.name, location: data.location, rooms: data.rooms || [] };
        });
        updateStats();
        updateSelects();
        if(document.getElementById('display-all').classList.contains('active')) displayAll();
        console.log("✅ Hotels synced from Firebase:", hotels.length, "hotels");
    }, (error) => {
        console.error("❌ Hotels listener error:", error);
        toast("Firebase hotel sync error: " + error.message, "error");
    });

    // Listen for Guests (real-time sync)
    onSnapshot(collection(db, "guests"), (snapshot) => {
        guests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateStats();
        if(document.getElementById('display-all').classList.contains('active')) displayAll();
        console.log("✅ Guests synced from Firebase:", guests.length, "guests");
    }, (error) => {
        console.error("❌ Guests listener error:", error);
        toast("Firebase guest sync error: " + error.message, "error");
    });

    updateStats();
    updateSelects();
    console.log("✅ System initialized. Real-time Firebase listeners active.");
    toast("System connected to Firebase ✓");
}

// --- CORE ACTIONS ---

async function addHotel() {
    const name = document.getElementById('h-name').value;
    const loc = document.getElementById('h-loc').value;
    if(!name || !loc) return toast("Missing required fields!", "error");

    const { addDoc, collection } = window.firebaseMethods;
    try {
        await addDoc(collection(window.db, "hotels"), { name, location: loc, rooms: [] });
        toast(`Hotel '${name}' deployed to Firebase.`);
        clearInputs(['h-name', 'h-loc']);
    } catch(e) {
        toast("Firebase Error: " + e.message, "error");
    }
}

async function addRoom() {
    const hIdx = document.getElementById('r-hotel').value;
    const num = parseInt(document.getElementById('r-num').value);
    const floor = parseInt(document.getElementById('r-floor').value);
    const view = document.getElementById('r-view').value;
    const price = parseFloat(document.getElementById('r-price').value);
    const avail = document.getElementById('r-avail').value === "true";

    if(isNaN(num) || isNaN(price)) return toast("Invalid numerical data!", "error");
    if(!hotels[hIdx]) return toast("Select a valid hotel!", "error");

    const { updateDoc, doc, arrayUnion } = window.firebaseMethods;
    const hotelId = hotels[hIdx].id;

    try {
        await updateDoc(doc(window.db, "hotels", hotelId), {
            rooms: arrayUnion({ number: num, floor, view, price, available: avail })
        });
        toast(`Room ${num} initialized in ${hotels[hIdx].name}.`);
        clearInputs(['r-num', 'r-floor', 'r-view', 'r-price']);
    } catch(e) {
        toast("Firebase Error: " + e.message, "error");
    }
}

async function addGuest() {
    const num = parseInt(document.getElementById('g-num').value);
    const name = document.getElementById('g-name').value;
    const phone = document.getElementById('g-phone').value;
    const ssd = document.getElementById('g-ssd').value;

    if(!num || !name) return toast("Missing guest identity!", "error");

    const { addDoc, collection } = window.firebaseMethods;
    try {
        await addDoc(collection(window.db, "guests"), { number: num, name, phone, ssd });
        toast(`Guest '${name}' registered in Firebase.`);
        clearInputs(['g-num', 'g-name', 'g-phone', 'g-ssd']);
    } catch(e) {
        toast("Firebase Error: " + e.message, "error");
    }
}

// --- ALGORITHMS (SORTING) ---

function runSort(type, algo) {
    const start = performance.now();
    let data = [];
    let boxId = "";

    if(type === 'hotels') {
        data = hotels;
        boxId = "hotels-sort-box";
        if(algo === 1) bubbleSort(data, 'name');
        else if(algo === 2) insertionSort(data, 'name');
        else selectionSort(data, 'name');
    } else if(type === 'guests') {
        data = guests;
        boxId = "guests-sort-box";
        if(algo === 1) bubbleSort(data, 'number');
        else if(algo === 2) insertionSort(data, 'number');
        else selectionSort(data, 'number');
    } else if(type === 'rooms') {
        hotels.forEach(h => {
            if(algo === 1) bubbleSort(h.rooms, 'number');
            else if(algo === 2) insertionSort(h.rooms, 'number');
            else selectionSort(h.rooms, 'number');
        });
        toast("All hotel rooms sorted by number.");
        return;
    }

    const end = performance.now();
    const time = (end - start).toFixed(4);
    const algoName = ["Bubble", "Insertion", "Selection"][algo-1];
    
    let html = `<strong>${algoName} Sort Completed in ${time}ms</strong><br>`;
    html += data.map(i => `• ${i.name || "Guest #"+i.number}`).join("<br>");
    document.getElementById(boxId).innerHTML = html;
    toast(`${algoName} sort finished.`);
}

function bubbleSort(arr, key) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j][key] > arr[j + 1][key]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
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

// --- SEARCH ENGINE ---

function searchGuest() {
    const id = parseInt(document.getElementById('search-guest-id').value);
    const result = guests.find(g => g.number === id);
    const box = document.getElementById('search-guest-box');
    
    if(result) {
        box.innerHTML = `<div style="color:var(--accent)">FOUND: ${result.name} | Phone: ${result.phone} | SSD: ${result.ssd}</div>`;
        toast("Guest record located.");
    } else {
        box.innerHTML = `<div style="color:#ff4b2b">ERROR: Guest ID ${id} not found in system.</div>`;
        toast("Search failed.", "error");
    }
}

function searchAvailable() {
    let available = [];
    hotels.forEach(h => {
        h.rooms.forEach(r => {
            if(r.available) available.push({ hName: h.name, ...r });
        });
    });
    
    const box = document.getElementById('search-room-box');
    if(available.length > 0) {
        box.innerHTML = available.map(r => `• ${r.hName}: Room ${r.number} (${r.view}) - $${r.price}`).join("<br>");
        toast(`${available.length} available rooms found.`);
    } else {
        box.innerHTML = "No available rooms found across all hotels.";
    }
}

// --- DISPLAY & UI HELPERS ---

function displayAll() {
    let html = "<h3>DATABASE GLOBAL DUMP</h3>";
    
    html += "<h4>HOTELS & ROOMS</h4>";
    hotels.forEach(h => {
        html += `<div style="margin-bottom:1rem; padding:0.5rem; border-left:2px solid var(--accent)">
            <strong>${h.name}</strong> (${h.location})<br>`;
        if(h.rooms.length === 0) html += "<small>No rooms registered.</small>";
        else {
            html += h.rooms.map(r => `  - Room ${r.number} | Floor ${r.floor} | ${r.view} | $${r.price} | ${r.available ? '🟢' : '🔴'}`).join("<br>");
        }
        html += "</div>";
    });

    html += "<h4>REGISTERED GUESTS</h4>";
    html += guests.map(g => `• #${g.number} | ${g.name} | ${g.phone}`).join("<br>");
    
    document.getElementById('all-data-dump').innerHTML = html;
}

function updateStats() {
    const h = document.getElementById('stat-hotels');
    const r = document.getElementById('stat-rooms');
    const g = document.getElementById('stat-guests');
    const a = document.getElementById('stat-avail');
    if(h) h.textContent = hotels.length;
    if(r) r.textContent = hotels.reduce((acc, curr) => acc + curr.rooms.length, 0);
    if(g) g.textContent = guests.length;
    if(a) a.textContent = hotels.reduce((acc, curr) => acc + curr.rooms.filter(rm => rm.available).length, 0);
}

function updateSelects() {
    const sel = document.getElementById('r-hotel');
    if(sel) sel.innerHTML = hotels.map((h,i) => `<option value="${i}">${h.name}</option>`).join("");
}

function switchSection(id, btn) {
    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if(id === 'display-all') displayAll();
}

function toast(msg, type = "success") {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.background = type === "success" ? "rgba(0, 210, 255, 0.8)" : "rgba(255, 75, 43, 0.8)";
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function clearInputs(ids) {
    ids.forEach(id => document.getElementById(id).value = "");
}
