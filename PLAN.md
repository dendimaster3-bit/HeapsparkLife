# Heapspark Life — Step 1 Proposal

> Status: **approved**. Progress: ✅ (a) island + camera · ✅ (b) building kit · ✅ (c) business cards + search · ✅ (d) promos + wallet + validation · ✅ (e) points + passport · ✅ (f) ad slots + founding partners · ✅ (g) business portal + admin. MVP complete on mock data; next: Supabase adapter.

## 1. Architecture at a glance

```
┌──────────────────────────────── Browser ────────────────────────────────┐
│  React UI overlay (Tailwind)        R3F Canvas (3D world)               │
│  cards · search · wallet · admin    island · districts · buildings · ads│
│            │                                 │                          │
│            └──────── Zustand stores ─────────┘                          │
│                 (camera, session, world, ui)                            │
│                            │                                            │
│                  api/ (one interface: HeapsparkApi)                     │
│                  ├── mock/     ← default: seed data + localStorage      │
│                  └── supabase/ ← drop-in later, same interface          │
└─────────────────────────────────────────────────────────────────────────┘
```

Key decisions:

- **One API interface, two adapters.** All UI and game code calls `api.*` (e.g. `api.businesses.list({ districtId })`). The mock adapter runs entirely in the browser on seed data, so the game works with zero backend. The Supabase adapter implements the same interface; switching is one env var (`VITE_API=supabase`). Your real directory plugs in here.
- **Data-driven world.** Districts, towns, landmarks, roads, plots and ad slots are positions in data files, not hand-placed in components. Adding a locality = adding a row.
- **Modular building kit.** `building = baseShape + signatureProp + signboard + stateDecorators`. A new subcategory = one config entry + one prop component.
- **Performance budget.** Procedural low-poly geometry (no big GLB downloads), `InstancedMesh` for trees/houses/rocks/cars, flat/Lambert materials, `<Detailed>` LOD, per-district lazy chunks via `React.lazy`, capped DPR (≤1.5 on mobile), frame-loop on demand when idle. Target < 8 MB initial, 30+ FPS mid-range Android.
- **Routing.** Player game at `/`, business portal at `/business`, code validation at `/validate`, admin at `/admin` — each a lazy-loaded chunk so players never download admin code.

## 2. Folder structure

```
heapspark-life/
├── index.html
├── vite.config.ts · tailwind.config.ts · tsconfig.json · .env.example
├── public/
│   ├── fonts/                 # one subset webfont
│   └── textures/              # tiny shared atlases only
├── supabase/
│   ├── migrations/            # SQL schema mirroring src/types (later)
│   └── seed.sql
└── src/
    ├── main.tsx · App.tsx · routes.tsx
    ├── types/                 # domain types — the single source of truth
    │   ├── geo.ts             # District, Town, Landmark, Road, Plot
    │   ├── business.ts        # Category, Subcategory, Business, BuildingConfig
    │   ├── promo.ts           # Promo, PromoCode, Redemption
    │   ├── player.ts          # Player, PointsLedgerEntry, Badge, PassportStamp
    │   └── ads.ts             # AdSlot, AdBooking, Partner
    ├── data/                  # static seed data (edit to add content)
    │   ├── districts.ts       # 9 districts: polygon, colour accent, camera preset
    │   ├── towns.ts           # towns/localities per district (extend freely)
    │   ├── landmarks.ts       # Le Morne, Grand Bassin, Chamarel, …
    │   ├── roads.ts           # M1/M2 + main roads as polylines
    │   ├── categories.ts      # 8 main categories + subcategories
    │   ├── demoBusinesses.ts  # ~30 businesses, all flagged `isDemo: true`
    │   ├── demoPromos.ts
    │   └── adSlots.ts         # billboard/airport/bus stop/plane/loading slots
    ├── api/
    │   ├── index.ts           # picks adapter from env
    │   ├── types.ts           # HeapsparkApi interface
    │   ├── mock/              # in-memory + localStorage persistence
    │   └── supabase/          # same interface, Supabase client
    ├── store/                 # Zustand
    │   ├── useCameraStore.ts  # zoom level (island/district/town/business), target
    │   ├── useSessionStore.ts # player/business/admin session
    │   ├── useWorldStore.ts   # loaded districts, selected building, filters
    │   └── useUiStore.ts      # panels, theme, language
    ├── game/                  # everything inside the <Canvas>
    │   ├── GameCanvas.tsx
    │   ├── camera/            # CameraRig, transitions, touch/mouse controls
    │   ├── world/
    │   │   ├── Ocean.tsx · Lagoon.tsx · Reef.tsx
    │   │   ├── Island.tsx     # terrain mesh + beaches + mountains
    │   │   ├── Roads.tsx      # motorway + roads from data
    │   │   ├── DistrictZone.tsx   # lazy-loaded per district
    │   │   ├── TownCluster.tsx    # instanced filler houses + plots
    │   │   └── landmarks/     # one small component per landmark
    │   ├── ambient/           # Buses, Boats, Plane, DayNightCycle (UTC+4)
    │   ├── buildings/
    │   │   ├── Building.tsx   # composes the kit from config
    │   │   ├── bases/         # Kiosk, Shop, TwoStorey, LargeVenue
    │   │   ├── props/         # one file per subcategory signature prop
    │   │   ├── decorators/    # PromoBeam, OpenLights, GrowthLevel, GoldSkin
    │   │   ├── Signboard.tsx  # name + brand colour (+ uploaded logo)
    │   │   ├── UnclaimedPlot.tsx
    │   │   └── registry.ts    # subcategory → { base, Prop, defaults }
    │   └── ads/               # Billboard, AirportBanner, BusStopAd, PlaneBanner
    ├── ui/                    # React overlay (Tailwind)
    │   ├── hud/               # top bar: points, passport, wallet, search
    │   ├── BusinessCard.tsx
    │   ├── search/            # SearchSheet, Filters
    │   ├── wallet/            # Wallet, PromoCodeQR
    │   ├── passport/          # Passport, Badges
    │   ├── share/             # ShareCard (canvas → image + link)
    │   ├── auth/              # SignIn (email / phone)
    │   ├── legal/             # Privacy notice (DPA 2017), Terms, "points ≠ money"
    │   └── common/            # Button, Sheet, Modal, LoadingScreen (sponsor slot)
    ├── portals/
    │   ├── business/          # ClaimPlot wizard, PromoManager, Stats, Validate
    │   └── admin/             # Approvals, Partners, AdSlots, Stats, Moderation
    ├── i18n/
    │   ├── index.ts           # tiny t() + language store
    │   └── locales/ en.json · fr.json · mfe.json (Kreol Morisien)
    └── lib/                   # time (Mauritius UTC+4), hours, geo helpers, codes
```

## 3. Data model

TypeScript types are the source of truth; the Supabase schema mirrors them 1:1 (snake_case columns). IDs are string slugs in seed data (`"plaines-wilhems"`) and UUIDs for user-generated rows.

| Table | Key fields | Notes |
|---|---|---|
| **districts** | id, name, colorAccent, polygon[[x,z]], center, cameraPreset, foundingPartnerId? | 9 rows |
| **towns** | id, districtId, name, position, kind (`city`/`town`/`village`), plotSlots[] | extend to all localities |
| **landmarks** | id, districtId, name, kind, position | generic low-poly, no logos |
| **categories** | id, name, icon, color | 8 rows matching heapspark.com |
| **subcategories** | id, categoryId, name, buildingStyleId | e.g. `car-wash → car-wash` |
| **building_configs** | id (=style), baseShape (`kiosk`/`shop`/`twoStorey`/`largeVenue`), propKey, defaultColor | mirrors `game/buildings/registry.ts` |
| **businesses** | id, ownerId, name, subcategoryId, districtId, townId, plotId, brandColor, logoUrl?, photos[], phone, whatsapp, website, hours (weekly JSON), status (`pending`/`approved`/`rejected`), growthLevel 1–3, isFoundingMember, foundingMemberNo?, isDemo, createdAt | |
| **plots** | id, townId, position, rotation, businessId? | unclaimed = `businessId` null → grey marker |
| **promos** | id, businessId, title, discountType (`percent`/`amount`/`freebie`), discountValue, quantityLimit, quantityUnlocked, expiresAt, rules {firstVisitOnly, minSpend?, oncePerPlayer}, status (`pending`/`active`/`expired`), pointsCost | |
| **promo_codes** | id, promoId, playerId, code (unique, e.g. `HS-7KQ2-M9XA`), unlockedAt, expiresAt, redeemedAt? | **unique(promoId, playerId)** → one per player; single-use via `redeemedAt` |
| **redemptions** | id, promoCodeId, businessId, validatedBy, redeemedAt, method (`typed`/`qr`) | audit trail |
| **players** | id, authUserId, displayName, homeDistrictId?, sparkPoints (derived cache), lastDailyVisit, createdAt | minimal PII: email *or* phone only, held by Auth |
| **points_ledger** | id, playerId, delta, reason (`daily`/`newDistrict`/`unlock`/`redeem`), refId?, createdAt | balance = SUM(delta); never cashable |
| **passport_stamps** | playerId, districtId, stampedAt | PK(playerId, districtId) |
| **badges** / **player_badges** | id, name, rule · playerId, badgeId, earnedAt | e.g. "Tour de l'Île" for 9/9 |
| **ad_slots** | id, type (`billboard`/`airport`/`busStop`/`planeBanner`/`loadingScreen`/`townEntrance`), districtId?, position, rotation, pricePerMonth (MUR) | rendered from data |
| **ad_bookings** | id, slotId, advertiserBusinessId?, creativeUrl, linkUrl, startDate, endDate, status, impressions, clicks | empty/expired → "Advertise here" |
| **partners** | id, type (`foundingMember`/`districtFounding`/`categoryFounding`), businessId, districtId?, subcategoryId?, assignedBy, assignedAt | unique(type, districtId) & unique(type, subcategoryId) |
| **events** | id, businessId, type (`view`/`cardOpen`/`whatsapp`/`call`/`website`/`adClick`), playerId?, createdAt | powers business + admin stats |

Rules enforced in the API layer (and later as Postgres constraints / RLS):
- One code per player per promo; code is single-use; validation checks business ownership, expiry and `redeemedAt IS NULL`.
- Founding Member = first 100 *approved* businesses, assigned once, never sold.
- One District Founding Partner per district, one Category Founding Partner per subcategory.

## 4. Building kit — how a subcategory is added

```ts
// game/buildings/registry.ts
export const buildingRegistry = {
  'car-wash':   { base: 'shop',       Prop: CarWashBay,   defaultColor: '#1fb6ff' },
  'restaurant': { base: 'twoStorey',  Prop: Terrace,      defaultColor: '#ff7a59' },
  'street-food':{ base: 'kiosk',      Prop: FoodCart,     defaultColor: '#ffc93c' },
  'salon':      { base: 'shop',       Prop: BarberPole,   defaultColor: '#e86ec5' },
  'garage':     { base: 'largeVenue', Prop: CarLift,      defaultColor: '#5b6b7a' },
  'pharmacy':   { base: 'shop',       Prop: GreenCross,   defaultColor: '#22c55e' },
  'bakery':     { base: 'shop',       Prop: Chimney,      defaultColor: '#d9a066' },
  'home-services': { base: 'shop',    Prop: ServiceVan,   defaultColor: '#3b82f6' },
  'construction':  { base: 'largeVenue', Prop: MiniCrane, defaultColor: '#f59e0b' },
  'retail':     { base: 'shop',       Prop: AwningWindow, defaultColor: '#8b5cf6' },
} satisfies Record<string, BuildingStyle>;
```

State decorators layered on top: `OpenLights` (from hours + Mauritius time), `PromoBeam`, `GrowthLevel` (scale + extra floor/props at levels 2–3), `GoldSkin` (founding/category partner), `UnclaimedPlot`.

## 5. Build plan (each step ends runnable + a summary)

| Step | Deliverable | "Done" check |
|---|---|---|
| **a. Island + camera** | Vite/R3F scaffold, ocean/lagoon/reef, stylised island terrain, 9 coloured districts, towns, landmarks, M1/M2 + roads, Island→District→Town zoom with smooth transitions, pinch/drag/mouse, day/night (UTC+4), buses & boats, loading screen | runs on phone, all districts reachable, FPS overlay in dev |
| **b. Building kit** | 4 bases, 10 signature props, signboards, unclaimed plots, open/closed lights, promo beam, growth levels, gold skin; ~30 demo businesses placed | every subcategory visible in a "kit gallery" debug route |
| **c. Cards + search** | Tap building → business card (hours, call, WhatsApp, website, photos, promos); search + category/subcategory/district filters that fly the camera to results | event tracking for views/opens/clicks |
| **d. Promos + wallet + validation** | Guest → sign-up (email/phone, mock auth), unlock code, wallet with expiry + QR, `/validate` page (type code or scan QR), single-use enforcement | full unlock → redeem loop works |
| **e. Points + passport** | Spark Points ledger (daily, new district, unlock, redeem), passport stamps, 9/9 badge, share card image + link | "points are not money" shown in HUD + terms |
| **f. Ads + founding partners** | Billboards, airport banner, bus stops, plane banner, loading sponsor, district-entrance partner logo, gold variants; "Advertise here" fallbacks; click tracking | all slot types visible on map |
| **g. Business portal + admin** | Claim-plot wizard, promo manager, stats; admin approvals, partner assignment, ad slot/creative management, moderation, stats | MVP definition of done met |

Then: Supabase adapter + SQL migrations (can be pulled earlier if you prefer).

## 6. Questions / approvals needed

**New dependencies** (all free, open-source, small). I'd like approval for:

| Package | Why | Approx. size (gzip) | Alternative if declined |
|---|---|---|---|
| `react-router-dom` | `/`, `/business`, `/validate`, `/admin` routes | ~13 KB | hand-rolled hash router |
| `qrcode` | render QR for wallet codes | ~12 KB | none good — would hand-write an encoder |
| `@zxing/browser` (lazy, `/validate` only) | scan player QR with phone camera | ~90 KB, never loaded by players | type-the-code only |
| `@supabase/supabase-js` (lazy, only when `VITE_API=supabase`) | real backend | ~45 KB | — |

No paid services. i18n will be a tiny in-house `t()` helper (no i18next) to save weight; share cards drawn with plain `<canvas>`.

**Open questions:**
1. **Supabase now or later?** I propose mock-first (works offline, no account needed) with Supabase wired after step g. OK?
2. **Auth in MVP**: mock email/phone sign-in until Supabase, then Supabase magic link / SMS OTP (SMS costs money via a provider — happy to stay email-only at first).
3. **Category/subcategory list**: I'll draft ~4–6 subcategories per main category from what I know of heapspark.com; send me your exact list if you have it.
4. **Currency/pricing**: ad prices in MUR — any placeholder figures you want, or leave as `0` for admin to set?
5. **Hosting**: plain static build (Vercel/Netlify/Cloudflare Pages all fine). Any preference for a subpath like `heapspark.com/life`? It affects the Vite `base`.
