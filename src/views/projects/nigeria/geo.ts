import { geoMercator, geoPath, geoContains, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';

/** SVG viewBox dimensions the projection is fit to (scaled responsively via viewBox). */
export const MAP_WIDTH = 720;
export const MAP_HEIGHT = 640;

/** The TopoJSON object key — fixed at conversion time (`geo2topo states=…`). */
const OBJECT_NAME = 'states';

/**
 * Hand-tuned label anchor overrides (lon/lat) for states whose geometric
 * centroid falls outside the polygon (concave / coastal / multipolygon),
 * so the inline abbreviation never lands in the Gulf of Guinea.
 * Populated from the label-placement spike (geoContains over all 37).
 */
const LABEL_OVERRIDES: Record<string, [number, number]> = {};

export interface NigeriaFeature {
  iso: string; // shapeISO, e.g. 'NG-LA' — join key to election data
  name: string; // shapeName
  path: string; // projected SVG path d-string
  label: [number, number]; // projected [x, y] pixel anchor for the abbreviation
}

interface RawFeature {
  type: string;
  id?: string | number;
  properties: { shapeISO?: string; shapeName?: string } | null;
  geometry: unknown;
}

/**
 * Convert the committed Nigeria TopoJSON into projected, election-ready
 * features. Joins on `properties.shapeISO`. Throws (rather than silently
 * dropping) on a missing object or a feature without a shapeISO — a dropped
 * state would make the data-integrity test lie.
 */
export const topologyToNigeriaFeatures = (
  topology: any,
  width: number = MAP_WIDTH,
  height: number = MAP_HEIGHT
): NigeriaFeature[] => {
  if (!topology?.objects?.[OBJECT_NAME]) {
    throw new Error(
      `nigeria geo: TopoJSON object '${OBJECT_NAME}' not found (found: ${Object.keys(
        topology?.objects ?? {}
      ).join(', ') || 'none'})`
    );
  }
  const collection = feature(topology, topology.objects[OBJECT_NAME]) as any;
  const feats: RawFeature[] = collection.features;

  const projection = geoMercator().fitSize([width, height], collection);
  const pathGen = geoPath(projection);

  return feats.map((f) => {
    const iso = f.properties?.shapeISO;
    if (!iso) {
      throw new Error(
        `nigeria geo: feature missing shapeISO (name=${f.properties?.shapeName ?? '?'})`
      );
    }
    const anchorLonLat = labelAnchor(f as any);
    const [lx, ly] = projection(anchorLonLat) ?? [0, 0];
    return {
      iso,
      name: f.properties?.shapeName ?? iso,
      path: pathGen(f as any) || '',
      label: [lx, ly],
    };
  });
};

/**
 * Lon/lat label anchor for a feature: an explicit override if present, else
 * the computed in-polygon anchor. Exported so the label-placement test can
 * assert geoContains for all 37 states.
 */
export const labelAnchor = (f: any): [number, number] =>
  LABEL_OVERRIDES[f?.properties?.shapeISO] ?? pickLabelAnchor(f);

/**
 * Choose a lon/lat anchor inside the polygon: the spherical centroid if it's
 * actually inside, otherwise the centroid of the largest ring. Anything that
 * still fails geoContains should get an explicit LABEL_OVERRIDES entry.
 */
const pickLabelAnchor = (f: {
  geometry: any;
  type: string;
  properties: unknown;
}): [number, number] => {
  const centroid = geoCentroid(f as any) as [number, number];
  if (geoContains(f as any, centroid)) return centroid;
  const ringCentroid = largestRingCentroid(f.geometry);
  return ringCentroid ?? centroid;
};

/** Area-weighted centroid of the largest exterior ring (planar approximation). */
const largestRingCentroid = (geometry: any): [number, number] | null => {
  if (!geometry) return null;
  const polygons: number[][][] =
    geometry.type === 'Polygon'
      ? [geometry.coordinates[0]]
      : geometry.type === 'MultiPolygon'
      ? geometry.coordinates.map((poly: number[][][]) => poly[0])
      : [];
  let best: number[][] | null = null;
  let bestArea = -Infinity;
  for (const ring of polygons) {
    const a = Math.abs(ringArea(ring));
    if (a > bestArea) {
      bestArea = a;
      best = ring;
    }
  }
  if (!best) return null;
  let x = 0;
  let y = 0;
  for (const [lon, lat] of best) {
    x += lon;
    y += lat;
  }
  return [x / best.length, y / best.length];
};

const ringArea = (ring: number[][]): number => {
  let area = 0;
  for (let i = 0, n = ring.length; i < n; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
};
