/**
 * Side Panel details view controller.
 * Renders pattern information, prerequisite links, collapsible subpatterns, and LeetCode problems lists.
 */
console.log("panel.js loaded.");

/**
 * Opens the detail panel, loads pattern data, and highlights the node circle.
 * @param {string} patternId 
 */
function openPanel(patternId) {
    const pattern = PATTERNS.find(p => p.id === patternId);
    if (!pattern) return;

    // Track explored pattern progress
    if (typeof window.markPatternVisited === "function") {
        window.markPatternVisited(patternId);
    }

    // Synchronize D3 visual highlight
    if (window.d3) {
        d3.selectAll(".node-circle").classed("node-selected", false);
        d3.selectAll(".node-circle").filter(d => d.id === patternId).classed("node-selected", true);
    }

    const panel = document.getElementById("panel");
    if (panel) {
        panel.className = "panel-expanded";
        
        // Render prerequisite dependencies list
        let depsHTML = "";
        if (pattern.dependencies && pattern.dependencies.length > 0) {
            depsHTML = pattern.dependencies.map(depId => {
                const dep = PATTERNS.find(p => p.id === depId);
                const depLabel = dep ? dep.label : depId;
                return `<button class="dependency-chip" onclick="navigateToPattern('${depId}')">${depLabel}</button>`;
            }).join("");
        } else {
            depsHTML = `<span class="no-dependencies">None (Tier 0 Start Pattern)</span>`;
        }

        // Tiers descriptions
        const tierNames = {
            0: "Basic Data Structures (Tier 0)",
            1: "Linear Algorithms (Tier 1)",
            2: "Advanced Linear & Lists (Tier 2)",
            3: "Hierarchical Trees & Heaps (Tier 3)",
            4: "Decision Space & DFS/BFS (Tier 4)",
            5: "Strings & Advanced Linear DP (Tier 5)",
            6: "Complex 2D Dynamic Programming (Tier 6)"
        };
        const tierName = tierNames[pattern.tier] || `Tier ${pattern.tier}`;

        // Render subpatterns list with collapsible details
        const subpatternsHTML = pattern.subpatterns.map(sub => {
            const rowsHTML = sub.questions.map(q => {
                return `
                    <tr>
                        <td><span class="problem-title">${q.title}</span></td>
                        <td><span class="difficulty-badge difficulty-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
                        <td><a href="${q.url}" target="_blank" class="solve-link">Solve ↗</a></td>
                    </tr>
                `;
            }).join("");

            return `
                <details class="subpattern-details" open>
                    <summary class="subpattern-summary">
                        <span>${sub.label}</span>
                        <span class="subpattern-count">${sub.questions.length} Problems</span>
                    </summary>
                    <div class="subpattern-content">
                        <table class="problem-table">
                            <thead>
                                <tr>
                                    <th>Problem</th>
                                    <th>Difficulty</th>
                                    <th>Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHTML}
                            </tbody>
                        </table>
                    </div>
                </details>
            `;
        }).join("");

        panel.innerHTML = `
            <div class="panel-header">
                <button class="close-btn" onclick="closePanel()">&times;</button>
                <div class="tier-badge-label" style="background-color: var(--tier-${pattern.tier});">
                    ${tierName}
                </div>
                <h2 class="panel-title">${pattern.label}</h2>
            </div>
            
            <div class="panel-section">
                <h3 class="section-title">Prerequisites</h3>
                <div class="dependencies-container">
                    ${depsHTML}
                </div>
            </div>

            <div class="panel-section">
                <h3 class="section-title">Sub-patterns</h3>
                <div class="subpatterns-container">
                    ${subpatternsHTML}
                </div>
            </div>
        `;
    }
}

/**
 * Closes the detail panel and removes selection ring from graph circles.
 */
function closePanel() {
    const panel = document.getElementById("panel");
    if (panel) {
        panel.className = "panel-collapsed";
    }
    if (window.d3) {
        d3.selectAll(".node-circle").classed("node-selected", false);
    }
}

/**
 * Routes navigation requests when clicking prerequisite chips inside the panel.
 * @param {string} patternId 
 */
function navigateToPattern(patternId) {
    if (typeof centerNodeOnGraph === "function") {
        centerNodeOnGraph(patternId);
    } else {
        openPanel(patternId);
    }
}
