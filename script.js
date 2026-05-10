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
    initSampleData();
    
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

// [Data logic remains stable...]
function initSampleData() { hotels = []; guests = []; updateStats(); updateSelects(); }
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
