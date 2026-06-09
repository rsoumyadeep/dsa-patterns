/**
 * v2_graph.js — Hyperrealistic 3D Solar System Visualizer using Three.js (Version 2).
 * Places Arrays & Hashing at the center as the glowing Core Sun, with concentric
 * tier orbit rings, procedurally textured planets with Saturn-like rings,
 * orbiting subpattern moons, and a dark space starry nebula background.
 */

console.log("v2_graph.js loading: Hyperrealistic Solar System...");

// Constants for planetary sizes and orbits
const NODE_RADIUS = 7;
const SUN_RADIUS = 15;
const MOON_RADIUS = 2.0;

// Global Three.js objects
let scene, camera, renderer, labelRenderer, controls;
let nodesData = [];
let linksData = [];
let nodeMeshes = [];
let linkLines = [];
let orbitLines = [];
let starField = null;
let sunMesh = null;
let sunLight = null;
let animationFrameId = null;

// Spawning Satellite Moons
let selectedNodeId = null;
let activeMoonContainer = null;
let activeMoons = [];

// Tour playback states
let tourActive = false;
let tourPaused = false;
let tourOrder = [];
let tourCurrentIndex = 0;
let tourInterval = null;

// Exploration Progress tracking
let visitedPatterns = new Set();
try {
    const stored = localStorage.getItem("visited_patterns");
    if (stored) {
        JSON.parse(stored).forEach(id => visitedPatterns.add(id));
    }
} catch (e) {
    console.error("Error reading visited_patterns from localStorage:", e);
}

// 7-Tier styling palette (Saturated pastel fills)
const TIER_COLORS = {
    0: "#e0f2fe",  // Sky blue (Arrays & Hashing core)
    1: "#ede9fe",  // Violet
    2: "#dcfce7",  // Emerald
    3: "#fef3c7",  // Amber
    4: "#ffe4e6",  // Rose
    5: "#fae8ff",  // Fuchsia
    6: "#fef9c3"   // Yellow
};

const TIER_STROKE_COLORS = {
    0: "#ef4444",  // Radiant Red-Orange for Arrays & Hashing Core Sun
    1: "#7c3aed",
    2: "#059669",
    3: "#d97706",
    4: "#e11d48",
    5: "#c084fc",
    6: "#ca8a04"
};

// Concentric orbits distance helper
function getTierRadius(tier) {
    if (tier === 0) return 0; // Arrays & Hashing sits at the center (Sun)
    return 28 + tier * 32; 
}

// Cubic easing helper
function easeCubicOut(t) {
    return (--t) * t * t + 1;
}

// Procedural Canvas Texture Generator for Stars & Nebula Halo glow
function createSoftCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
}

// Procedural Canvas Texture Generator for Sun swirling plasma
function generateSunTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Core plasma gradient
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, '#fffdf5'); // ultra bright core
    grad.addColorStop(0.15, '#fbbf24'); // sunny gold
    grad.addColorStop(0.55, '#f97316'); // solar orange
    grad.addColorStop(0.85, '#b45309'); // deep amber flare
    grad.addColorStop(1, '#060813'); // fade boundary
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Dynamic magnetic loops overlay
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(128, 128, 32 + i * 9, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
}

// Procedural Canvas Texture Generator for Planet Surfaces
function generatePlanetTexture(baseColorHex, detailColorHex, type) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // 1. Fill base planet background color
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 128, 128);
    
    // 2. Add surface details depending on planet category
    ctx.fillStyle = detailColorHex;
    if (type === 'striped') {
        // Jupiter-like bands/strips
        for (let i = 0; i < 8; i++) {
            const y = 8 + i * 15 + (Math.random() - 0.5) * 5;
            const h = 3 + Math.random() * 8;
            ctx.fillRect(0, y, 128, h);
        }
    } else if (type === 'cratered') {
        // Rocky asteroid craters
        for (let i = 0; i < 14; i++) {
            const cx = Math.random() * 128;
            const cy = Math.random() * 128;
            const r = 2 + Math.random() * 5;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
            // Crater rim light highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(cx + 0.5, cy + 0.5, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else {
        // Swirling gas storms (marble)
        for (let i = 0; i < 16; i++) {
            const cx = Math.random() * 128;
            const cy = Math.random() * 128;
            const r = 7 + Math.random() * 16;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fill();
        }
    }
    return new THREE.CanvasTexture(canvas);
}

// Setup Scene, WebGL, Lights, overlays
function init3D() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 160, 240); // elevated viewing perspective

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.getElementById("canvas3d").appendChild(renderer.domElement);

    labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.getElementById("labels3d").appendChild(labelRenderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 450;
    controls.minDistance = 30;
    controls.target.set(0, 0, 0); // locks onto Sun
}

// Particle Stars & Glowing Additive Nebulae clouds background
function initUniverse() {
    // 1. Star field background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 850;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // soft circular texture prevents stars from rendering as squares
    const softTexture = createSoftCircleTexture();
    const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.6,
        map: softTexture,
        transparent: true,
        opacity: 0.65,
        depthWrite: false
    });

    starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 2. Cosmic Nebula Clouds (Large Additive points)
    const nebulaCount = 5;
    const colors = [0x3b82f6, 0xec4899, 0x6366f1, 0xa855f7]; // blue, pink, indigo, purple

    for (let i = 0; i < nebulaCount; i++) {
        const geo = new THREE.BufferGeometry();
        const coords = new Float32Array(3);
        coords[0] = (Math.random() - 0.5) * 320;
        coords[1] = (Math.random() - 0.5) * 120 - 30;
        coords[2] = (Math.random() - 0.5) * 320;
        geo.setAttribute('position', new THREE.BufferAttribute(coords, 3));

        const mat = new THREE.PointsMaterial({
            color: colors[i % colors.length],
            size: 240 + Math.random() * 120, // massive dust scaling
            map: softTexture,
            transparent: true,
            opacity: 0.12,
            depthWrite: false,
            blending: THREE.AdditiveBlending // creates bright overlapping gas glows
        });

        const nebula = new THREE.Points(geo, mat);
        scene.add(nebula);
    }
}

// Concentric Circular Orbit Loop paths
function initOrbits() {
    // Orbits are drawn starting from Tier 1, since Tier 0 (Arrays/Hashing) is at the center
    for (let t = 1; t <= 6; t++) {
        const radius = getTierRadius(t);
        const points = [];

        for (let j = 0; j <= 64; j++) {
            const theta = (j / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
        }

        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMat = new THREE.LineDashedMaterial({
            color: 0x475569,
            dashSize: 3,
            gapSize: 3,
            transparent: true,
            opacity: 0.28
        });

        const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
        orbitLine.computeLineDistances();
        scene.add(orbitLine);

        orbitLines.push({
            tier: t,
            line: orbitLine,
            radius: radius
        });
    }
}

// Helper to append Saturn-like rings to outer gas giants
function addPlanetRings(mesh, colorHex) {
    const ringGeo = new THREE.RingGeometry(NODE_RADIUS + 2.5, NODE_RADIUS + 7.5, 32);
    const ringMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.48,
        roughness: 0.6
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    // tilt the rings slightly for 3D realism
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.rotation.y = Math.PI / 8;
    mesh.add(ringMesh);
}

// Setup the Arrays & Hashing central Core Sun and planetary revolving nodes
function buildSolarSystem() {
    // 1. Core Sun: Arrays & Hashing
    const sunGeo = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
    // Basic material with swirling plasma texture map
    const sunMat = new THREE.MeshBasicMaterial({
        map: generateSunTexture()
    });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Label for the Arrays & Hashing Core Sun
    const sunDiv = document.createElement('div');
    sunDiv.id = `v2-label-arrays_hashing`;
    sunDiv.className = 'v2-node-label tier-0';
    sunDiv.style.border = '1.5px solid #ef4444';
    sunDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.18)'; // reddish-orange core flare glow
    sunDiv.style.fontWeight = '800';
    sunDiv.style.fontSize = '12px';
    sunDiv.innerHTML = `<span style="color:#ef4444; margin-right: 4px;">☀️</span>Arrays & Hashing`;
    sunDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        selectNode("arrays_hashing");
    });

    const sunLabel = new THREE.CSS2DObject(sunDiv);
    sunLabel.position.set(0, SUN_RADIUS + 5, 0);
    sunMesh.add(sunLabel);

    // Core point light source
    sunLight = new THREE.PointLight(0xfffbeb, 1.5, 450);
    scene.add(sunLight);

    // 2. Count patterns per tier to calculate spacing angles (excluding Arrays/Hashing)
    const tierCounts = {};
    PATTERNS.forEach(p => {
        if (p.id !== 'arrays_hashing') {
            tierCounts[p.tier] = (tierCounts[p.tier] || 0) + 1;
        }
    });

    const tierIndices = {};

    // 3. Setup orbital data nodes
    nodesData = PATTERNS.map(p => {
        // Arrays & Hashing sits at the center
        if (p.id === 'arrays_hashing') {
            return {
                id: p.id,
                label: p.label,
                tier: p.tier,
                subpatterns: p.subpatterns,
                orbitRadius: 0,
                angle: 0,
                speed: 0,
                yOffset: 0,
                x: 0,
                y: 0,
                z: 0,
                mesh: sunMesh,
                labelElement: sunDiv
            };
        }

        const tier = p.tier;
        const totalInTier = tierCounts[tier];
        const indexInTier = tierIndices[tier] || 0;
        tierIndices[tier] = indexInTier + 1;

        const radius = getTierRadius(tier);
        const startAngle = (indexInTier / totalInTier) * Math.PI * 2;

        return {
            id: p.id,
            label: p.label,
            tier: p.tier,
            subpatterns: p.subpatterns,
            orbitRadius: radius,
            angle: startAngle,
            // Kepler's speed
            speed: 0.003 / (1 + tier * 0.42),
            yOffset: Math.random() * Math.PI * 2,
            x: radius * Math.cos(startAngle),
            y: 0,
            z: radius * Math.sin(startAngle)
        };
    });

    // 4. Map link lines (stretching dependency connectors)
    linksData = [];
    PATTERNS.forEach(p => {
        if (p.dependencies) {
            p.dependencies.forEach(depId => {
                linksData.push({
                    source: depId,
                    target: p.id
                });
            });
        }
    });

    // 5. Render Planet Meshes with procedural surface textures
    const sphereGeo = new THREE.SphereGeometry(NODE_RADIUS, 32, 32);

    nodesData.forEach(node => {
        // Skip creating mesh for Arrays/Hashing since it uses sunMesh
        if (node.id === 'arrays_hashing') return;

        // Choose planet textures category
        let textureType = 'atmospheric';
        if (node.tier === 2 || node.tier === 4) textureType = 'cratered';
        if (node.tier === 3 || node.tier === 5) textureType = 'striped';

        const baseColor = TIER_COLORS[node.tier] || "#ffffff";
        const detailColor = (textureType === 'cratered') ? '#000000' : '#ffffff';
        const proceduralMap = generatePlanetTexture(baseColor, detailColor, textureType);

        const bubbleMat = new THREE.MeshPhysicalMaterial({
            map: proceduralMap,
            roughness: 0.08,
            metalness: 0.12,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            transmission: 0.45, // translucent refractive fill
            thickness: 2.0,
            transparent: true,
            opacity: 0.92,
            ior: 1.42
        });

        const mesh = new THREE.Mesh(sphereGeo, bubbleMat);
        mesh.position.set(node.x, node.y, node.z);
        scene.add(mesh);
        nodeMeshes.push(mesh);

        // Add rings to gas giants (Tier 3 & 5)
        if (textureType === 'striped') {
            addPlanetRings(mesh, baseColor);
        }

        // Project HTML CSS2D label pill
        const labelDiv = document.createElement('div');
        labelDiv.id = `v2-label-${node.id}`;
        labelDiv.className = `v2-node-label tier-${node.tier}`;
        labelDiv.innerHTML = `<span class="label-text">${node.label}</span>`;
        
        labelDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            selectNode(node.id);
        });

        const labelObj = new THREE.CSS2DObject(labelDiv);
        labelObj.position.set(0, NODE_RADIUS + 3.5, 0);
        mesh.add(labelObj);

        node.labelElement = labelDiv;
        node.mesh = mesh;
    });

    // 6. Draw connection lines
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.42
    });

    linksData.forEach(link => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(2 * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const line = new THREE.Line(geometry, lineMat);
        scene.add(line);
        linkLines.push({
            line: line,
            sourceId: link.source,
            targetId: link.target
        });
    });
}

// Spawns subconcept moons revolving around focused planet
function spawnMoons(parentNode) {
    clearMoons();

    activeMoonContainer = new THREE.Group();
    activeMoonContainer.position.set(parentNode.x, parentNode.y, parentNode.z);
    scene.add(activeMoonContainer);

    const numMoons = parentNode.subpatterns.length;
    const moonGeo = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);

    parentNode.subpatterns.forEach((sub, index) => {
        const moonMat = new THREE.MeshPhysicalMaterial({
            color: 0xe2e8f0,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.8,
            thickness: 0.8,
            transparent: true,
            opacity: 0.72
        });

        const mesh = new THREE.Mesh(moonGeo, moonMat);
        const radius = 15 + index * 4.2;
        const angle = (index / numMoons) * Math.PI * 2;

        mesh.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
        activeMoonContainer.add(mesh);

        // Moon text label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'v2-moon-label';
        labelDiv.textContent = sub.label;

        const labelObj = new THREE.CSS2DObject(labelDiv);
        labelObj.position.set(0, MOON_RADIUS + 2.0, 0);
        mesh.add(labelObj);

        activeMoons.push({
            mesh: mesh,
            labelElement: labelDiv,
            radius: radius,
            angle: angle,
            speed: 0.015 + (index * 0.0035)
        });
    });
}

// Clears moon container
function clearMoons() {
    if (activeMoonContainer) {
        activeMoons.forEach(m => {
            if (m.labelElement && m.labelElement.parentNode) {
                m.labelElement.parentNode.removeChild(m.labelElement);
            }
        });
        scene.remove(activeMoonContainer);
        activeMoonContainer = null;
    }
    activeMoons = [];
}

// Animation loop
function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // 1. Swirl Sun plasma texture details
    if (sunMesh) {
        sunMesh.rotation.y += 0.0025;
    }

    // 2. Revolving planets (excluding Arrays/Hashing center)
    nodesData.forEach(node => {
        if (node.id === 'arrays_hashing') return;

        node.angle += node.speed;
        node.x = node.orbitRadius * Math.cos(node.angle);
        node.z = node.orbitRadius * Math.sin(node.angle);
        node.y = Math.sin(time * 1.5 + node.yOffset) * 2;

        if (node.mesh) {
            node.mesh.position.set(node.x, node.y, node.z);
        }
    });

    // 3. Revolving satellite moons
    if (activeMoonContainer && selectedNodeId) {
        const parent = nodesData.find(n => n.id === selectedNodeId);
        if (parent) {
            activeMoonContainer.position.set(parent.x, parent.y, parent.z);

            activeMoons.forEach(m => {
                m.angle += m.speed;
                m.mesh.position.set(
                    m.radius * Math.cos(m.angle),
                    Math.sin(time * 3 + m.angle) * 1.2,
                    m.radius * Math.sin(m.angle)
                );
            });
        }
    }

    // 4. Update dependency links
    linkLines.forEach(item => {
        const s = nodesData.find(n => n.id === item.sourceId);
        const t = nodesData.find(n => n.id === item.targetId);
        if (s && t && item.line) {
            const positions = item.line.geometry.attributes.position.array;
            positions[0] = s.x;
            positions[1] = s.y;
            positions[2] = s.z;
            positions[3] = t.x;
            positions[4] = t.y;
            positions[5] = t.z;
            item.line.geometry.attributes.position.needsUpdate = true;
        }
    });

    // 5. Update Orbit camera
    if (controls) {
        controls.update();
    }

    // 6. Draw
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
    if (labelRenderer && scene && camera) {
        labelRenderer.render(scene, camera);
    }
}

// Node selection handler
let activeFlightAnimation = null;
window.selectNode = function(nodeId) {
    const node = nodesData.find(n => n.id === nodeId);
    if (!node) return;

    selectedNodeId = nodeId;

    // 1. Highlight labels
    nodesData.forEach(n => {
        if (n.labelElement) n.labelElement.classList.remove("selected");
    });
    if (node.labelElement) {
        node.labelElement.classList.add("selected");
    }

    // 2. Highlight planet sizes
    nodesData.forEach(n => {
        if (n.id === 'arrays_hashing') {
            // slightly scale Sun up on select
            if (n.mesh) {
                const scale = (nodeId === 'arrays_hashing') ? 1.3 : 1.0;
                n.mesh.scale.set(scale, scale, scale);
            }
            return;
        }
        if (n.mesh) {
            const scale = (n.id === nodeId) ? 1.6 : 1.0;
            n.mesh.scale.set(scale, scale, scale);
        }
    });

    // 3. Mark pattern explored
    if (typeof window.markPatternVisited === "function") {
        window.markPatternVisited(nodeId);
    }

    // 4. Spawn moons (skip spawning moons around the Sun itself since it represents a general pattern,
    // but we can spawn them if we want to show its subconcepts!)
    // Yes! Arrays & Hashing has 3 subconcepts, so spawning moons around the Sun looks incredible!
    spawnMoons(node);

    // 5. Open sidebar panel
    if (typeof openPanel === "function") {
        openPanel(nodeId);
    }

    // 6. Camera flight focus
    flyCameraTo(node.x, node.y, node.z);
};

// Smooth Camera Flight Transition (Tweening target and position)
function flyCameraTo(tx, ty, tz) {
    if (activeFlightAnimation) {
        cancelAnimationFrame(activeFlightAnimation);
    }

    const duration = 40; // frames
    let frame = 0;

    const startCamX = camera.position.x;
    const startCamY = camera.position.y;
    const startCamZ = camera.position.z;

    const startTarX = controls.target.x;
    const startTarY = controls.target.y;
    const startTarZ = controls.target.z;

    // Position camera focused slightly elevated and back from target planet coordinates
    // If targeting the center Sun, elevate view slightly
    const endCamX = tx;
    const endCamY = (tx === 0 && tz === 0) ? ty + 70 : ty + 40;
    const endCamZ = (tx === 0 && tz === 0) ? tz + 120 : tz + 75;

    const endTarX = tx;
    const endTarY = ty;
    const endTarZ = tz;

    function step() {
        if (frame <= duration) {
            const t = easeCubicOut(frame / duration);
            
            camera.position.set(
                startCamX + (endCamX - startCamX) * t,
                startCamY + (endCamY - startCamY) * t,
                startCamZ + (endCamZ - startCamZ) * t
            );

            controls.target.set(
                startTarX + (endTarX - startTarX) * t,
                startTarY + (endTarY - startTarY) * t,
                startTarZ + (endTarZ - startTarZ) * t
            );

            controls.update();
            frame++;
            activeFlightAnimation = requestAnimationFrame(step);
        } else {
            activeFlightAnimation = null;
        }
    }
    step();
}

// Navigation wrapper referenced in panel.js (dependency chip click)
window.navigateToPattern = function(patternId) {
    window.selectNode(patternId);
};

// Search filter: fades non-matching orbits, planets, and lines
function filterNodes3D(query) {
    if (query === "") {
        // Restore all
        nodesData.forEach(n => {
            if (n.mesh) n.mesh.scale.set(1.0, 1.0, 1.0);
            if (n.labelElement) n.labelElement.classList.remove("faded");
        });
        linkLines.forEach(item => {
            if (item.line) item.line.material.opacity = 0.42;
        });
        orbitLines.forEach(orbit => {
            if (orbit.line) orbit.line.material.opacity = 0.28;
        });
        return;
    }

    function matchesQuery(node, term) {
        if (node.label.toLowerCase().includes(term)) return true;
        if (node.subpatterns) {
            return node.subpatterns.some(sub => 
                sub.label.toLowerCase().includes(term) ||
                sub.questions.some(q => q.title.toLowerCase().includes(term))
            );
        }
        return false;
    }

    // Filter planets
    nodesData.forEach(n => {
        const matches = matchesQuery(n, query);
        
        if (n.mesh) {
            // If Sun, scale slightly differently
            const isSun = n.id === 'arrays_hashing';
            const baseScale = isSun ? 1.0 : 1.0;
            const targetScale = matches ? (isSun ? 1.2 : 1.3) : (isSun ? 0.4 : 0.3);
            n.mesh.scale.set(targetScale, targetScale, targetScale);
        }
        
        if (n.labelElement) {
            if (matches) {
                n.labelElement.classList.remove("faded");
            } else {
                n.labelElement.classList.add("faded");
            }
        }
    });

    // Fade link lines
    linkLines.forEach(item => {
        const sourceNode = nodesData.find(n => n.id === item.sourceId);
        const targetNode = nodesData.find(n => n.id === item.targetId);
        const sourceMatch = sourceNode && matchesQuery(sourceNode, query);
        const targetMatch = targetNode && matchesQuery(targetNode, query);
        
        if (item.line) {
            item.line.material.opacity = (sourceMatch && targetMatch) ? 0.6 : 0.05;
        }
    });

    // Fade helper orbit lines if they contain no matching planets
    orbitLines.forEach(orbit => {
        const hasMatchInTier = nodesData.some(n => n.tier === orbit.tier && matchesQuery(n, query));
        if (orbit.line) {
            orbit.line.material.opacity = hasMatchInTier ? 0.35 : 0.03;
        }
    });
}

// Guided Topological 3D Study Tour controls
window.startStudyTour = function() {
    if (tourActive) {
        if (tourPaused) {
            window.togglePauseTour();
        }
        return;
    }
    
    tourActive = true;
    tourPaused = false;
    tourOrder = getTopologicalOrder();
    tourCurrentIndex = 0;

    const toast = document.getElementById("tour-toast");
    if (toast) {
        toast.classList.remove("hidden");
    }

    updatePauseResumeButton();
    runTourStep();
};

function runTourStep() {
    if (!tourActive || tourPaused) return;

    if (tourCurrentIndex >= tourOrder.length) {
        window.stopStudyTour();
        return;
    }

    const nodeId = tourOrder[tourCurrentIndex];
    const node = PATTERNS.find(p => p.id === nodeId);
    if (!node) return;

    const toastText = document.getElementById("tour-toast-text");
    if (toastText) {
        toastText.innerHTML = `Step ${tourCurrentIndex + 1} of ${tourOrder.length}: <strong>${node.label}</strong> (Tier ${node.tier})`;
    }

    // Animate camera focus to node in 3D
    window.selectNode(nodeId);

    tourCurrentIndex++;

    // Proceed to next node in 3.5s
    tourInterval = setTimeout(runTourStep, 3500);
}

window.togglePauseTour = function() {
    if (!tourActive) return;

    if (tourPaused) {
        tourPaused = false;
        updatePauseResumeButton();
        runTourStep();
    } else {
        tourPaused = true;
        if (tourInterval) {
            clearTimeout(tourInterval);
            tourInterval = null;
        }
        updatePauseResumeButton();
    }
};

window.stopStudyTour = function() {
    tourActive = false;
    tourPaused = false;
    tourCurrentIndex = 0;
    if (tourInterval) {
        clearTimeout(tourInterval);
        tourInterval = null;
    }
    const toast = document.getElementById("tour-toast");
    if (toast) {
        toast.classList.add("hidden");
    }
    closePanel();
    clearMoons();
    selectedNodeId = null;
    
    // Scale all nodes back to normal
    nodesData.forEach(n => {
        if (n.mesh) n.mesh.scale.set(1.0, 1.0, 1.0);
    });
};

function updatePauseResumeButton() {
    const btn = document.getElementById("tour-btn-stop-resume");
    if (btn) {
        btn.textContent = tourPaused ? "Resume" : "Stop Tour";
        if (tourPaused) {
            btn.className = "tour-btn tour-btn-resume";
        } else {
            btn.className = "tour-btn tour-btn-stop";
        }
    }
}

// Exploration Progress update
window.updateProgressUI = function() {
    const total = PATTERNS.length;
    const count = visitedPatterns.size;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    
    const percentEl = document.getElementById("progress-percent");
    const fillEl = document.getElementById("progress-bar-fill");
    const countEl = document.getElementById("progress-count");
    
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (countEl) countEl.textContent = `${count} of ${total} patterns`;
};

window.resetProgress = function(event) {
    if (event) event.stopPropagation();
    if (confirm("Are you sure you want to reset your exploration progress?")) {
        visitedPatterns.clear();
        localStorage.removeItem("visited_patterns");
        window.updateProgressUI();
    }
};

// Topological Sort Sort helper for Tour order calculation
function getTopologicalOrder() {
    const visited = new Set();
    const temp = new Set();
    const order = [];

    function visit(nodeId) {
        if (visited.has(nodeId)) return;
        if (temp.has(nodeId)) return;
        
        temp.add(nodeId);

        const node = PATTERNS.find(p => p.id === nodeId);
        if (node && node.dependencies) {
            node.dependencies.forEach(depId => visit(depId));
        }

        temp.delete(nodeId);
        visited.add(nodeId);
        order.push(nodeId);
    }

    PATTERNS.forEach(p => visit(p.id));
    return order;
}

// UI Elements Injection & Listeners on Page Load
document.addEventListener("DOMContentLoaded", () => {
    // Initialize ThreeJS Solar System
    init3D();
    initUniverse();
    initOrbits();
    initSun();
    buildSolarSystem();
    animate();

    // 1. Create Guided Tour Toast overlay programmatically
    const toastDiv = document.createElement("div");
    toastDiv.id = "tour-toast";
    toastDiv.className = "hidden";
    toastDiv.innerHTML = `
        <span id="tour-toast-text">Guided Tour</span>
        <div class="tour-controls">
            <button id="tour-btn-stop-resume" class="tour-btn tour-btn-stop" onclick="window.togglePauseTour()">Stop Tour</button>
            <button class="tour-btn tour-btn-quit-new" onclick="window.stopStudyTour()">Quit</button>
        </div>
    `;
    document.body.appendChild(toastDiv);

    // 2. Inject Legend, Search Bar, and Controls
    const overlay = document.getElementById("ui-overlay");
    if (overlay) {
        overlay.innerHTML = `
            <!-- Top Left Legend -->
            <div id="legend-card" class="ui-card">
                <h3>Pattern Tiers</h3>
                
                <!-- Study Progress Section -->
                <div id="progress-container">
                    <div class="progress-info">
                        <span class="progress-label">Explored Progress</span>
                        <span id="progress-percent">0%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div id="progress-bar-fill"></div>
                    </div>
                    <div class="progress-footer">
                        <span id="progress-count">0 of 19 patterns</span>
                        <button id="reset-progress-btn" onclick="window.resetProgress(event)">Reset</button>
                    </div>
                </div>

                <div class="legend-items">
                    <div class="legend-item"><span class="legend-color" style="background:#e0f2fe; border: 1.5px solid #ef4444;"></span> Tier 0: Arrays & Hashing (Core)</div>
                    <div class="legend-item"><span class="legend-color" style="background:#ede9fe; border: 1.5px solid #7c3aed;"></span> Tier 1: Basic Linear & Search</div>
                    <div class="legend-item"><span class="legend-color" style="background:#dcfce7; border: 1.5px solid #059669;"></span> Tier 2: Linear Structs & Lists</div>
                    <div class="legend-item"><span class="legend-color" style="background:#fef3c7; border: 1.5px solid #d97706;"></span> Tier 3: Trees & Heaps</div>
                    <div class="legend-item"><span class="legend-color" style="background:#ffe4e6; border: 1.5px solid #e11d48;"></span> Tier 4: Graphs & Greedy</div>
                    <div class="legend-item"><span class="legend-color" style="background:#fae8ff; border: 1.5px solid #c084fc;"></span> Tier 5: Tries, Intervals & 1D DP</div>
                    <div class="legend-item"><span class="legend-color" style="background:#fef9c3; border: 1.5px solid #ca8a04;"></span> Tier 6: Complex 2D DP</div>
                </div>
            </div>

            <!-- Top Right Search & Control panel -->
            <div id="control-panel">
                <div class="search-container">
                    <input type="text" id="search-input" placeholder="Search DSA pattern..." autocomplete="off">
                    <button id="clear-search" style="display:none;">&times;</button>
                </div>
                <button id="study-tour-btn" class="ui-btn" style="border-color: var(--accent-blue); color: var(--accent-blue)">Study Order</button>
                <button id="reset-layout-btn" class="ui-btn">Reset</button>
                <div class="view-toggle-container">
                    <button class="v2-toggle-btn" onclick="window.location.href='index.html'">2D View</button>
                </div>
            </div>
        `;
        
        window.updateProgressUI();
    }

    // 3. Search inputs
    const searchInput = document.getElementById("search-input");
    const clearBtn = document.getElementById("clear-search");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (clearBtn) {
                clearBtn.style.display = query.length > 0 ? "block" : "none";
            }
            filterNodes3D(query);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = "";
                searchInput.focus();
            }
            clearBtn.style.display = "none";
            filterNodes3D("");
        });
    }

    // 4. Reset layout action: fly camera back to center
    const resetBtn = document.getElementById("reset-layout-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            window.stopStudyTour();
            closePanel();
            clearMoons();
            selectedNodeId = null;
            
            // Scale nodes back to normal
            nodesData.forEach(n => {
                if (n.mesh) n.mesh.scale.set(1.0, 1.0, 1.0);
            });

            // Smoothly fly camera back to elevated home coordinate
            flyCameraTo(0, 0, 0);
        });
    }

    // 5. Study Tour action
    const tourBtn = document.getElementById("study-tour-btn");
    if (tourBtn) {
        tourBtn.addEventListener("click", () => {
            window.startStudyTour();
        });
    }

    // 6. Keyboard bindings: Escape key to close panel/stop tour
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            window.stopStudyTour();
            closePanel();
        }
    });

    // 7. Click on canvas background to close panel
    const canvasContainer = document.getElementById("canvas3d");
    if (canvasContainer) {
        canvasContainer.addEventListener("click", (e) => {
            if (e.target.id === "canvas3d" || e.target.tagName === "CANVAS") {
                window.stopStudyTour();
                closePanel();
                clearMoons();
                selectedNodeId = null;
                
                // Return selected scales to normal
                nodesData.forEach(n => {
                    if (n.mesh) n.mesh.scale.set(1.0, 1.0, 1.0);
                });
            }
        });
    }
});

// Window resize listener
window.addEventListener("resize", () => {
    if (camera && renderer && labelRenderer) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        labelRenderer.setSize(width, height);
    }
});
