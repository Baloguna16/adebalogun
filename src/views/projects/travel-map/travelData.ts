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
