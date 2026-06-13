import { readFileSync } from 'fs';
import { resolve } from 'path';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';
import { labelAnchor } from './geo';

// Guards against the "label in the Gulf of Guinea" bug: every state's label
// anchor (centroid or override) must fall inside the state's polygon.
const topo = JSON.parse(
  readFileSync(resolve(__dirname, '../../../../public/data/nigeria-states.json'), 'utf8')
);
const fc: any = feature(topo, topo.objects.states);

describe('label placement', () => {
  test('every label anchor is inside its state polygon', () => {
    const outside: string[] = [];
    for (const f of fc.features) {
      const anchor = labelAnchor(f);
      if (!geoContains(f, anchor)) outside.push(f.properties.shapeISO);
    }
    expect(outside).toEqual([]);
  });
});
