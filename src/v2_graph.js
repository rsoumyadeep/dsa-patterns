/**
 * v2_graph.js — 3D Bubble Graph logic using Three.js (Version 2).
 * Features a lightweight 3D spring-embedder layout, physical glassmorphic materials,
 * projected HTML labels using CSS2DRenderer, smooth camera flight animations,
 * search filtering, progress tracking, and a Guided Study Order Tour.
 */

console.log("v2_graph.js loading...");

// Configuration variables
const NODE_RADIUS = 8;
const SPRING_LENGTH = 75;
const SPRING_K = 0.08;
const CHARGE_STRENGTH = 2000;
const GRAVITY_STRENGTH = 0.06;
const DAMPING = 0.85;

// Global Three.js objects
let scene, camera, renderer, labelRenderer, controls;
let nodesData = [];
let linksData = [];
let nodeMeshes = [];
let linkLines = [];
let animationFrameId = null;

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

// 7-Tier styling palette
const TIER_COLORS = {
    0: "#e0f2fe",  // Sky blue
    1: "#ede9fe",  // Violet
    2: "#dcfce7",  // Emerald
    3: "#fef3c7",  // Amber
    4: "#ffe4e6",  // Rose
    5: "#fae8ff",  // Fuchsia
    6: "#fef9c3"   // Yellow
};

const TIER_STROKE_COLORS = {
    0: "#0284c7",
    1: "#7c3aed",
    2: "#059669",
    3: "#d97706",
    4: "#e11d48",
    5: "#c084fc",
    6: "#ca8a04"
};

// CSS easing helper
function easeCubicOut(t) {
    return (--t) * t * t + 1;
}

// Setup Scene, WebGL, Lighting, and CSS2D Label projection
function init3D() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Core Scene & Cam
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 240);

    // 2. Transparent WebGL Renderer (underlaid grid shows through)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.getElementById("canvas3d").appendChild(renderer.domElement);

    // 3. CSS2D Renderer for HTML Labels on top of WebGL coordinates
    labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none'; // click passes through to orbit canvas
    document.getElementById("labels3d").appendChild(labelRenderer.domElement);

    // 4. Orbit Camera Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 450;
    controls.minDistance = 40;

    // 5. Soft Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight1.position.set(120, 150, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0ea5e9, 0.3); // Sky accent light
    dirLight2.position.set(-120, -150, 50);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 300);
    pointLight.position.set(0, 0, 150);
    scene.add(pointLight);
}

// Generate Nodes & Links, Apply physical glass materials
function buildGraph() {
    // 1. Prepare Nodes with random 3D starting coordinates inside a sphere
    nodesData = PATTERNS.map(p => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = 60 + Math.random() * 25;
        return {
            id: p.id,
            label: p.label,
            tier: p.tier,
            subpatterns: p.subpatterns,
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.sin(phi) * Math.sin(theta),
            z: radius * Math.cos(phi),
            vx: 0,
            vy: 0,
            vz: 0
        };
    });

    // 2. Map links from dependencies
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

    // 3. Render 3D Spheres (Nodes)
    const sphereGeo = new THREE.SphereGeometry(NODE_RADIUS, 32, 32);

    nodesData.forEach(node => {
        // High quality refractive standard/physical glass material
        const bubbleMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(TIER_COLORS[node.tier] || "#ffffff"),
            roughness: 0.12,
            metalness: 0.08,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            transmission: 0.65, // translucent glass fill
            thickness: 2.5,
            transparent: true,
            opacity: 0.92,
            ior: 1.5 // refraction ratio
        });

        const mesh = new THREE.Mesh(sphereGeo, bubbleMat);
        mesh.position.set(node.x, node.y, node.z);
        mesh.userData = { id: node.id };
        scene.add(mesh);
        nodeMeshes.push(mesh);

        // Render CSS2D projected HTML label pill
        const labelDiv = document.createElement('div');
        labelDiv.id = `v2-label-${node.id}`;
        labelDiv.className = `v2-node-label tier-${node.tier}`;
        labelDiv.innerHTML = `<span class="label-text">${node.label}</span>`;
        
        // Handle click on label
        labelDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            selectNode(node.id);
        });

        const labelObj = new THREE.CSS2DObject(labelDiv);
        labelObj.position.set(0, NODE_RADIUS + 3.5, 0); // stack label slightly above bubble
        mesh.add(labelObj);
        node.labelElement = labelDiv;
    });

    // 4. Render Edge connection lines
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.55
    });

    linksData.forEach(link => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(2 * 3); // 2 vertices (x,y,z)
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

// 3D Spring-embedder force simulation updates
function tickSimulation() {
    // 1. Repulsion (charge) between all pairs
    const len = nodesData.length;
    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            const n1 = nodesData[i];
            const n2 = nodesData[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dz = n2.z - n1.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1.0;
            
            if (dist < 180) {
                const force = CHARGE_STRENGTH / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                const fz = (dz / dist) * force;

                n1.vx -= fx;
                n1.vy -= fy;
                n1.vz -= fz;

                n2.vx += fx;
                n2.vy += fy;
                n2.vz += fz;
            }
        }
    }

    // 2. Attraction along spring links
    linksData.forEach(link => {
        const s = nodesData.find(n => n.id === link.source);
        const t = nodesData.find(n => n.id === link.target);
        if (s && t) {
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dz = t.z - s.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1.0;
            const force = (dist - SPRING_LENGTH) * SPRING_K;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            const fz = (dz / dist) * force;

            s.vx += fx;
            s.vy += fy;
            s.vz += fz;

            t.vx -= fx;
            t.vy -= fy;
            t.vz -= fz;
        }
    });

    // 3. Gravity / Centering pull
    nodesData.forEach(n => {
        n.vx -= n.x * GRAVITY_STRENGTH;
        n.vy -= n.y * GRAVITY_STRENGTH;
        n.vz -= n.z * GRAVITY_STRENGTH;
    });

    // 4. Update coordinates & apply damping
    nodesData.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.vz *= DAMPING;
    });

    // 5. Update WebGL meshes position
    nodesData.forEach((node, i) => {
        const mesh = nodeMeshes[i];
        if (mesh) {
            mesh.position.set(node.x, node.y, node.z);
        }
    });

    // 6. Update link line coordinates
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
}

// Render loop
function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // Update force positions
    tickSimulation();

    // Update camera controls
    if (controls) {
        controls.update();
    }

    // Render WebGL and CSS2D overlays
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
    if (labelRenderer && scene && camera) {
        labelRenderer.render(scene, camera);
    }
}

// Selects node, opens sidebar, highlights elements, and triggers camera flight
let activeFlightAnimation = null;
window.selectNode = function(nodeId) {
    const node = nodesData.find(n => n.id === nodeId);
    if (!node) return;

    // Close any previous panel state
    closePanel();

    // 1. Highlight labels
    nodesData.forEach(n => {
        if (n.labelElement) {
            n.labelElement.classList.remove("selected");
        }
    });
    const activeLabel = document.getElementById(`v2-label-${nodeId}`);
    if (activeLabel) {
        activeLabel.classList.add("selected");
    }

    // 2. Animate selected sphere size (scale selected up, rest normal)
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

    // 4. Open side drawer panel
    if (typeof openPanel === "function") {
        openPanel(nodeId);
    }

    // 5. Animate Orbit Camera Focus flight to target
    flyCameraTo(node.x, node.y, node.z);
};

// Smooth Camera Flight Transition (Tweening target and position)
function flyCameraTo(tx, ty, tz) {
    if (activeFlightAnimation) {
        cancelAnimationFrame(activeFlightAnimation);
    }

    const duration = 45; // frames
    let frame = 0;

    const startCamX = camera.position.x;
    const startCamY = camera.position.y;
    const startCamZ = camera.position.z;

    const startTarX = controls.target.x;
    const startTarY = controls.target.y;
    const startTarZ = controls.target.z;

    // Fly camera slightly back on the Z-axis relative to target node coordinates
    const endCamX = tx;
    const endCamY = ty;
    const endCamZ = tz + 80;

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

// Search filter: scales and fades non-matching nodes
function filterNodes3D(query) {
    if (query === "") {
        // Restore all nodes and lines
        nodesData.forEach((n, idx) => {
            const mesh = nodeMeshes[idx];
            if (mesh) mesh.scale.set(1.0, 1.0, 1.0);
            if (n.labelElement) n.labelElement.classList.remove("faded");
        });
        linkLines.forEach(item => {
            if (item.line) item.line.material.opacity = 0.55;
        });
        return;
    }

    // Check query matches
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

    // Fade link lines connecting unselected elements
    linkLines.forEach(item => {
        const sourceNode = nodesData.find(n => n.id === item.sourceId);
        const targetNode = nodesData.find(n => n.id === item.targetId);
        const sourceMatch = sourceNode && matchesQuery(sourceNode, query);
        const targetMatch = targetNode && matchesQuery(targetNode, query);
        
        if (item.line) {
            item.line.material.opacity = (sourceMatch && targetMatch) ? 0.65 : 0.05;
        }
    });
}

// Topological Sort for Study Order
function getTopologicalOrder() {
    const visited = new Set();
    const temp = new Set();
    const order = [];

    function visit(nodeId) {
        if (visited.has(nodeId)) return;
        if (temp.has(nodeId)) return; // acyclicity check
        
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

    // Proceed to next node in 3.5s (slightly longer for 3D camera travel)
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
    // Initialize ThreeJS
    init3D();
    buildGraph();
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
            
            // Scale nodes back to normal
            nodesData.forEach((n, idx) => {
                const mesh = nodeMeshes[idx];
                if (mesh) mesh.scale.set(1.0, 1.0, 1.0);
            });

            // Smoothly fly camera back to home coordinate
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
