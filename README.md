# Heapspark Life

A cozy, low-poly 3D Mauritius for [heapspark.com](https://heapspark.com): explore the island, discover local businesses and unlock real promo codes.

See [PLAN.md](PLAN.md) for the architecture, data model and build plan.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Handy URL flags:

| Flag | What it does |
|---|---|
| `?debug` | FPS / draw-call / triangle meter and a time-of-day slider |
| `?hour=19.5` | Force the Mauritius time (e.g. to see the night lights) |

Copy `.env.example` to `.env` to change the data adapter (`VITE_API`) or serve from a sub-path (`VITE_BASE=/life/`).

## Extending the map

All map content is data. Coordinates are approximate real latitude/longitude, so you can look new places up on any map.

| To add… | Edit |
|---|---|
| A town or locality | `src/data/towns.ts` (one row) |
| A road | `src/data/roads.ts` (a list of lat/lon points) |
| A hill or mountain | `PEAKS` in `src/data/terrain.ts` |
| A landmark | a row in `src/data/landmarks.ts` + a component in `src/game/world/landmarks/` registered in `index.tsx` |
| A district boundary tweak | move or add `seeds` in `src/data/districts.ts` |
| A translation | `src/i18n/locales/{en,fr,mfe}.ts` |

## Controls

- **Phone:** drag to move, pinch to zoom, two fingers to rotate/tilt.
- **Desktop:** left-drag to move, scroll to zoom, right-drag to rotate.
- Tap a district or town label (or a chip in the bottom bar) to fly there; use ← or the breadcrumb to zoom back out.
