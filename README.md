# Food Rescue Impact Dashboard — Interactive Prototype

A clickable UX prototype built from the approved requirements specification
(`Food Rescue Impact Dashboard – Requirements Specification`). It is **not**
production-ready — see the explanation given alongside this build for what's
real, what's simulated, and what still needs backend work.

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

## What's here

- `/` — Impact heatmap overview (Australia/Victoria toggle, legend, stats, weekly trend chart, recent activity)
- `/record` — Volunteer delivery entry form
- `/agencies` — Admin agency management (add/edit/remove, with mock address geocoding)

All data is in-memory mock data (see `src/data/mockData.ts`) — nothing is
persisted to a server, and refreshing the page resets it back to the seeded
state.

## Stack

React + TypeScript + Vite, Tailwind CSS, React Router, Leaflet (via
react-leaflet) with a custom canvas heat layer, and Recharts for the trend
chart.
