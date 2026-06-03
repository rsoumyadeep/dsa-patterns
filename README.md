# DSA Pattern Dependency Graph

An interactive, browser-based visualizer for Data Structures and Algorithms (DSA) pattern dependencies. 

This project maps **19 core DSA patterns** across **7 learning tiers (Tiers 0–6)** as a Directed Acyclic Graph (DAG). It serves as a visual syllabus to guide students through the optimal topological study order, from basic array hashing up to complex 2D dynamic programming.

---

## 🌟 Key Features

*   **Interactive D3.js Simulation:** Fluid force-directed graph displaying pattern nodes, topological dependencies, and directed edge pointers. Includes smooth dragging, zoom-pan canvas controls, and layout auto-centering on resize.
*   **Modern Eye-Friendly Light Theme:** Crafted with a soft off-white grid background, clean charcoal text, glassmorphism overlays (legends, search bars, panels), and tier-colored pastel nodes with high-contrast borders.
*   **Deep Search Filtering:** Real-time search bar that filters nodes by matching pattern names, subpattern titles, or even specific LeetCode problem titles recursively (fading non-matching nodes to 15% opacity).
*   **Collapsible Study Drawer:** Expanding side-panel displaying prerequisite dependency chips, subpattern groupings (accordion cards), and tables of curated LeetCode questions with colored difficulty badges.
*   **Smooth Target Navigation:** Clicking a prerequisite chip inside the drawer triggers a camera pan and zoom transition to center on the dependency node before showing its contents.
*   **Guided Study Order Tour:** Sequentially highlights and zooms to nodes step-by-step in topological order (from zero prerequisites up to advanced topics) with a guided toast status and progress manager.
*   **Zero-Dependency Setup:** Plain HTML, CSS3, and JavaScript loaded directly in browser. Starts instantly via standard Python 3.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Visualization** | [D3.js v7](https://d3js.org/) | Force-directed graphs, zoom, panning, & DOM manipulation. |
| **Logic & Data** | Vanilla JS + JSON | Light-weight data structures loaded directly from `/data`. |
| **Styling** | CSS3 Variables + Webkit Filters | Glassmorphic cards, custom scrollbars, transitions. |
| **Dev Host** | Python 3 HTTP Server | Multi-threaded runner launching default browser automatically. |

---

## 🚀 Getting Started

No `npm` installs or packages required. Just run the built-in python script:

```bash
# Clone the repository
git clone https://github.com/rsoumyadeep/dsa-patterns.git
cd dsa-patterns

# Start the local development server
python run.py
```

The browser will automatically open to: **`http://localhost:8765`**

---

## 📂 Project Structure

```
dsa-patterns/
├── README.md               # Project documentation
├── BUILD_INSTRUCTIONS.md   # Original steps & specification guidelines
├── index.html              # Core HTML structure & D3 CDN integrations
├── style.css               # Premium CSS themes, glassmorphism, & layouts
├── run.py                  # Local Python server and browser launcher
├── data/
│   └── patterns.js         # Unified database (19 patterns, subpatterns, LeetCode URLs)
└── src/
    ├── graph.js            # D3 simulation, tooltips, force controls, & node ticks
    ├── panel.js            # Drawer rendering, collapsible details, and problem tables
    └── interactions.js     # Legend overlays, search inputs, reset events, & Study Tour
```

---

## 🔗 Learning Progression (Tiers)

The graph maps learning dependencies chronologically:
1.  **Tier 0 (Basics):** Arrays & Hashing, Stack, Bit Manipulation.
2.  **Tier 1 (Linear Algorithms):** Two Pointers, Prefix Sum, Kadane's, Binary Search.
3.  **Tier 2 (Linear Structs):** Sliding Window, Fast & Slow Pointers, Linked List.
4.  **Tier 3 (Hierarchical Structs):** Trees, Heap / Priority Queue.
5.  **Tier 4 (Advanced Non-Linear):** Backtracking, Graphs, Greedy.
6.  **Tier 5 (Strings & 1D DP):** Tries, Merge Intervals, 1D Dynamic Programming.
7.  **Tier 6 (Complex DP):** 2D Dynamic Programming.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
