# Nigeria Election Tracker — Maintenance

This tracker is **hand-curated**. Nigerian political alignments shift fast, so the
data in `electionData.ts` is living data. Keep it honest.

## When to re-verify

- Before each off-cycle vote: **Ekiti (20 Jun 2026)**, **Osun (15 Aug 2026)**.
- Before the **2027 generals** (Presidential 16 Jan 2027, Governorship 6 Feb 2027).
- Whenever a defection / court ruling / primary result lands for a state.

After reviewing a state, bump its `asOf` (and `siteReviewed` once the whole set is swept).
The UI shows a staleness banner when `siteReviewed` is older than `DEFAULT_STALE_DAYS`.

## Watch-list (known-fluid — check these first)

- **Bauchi** — last big PDP holdout; flirted with APC/ADC. Party may change.
- **Oyo** — Makinde's APM move is recent; some sources still list PDP.
- **Imo** — Uzodimma's term count is genuinely contested (court-installed 2020, won 2023).
- **Rivers** — open seat; Fubara won't seek re-election (Fubara–Wike crisis).
- **Presidential field** — coalitions (ADC vs NDC), running mates, and the PDP split are all fluid.

Per-state `confidence` (`verified` / `fluid` / `contested`) is surfaced in the panel —
use it; don't render a shaky fact as settled.

## Sources

Primary: INEC (timetable + candidate lists), Wikipedia current-governors list.
Secondary: Vanguard, Premium Times, Intelpoint. Full list + URLs are in
`electionData.ts` and the research brief:
`docs/superpowers/research/2026-06-13-nigeria-elections-2027.md`.

## Rebuilding the boundary file (`public/data/nigeria-states.json`)

The committed TopoJSON is the source of truth at runtime — you do **not** need to
rebuild it for routine data edits. Only rebuild if the geometry needs updating.

The conversion tools are **not** project dependencies (one-time use via `npx`).
geoBoundaries files are **Git-LFS-backed** — fetch from the `media.githubusercontent.com`
endpoint, not the plain `/raw/` URL (which returns an LFS pointer). geoBoundaries
rings are wound opposite to what `d3.geoPath` expects, so they must be **rewound**
or every state floods the whole map.

```sh
# 1. fetch the simplified GeoJSON (LFS media endpoint)
curl -sL -o /tmp/nga.geojson \
  "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/NGA/ADM1/geoBoundaries-NGA-ADM1_simplified.geojson"

# 2. rewind polygon winding for d3 (committed script; uses d3-geo)
node scripts/rewind-geojson.mjs /tmp/nga.geojson /tmp/nga-rw.geojson

# 3. convert -> quantized/simplified TopoJSON with the deterministic object name `states`
npx -y -p topojson-server -p topojson-simplify -c \
  "geo2topo states=/tmp/nga-rw.geojson | toposimplify -P 0.4" \
  > public/data/nigeria-states.json

# 4. verify (object name, 37 features, all shapeISO incl. NG-FC)
node scripts/verify-nigeria-topojson.mjs
```

Then run the test suite — `dataIntegrity.test.ts` and `labelPlacement.test.ts`
re-validate the committed artifact (37↔37 join, valid party codes, labels in-polygon).
