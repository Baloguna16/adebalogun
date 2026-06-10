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
