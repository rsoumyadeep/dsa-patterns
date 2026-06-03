# DSA Pattern Dependency Graph — Build Instructions

## Project Overview

An interactive browser-based visualization of DSA pattern dependencies.
- Nodes represent the 18 DSA patterns, connected by dependency edges
- Click a node → expands to show sub-patterns
- Click a sub-pattern → shows a list of LeetCode problems with links
- Click again (or press Escape) → collapses back
- Fully self-contained: one script generates a static HTML file, open in any browser

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Visualization | [D3.js](https://d3js.org/) v7 | Best-in-class force-directed graphs, widely documented |
| Language | Vanilla JS + HTML + CSS | Zero build step, runs anywhere |
| Data | JSON embedded in JS | Self-contained, no backend needed |
| Runner | Python 3 (http.server) | Opens browser automatically, no install needed |

No npm, no bundler, no framework. Claude Code can generate and edit the entire project in one session.

---

## Project Structure

```
dsa-graph/
├── BUILD_INSTRUCTIONS.md   ← this file
├── run.py                  ← launches local server + opens browser
├── index.html              ← main entry point
├── style.css               ← layout, node styles, panel styles
├── data/
│   └── patterns.js         ← all pattern/subpattern/question data
└── src/
    ├── graph.js            ← D3 force graph: nodes, edges, simulation
    ├── panel.js            ← side panel: sub-patterns + question list
    └── interactions.js     ← click handlers, expand/collapse, keyboard
```

---

## Step-by-Step Build Guide for Claude Code

Paste these instructions into Claude Code in order. Each step is a focused prompt.

---

### Step 1 — Scaffold the project

```
Create the folder structure for a project called dsa-graph with these files:
index.html, style.css, run.py, data/patterns.js, src/graph.js, src/panel.js, src/interactions.js.

In index.html:
- Load D3.js v7 from CDN (https://cdn.jsdelivr.net/npm/d3@7)
- Link style.css
- Create a full-viewport <svg id="graph"> for the D3 graph
- Create a hidden <div id="panel"> for the side panel (sub-patterns + questions)
- Script load order: data/patterns.js → src/graph.js → src/panel.js → src/interactions.js
```

---

### Step 2 — Build the data file

```
Populate data/patterns.js with a const PATTERNS array. Each entry has this shape:

{
  id: "arrays_hashing",
  label: "Arrays & Hashing",
  tier: 0,
  dependencies: [],          // array of other pattern ids this depends on
  subpatterns: [
    {
      id: "frequency_map",
      label: "Frequency Map",
      questions: [
        { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", difficulty: "Easy" },
        ...
      ]
    }
  ]
}

Include all 18 patterns with their dependencies matching this structure:

TIER 0: arrays_hashing, stack, bit_manipulation
TIER 1: two_pointers, prefix_sum, kadanes, binary_search
TIER 2: sliding_window, fast_slow_pointers, linked_list
TIER 3: trees, heap
TIER 4: backtracking, graphs, greedy
TIER 5: tries, merge_intervals, dp_1d
TIER 6: dp_2d

Dependencies (id → depends on):
- two_pointers → arrays_hashing
- prefix_sum → arrays_hashing
- kadanes → arrays_hashing
- binary_search → arrays_hashing
- sliding_window → two_pointers
- fast_slow_pointers → two_pointers
- linked_list → fast_slow_pointers
- trees → stack
- heap → binary_search
- backtracking → trees
- graphs → trees, stack
- greedy → heap
- tries → backtracking, trees
- merge_intervals → greedy
- dp_1d → kadanes, prefix_sum, binary_search
- dp_2d → dp_1d, graphs, backtracking
- bit_manipulation → (none)

Add at least 3 subpatterns per pattern, each with 3–5 real LeetCode questions.
```

---

### Step 3 — Build the D3 force graph

```
In src/graph.js, using D3 v7:

1. Create a force simulation with:
   - forceLink (edges, distance ~120)
   - forceManyBody (strength -400)
   - forceCenter (window.innerWidth/2, window.innerHeight/2)
   - forceCollide (radius 55)

2. Draw directed edges as <line> elements with an arrowhead marker (<defs> + <marker>).

3. Draw nodes as <g> elements containing:
   - A <circle> (radius 40), fill colored by tier (use 7 distinct colors)
   - A <text> label (centered, wrapping if needed, font-size 11px)

4. Color scheme by tier:
   - Tier 0: #4A90D9  (blue)
   - Tier 1: #7B68EE  (medium slate blue)
   - Tier 2: #50C878  (emerald)
   - Tier 3: #FFB347  (orange)
   - Tier 4: #FF6B6B  (coral)
   - Tier 5: #DDA0DD  (plum)
   - Tier 6: #F0E68C  (khaki)

5. Add a drag behavior so nodes can be repositioned.

6. Add a zoom/pan behavior on the SVG.

7. On node click, call openPanel(patternId) from panel.js.

8. Export the simulation as window.graphSimulation.
```

---

### Step 4 — Build the side panel

```
In src/panel.js, build openPanel(patternId) and closePanel():

openPanel(patternId):
1. Look up the pattern from PATTERNS by id.
2. Show #panel (slide in from the right, CSS transition).
3. Render inside #panel:
   - Pattern name as <h2>
   - Tier badge
   - "Dependencies: X, Y, Z" as clickable chips (clicking navigates to that node)
   - A list of subpatterns as collapsible <details> elements:
     - <summary> = subpattern label
     - Inside: a table with columns: Problem | Difficulty | Link
     - Difficulty colored: Easy=green, Medium=orange, Hard=red
   - A close button (×) in the top-right corner

closePanel():
1. Hide #panel with a slide-out transition.
2. Deselect the active node (remove highlight ring).

When a node is selected, add a white glowing ring around its circle.
```

---

### Step 5 — Build interactions

```
In src/interactions.js:

1. Escape key → closePanel()
2. Clicking the SVG background (not a node) → closePanel()
3. Clicking a dependency chip in the panel → closePanel(), then re-open panel for that pattern, and smoothly pan/zoom the graph to center on that node using d3.zoom transform.
4. Add a top-left legend showing tier colors and labels (Tier 0 = No dependencies ... Tier 6 = DP 2D).
5. Add a top-right search bar: typing filters nodes by label (non-matching nodes fade to 20% opacity, matching nodes highlight).
6. Add a "Reset Layout" button that re-centers and re-fits the graph.
```

---

### Step 6 — Styling

```
In style.css:

- Dark background: #0f1117
- Panel: fixed, right: 0, top: 0, width 380px, full height, background #1a1d27, 
  box-shadow left, z-index 100, overflow-y scroll
- Panel slide-in: transform translateX(100%) → translateX(0), transition 0.25s ease
- Node circles: cursor pointer, transition fill 0.2s
- Node hover: brightness(1.3) filter
- Selected node: drop-shadow(0 0 12px white)
- Edge lines: stroke #444, stroke-width 1.5, marker-end arrowhead
- Details/summary: styled as cards with border #2a2d3a, padding, margin-bottom
- Difficulty badges: inline-block, border-radius 4px, padding 2px 8px
  Easy: background #1a3a1a color #50C878
  Medium: background #3a2a0a color #FFB347
  Hard: background #3a1a1a color #FF6B6B
- Search bar: positioned top-right, dark input, border #444
- Legend: top-left, semi-transparent dark card
```

---

### Step 7 — Runner script

```
Create run.py:

import subprocess, sys, time, threading, webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

PORT = 8765

def open_browser():
    time.sleep(0.8)
    webbrowser.open(f"http://localhost:{PORT}")

os.chdir(os.path.dirname(os.path.abspath(__file__)))
threading.Thread(target=open_browser, daemon=True).start()
print(f"DSA Graph running at http://localhost:{PORT} — Ctrl+C to stop")
HTTPServer(("", PORT), SimpleHTTPRequestHandler).serve_forever()
```

---

### Step 8 — Final polish (do last)

```
1. Make the graph responsive: on window resize, update forceCenter and re-heat simulation.
2. Add a small tooltip on node hover showing: pattern name, tier, number of questions total.
3. On initial load, run a "fly-in" animation: nodes start at center and spread out.
4. Add a "Study Order" button that highlights nodes one by one in the optimal topological 
   order (from BUILD_INSTRUCTIONS), with a 1s delay between each, like a guided tour.
```

---

## Running the Project

```bash
# Clone / create the folder
cd dsa-graph

# Run (Python 3 required, no other dependencies)
python run.py

# Browser opens automatically at http://localhost:8765
```

---

## Extending Later

| Feature | How |
|---|---|
| Add more questions | Edit `data/patterns.js` only |
| Track solved problems | Add a `solved: bool` field per question; persist in `localStorage` |
| Export study plan | Add a button that prints the topological order as a checklist PDF |
| Add your own notes | Add a `notes` field per pattern; render as an editable textarea in the panel |

---

## Notes for Claude Code Session

- Build in the order of Steps 1–8 above — each step depends on the previous.
- After Step 2, ask Claude Code to verify the dependency graph is acyclic before continuing.
- After Step 5, do a full interaction test before styling.
- Keep `data/patterns.js` as the single source of truth — never hardcode pattern data in graph.js or panel.js.