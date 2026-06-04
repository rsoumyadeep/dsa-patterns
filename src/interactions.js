/**
 * User interactions and keyboard/click bindings.
 * Implements Legend card, search filters, canvas background clicks, smooth pan/zoom transitions,
 * layout resets, floating tooltip card setup, and guided topological Study Tour.
 */
console.log("interactions.js loaded.");

// Register global navigation function referenced in panel.js
window.centerNodeOnGraph = function(patternId) {
    if (!window.graphElements || !window.graphSimulation) return;

    const nodes = window.graphSimulation.nodes();
    const nodeData = nodes.find(n => n.id === patternId);
    if (!nodeData) return;

    const svg = window.graphElements.svg;
    const zoom = window.graphElements.zoom;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Target center coordinates: center screen (width/2, height/2)
    // Formula: Tx = width/2 - scale * x, Ty = height/2 - scale * y
    const scale = 1.15;
    const transform = d3.zoomIdentity
        .translate(width / 2 - scale * nodeData.x, height / 2 - scale * nodeData.y)
        .scale(scale);

    // Animate zoom transition, close current view, then re-open for the target node
    closePanel();
    
    svg.transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .call(zoom.transform, transform)
        .on("end", () => {
            openPanel(patternId);
        });
};

// Topological Sort function to get topological study order of patterns
function getTopologicalOrder() {
    const visited = new Set();
    const temp = new Set();
    const order = [];

    function visit(nodeId) {
        if (visited.has(nodeId)) return;
        if (temp.has(nodeId)) return; // Cycle guard (acyclicity verified in verify_graph.py)
        
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

// Guided Topological Study Tour globals
let tourInterval = null;
let tourActive = false;
let tourPaused = false;
let tourOrder = [];
let tourCurrentIndex = 0;

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

    // Show tour toast
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

    // Update toast description text
    const toastText = document.getElementById("tour-toast-text");
    if (toastText) {
        toastText.innerHTML = `Step ${tourCurrentIndex + 1} of ${tourOrder.length}: <strong>${node.label}</strong> (Tier ${node.tier})`;
    }

    // Animate focus centering on graph
    window.centerNodeOnGraph(nodeId);

    tourCurrentIndex++;

    // Wait 2.6s to allow reading details, then proceed
    tourInterval = setTimeout(runTourStep, 2600);
}

window.togglePauseTour = function() {
    if (!tourActive) return;

    if (tourPaused) {
        // Resume
        tourPaused = false;
        updatePauseResumeButton();
        runTourStep();
    } else {
        // Pause
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
};

function updatePauseResumeButton() {
    const btn = document.getElementById("tour-btn-pause-resume");
    if (btn) {
        btn.textContent = tourPaused ? "Resume" : "Pause";
        if (tourPaused) {
            btn.classList.add("tour-paused");
        } else {
            btn.classList.remove("tour-paused");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Create Tooltip and Guided Tour Toast overlays programmatically
    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "hidden";
    document.body.appendChild(tooltipDiv);

    const toastDiv = document.createElement("div");
    toastDiv.id = "tour-toast";
    toastDiv.className = "hidden";
    toastDiv.innerHTML = `
        <span id="tour-toast-text">Guided Tour</span>
        <div class="tour-controls">
            <button id="tour-btn-pause-resume" class="tour-btn-action" onclick="window.togglePauseTour()">Pause</button>
            <button class="tour-btn-quit" onclick="window.stopStudyTour()">Quit</button>
        </div>
    `;
    document.body.appendChild(toastDiv);

    const overlay = document.getElementById("ui-overlay");
    if (!overlay) return;

    // Inject Legend, Search Bar, and Controls programmatically
    overlay.innerHTML = `
        <!-- Top Left Legend -->
        <div id="legend-card" class="ui-card">
            <h3>Pattern Tiers</h3>
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
        </div>
    `;

    // 1. Keyboard bindings: Escape key to close panel/stop tour
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            window.stopStudyTour();
            closePanel();
        }
    });

    // 2. Click background to close panel
    const svgEl = document.getElementById("graph");
    if (svgEl) {
        svgEl.addEventListener("click", () => {
            window.stopStudyTour();
            closePanel();
        });
    }

    // 3. Search input handler
    const searchInput = document.getElementById("search-input");
    const clearBtn = document.getElementById("clear-search");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (clearBtn) {
                clearBtn.style.display = query.length > 0 ? "block" : "none";
            }
            
            filterNodes(query);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = "";
                searchInput.focus();
            }
            clearBtn.style.display = "none";
            filterNodes("");
        });
    }

    // Helper to check if a node (or its subpatterns/questions) matches the query
    function nodeMatches(d, query) {
        if (d.label.toLowerCase().includes(query)) return true;
        if (d.subpatterns) {
            return d.subpatterns.some(sub => 
                sub.label.toLowerCase().includes(query) ||
                sub.questions.some(q => q.title.toLowerCase().includes(query))
            );
        }
        return false;
    }

    // Node opacity filter helper
    function filterNodes(query) {
        if (!window.graphElements) return;

        const nodes = window.graphElements.node;
        const links = window.graphElements.link;

        if (query === "") {
            // Restore original visual states
            nodes.transition().duration(250).style("opacity", 1);
            links.transition().duration(250).style("opacity", 0.85);
            return;
        }

        // Apply opacity filtering
        nodes.each(function(d) {
            const matches = nodeMatches(d, query);
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", matches ? 1.0 : 0.15);
        });

        links.each(function(d) {
            const sourceMatches = nodeMatches(d.source, query);
            const targetMatches = nodeMatches(d.target, query);
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", (sourceMatches && targetMatches) ? 0.85 : 0.08);
        });
    }

    // 4. Study Tour button handler
    const tourBtn = document.getElementById("study-tour-btn");
    if (tourBtn) {
        tourBtn.addEventListener("click", () => {
            window.startStudyTour();
        });
    }

    // 5. Reset Layout button handler
    const resetBtn = document.getElementById("reset-layout-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            window.stopStudyTour();
            if (!window.graphElements) return;

            const svg = window.graphElements.svg;
            const zoom = window.graphElements.zoom;
            
            // Clear selections
            closePanel();

            // Smoothly pan and zoom back to default transform
            svg.transition()
                .duration(850)
                .ease(d3.easeCubicOut)
                .call(zoom.transform, d3.zoomIdentity);
        });
    }
});
