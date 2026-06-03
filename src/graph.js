/**
 * D3 Force Directed Graph logic for DSA patterns.
 * Implements force simulation, nodes/edges rendering, tier-coloring, text wrapping, drag & zoom.
 * Step 8 enhancements: Fly-out entry animations, interactive hover tooltips, and responsive centering.
 */
console.log("graph.js loaded. Initializing visualization...");

// Global simulation reference
window.graphSimulation = null;

// Color scheme by tier (Light Theme pastels)
const TIER_COLORS = {
    0: "#e0f2fe",  // Sky blue
    1: "#ede9fe",  // Violet
    2: "#dcfce7",  // Emerald
    3: "#fef3c7",  // Amber
    4: "#ffe4e6",  // Rose
    5: "#fae8ff",  // Fuchsia
    6: "#fef9c3"   // Yellow
};

// High-contrast stroke colors by tier
const TIER_STROKE_COLORS = {
    0: "#0284c7",
    1: "#7c3aed",
    2: "#059669",
    3: "#d97706",
    4: "#e11d48",
    5: "#c084fc",
    6: "#ca8a04"
};

function initGraph() {
    const svg = d3.select("#graph");
    if (!svg.node()) return;

    // Clear any previous elements in case of re-init
    svg.selectAll("*").remove();

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Setup arrowhead markers for directed graph links
    const defs = svg.append("defs");
    defs.append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 48)  // Offset marker back by circle radius (40) + arrowhead length (~8)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .append("path")
        .attr("d", "M0,-4 L8,0 L0,4")
        .attr("fill", "#94a3b8"); // Light mode cool grey arrowhead

    // Zoom container (contains all links and nodes)
    const container = svg.append("g").attr("class", "graph-container");

    // Configure Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.2, 3.0])
        .on("zoom", (event) => {
            container.attr("transform", event.transform);
        });
    
    svg.call(zoom);

    // Prepare D3 nodes and links from PATTERNS data
    // Fly-out Entry Animation: Position nodes in the center with a slight random offset
    const nodes = PATTERNS.map(p => ({
        id: p.id,
        label: p.label,
        tier: p.tier,
        subpatterns: p.subpatterns,
        x: width / 2 + (Math.random() - 0.5) * 15,
        y: height / 2 + (Math.random() - 0.5) * 15
    }));

    const links = [];
    PATTERNS.forEach(p => {
        if (p.dependencies) {
            p.dependencies.forEach(depId => {
                links.push({
                    source: depId,
                    target: p.id
                });
            });
        }
    });

    // Create D3 Force Simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(135))
        .force("charge", d3.forceManyBody().strength(-480))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(58));

    window.graphSimulation = simulation;

    // Render Edges (Links)
    const link = container.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "edge-line")
        .attr("marker-end", "url(#arrowhead)");

    // Render Node Group Containers
    const node = container.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node-group")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

    // Selection helper for tooltip card
    const tooltip = d3.select("#tooltip");

    // Render Circle Background for Nodes
    node.append("circle")
        .attr("r", 40)
        .attr("fill", d => TIER_COLORS[d.tier] || "#f3f4f6")
        .attr("stroke", d => TIER_STROKE_COLORS[d.tier] || "#d1d5db")
        .attr("stroke-width", 2)
        .attr("class", "node-circle")
        .on("click", function(event, d) {
            event.stopPropagation(); // Prevent background click from closing
            
            // Remove highlight ring from all nodes
            d3.selectAll(".node-circle").classed("node-selected", false);
            
            // Add white highlight ring to clicked node
            d3.select(this).classed("node-selected", true);
            
            // Trigger side panel rendering
            if (typeof openPanel === "function") {
                openPanel(d.id);
            }
        })
        .on("mouseover", function(event, d) {
            // Count total problems
            const totalQ = d.subpatterns.reduce((sum, sub) => sum + sub.questions.length, 0);
            
            // Render tooltip text content
            tooltip.html(`
                <h4>${d.label}</h4>
                <div class="tooltip-meta">Tier ${d.tier} • ${d.subpatterns.length} Subpatterns</div>
                <div class="tooltip-counts">${totalQ} LeetCode Problems</div>
            `);
            tooltip.classed("hidden", false);
        })
        .on("mousemove", function(event) {
            // Align tooltip layout above cursor position
            tooltip
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseout", function() {
            tooltip.classed("hidden", true);
        });

    // Render Centered Wrapped Labels
    node.each(function(d) {
        const el = d3.select(this);
        const words = d.label.split(/\s+/);
        
        const text = el.append("text")
            .attr("text-anchor", "middle")
            .attr("class", "node-label")
            .style("pointer-events", "none");

        // Split text dynamically into lines depending on word lengths
        let lines = [];
        if (words.length <= 2) {
            lines = words;
        } else {
            let currentLine = "";
            words.forEach(w => {
                if (currentLine && (currentLine.length + w.length > 11)) {
                    lines.push(currentLine);
                    currentLine = w;
                } else {
                    currentLine = currentLine ? (currentLine + " " + w) : w;
                }
            });
            if (currentLine) lines.push(currentLine);
        }

        const totalLines = lines.length;
        const lineHeight = 12; // vertical line-height spacing
        const startDy = -((totalLines - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
            text.append("tspan")
                .attr("x", 0)
                .attr("dy", i === 0 ? `${startDy + 3}px` : `${lineHeight}px`)
                .text(line);
        });
    });

    // Update positions on simulation tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    // Drag behavior helper functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Save elements onto window for interactions.js access
    window.graphElements = {
        svg,
        container,
        zoom,
        node,
        link
    };
}

// Re-heat simulation and center graph on window resize
window.addEventListener("resize", () => {
    if (window.graphSimulation) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        window.graphSimulation.force("center", d3.forceCenter(width / 2, height / 2));
        window.graphSimulation.alpha(0.3).restart();
    }
});

// Run setup when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    initGraph();
});
