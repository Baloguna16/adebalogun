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
