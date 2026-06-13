// Rewind GeoJSON polygon rings to d3-geo's expected winding.
// geoBoundaries' rings are wound opposite to what d3.geoPath fill expects, so
// every state would otherwise flood the whole map (geoArea ≈ 4π). We reverse
// any feature whose spherical area exceeds half the globe — self-correcting and
// safe for already-correct data.
//
// Usage: node scripts/rewind-geojson.mjs <in.geojson> <out.geojson>
import { readFileSync, writeFileSync } from 'fs';
import { geoArea } from 'd3-geo';

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: node scripts/rewind-geojson.mjs <in.geojson> <out.geojson>');
  process.exit(1);
}

const reverseRings = (geom) => {
  if (geom.type === 'Polygon') geom.coordinates.forEach((r) => r.reverse());
  else if (geom.type === 'MultiPolygon')
    geom.coordinates.forEach((p) => p.forEach((r) => r.reverse()));
};

const fc = JSON.parse(readFileSync(inPath, 'utf8'));
let fixed = 0;
for (const f of fc.features) {
  if (geoArea(f) > 2 * Math.PI) {
    reverseRings(f.geometry);
    fixed++;
  }
}
writeFileSync(outPath, JSON.stringify(fc));
console.log(`rewound ${fixed}/${fc.features.length} features -> ${outPath}`);
