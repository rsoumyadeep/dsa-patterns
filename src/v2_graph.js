/**
 * v2_graph.js — 3D Solar System Visualizer using Three.js (Version 2).
 * Features a central glowing Core Sun, concentric circular orbit rings representing DSA Tiers,
 * revolving pattern planets, orbiting subpattern satellite moons, and a starry dark cosmic theme.
 */

console.log("v2_graph.js loading: Solar System layout...");

// Constants for planetary sizes and orbits
const NODE_RADIUS = 7;
const SUN_RADIUS = 14;
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
    0: "#e0f2fe",  // Sky blue
    1: "#ede9fe",  // Violet
    2: "#dcfce7",  // Emerald
    3: "#fef3c7",  // Amber
    4: "#ffe4e6",  // Rose
    5: "#fae8ff",  // Fuchsia
    6: "#fef9c3"   // Yellow
};

// Orbit layout distance helpers
function getTierRadius(tier) {
    // concentric orbits spanning outward
    return 36 + tier * 32; 
}

// Cubic easing helper
function easeCubicOut(t) {
    return (--t) * t * t + 1;
}

// Setup Scene, WebGL canvas, cosmic lights, and CSS2D label overlays
function init3D() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Perspective Camera & Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 150, 240); // slightly elevated view for 3D depth

    // 2. WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.getElementById("canvas3d").appendChild(renderer.domElement);

    // 3. CSS2D label projection overlay
    labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none'; // click passes through
    document.getElementById("labels3d").appendChild(labelRenderer.domElement);

    // 4. Orbit Camera Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 450;
    controls.minDistance = 35;
    // Set target initially to Sun
    controls.target.set(0, 0, 0);

    // 5. Cosmic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight1.position.set(120, 180, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.35); // soft blue fill light
    dirLight2.position.set(-100, -100, 50);
    scene.add(dirLight2);
}

// Particle space starfield background
function initStarfield() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
        // spread particles randomly inside a large box bounding area
        positions[i] = (Math.random() - 0.5) * 800;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.9,
        transparent: true,
        opacity: 0.55
    });

    starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);
}

// Circular tier orbits helper lines (XZ plane)
function initOrbits() {
    for (let t = 0; t <= 6; t++) {
        const radius = getTierRadius(t);
        const points = [];
        
        for (let j = 0; j <= 64; j++) {
            const theta = (j / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
        }

        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        // Faint, dotted helper lines
        const orbitMat = new THREE.LineDashedMaterial({
            color: 0x475569,
            dashSize: 3,
            gapSize: 3,
            transparent: true,
            opacity: 0.32
        });

        const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
        orbitLine.computeLineDistances(); // required for dashed material
        scene.add(orbitLine);
        
        orbitLines.push({
            tier: t,
            line: orbitLine,
            radius: radius
        });
    }
}

// Central Core Star (DSA Sun)
function initSun() {
    const sunGeo = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
    // MeshBasicMaterial so it glows independently of other lights
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Label CSS2D pill for the Sun
    const sunDiv = document.createElement('div');
    sunDiv.className = 'v2-node-label';
    sunDiv.style.borderLeft = '4px solid #f59e0b';
    sunDiv.style.fontWeight = '800';
    sunDiv.style.fontSize = '12px';
    sunDiv.style.backgroundColor = 'rgba(251, 191, 36, 0.15)';
    sunDiv.innerHTML = `<span style="color:#fbbf24; margin-right: 4px;">☀️</span>DSA CORE`;
    
    const sunLabel = new THREE.CSS2DObject(sunDiv);
    sunLabel.position.set(0, SUN_RADIUS + 5, 0);
    sunMesh.add(sunLabel);

    // Dynamic light source from Sun outwards
    sunLight = new THREE.PointLight(0xfffbeb, 1.4, 450);
    scene.add(sunLight);
}

// Build nodes as revolving planets
function buildSolarSystem() {
    // 1. Group patterns by tier to calculate even spacing angles
    const tierCounts = {};
    PATTERNS.forEach(p => {
        tierCounts[p.tier] = (tierCounts[p.tier] || 0) + 1;
    });

    const tierIndices = {};
    
    // 2. Initialize planetary orbits
    nodesData = PATTERNS.map(p => {
        const tier = p.tier;
        const totalInTier = tierCounts[tier];
        const indexInTier = tierIndices[tier] || 0;
        tierIndices[tier] = indexInTier + 1;

        const radius = getTierRadius(tier);
        // Distribute evenly along the circle path
        const startAngle = (indexInTier / totalInTier) * Math.PI * 2;

        return {
            id: p.id,
            label: p.label,
            tier: p.tier,
            subpatterns: p.subpatterns,
            orbitRadius: radius,
            angle: startAngle,
            // Kepler's law speed approximation (outer planets move slower)
            speed: 0.003 / (1 + tier * 0.45),
            // Randomized phase offset for zero-gravity Y-axis wobble
            yOffset: Math.random() * Math.PI * 2,
            x: radius * Math.cos(startAngle),
            y: 0,
            z: radius * Math.sin(startAngle)
        };
    });

    // 3. Map links from dependencies
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

    // 4. Render spheres (Planets) with clearcoat glossy physical glass
    const sphereGeo = new THREE.SphereGeometry(NODE_RADIUS, 32, 32);

    nodesData.forEach(node => {
        const bubbleMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(TIER_COLORS[node.tier] || "#ffffff"),
            roughness: 0.08,
            metalness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.06,
            transmission: 0.58, // glass refraction fill
            thickness: 2.2,
            transparent: true,
            opacity: 0.9,
            ior: 1.45
        });

        const mesh = new THREE.Mesh(sphereGeo, bubbleMat);
        mesh.position.set(node.x, node.y, node.z);
        scene.add(mesh);
        nodeMeshes.push(mesh);

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

    // 5. Render stretching connection lines
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.45
    });

    linksData.forEach(link => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(2 * 3); // 2 points
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

// Spawns sub-pattern satellite moons orbiting a selected planet
function spawnMoons(parentNode) {
    // 1. Clear previous selection
    clearMoons();

    // 2. Create local moons container group
    activeMoonContainer = new THREE.Group();
    // Position immediately at the parent planet's coordinates
    activeMoonContainer.position.set(parentNode.x, parentNode.y, parentNode.z);
    scene.add(activeMoonContainer);

    const numMoons = parentNode.subpatterns.length;
    const moonGeo = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);

    parentNode.subpatterns.forEach((sub, index) => {
        // High transparency glassy moon mesh
        const moonMat = new THREE.MeshPhysicalMaterial({
            color: 0xe2e8f0,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.8,
            thickness: 1.0,
            transparent: true,
            opacity: 0.75
        });

        const mesh = new THREE.Mesh(moonGeo, moonMat);
        
        // Circular offset positioning relative to planet
        const orbitRadius = 15 + index * 4.5;
        const angle = (index / numMoons) * Math.PI * 2;

        mesh.position.set(orbitRadius * Math.cos(angle), 0, orbitRadius * Math.sin(angle));
        activeMoonContainer.add(mesh);

        // Add subpattern tag labels
        const labelDiv = document.createElement('div');
        labelDiv.className = 'v2-moon-label';
        labelDiv.textContent = sub.label;

        const labelObj = new THREE.CSS2DObject(labelDiv);
        labelObj.position.set(0, MOON_RADIUS + 2.0, 0);
        mesh.add(labelObj);

        activeMoons.push({
            mesh: mesh,
            labelElement: labelDiv,
            radius: orbitRadius,
            angle: angle,
            // Revolution speed
            speed: 0.015 + (index * 0.004)
        });
    });
}

// Destroys satellite moons
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

// Animate positions and render tick
function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // 1. Move planets revolving around Sun
    nodesData.forEach((node, i) => {
        node.angle += node.speed;
        node.x = node.orbitRadius * Math.cos(node.angle);
        node.z = node.orbitRadius * Math.sin(node.angle);
        // Sinusoidal zero-gravity wobble
        node.y = Math.sin(time * 1.5 + node.yOffset) * 2;

        const mesh = nodeMeshes[i];
        if (mesh) {
            mesh.position.set(node.x, node.y, node.z);
        }
    });

    // 2. Move active moons revolving around selected planet
    if (activeMoonContainer && selectedNodeId) {
        const parentNode = nodesData.find(n => n.id === selectedNodeId);
        if (parentNode) {
            // Keep container locked onto parent coordinate
            activeMoonContainer.position.set(parentNode.x, parentNode.y, parentNode.z);

            // Orbit each moon
            activeMoons.forEach(m => {
                m.angle += m.speed;
                m.mesh.position.set(
                    m.radius * Math.cos(m.angle),
                    Math.sin(time * 3 + m.angle) * 1.2, // dynamic vertical sway
                    m.radius * Math.sin(m.angle)
                );
            });
        }
    }

    // 3. Stretch link connection lines dynamically
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

    // 4. Update Orbit camera damping
    if (controls) {
        controls.update();
    }

    // 5. Draw
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
    if (labelRenderer && scene && camera) {
        labelRenderer.render(scene, camera);
    }
}

// Selects planet, flies camera, spawns moons, and opens panel drawer
let activeFlightAnimation = null;
window.selectNode = function(nodeId) {
    const node = nodesData.find(n => n.id === nodeId);
    if (!node) return;

    selectedNodeId = nodeId;

    // 1. Highlight HTML labels
    nodesData.forEach(n => {
        if (n.labelElement) n.labelElement.classList.remove("selected");
    });
    const label = document.getElementById(`v2-label-${nodeId}`);
    if (label) {
        label.classList.add("selected");
    }

    // 2. Adjust planet sizes (scale selected planet up, rest normal)
    nodesData.forEach((n, idx) => {
        const mesh = nodeMeshes[idx];
        if (mesh) {
            const scale = (n.id === nodeId) ? 1.6 : 1.0;
            mesh.scale.set(scale, scale, scale);
        }
    });

    // 3. Mark pattern as explored
    if (typeof window.markPatternVisited === "function") {
        window.markPatternVisited(nodeId);
    }

    // 4. Spawn orbiting moons
    spawnMoons(node);

    // 5. Open side drawer panel
    if (typeof openPanel === "function") {
        openPanel(nodeId);
    }

    // 6. Animate Orbit Camera Focus flight to target
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
    const endCamX = tx;
    const endCamY = ty + 40;
    const endCamZ = tz + 75;

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

// Search filter: fades non-matching orbits, planets, and link lines
function filterNodes3D(query) {
    if (query === "") {
        // Restore all
        nodesData.forEach((n, idx) => {
            const mesh = nodeMeshes[idx];
            if (mesh) mesh.scale.set(1.0, 1.0, 1.0);
            if (n.labelElement) n.labelElement.classList.remove("faded");
        });
        linkLines.forEach(item => {
            if (item.line) item.line.material.opacity = 0.45;
        });
        orbitLines.forEach(orbit => {
            if (orbit.line) orbit.line.material.opacity = 0.32;
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
    nodesData.forEach((n, idx) => {
        const mesh = nodeMeshes[idx];
        const matches = matchesQuery(n, query);
        
        if (mesh) {
            const targetScale = matches ? 1.3 : 0.3;
            mesh.scale.set(targetScale, targetScale, targetScale);
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
            orbit.line.material.opacity = hasMatchInTier ? 0.4 : 0.03;
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
    nodesData.forEach((n, idx) => {
        const mesh = nodeMeshes[idx];
        if (mesh) mesh.scale.set(1.0, 1.0, 1.0);
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

// UI Elements Injection & Listeners on Page Load
document.addEventListener("DOMContentLoaded", () => {
    // Initialize ThreeJS Solar System
    init3D();
    initStarfield();
    initOrbits();
    initSun();
    buildSolarSystem();
    animate();

    // 1. Create Tooltip & Guided Tour Toast overlays programmatically
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
                    <div class="legend-item"><span class="legend-color" style="background:#e0f2fe; border: 1.5px solid #0284c7;"></span> Tier 0: Basics (Arrays/Stack)</div>
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
            nodesData.forEach((n, idx) => {
                const mesh = nodeMeshes[idx];
                if (mesh) mesh.scale.set(1.0, 1.0, 1.0);
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
            // Check if user clicked background, not a label/button
            if (e.target.id === "canvas3d" || e.target.tagName === "CANVAS") {
                window.stopStudyTour();
                closePanel();
                clearMoons();
                selectedNodeId = null;
                
                // Return selected scales to normal
                nodesData.forEach((n, idx) => {
                    const mesh = nodeMeshes[idx];
                    if (mesh) mesh.scale.set(1.0, 1.0, 1.0);
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
