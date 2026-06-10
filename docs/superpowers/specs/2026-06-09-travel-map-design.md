# Travel Map — Design Spec

**Date:** 2026-06-09
**Route:** `/tools/travel-map`
**Status:** Approved by Ade. Implementation scheduled as an autonomous cloud run — this spec answers every design question up front; the implementing agent should not need to make product decisions.

## Summary

An interactive "where I've traveled" map under the site's `/tools` section. A flat, poster-style SVG world map where visited countries are filled in the theme's primary color. Clicking a visited place opens a diary popup listing dated visits ("March 2024 — cherry blossom trip · Tokyo, Kyoto"). Clicking the United States drills down into a US states map with the same behavior per state. A stats header shows running totals. Travel data lives in a TypeScript file in the repo.

## Decisions (all locked)

| Question | Decision |
|---|---|
| Map style | Flat SVG poster map. No tiles, no panning. NOT Leaflet, NOT a globe. |
| Rendering stack | `d3-geo` + `topojson-client`, hand-rolled React SVG. NOT react-simple-maps. |
| World projection | `geoNaturalEarth1`, fitted to the SVG viewBox. Antarctica may be filtered out for a tighter poster crop. |
| US projection | `geoAlbersUsa` (handles Alaska/Hawaii insets automatically). |
| US states UX | Drill-down: clicking the US on the world map transitions to a full US states view with a "← World" back button. NOT tabs/toggle. |
| Fill style | Uniform fill for all visited places: `theme.palette.primary.main` (purple `#5D3FD3` light mode, neon green `#08FF00` dark mode). No heatmap/intensity. |
| Unvisited places | Theme-adaptive neutral gray (light mode: light gray fill with white strokes; dark mode: dark gray fill with near-black strokes). Hover shows name tooltip but click does nothing (no popup). |
| Popup content | Per visit, newest first: date as "March 2024" (from `YYYY-MM`), optional one-line note, optional cities list. No photos. |
| Popup component | Desktop: MUI `Popover` anchored near the click. Mobile (`sm` and below): MUI `Dialog` (fullWidth). |
| Stats header | Above the map: `X / 195 countries · Y / 50 states`. Denominators are constants 195 and 50. The US counts as a visited country if it has country-level visits OR any visited state. |
| Data storage | Hardcoded TS file in the repo (`travelData.ts`). No Firebase, no admin UI. |
| Data entry | Ade edits the file and redeploys. Ship with clearly-marked sample data (see Data section). |
| Tools registration | New card in `ToolsIndex.tsx` + lazy route in `App.tsx`, following the existing pattern exactly. |
| Navbar | Shown, same as other tool pages. |

## Architecture

New directory: `src/views/tools/travel-map/`

```
travel-map/
  TravelMap.tsx      — page shell: stats header, view state machine (world | us), renders WorldMap or USMap
  WorldMap.tsx       — world SVG: builds features from countries-110m TopoJSON, geoNaturalEarth1
  USMap.tsx          — US SVG: builds features from states-10m TopoJSON, geoAlbersUsa
  GeoShape.tsx       — single <path>: fill/hover/click/aria, shared by both maps
  PlacePopup.tsx     — Popover/Dialog showing a place's visit diary
  travelData.ts      — the diary data + place id maps
  geo.ts             — pure utils: topojson→features, path generators, formatVisitDate, computeStats, isVisited
  useGeoData.ts      — hook: fetches /data/*.json TopoJSON, loading/error state
```

### Geo data files

Commit the TopoJSON to `public/data/`:
- `public/data/countries-110m.json` — from the `world-atlas` npm package (v2)
- `public/data/states-10m.json` — from the `us-atlas` npm package (v3)

Obtain by `npm i -D world-atlas us-atlas` and copying the two files out of `node_modules` into `public/data/` (the dev-deps stay in `package.json` for provenance). Runtime deps added: `d3-geo`, `topojson-client`, plus `@types/d3-geo` and `@types/topojson-client` as dev-deps.

### Data model (`travelData.ts`)

```ts
export interface Visit {
  /** 'YYYY-MM', e.g. '2024-03' */
  date: string;
  /** one-line diary note */
  note?: string;
  /** cities visited on this trip */
  cities?: string[];
}

export interface Place {
  /** world-atlas numeric ISO id for countries (e.g. '392' = Japan),
      us-atlas FIPS id for states (e.g. '36' = New York) */
  id: string;
  /** display name, must match for readability but matching is BY ID */
  name: string;
  visits: Visit[];
}

export const visitedCountries: Place[] = [ /* … */ ];
export const visitedStates: Place[] = [ /* … */ ];
```

Ship with 2–3 sample entries in each array, each tagged `// SAMPLE — replace with real history`, and a top-of-file comment block: `// TODO(ade): replace sample data with your real travel diary. Find country ids in countries-110m.json (ISO 3166-1 numeric), state ids in states-10m.json (FIPS).` Do NOT invent a real travel history.

### Interactions

- **Hover (desktop):** shape brightens (opacity/stroke emphasis) and a lightweight tooltip shows the place name, plus visit count if visited. MUI `Tooltip` or a simple positioned div — implementer's choice.
- **Click visited place:** opens `PlacePopup` with the diary entries.
- **Click unvisited place:** nothing.
- **Click the US on the world map:** transitions to the US view. Transition: a simple crossfade (~300ms, e.g. CSS opacity) between the two SVGs is sufficient; an animated projection zoom is NOT required.
- **"← World" button** in the US view returns to the world map (same crossfade).
- **Keyboard/a11y:** visited shapes get `role="button"`, `tabIndex={0}`, `aria-label` ("Japan, 2 visits"), and Enter/Space opens the popup. Unvisited shapes are plain paths with a `<title>` for the name.
- **Mobile:** SVG scales via `viewBox` + `width: 100%`. Tap = click. Popup becomes fullWidth `Dialog` below the `sm` breakpoint.

### Theming

All colors come from the MUI theme via `useTheme()` — no hardcoded hex in components:
- Visited fill: `palette.primary.main`; hover: slightly emphasized (e.g. `filter: brightness(1.15)` or stroke in `palette.primary.light`).
- Unvisited fill/stroke: derive from `palette.mode` (light: `grey[300]` fill / `#fff` stroke; dark: `grey[800]` fill / `grey[900]` stroke).
- Stats header uses the site's heading font (Space Mono, via `Typography`).
- Must look correct in both modes — test by toggling the navbar switch.

### Error handling

- TopoJSON fetch failure → MUI `Alert severity="error"` with a Retry button in place of the map.
- While loading → centered `CircularProgress`.
- `travelData.ts` correctness is enforced by the TS types at compile time; `computeStats` must tolerate empty arrays.

### Testing

CRA Jest + React Testing Library (already configured):
- `geo.test.ts` — `formatVisitDate('2024-03') === 'March 2024'` (IMPORTANT: parse the `YYYY-MM` string manually — `new Date('2024-03')` is UTC midnight and renders as February in US timezones); `computeStats` counts distinct visited places, applies the US-counts-if-states-visited rule, tolerates empty data; `isVisited` id matching.
- `PlacePopup.test.tsx` — renders date, note, cities; sorts newest first; omits missing optional fields cleanly.
- `TravelMap.test.tsx` — smoke test with mocked fetch: renders stats header, swaps to US view on US click, back button returns.

### Registration

1. `ToolsIndex.tsx` tools array: `{ path: '/tools/travel-map', title: 'Travel Map', description: 'An interactive map of everywhere I\'ve traveled — click a country or state to read the diary.' }`
2. `App.tsx`: lazy import + `<Route path="/tools/travel-map" element={<TravelMap />} />`, matching the existing lazy-route pattern.

## Out of scope (do not build)

- Firebase/admin editing UI, photo support, visit-count heatmap, world/US toggle tabs, animated projection-morph zoom, city-level pins, sharing/export features.
