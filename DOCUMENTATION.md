# Stakeholder Relationship Visualiser — Technical Documentation

**Client:** Iberdrola (Spanish multinational utility)
**Stack:** React + Vite, D3.js (force simulation, zoom/drag), Tailwind CSS
**Data:** 34 stakeholder nodes, 47 relationship edges — mock, invented for this assignment

---

## 1. Data model

### Node

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Stable key for graph/edge references |
| `name` | string | Display name |
| `type` | enum | `client`, `government`, `regulator`, `jv_partner`, `competitor`, `supplier`, `customer`, `financier`, `union`, `ngo`, `individual` — drives color and clustering ring |
| `region` | string | Geography, shown in the sidebar |
| `relationship` | enum | `aligned` / `neutral` / `tension` / `adversarial` — the client's *overall* posture toward this stakeholder (a summary judgment, independent of any single edge) |
| `trend` | enum | `improving` / `stable` / `deteriorating` — where that overall posture is heading |
| `influence` | 1–5 | Material power this stakeholder has over the client's position — drives node size |
| `description` | string | One or two sentences of grounding context |
| `lastUpdate` | date | When this assessment was last refreshed |

### Edge

| Field | Type | Purpose |
|---|---|---|
| `source` / `target` | node ids | Endpoints |
| `type` | enum | `regulatory`, `ownership`, `commercial`, `financing`, `advocacy`, `labor`, `competitive` — the *nature* of the tie |
| `strength` | 1–5 | How material this specific tie is — drives link distance and line weight |
| `state` | enum | `improving` / `stable` / `deteriorating` — the state of *this specific relationship*, not the node's overall posture |
| `direction` | `directed` / `undirected` | Whether influence runs one way (e.g. a regulator over the client) or is mutual (e.g. two competitors) |
| `description` | string | What's actually happening on this edge right now |

**Why both a node-level `relationship`/`trend` and an edge-level `state`:** a stakeholder's overall posture and the state of one particular tie are different questions. Ofgem's *overall* relationship with Iberdrola can read as "tension / deteriorating" while a specific edge (e.g. Ofgem ↔ the UK minister) is stable — the node captures the client's summary judgment, the edge captures what's moving on a given line of exposure. Collapsing these into one field would hide exactly the kind of divergence a risk team needs to see.

We deliberately did **not** add a numeric "risk score" — a single blended number would hide the direction/magnitude information that `trend` and `state` already carry, and multiplying influence × sentiment into one index invites false precision on data that's inherently qualitative.

---

## 2. Technical approach

- **React + Vite** for the app shell, matching a stack I already use in production (an astronomical archive system I built during my ARIES internship).
- **D3.js force simulation**, not a pre-canned graph library — this gives full control over the specific layout compromise below, which off-the-shelf graph components don't expose cleanly.
- **Hybrid layout**: standard `forceLink` + `forceManyBody` (so genuinely connected nodes still pull together) is combined with a `forceRadial` per node type, placing four concentric rings — client → regulatory/ownership core → commercial layer → advisory/labor periphery. Pure force-directed layout on 34 nodes tends to produce an unreadable hairball; the radial constraint keeps categories visually separated *and* still lets the link force show real clustering within a category.
- **Zoom/pan** via `d3.zoom` on the SVG root; **drag-to-pin** via `d3.drag`, and a dragged node stays fixed (`fx`/`fy`) after release rather than snapping back — this lets the user manually declutter a crowded region, which was more useful in testing than pure auto-layout.
- **React owns state, D3 owns the DOM inside the SVG.** The simulation is built once per dataset in a `useEffect`; selection, search, and type-filter changes run in a second, cheaper effect that only toggles opacity/stroke — it does not restart the simulation, so filtering doesn't cause the whole graph to jump.
- **Sidebar** re-derives a stakeholder's connections by scanning the edge list on click — trivial at this node count, and it means the sidebar and graph can never disagree about what's connected to what.

## 3. Legibility decisions (the actual ask)

At 34 nodes, the main risks are edge clutter and label overlap. Choices made to manage this:

- **Concentric clustering by type** (above) — the reader gets a mental map (core institutional actors vs. periphery) even before touching anything.
- **Selection dims the rest of the graph** to ~10% opacity, so clicking a node turns the view into an ego-graph of just that stakeholder's direct ties.
- **Edge color/dash directly encodes trajectory** (green = improving, gray = stable, red dashed = deteriorating) rather than only being available in the sidebar — the state of things is visible at a glance, per the brief's emphasis on "how it's doing now, and where it's heading."
- **Search and per-type filters** let the user isolate one category (e.g. just regulators, or just anything containing "gov") instead of always looking at all 34 at once.
- Node **size scales with influence**, so the handful of stakeholders that actually matter most are visually dominant rather than same-sized as a minor supplier.

## 4. Scope cuts

- **No backend / no live data feed.** The brief asks for mock data; I didn't build a fetch layer or CMS for it, since that would be effort spent on infrastructure the assignment explicitly doesn't require.
- **No edge-level history/timeline scrubber.** A "how has this relationship moved over the last 6 months" slider would be a natural next feature, but it roughly doubles the data model and UI surface for a 3-day assignment; the `state`/`trend` fields cover "now vs. direction" without needing a full time series.
- **Individuals kept generic (role titles, not real people's names)** — e.g. "UK Minister for Energy Security" rather than a named person. This is invented mock data, and I didn't want fabricated positions or sentiment attached to a real named public official.
- **One client, not a multi-client switcher.** The brief asks to pick one company; building a client-switcher would be scope creep for a technical assignment about the graph itself.

## 5. Challenges

- **Tailwind v4** changed its CLI (`tailwindcss init` no longer exists) in favor of a Vite plugin (`@tailwindcss/vite`) — had to switch configuration approach mid-setup.
- **Keeping D3 and React from fighting over the DOM.** D3 wants imperative control of node/link elements; React wants to own rendering. Solved by giving D3 a single `<g>` ref to manage entirely, and keeping React state (selection, filters, search) one level up, only touched via a second, non-restarting effect.
- **Balancing link-force realism against readability.** A pure force layout with real link strengths produced a tangled mass in early iterations; the concentric radial constraint was added specifically to fix this without discarding the link force entirely (which still matters for showing e.g. a competitor sharing a supplier).

## 6. Running locally

```bash
npm install
npm run dev       # http://localhost:5173
```

## 7. Deploying to Vercel

```bash
npm install -g vercel   # if not already installed
vercel login
vercel --prod
```

Vercel auto-detects the Vite framework preset (`npm run build`, output in `dist/`) — no `vercel.json` is required.
