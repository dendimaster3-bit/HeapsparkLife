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

Pages: `/` the game · `/kit` building-kit showroom (toggle open/closed, promo, growth level, gold, night).

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

## Building kit

A building = **base shape** (kiosk, shop, two-storey, large venue) + **signature prop** + **signboard** (name in brand colour, uploaded logo if any) + **state decorators**:

| State | Look |
|---|---|
| Unclaimed plot | grey pad with a "+" marker; "Claim this spot" label in the current town |
| Open / closed | windows and signboard lit or dark, following the business's hours in Mauritius time; props animate only when open |
| Active promo | soft yellow light beam with sparkles (visible from the district view) |
| Growth level 1–3 | bigger building, planters + flag at L2, taller flag + neon roof trim at L3 |
| Founding Member | gold roof/trim and a spinning gold star |

**Adding a subcategory that reuses a look:** add one row to `SUBCATEGORIES` in `src/data/categories.ts`.

**Adding a brand-new look:** write a prop component in `src/game/buildings/props/` (it receives the base dimensions, brand colour and materials), then add one entry to `BUILDING_STYLES` in `src/game/buildings/registry.ts`.

Plots are generated along the streets of every town (`src/game/world/plots.ts`, ids `<townId>-<n>`). Demo businesses live in `src/data/demoBusinesses.ts` and are all flagged `isDemo`.

## Business cards, search and tracking

- **Business card:** tap a building (or a search result). It shows the category, town and district, open status with the next opening time, Call / WhatsApp / Website buttons, active promos, and under "More details": description, photos and weekly hours. It's a bottom sheet on phones and a side panel on wider screens, and the camera turns to the shop front and frames it beside the card.
- **Search** (🔍 in the top bar): free text (accent-insensitive, matches name, type, category, town, district, description) plus category → subcategory, district, *Open now* and *With promo* filters. Tap a result to fly there; **Show on map** pins every result and frames them.
- **Tracking:** `view` (building shown at town zoom, once per session), `cardOpen`, `call`, `whatsapp`, `website` via `api.events.track`. The mock adapter stores them anonymously in localStorage (capped at 5,000) for the business stats screen in step (g).

## Controls

- **Phone:** drag to move, pinch to zoom, two fingers to rotate/tilt.
- **Desktop:** left-drag to move, scroll to zoom, right-drag to rotate.
- Tap a district or town label (or a chip in the bottom bar) to fly there; use ← or the breadcrumb to zoom back out.
