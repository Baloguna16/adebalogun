# Travel Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the interactive travel map tool at `/tools/travel-map` exactly as specified in `docs/superpowers/specs/2026-06-09-travel-map-design.md`.

**Architecture:** Flat poster-style SVG maps rendered by hand-rolled React components from TopoJSON via `d3-geo` + `topojson-client`. World view (Natural Earth projection) drills down into a US states view (Albers USA). Diary data is a hardcoded TS file; popups are MUI Popover/Dialog. All colors come from the MUI theme.

**Tech Stack:** React 18 + TypeScript 4.4 (CRA / react-scripts 5), MUI v5, d3-geo, topojson-client, Jest + React Testing Library.

**Execution context (cloud agent):** Work on branch `feat/travel-map` off `main`. NEVER commit or push to `main`. Commit after every task. The spec answers every product question — do not make product decisions or add anything listed "Out of scope". Finish by opening a PR (Task 10).

**Known gotchas (read before starting):**
1. `d3-geo` and `topojson-client` are ESM-only. CRA's Jest will fail with `SyntaxError: Cannot use import statement outside a module` unless `transformIgnorePatterns` is overridden in `package.json` (done in Task 1). The build (webpack 5) handles them fine.
2. `geoAlbersUsa` returns `null` for any point outside the US composite projection — test fixtures for states MUST use real US-range coordinates (the fixtures below already do).
3. Never parse `'YYYY-MM'` with `new Date()` — it's interpreted as UTC midnight and renders as the previous month in US timezones. `formatVisitDate` parses the string manually.
4. If `npm i -D @types/d3-geo @types/topojson-client` produces TypeScript errors under TS 4.4, pin `@types/d3-geo@3.0.3` and `@types/topojson-client@3.1.1`.

---

### Task 1: Branch, dependencies, geo data files, Jest config

**Files:**
- Modify: `package.json`
- Create: `public/data/countries-110m.json`, `public/data/states-10m.json`

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git pull && git checkout -b feat/travel-map
```

- [ ] **Step 2: Install dependencies**

```bash
npm install d3-geo topojson-client
npm install -D @types/d3-geo @types/topojson-client world-atlas us-atlas
```

- [ ] **Step 3: Copy TopoJSON into public/data**

```bash
mkdir -p public/data
cp node_modules/world-atlas/countries-110m.json public/data/
cp node_modules/us-atlas/states-10m.json public/data/
ls -la public/data/
```

Expected: both files present (`countries-110m.json` ~110KB, `states-10m.json` ~850KB — fine, gzip serves ~250KB and it only loads on this page).

- [ ] **Step 4: Add Jest ESM override to package.json**

Add this top-level key to `package.json` (sibling of `"scripts"`):

```json
"jest": {
  "transformIgnorePatterns": [
    "node_modules/(?!(d3-geo|d3-array|internmap|topojson-client)/)",
    "^.+\\.module\\.(css|sass|scss)$"
  ]
}
```

- [ ] **Step 5: Sanity-check the test runner still works**

```bash
CI=true npm test -- --watchAll=false
```

Expected: runs (pass or "no tests found" both fine — no failures caused by config).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json public/data/
git commit -m "chore: add d3-geo/topojson deps, geo data, jest ESM config for travel map"
```

---

### Task 2: Travel data file

**Files:**
- Create: `src/views/tools/travel-map/travelData.ts`

- [ ] **Step 1: Create `src/views/tools/travel-map/travelData.ts`**

```ts
// TODO(ade): replace the SAMPLE data below with your real travel diary.
// Country ids are ISO 3166-1 numeric strings — find them in
// public/data/countries-110m.json (e.g. '392' = Japan, '250' = France).
// State ids are 2-digit FIPS strings — find them in
// public/data/states-10m.json (e.g. '36' = New York, '06' = California).
// Dates are 'YYYY-MM'. Notes and cities are optional.

export interface Visit {
  /** 'YYYY-MM', e.g. '2024-03' */
  date: string;
  /** one-line diary note */
  note?: string;
  /** cities visited on this trip */
  cities?: string[];
}

export interface Place {
  /** world-atlas numeric ISO id for countries, us-atlas FIPS id for states */
  id: string;
  /** display name (matching is by id; this is for readability) */
  name: string;
  visits: Visit[];
}

export const visitedCountries: Place[] = [
  // SAMPLE — replace with real history
  {
    id: '392',
    name: 'Japan',
    visits: [
      { date: '2024-03', note: 'SAMPLE — cherry blossom trip', cities: ['Tokyo', 'Kyoto'] },
      { date: '2019-11', note: 'SAMPLE — first visit' },
    ],
  },
  // SAMPLE — replace with real history
  {
    id: '250',
    name: 'France',
    visits: [{ date: '2022-06', note: 'SAMPLE — summer in Paris', cities: ['Paris'] }],
  },
];

export const visitedStates: Place[] = [
  // SAMPLE — replace with real history
  {
    id: '36',
    name: 'New York',
    visits: [{ date: '2023-07', note: 'SAMPLE — home base' }],
  },
  // SAMPLE — replace with real history
  {
    id: '06',
    name: 'California',
    visits: [{ date: '2021-09', note: 'SAMPLE — west coast trip', cities: ['San Francisco'] }],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/views/tools/travel-map/travelData.ts
git commit -m "feat: add travel diary data model with sample data"
```

---

### Task 3: Geo utilities (TDD)

**Files:**
- Create: `src/views/tools/travel-map/geo.ts`
- Test: `src/views/tools/travel-map/geo.test.ts`

- [ ] **Step 1: Write the failing tests — create `src/views/tools/travel-map/geo.test.ts`**

```ts
import {
  computeStats,
  findPlace,
  formatVisitDate,
  topologyToFeatures,
  US_COUNTRY_ID,
} from './geo';
import { Place } from './travelData';

describe('formatVisitDate', () => {
  it('formats YYYY-MM as Month YYYY', () => {
    expect(formatVisitDate('2024-03')).toBe('March 2024');
    expect(formatVisitDate('2019-11')).toBe('November 2019');
    expect(formatVisitDate('2020-01')).toBe('January 2020');
    expect(formatVisitDate('2020-12')).toBe('December 2020');
  });
});

describe('computeStats', () => {
  const visit = { date: '2024-01' };

  it('counts visited countries and states, inferring the US from visited states', () => {
    const countries: Place[] = [
      { id: '392', name: 'Japan', visits: [visit, { date: '2019-11' }] },
      { id: '250', name: 'France', visits: [visit] },
    ];
    const states: Place[] = [{ id: '36', name: 'New York', visits: [visit] }];
    expect(computeStats(countries, states)).toEqual({ countries: 3, states: 1 });
  });

  it('does not add the US when no states are visited', () => {
    const countries: Place[] = [{ id: '392', name: 'Japan', visits: [visit] }];
    expect(computeStats(countries, [])).toEqual({ countries: 1, states: 0 });
  });

  it('does not double-count the US when listed as a country and states are visited', () => {
    const countries: Place[] = [
      { id: US_COUNTRY_ID, name: 'United States of America', visits: [visit] },
    ];
    const states: Place[] = [{ id: '36', name: 'New York', visits: [visit] }];
    expect(computeStats(countries, states)).toEqual({ countries: 1, states: 1 });
  });

  it('ignores places with no visits and tolerates empty data', () => {
    expect(computeStats([{ id: '392', name: 'Japan', visits: [] }], [])).toEqual({
      countries: 0,
      states: 0,
    });
    expect(computeStats([], [])).toEqual({ countries: 0, states: 0 });
  });
});

describe('findPlace', () => {
  const places: Place[] = [
    { id: '392', name: 'Japan', visits: [{ date: '2024-03' }] },
    { id: '250', name: 'France', visits: [] },
  ];

  it('finds a visited place by id', () => {
    expect(findPlace('392', places)?.name).toBe('Japan');
  });

  it('returns undefined for unvisited or unknown ids', () => {
    expect(findPlace('250', places)).toBeUndefined();
    expect(findPlace('999', places)).toBeUndefined();
  });
});

describe('topologyToFeatures', () => {
  const topo = {
    type: 'Topology',
    objects: {
      countries: {
        type: 'GeometryCollection',
        geometries: [
          { type: 'Polygon', id: '392', arcs: [[0]], properties: { name: 'Japan' } },
          { type: 'Polygon', id: '010', arcs: [[1]], properties: { name: 'Antarctica' } },
        ],
      },
    },
    arcs: [
      [[135, 34], [135, 36], [140, 36], [140, 34], [135, 34]],
      [[0, -75], [0, -70], [10, -70], [10, -75], [0, -75]],
    ],
  };

  it('builds svg paths and filters Antarctica on the world projection', () => {
    const features = topologyToFeatures(topo, 'countries', 960, 500, 'world');
    expect(features).toHaveLength(1);
    expect(features[0].id).toBe('392');
    expect(features[0].name).toBe('Japan');
    expect(features[0].path).toMatch(/^M/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
CI=true npm test -- --watchAll=false geo.test
```

Expected: FAIL — `Cannot find module './geo'`.

- [ ] **Step 3: Create `src/views/tools/travel-map/geo.ts`**

```ts
import { geoAlbersUsa, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { Place } from './travelData';

export const TOTAL_COUNTRIES = 195;
export const TOTAL_STATES = 50;
/** world-atlas ISO 3166-1 numeric id for the United States */
export const US_COUNTRY_ID = '840';
/** world-atlas id for Antarctica — filtered out for a tighter poster crop */
const ANTARCTICA_ID = '010';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * '2024-03' -> 'March 2024'. Parsed manually: new Date('2024-03') is UTC
 * midnight and renders as the previous month in US timezones.
 */
export const formatVisitDate = (date: string): string => {
  const [year, month] = date.split('-');
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
};

/** Finds a place by id, only if it actually has visits. */
export const findPlace = (id: string, places: Place[]): Place | undefined =>
  places.find((p) => p.id === id && p.visits.length > 0);

export interface TravelStats {
  countries: number;
  states: number;
}

export const computeStats = (countries: Place[], states: Place[]): TravelStats => {
  const countryIds = new Set(
    countries.filter((c) => c.visits.length > 0).map((c) => c.id)
  );
  const stateIds = new Set(
    states.filter((s) => s.visits.length > 0).map((s) => s.id)
  );
  if (stateIds.size > 0) countryIds.add(US_COUNTRY_ID);
  return { countries: countryIds.size, states: stateIds.size };
};

export interface MapFeature {
  id: string;
  name: string;
  path: string;
}

export const topologyToFeatures = (
  topology: any,
  objectName: string,
  width: number,
  height: number,
  projectionType: 'world' | 'us'
): MapFeature[] => {
  const collection = feature(topology, topology.objects[objectName]) as any;
  const feats =
    projectionType === 'world'
      ? collection.features.filter((f: any) => String(f.id) !== ANTARCTICA_ID)
      : collection.features;
  const fitTarget = { type: 'FeatureCollection', features: feats } as any;
  const projection = (
    projectionType === 'world' ? geoNaturalEarth1() : geoAlbersUsa()
  ).fitSize([width, height], fitTarget);
  const pathGen = geoPath(projection);
  return feats
    .map((f: any) => ({
      id: String(f.id ?? ''),
      name: f.properties && f.properties.name ? f.properties.name : '',
      path: pathGen(f) || '',
    }))
    .filter((f: MapFeature) => f.id !== '' && f.path !== '');
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
CI=true npm test -- --watchAll=false geo.test
```

Expected: PASS (4 suites of assertions, all green). If you see `Cannot use import statement outside a module`, the Task 1 Jest override is missing or wrong — fix that, do not change this code.

- [ ] **Step 5: Commit**

```bash
git add src/views/tools/travel-map/geo.ts src/views/tools/travel-map/geo.test.ts
git commit -m "feat: add travel map geo utilities with tests"
```

---

### Task 4: Geo data fetch hook

**Files:**
- Create: `src/views/tools/travel-map/useGeoData.ts`

(No dedicated test — exercised end-to-end by the Task 8 page test with mocked fetch.)

- [ ] **Step 1: Create `src/views/tools/travel-map/useGeoData.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';

export interface GeoData {
  topology: unknown | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

export const useGeoData = (url: string): GeoData => {
  const [topology, setTopology] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTopology(null);
    setLoading(true);
    setError(false);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTopology(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url, attempt]);

  return { topology, loading, error, retry };
};
```

- [ ] **Step 2: Commit**

```bash
git add src/views/tools/travel-map/useGeoData.ts
git commit -m "feat: add useGeoData TopoJSON fetch hook"
```

---

### Task 5: GeoShape — the single interactive map shape

**Files:**
- Create: `src/views/tools/travel-map/GeoShape.tsx`

(Covered by the Task 8 page test, which clicks shapes by their accessible name.)

- [ ] **Step 1: Create `src/views/tools/travel-map/GeoShape.tsx`**

```tsx
import { useState, KeyboardEvent, MouseEvent } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

export interface GeoShapeProps {
  id: string;
  name: string;
  d: string;
  visited: boolean;
  visitCount: number;
  clickable: boolean;
  onActivate: (id: string, pos: { top: number; left: number }) => void;
}

export const GeoShape = ({
  id,
  name,
  d,
  visited,
  visitCount,
  clickable,
  onActivate,
}: GeoShapeProps) => {
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  const dark = theme.palette.mode === 'dark';

  const fill = visited
    ? theme.palette.primary.main
    : dark
    ? theme.palette.grey[800]
    : theme.palette.grey[300];
  const stroke = dark ? theme.palette.grey[900] : '#ffffff';

  const label = visited
    ? `${name}, ${visitCount} visit${visitCount === 1 ? '' : 's'}`
    : name;

  const handleClick = (e: MouseEvent<SVGPathElement>) => {
    if (!clickable) return;
    onActivate(id, { top: e.clientY, left: e.clientX });
  };

  const handleKeyDown = (e: KeyboardEvent<SVGPathElement>) => {
    if (!clickable || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    onActivate(id, {
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width / 2,
    });
  };

  return (
    <Tooltip title={label} followCursor>
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={0.5}
        opacity={hover && clickable ? 0.75 : 1}
        cursor={clickable ? 'pointer' : 'default'}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={label}
      />
    </Tooltip>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/views/tools/travel-map/GeoShape.tsx
git commit -m "feat: add GeoShape interactive map path component"
```

---

### Task 6: PlacePopup (TDD)

**Files:**
- Create: `src/views/tools/travel-map/PlacePopup.tsx`
- Test: `src/views/tools/travel-map/PlacePopup.test.tsx`

- [ ] **Step 1: Write the failing tests — create `src/views/tools/travel-map/PlacePopup.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../../../theme';
import { PlacePopup } from './PlacePopup';
import { Place } from './travelData';

const japan: Place = {
  id: '392',
  name: 'Japan',
  visits: [
    { date: '2019-11', note: 'first trip' },
    { date: '2024-03', note: 'cherry blossoms', cities: ['Tokyo', 'Kyoto'] },
  ],
};

const renderPopup = (place: Place) =>
  render(
    <ThemeProvider theme={getTheme('light')}>
      <PlacePopup
        selection={{ place, pos: { top: 10, left: 10 } }}
        onClose={() => {}}
      />
    </ThemeProvider>
  );

test('renders visits newest first with notes and cities', () => {
  renderPopup(japan);
  expect(screen.getByText('Japan')).toBeInTheDocument();
  const dates = screen
    .getAllByText(/(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/)
    .map((el) => el.textContent);
  expect(dates).toEqual(['March 2024', 'November 2019']);
  expect(screen.getByText('cherry blossoms')).toBeInTheDocument();
  expect(screen.getByText('Tokyo · Kyoto')).toBeInTheDocument();
});

test('omits note and cities cleanly when absent', () => {
  renderPopup({ id: '250', name: 'France', visits: [{ date: '2022-06' }] });
  expect(screen.getByText('France')).toBeInTheDocument();
  expect(screen.getByText('June 2022')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
CI=true npm test -- --watchAll=false PlacePopup
```

Expected: FAIL — `Cannot find module './PlacePopup'`.

- [ ] **Step 3: Create `src/views/tools/travel-map/PlacePopup.tsx`**

```tsx
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatVisitDate } from './geo';
import { Place } from './travelData';

export interface PlacePopupProps {
  selection: { place: Place; pos: { top: number; left: number } } | null;
  onClose: () => void;
}

const VisitList = ({ place }: { place: Place }) => {
  const visits = [...place.visits].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <List dense disablePadding>
      {visits.map((v, i) => (
        <ListItem key={`${v.date}-${i}`} disableGutters alignItems="flex-start">
          <ListItemText
            primary={
              <Typography fontWeight="bold" color="primary">
                {formatVisitDate(v.date)}
              </Typography>
            }
            secondary={
              <>
                {v.note && (
                  <Typography variant="body2" component="span" display="block">
                    {v.note}
                  </Typography>
                )}
                {v.cities && v.cities.length > 0 && (
                  <Typography
                    variant="body2"
                    component="span"
                    display="block"
                    color="text.secondary"
                  >
                    {v.cities.join(' · ')}
                  </Typography>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export const PlacePopup = ({ selection, onClose }: PlacePopupProps) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  if (!selection) return null;
  const { place, pos } = selection;

  if (mobile) {
    return (
      <Dialog open fullWidth onClose={onClose}>
        <DialogTitle>{place.name}</DialogTitle>
        <DialogContent>
          <VisitList place={place} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover
      open
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={pos}
    >
      <Typography variant="h6" sx={{ px: 2, pt: 2 }}>
        {place.name}
      </Typography>
      <DialogContent sx={{ pt: 1, maxWidth: 360 }}>
        <VisitList place={place} />
      </DialogContent>
    </Popover>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
CI=true npm test -- --watchAll=false PlacePopup
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/views/tools/travel-map/PlacePopup.tsx src/views/tools/travel-map/PlacePopup.test.tsx
git commit -m "feat: add PlacePopup visit diary popup with tests"
```

---

### Task 7: WorldMap and USMap

**Files:**
- Create: `src/views/tools/travel-map/WorldMap.tsx`
- Create: `src/views/tools/travel-map/USMap.tsx`

- [ ] **Step 1: Create `src/views/tools/travel-map/WorldMap.tsx`**

```tsx
import { useMemo } from 'react';
import { findPlace, topologyToFeatures, US_COUNTRY_ID } from './geo';
import { visitedCountries } from './travelData';
import { GeoShape } from './GeoShape';

const WIDTH = 960;
const HEIGHT = 500;

export interface WorldMapProps {
  topology: unknown;
  onActivate: (id: string, pos: { top: number; left: number }) => void;
}

export const WorldMap = ({ topology, onActivate }: WorldMapProps) => {
  const features = useMemo(
    () => topologyToFeatures(topology, 'countries', WIDTH, HEIGHT, 'world'),
    [topology]
  );

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="World map"
    >
      {features.map((f) => {
        const place = findPlace(f.id, visitedCountries);
        return (
          <GeoShape
            key={f.id}
            id={f.id}
            name={f.name}
            d={f.path}
            visited={!!place}
            visitCount={place ? place.visits.length : 0}
            clickable={!!place || f.id === US_COUNTRY_ID}
            onActivate={onActivate}
          />
        );
      })}
    </svg>
  );
};
```

- [ ] **Step 2: Create `src/views/tools/travel-map/USMap.tsx`**

```tsx
import { useMemo } from 'react';
import { findPlace, topologyToFeatures } from './geo';
import { visitedStates } from './travelData';
import { GeoShape } from './GeoShape';

const WIDTH = 960;
const HEIGHT = 600;

export interface USMapProps {
  topology: unknown;
  onActivate: (id: string, pos: { top: number; left: number }) => void;
}

export const USMap = ({ topology, onActivate }: USMapProps) => {
  const features = useMemo(
    () => topologyToFeatures(topology, 'states', WIDTH, HEIGHT, 'us'),
    [topology]
  );

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="United States map"
    >
      {features.map((f) => {
        const place = findPlace(f.id, visitedStates);
        return (
          <GeoShape
            key={f.id}
            id={f.id}
            name={f.name}
            d={f.path}
            visited={!!place}
            visitCount={place ? place.visits.length : 0}
            clickable={!!place}
            onActivate={onActivate}
          />
        );
      })}
    </svg>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/views/tools/travel-map/WorldMap.tsx src/views/tools/travel-map/USMap.tsx
git commit -m "feat: add WorldMap and USMap SVG components"
```

---

### Task 8: TravelMap page shell (TDD)

**Files:**
- Create: `src/views/tools/travel-map/TravelMap.tsx`
- Test: `src/views/tools/travel-map/TravelMap.test.tsx`

- [ ] **Step 1: Write the failing tests — create `src/views/tools/travel-map/TravelMap.test.tsx`**

NOTE: the US-states fixture uses real US-range coordinates because `geoAlbersUsa`
drops geometry outside the US. Tests assert on patterns (`/ 195 countries`), not
exact counts, so they keep passing when Ade replaces the sample data.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../../../theme';
import { TravelMap } from './TravelMap';

const worldTopo = {
  type: 'Topology',
  objects: {
    countries: {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'Polygon',
          id: '840',
          arcs: [[0]],
          properties: { name: 'United States of America' },
        },
        { type: 'Polygon', id: '392', arcs: [[1]], properties: { name: 'Japan' } },
      ],
    },
  },
  arcs: [
    [[-79, 40.5], [-79, 45], [-72, 45], [-72, 40.5], [-79, 40.5]],
    [[135, 34], [135, 36], [140, 36], [140, 34], [135, 34]],
  ],
};

const usTopo = {
  type: 'Topology',
  objects: {
    states: {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Polygon', id: '36', arcs: [[0]], properties: { name: 'New York' } },
      ],
    },
  },
  arcs: [[[-79, 40.5], [-79, 45], [-72, 45], [-72, 40.5], [-79, 40.5]]],
};

beforeEach(() => {
  global.fetch = jest.fn((url: any) =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve(String(url).includes('countries') ? worldTopo : usTopo),
    })
  ) as any;
});

const renderPage = () =>
  render(
    <ThemeProvider theme={getTheme('light')}>
      <TravelMap />
    </ThemeProvider>
  );

test('shows the stats header', async () => {
  renderPage();
  expect(await screen.findByText(/\/ 195 countries/)).toBeInTheDocument();
  expect(screen.getByText(/\/ 50 states/)).toBeInTheDocument();
});

test('clicking the US drills down to the states view and back', async () => {
  renderPage();
  const us = await screen.findByRole('button', { name: /United States/ });
  userEvent.click(us);
  expect(await screen.findByRole('button', { name: /world/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /New York/ })).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: /world/i }));
  expect(
    await screen.findByRole('button', { name: /United States/ })
  ).toBeInTheDocument();
});

test('shows an error alert with retry when geo data fails to load', async () => {
  (global.fetch as jest.Mock).mockImplementation(() =>
    Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })
  );
  renderPage();
  expect(await screen.findByText(/could not load/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
CI=true npm test -- --watchAll=false TravelMap.test
```

Expected: FAIL — `Cannot find module './TravelMap'`.

- [ ] **Step 3: Create `src/views/tools/travel-map/TravelMap.tsx`**

```tsx
import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGeoData } from './useGeoData';
import {
  computeStats,
  findPlace,
  TOTAL_COUNTRIES,
  TOTAL_STATES,
  US_COUNTRY_ID,
} from './geo';
import { Place, visitedCountries, visitedStates } from './travelData';
import { WorldMap } from './WorldMap';
import { USMap } from './USMap';
import { PlacePopup } from './PlacePopup';

interface Selection {
  place: Place;
  pos: { top: number; left: number };
}

export const TravelMap = () => {
  const [view, setView] = useState<'world' | 'us'>('world');
  const [selection, setSelection] = useState<Selection | null>(null);
  const world = useGeoData(`${process.env.PUBLIC_URL}/data/countries-110m.json`);
  const us = useGeoData(`${process.env.PUBLIC_URL}/data/states-10m.json`);
  const stats = useMemo(() => computeStats(visitedCountries, visitedStates), []);

  const handleCountry = (id: string, pos: { top: number; left: number }) => {
    if (id === US_COUNTRY_ID) {
      setView('us');
      return;
    }
    const place = findPlace(id, visitedCountries);
    if (place) setSelection({ place, pos });
  };

  const handleState = (id: string, pos: { top: number; left: number }) => {
    const place = findPlace(id, visitedStates);
    if (place) setSelection({ place, pos });
  };

  const active = view === 'world' ? world : us;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Travel Map
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {stats.countries} / {TOTAL_COUNTRIES} countries · {stats.states} /{' '}
        {TOTAL_STATES} states
      </Typography>
      <Box sx={{ minHeight: 48, display: 'flex', alignItems: 'center' }}>
        {view === 'us' && (
          <Button startIcon={<ArrowBackIcon />} onClick={() => setView('world')}>
            World
          </Button>
        )}
      </Box>
      {active.error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={active.retry}>
              Retry
            </Button>
          }
        >
          Could not load the map data.
        </Alert>
      ) : active.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in timeout={300} key={view}>
          <Box>
            {view === 'world' ? (
              <WorldMap topology={world.topology} onActivate={handleCountry} />
            ) : (
              <USMap topology={us.topology} onActivate={handleState} />
            )}
          </Box>
        </Fade>
      )}
      <PlacePopup selection={selection} onClose={() => setSelection(null)} />
    </Container>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
CI=true npm test -- --watchAll=false TravelMap.test
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/views/tools/travel-map/TravelMap.tsx src/views/tools/travel-map/TravelMap.test.tsx
git commit -m "feat: add TravelMap page with drill-down and stats header"
```

---

### Task 9: Register the tool (route + index card)

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/views/tools/ToolsIndex.tsx`

- [ ] **Step 1: Add the lazy import in `src/App.tsx`**

After the line:

```tsx
const RickrollGenerator = lazy(() => import('./views/tools/rickroll').then(m => ({ default: m.RickrollGenerator })));
```

add:

```tsx
const TravelMap = lazy(() => import('./views/tools/travel-map/TravelMap').then(m => ({ default: m.TravelMap })));
```

- [ ] **Step 2: Add the route in `src/App.tsx`**

After the line:

```tsx
      <Route path="/tools/rickroll" element={<RickrollGenerator />} />
```

add:

```tsx
      <Route path="/tools/travel-map" element={<TravelMap />} />
```

- [ ] **Step 3: Add the card in `src/views/tools/ToolsIndex.tsx`**

Append to the `tools` array (after the rickroll entry):

```ts
  {
    path: '/tools/travel-map',
    title: 'Travel Map',
    description:
      'An interactive map of everywhere I’ve traveled — click a country or state to read the diary.',
  },
```

- [ ] **Step 4: Verify the app compiles**

```bash
npm run build
```

Expected: `Compiled successfully.` (warnings acceptable, errors are not).

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/views/tools/ToolsIndex.tsx
git commit -m "feat: register travel map tool route and index card"
```

---

### Task 10: Full verification and PR

- [ ] **Step 1: Run the entire test suite**

```bash
CI=true npm test -- --watchAll=false
```

Expected: all suites pass. Fix any failure before proceeding — do not skip or delete tests.

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: `Compiled successfully.`

- [ ] **Step 3: Push the branch and open a PR**

```bash
git push -u origin feat/travel-map
```

Open a pull request from `feat/travel-map` to `main` titled `feat: add interactive travel map tool`. The body must summarize: what was built (poster-style SVG travel map at /tools/travel-map with US drill-down, diary popups, stats header), the spec it implements (`docs/superpowers/specs/2026-06-09-travel-map-design.md`), test/build results, and a prominent note that `src/views/tools/travel-map/travelData.ts` contains SAMPLE data that Ade must replace with his real travel history. Do NOT merge the PR.
