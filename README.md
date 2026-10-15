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

Pages: `/` the game · `/validate` code validation for shop staff · `/privacy` · `/terms` · `/kit` building-kit showroom (toggle open/closed, promo, growth level, gold, night).

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

## Promos, wallet and validation

- **Sign-in** is passwordless: email *or* mobile number + a 6-digit one-time code. New players add a display name and accept the privacy notice (Data Protection Act 2017). In mock mode no message is sent; the code is shown on screen. Players can sign out or **delete their data** from Settings.
- **Unlocking** a promo (business card → ✨ Unlock) asks guests to sign in first, then issues a code like `HS-7KQ2-M9XA` (crypto-random, no look-alike characters). Each player gets **one code per promo**; unlocking again shows the same code. Quantity limits, expiry and optional "code valid N days" are enforced.
- **Wallet** (🎟️ in the top bar): active codes with a badge count, plus used and expired ones. Each opens a full-screen **QR + code** to show at the counter.
- **Validation** (`/validate`): staff type the code (case, spaces and dashes don't matter) or tap **Scan QR** to use the camera. The QR holds a link to `/validate?code=…`, so a normal phone camera opens the page with the code filled in. Staff see the offer, the player's display name and any rules to check (first visit, minimum spend), then **Confirm & mark as used**. Codes are **single-use** and only valid at the issuing business.
- ⚠️ **Demo limitation:** the mock adapter stores everything in the browser's localStorage, so a code can only be validated in the same browser that unlocked it, and staff pick their business from a list. With Supabase, staff will sign in and the server will enforce ownership and single use.

## Spark Points, passport and sharing

- **Spark Points** (⚡ pill in the top bar): +10 daily visit (once per Mauritius day), +25 first time in each district, +15 per promo unlocked, +50 per code redeemed at a shop, plus badge bonuses. Rules and numbers live in `src/data/rewards.ts`. Every award has a unique key, so nothing is ever paid twice. **Points are not money and can't be cashed out** — stated in the passport, wallet, settings and `/terms`.
- **District passport:** a stamp per district the first time you enter it, a progress bar, and badges: First stamp, Explorer (5 districts), **Tour de l'Île (9/9)**, First deal, Regular. Tap an empty stamp to fly there.
- **Guests earn too.** Their progress is kept on the device and merged into the account when they sign in. Points for a code redeemed at a shop appear as a toast the next time the player opens the game.
- **Share cards:** "I unlocked 15% off at X in Heapspark Life!" (from the code screen) and "I've explored 5/9 districts…" (from the passport). A 1080×1080 image is drawn on a canvas with the island outline, and shared via the phone's share sheet (with the image where supported), WhatsApp, Facebook, Save image or Copy link. The personal code is never shared. Links like `/?b=<businessId>` open the game and fly to that business; `/?d=<districtId>` opens a district.

## Ads and founding partners

**Ad slots** are data (`src/data/adSlots.ts`): id, type, place, monthly price (placeholder MUR). Bookings (advertiser, creative, link, start/end, impressions, clicks) are separate, so admin can schedule them in step (g).

| Slot | Where |
|---|---|
| Motorway billboards | along the M1/M2 at a fraction of the road, automatically kept clear of business plots |
| Town entrances | beside the road at the edge of a town |
| Bus stops | small shelters with a poster in town centres |
| Airport arrival banner | beside the terminal **and** as the welcome card players see right after "Start exploring" |
| Plane banner | towed behind the plane looping over the beaches |
| Loading screen sponsor | on the welcome screen |

A creative is either an uploaded image or simple text (headline, line, colour) drawn on a canvas. Empty slots show **"Advertise here — heapspark.com/advertise"**. Every tap is tracked per slot (empty slots too, to show demand); tapping a booked ad flies to the advertiser's building or opens their link. Impressions count once per session when the player is in the slot's district. To keep phones fast, only the current district's ads are mounted.

**Founding partners** (`partners` table, assigned by an admin):
- **Founding Member** (first 100 businesses): permanent gold skin + star (flag on the business).
- **District Founding Partner** (one per district): its name on a gold gateway over the road into the district, a landmark-style building (bigger, gold, plaza with flags), and a "Founding partner: …" line on the district welcome card. Empty districts show "Founding partner slot available".
- **Category Founding Partner** (one per subcategory): always first in search results for its category/type, with a 🏆 badge, and a gold building.

## Controls

- **Phone:** drag to move, pinch to zoom, two fingers to rotate/tilt.
- **Desktop:** left-drag to move, scroll to zoom, right-drag to rotate.
- Tap a district or town label (or a chip in the bottom bar) to fly there; use ← or the breadcrumb to zoom back out.
