// One-shot assertion that the committed Nigeria TopoJSON is intact.
// Run: node scripts/verify-nigeria-topojson.mjs
// Verifies: object name `states`, 37 features, every shapeISO non-null, NG-FC present.
import { readFileSync } from 'node:fs';
import { feature } from 'topojson-client';

const path = new URL('../public/data/nigeria-states.json', import.meta.url);
const topo = JSON.parse(readFileSync(path, 'utf8'));

const errors = [];
const objNames = Object.keys(topo.objects || {});
if (!objNames.includes('states')) {
  errors.push(`object name 'states' missing; found: ${objNames.join(', ') || '(none)'}`);
}

let isos = [];
if (objNames.includes('states')) {
  const fc = feature(topo, topo.objects.states);
  const features = fc.features || [];
  if (features.length !== 37) errors.push(`expected 37 features, got ${features.length}`);
  isos = features.map((f) => f.properties?.shapeISO);
  const missing = features.filter((f) => !f.properties?.shapeISO);
  if (missing.length) errors.push(`${missing.length} feature(s) missing shapeISO`);
  if (!isos.includes('NG-FC')) errors.push(`FCT key 'NG-FC' not present`);
  const dupes = isos.filter((v, i) => isos.indexOf(v) !== i);
  if (dupes.length) errors.push(`duplicate shapeISO: ${[...new Set(dupes)].join(', ')}`);
}

if (errors.length) {
  console.error('❌ TopoJSON verification FAILED:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✅ TopoJSON OK — object 'states', 37 features, all shapeISO present (incl. NG-FC).`);
console.log(`   sample: ${isos.slice(0, 6).join(', ')}`);
