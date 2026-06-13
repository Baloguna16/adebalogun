# Nigeria Election Tracker — Design Spec

**Date:** 2026-06-13
**Status:** Approved (brainstorming, revised after product + engineering critique) — ready for implementation planning
**Research brief:** `docs/superpowers/research/2026-06-13-nigeria-elections-2027.md`
**Route:** `/projects/nigeria`

## 1. Goal

An interactive, per-state map of Nigeria (36 states + FCT) tracking the country's elections, NYT-style, targeted at **diaspora trying to stay informed**. v1 ships the elections map as a self-contained page; future "Nigeria news" trackers, if built, are independent sibling modules (no shared shell is built now).

**The product is its trustworthiness, not its rendering.** Freshness and confidence are first-class, per-state, and visible.

### Scope decisions (locked)
- **v1 = elections map, honestly curated.** No live results feed exists (research §6); v1 is hand-curated with **per-state** freshness/source/confidence.
- **Two factual color layers + one editorial annotation:** **Party control** (default, fact), **Election timing** (fact), **Races to watch** (opt-in editorial annotation — sparse markers, never the default, never a choropleth, tied to named sources).
- **Curated now, live-ready later:** each state reserves `result?: null` (shape intentionally unspecified until live ingestion exists).
- **Diaspora-can't-vote is surfaced copy** (research §5).
- **Theme:** inherit the site's MUI light/dark theming; party colors are self-contained (see §6).
- **Out of v1:** live results, 2023 historical results, per-state news, a `/projects/nigeria` hub shell.

## 2. Non-goals

- No live/real-time results ingestion. No voter-registration/diaspora-voting tooling. No backend.
- Not editable without a redeploy — and that is fine (site deploys by pushing; the typed module is what enables the integrity + staleness tests). Considered and rejected: editable `/public` JSON (forfeits type safety for no real gain).

## 3. Architecture

**Honest reuse accounting** (verified against the travel-map code):
- **Reuses cleanly:** `useGeoData` (`useGeoData.ts:10-46`, generic `(url)→{topology,loading,error,retry}`) — *call it exactly like `TravelMap.tsx:33-34`, i.e. with `` `${process.env.PUBLIC_URL}/data/nigeria-states.json` ``, or it breaks on non-root deploy bases (gh-pages/Cloud Run)*. Responsive-`viewBox` SVG approach (`WorldMap.tsx:21-25`). Lazy-route + `DirectoryList` registration.
- **Net-new (semantics differ):** `geo.ts` — travel-map joins on numeric `String(f.id)` (`geo.ts:62`) and uses `geoNaturalEarth1`; Nigeria joins on `feature.properties.shapeISO` and a Nigeria-fitted projection, and the helper must **throw on a missing/empty `shapeISO`**, not silently `.filter()` it out (travel-map's `geo.ts:75` drops empties — that would make the integrity test lie). The shape/fill renderer — `GeoShape.tsx` is reusable as **a11y scaffolding** (`aria-label` `:69`, MUI `Tooltip` `:55`, `role/tabIndex` `:67-68`, Enter/Space `:44-52`) but **0% reusable as a renderer**: it does a binary `visited?primary.main:grey` fill (`:28-32`) and wraps a single `<path>` in a `Tooltip` (so an inline `<text>` label needs a restructure, not an add). The map container, reducer, list, and panel are new.

```
src/views/projects/nigeria/
  NigeriaElections.tsx     page container
  ElectionMap.tsx          SVG map; owns the interaction reducer (§3.1)
  StateList.tsx            searchable state list — canonical keyboard + mobile entry point
  StatePanel.tsx           detail panel (facts + confidence chip + asOf/source)
  LayerToggle.tsx          party/timing switch + races-to-watch toggle (hidden if no watch data)
  Legend.tsx               legend driven by active layer
  KeyDates.tsx             upcoming-elections strip
  PresidentialRace.tsx     candidate cards ("field as of …; subject to primaries")
  electionData.ts          single typed source of truth (curated)
  parties.ts               party metadata + self-contained CVD-safe per-mode color tokens
  geo.ts                   Nigeria projection + topojson→features (ISO join, throws on missing ISO)
  staleness.ts             pure isStale(asOf, now, thresholdDays)
  index.ts
  MAINTENANCE.md           re-verify checklist + source URLs (research §7) + watch-list + the exact conversion command
public/data/nigeria-states.json   COMMITTED converted TopoJSON (see §7)
scripts/verify-nigeria-topojson.mjs   one-shot assertion script (see §7/§13)
```

Routing: lazy route `/projects/nigeria` in `src/App.tsx` (mirror `:31`/`:118`); one `DirectoryEntry` ("Nigeria Elections", `date:"2026-06"`, tags `#nigeria #elections`) in `ProjectPosts.tsx`.

### 3.1 Interaction model (one reducer, not four `useState`s)

State: `{ activeLayer: 'party'|'timing', hovered: iso|null, pinned: iso|null, showWatch: boolean }`. Explicit transitions — these are the bug-prone interactions:

- **Panel content = `pinned ?? hovered`.** Once pinned, hover does **not** overwrite panel content (hover may drive only a transient highlight).
- **`mouseleave` clears `hovered` only — never `pinned`.** (Separate atoms; leave must not blank a pinned panel.)
- **StateList select and map click both set `pinned`** (toggle off if same). The list is the alternate path to the *same* pinned state.
- **Touch/mobile:** there is no hover event. **Tap = pin directly** (mirror `PlacePopup.tsx:60-61` mobile branch via `useMediaQuery(down('sm'))`); no preview state on touch.
- **Selection is rendered as a stroke/outline, never a fill override** — otherwise the layer's `state→color` fill fights the "selected" styling (and would collide with dark-mode neon-green primary).
- **Layer toggle while pinned:** recolors fills; panel content and the pin's selected outline are preserved (panel shows all facts regardless of active layer).
- **Watch markers delegate to the same pin handler** (no separate popover) — they select the underlying state.

## 4. Data model (`electionData.ts`)

```ts
type PartyCode = 'APC'|'PDP'|'LP'|'APGA'|'Accord'|'APM'|'NNPP'|'OTHER';
type Layer = 'party' | 'timing';                 // factual, colored
type Confidence = 'verified' | 'fluid' | 'contested';

interface Source { label: string; url: string }

interface StateElection {
  iso: string;                 // 'NG-LA'; FCT is exactly 'NG-FC' — JOIN KEY to boundary shapeISO
  name: string;                // 'Lagos' (FCT shown as 'FCT (Abuja)')
  governor: string;
  currentParty: PartyCode;     // 'OTHER' + partyLabel for new vehicles
  electedParty: PartyCode | null;   // null for FCT; drives the "⇄ defection" flag
  partyLabel?: string;         // display name when a party is 'OTHER'
  termLimited: boolean;        // the reader's real question: can the incumbent run again?
  termNote?: string;           // e.g. "2nd term; count contested — court-installed 2020, won 2023"
  cycle: { type: 'general'|'offcycle'|'none'; date?: string };  // label is DERIVED, not stored
  watch?: { level: 'high'|'med'; note: string; sources: Source[] };  // editorial; optional
  confidence: Confidence;      // rendered even on the party layer for fluid/contested
  asOf: string;                // per-state freshness 'YYYY-MM-DD' (non-empty; validated by test)
  source: Source;              // where THIS state's facts came from
  notes?: string;              // free text — also the v1 home for an off-cycle RESULT (e.g. Ekiti) until `result` has a shape
  result?: null;               // reserved; shape intentionally unspecified in v1 (do NOT widen casually)
}

interface Candidate { name: string; party: string; runningMate?: string; confidence: Confidence; note?: string }
interface KeyDate { label: string; date: string; kind: 'offcycle'|'general' }

interface ElectionDataset {
  siteReviewed: string;        // when the WHOLE set was last swept (distinct from per-state asOf)
  presidentialAsOf: string;
  states: Record<string, StateElection>;   // keyed by iso; lookups go through a guarded helper (§8)
  presidential: Candidate[];
  keyDates: KeyDate[];
  sources: Source[];
}
```

- `cycle.label` is **derived** at render from `type` + `date` (single source of truth).
- `confidence` comes from the research ✅/🟡/⚠️ legend; fluid/contested states are visually distinguished even on the default layer (hatch/muted border + panel chip).
- Seed from research §3/§4/§1/§7; set each state's `asOf`/`source`/`confidence` at seed time.

## 5. Layers & the editorial annotation

`state→color` is a `Record<PartyCode, token>` / `Record<cycleBucket, token>` (compile-time exhaustive — a new party without a color won't compile), resolved from `parties.ts`/theme:
- **party** (default): `currentParty` → CVD-safe categorical color. The page states the APC count as a **number** with the defection mechanism explained + sourced — it does not editorialize "one-party state."
- **timing:** `cycle` bucket → sequential color (votes-2026 / Feb-2027-general / off-cycle 2027 / 2028 / 2029 / FCT-none).
- **races to watch (opt-in annotation):** sparse markers over the active factual layer, each with a one-line note + named sources in the panel. Toggle is **hidden when no state has `watch`**.

## 6. Theme & accessibility (acceptance criteria)

- Map chrome (background/borders/text) uses MUI tokens (`text.secondary`, `divider`, `action.hover` — all exist) → correct light/dark.
- **Party palette is self-contained in `parties.ts`** as `{light,dark}` tokens per party, **fully independent of `theme.palette.primary`** (dark primary is neon green `#08FF00` — reusing it for selection or a green party breaks dark mode). Use a CVD-safe categorical set (Okabe–Ito / ColorBrewer qualitative); **distinguishability + colorblind-safety + theme legibility beat brand fidelity** ("brand-adjacent" is dropped).
- **Non-color encoding required:** inline party abbreviation label per state (see §9 placement); panel/tooltip state party in words.
- Read mode via `useTheme()` inside the React tree (like `GeoShape.tsx:24-26`) — **not** CSS `prefers-color-scheme` (site mode is React state, `App.tsx:58`).
- **Acceptance:** verified in light AND dark AND through a colorblind simulator before "done."

## 7. Boundary data pipeline (one-time, committed)

Source: **geoBoundaries ADM1 (Nigeria)** — 37 features; every one has a non-null `shapeISO`; FCT = `NG-FC`. Validated 2026-06-13.

> ⚠️ **Git-LFS:** the plain `/raw/` URL returns an LFS pointer. Fetch from:
> `https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/NGA/ADM1/geoBoundaries-NGA-ADM1_simplified.geojson`

> ⚠️ **Toolchain not installed:** `geo2topo`/`toposimplify` are NOT in the repo (only `topomerge` ships transitively). Run them as **one-time tools via `npx`**, do NOT add to `dependencies` (the output is committed; install shouldn't carry a one-shot tool).

Exact conversion (also recorded in `MAINTENANCE.md`):
```
npx -p topojson-server -p topojson-simplify -c \
  "geo2topo states=geoBoundaries-NGA-ADM1_simplified.geojson | toposimplify -P 0.4" \
  > public/data/nigeria-states.json
```
- The TopoJSON **object name is the left key you choose** → fix it as **`states`** (deterministic and known to `geo.ts`).
- **Pass no property-stripping flag.** Quantization/simplification only touch coordinates, never `properties`, so `shapeISO` survives by construction — but a stray `-p`/filter flag would drop it; don't use one.
- **⚠️ Winding (discovered during implementation):** geoBoundaries rings are wound OPPOSITE to what `d3.geoPath` fill expects — every feature comes back with `geoArea ≈ 4π`, so each state floods the whole map. Must **rewind before converting** (`scripts/rewind-geojson.mjs`, conditional on `geoArea > 2π`). (The earlier assumption that winding was a non-issue for Nigeria was wrong — `geoPath` fill very much respects winding.)
- **Commit the converted `nigeria-states.json`** (no live third-party dependency at build/run time). License GRID3 / CC BY 4.0 (footer credit). Full rebuild recipe lives in `src/views/projects/nigeria/MAINTENANCE.md`.

`geo.ts` loads the committed file, **asserts `topology.objects.states` exists** (throw a named error otherwise), runs `topojson-client.feature()`, projects with `geoMercator().fitSize([W,H], fc)` to **constant** W/H inside `useMemo([topology])` (so there is **no resize recompute** — viewBox scales the SVG, mirroring `WorldMap.tsx:15-25`), emits `{iso, name, path, centroid, properties}`. Winding/antimeridian are **non-issues** at Nigeria's latitude; Mercator stretch is mild (verify in the spike, §13; only revisit `geoConicConformal` if it looks poor).

## 8. Data flow

1. `NigeriaElections` imports `electionData` (bundled), renders shell.
2. `ElectionMap` loads the committed TopoJSON via `useGeoData(`${process.env.PUBLIC_URL}/data/nigeria-states.json`)`.
3. Per feature, **guarded lookup**: `const rec = states[iso]; if (!rec) return NEUTRAL;` (a single helper used everywhere — never destructure unguarded). Color by `activeLayer`; overlay `watch` markers if on; apply confidence treatment.
4. Hover → transient highlight + `hovered`; click/tap → `pinned`. `StatePanel` (`pinned ?? hovered`) shows governor / party / "can they run again?" (`termLimited`+`termNote`) / next race (derived label) / defection flag / **confidence chip** / **`asOf` + source link**.
5. `StateList` (searchable) sets the same `pinned`.
6. `KeyDates`, `PresidentialRace`, diaspora note read the same dataset.

## 9. Edge cases

- **FCT (`NG-FC`):** `cycle.type='none'`, `termLimited=false`, `electedParty=null`. **Party layer: neutral "no governorship" fill** (NOT APC, despite Wike being APC-aligned) — panel notes "Federal capital — administered by a Minister (APC-aligned); no governorship." Resolves the §5-vs-data contradiction in favor of neutral.
- **Label placement:** `geoPath.centroid`/`geoCentroid` lands in water for concave/multipolygon states — **Lagos, Rivers, Bayelsa, Cross River** especially. Use the **largest ring**, and keep a small **manual offset table keyed by `shapeISO`** for the failures (37 fixed states → cheap). States too small for an inline label (Lagos/FCT/Ekiti) fall back to the StateList/panel rather than forcing an in-map label. **All `<text>` labels and watch markers get `pointer-events:none`** so hits go to the path beneath.
- **Data record without geometry:** invisible on the map but still in `StateList` (which iterates `electionData.states`) — acceptable, intentional.
- **Keyboard:** **StateList is the canonical keyboard entry**; map paths are `tabIndex={-1}` (mouse/touch) to avoid 37 geographic-order tab stops.
- **`asOf` empty/malformed:** rejected by the staleness function, not just "old."

## 10. Testing

- **Data-integrity (highest value), against the COMMITTED converted file:** boundary `shapeISO` ↔ `electionData.states` keys match **bidirectionally**; assert **exactly 37** features AND **exactly 37** records; `NG-FC` present on both sides; every `currentParty`/`electedParty` is a valid `PartyCode` (catches a trailing-space typo the color `Record` would render neutral).
- **Label-in-polygon:** for all 37, assert the (offset-adjusted) label point satisfies `d3.geoContains(feature, [lon,lat])`. Deterministic guard against ocean labels.
- **Staleness — clock injected:** `isStale(asOf, now, thresholdDays)` is a **pure function** tested with fixed `now` (incl. empty/malformed `asOf`). The runtime banner reads the real clock; **CI never asserts "fresh as of real today"** (that would spontaneously redden later).
- **Color mapping:** `state→color` for every party/cycle incl. FCT and `'OTHER'`.
- **Interaction:** hovering after pinning does NOT change panel (`pinned ?? hovered`); layer toggle while pinned preserves pin + outline; map click AND list select both pin; guarded lookup returns NEUTRAL (no throw) for unknown `shapeISO`; watch toggle hidden when no watch data.
- **Hook:** `useGeoData` error/retry on the Nigeria URL.
- **Acknowledged non-CI / manual:** projection visual fit; touch tap-to-pin (RTL can't truly simulate touch-vs-hover).

## 11. Maintenance & launch

- **Per-state `asOf` + `source`** is the freshness model; global `siteReviewed` only says "swept on," never vouches an unreviewed state is current.
- **`MAINTENANCE.md`:** source URLs (research §7), the exact conversion command (§7), a per-field re-verify checklist, watch-list (Bauchi/Oyo party fluidity, Imo term count, Rivers open seat).
- **Re-verify cadence:** before Ekiti (Jun 20 2026), Osun (Aug 15 2026), Jan/Feb 2027 generals.
- **⚠️ Launch + the Ekiti result:** Ekiti votes **Jun 20 2026**. `result` has no shape in v1, so the Ekiti outcome is entered as **text in `notes`/`termNote`** (and the state's `asOf` bumped) until a live `result` shape exists. Launch either before Jun 20 with Ekiti flagged "votes Jun 20," then enter the text result promptly, or after with the result already in.

## 12. Extensibility (stated, not built)

Elections-specific code stays under `src/views/projects/nigeria/`. Future trackers are independent siblings; `/projects/nigeria` can later become a hub. No hub scaffolding in v1.

## 13. Build sequence / de-risking (spike before committing to the full build)

The load-bearing unknown is **the `shapeISO` join surviving conversion with a known object name** — everything downstream rests on it. Order:

1. **Conversion spike (do first).** Fetch the LFS file, run the §7 command, then `scripts/verify-nigeria-topojson.mjs`: assert `Object.keys(topology.objects)` includes `states`, `feature(topology, topology.objects.states).features.length === 37`, every `properties.shapeISO` non-null, `NG-FC` present. Kills the toolchain/object-name/property-survival unknowns at once. Commit the verified artifact.
2. **Render-fit spike.** A throwaway map of 37 `geoMercator().fitSize` paths (copy `WorldMap` structure, swap join to `shapeISO`). Eyeball: recognizable Nigeria, acceptable stretch? Closes the projection question.
3. **Label-placement spike.** `geoContains` over all 37 centroids → build the offset table for the failures (expect Lagos/Rivers/Bayelsa/Cross River).
4. **Lock the §3.1 reducer + transitions** before building Panel/List.
5. Then: data model + `parties.ts` (self-contained tokens) → integrity + clock-injected staleness tests (TDD, integrity test against the spiked file first) → components.
