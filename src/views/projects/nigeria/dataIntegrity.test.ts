import { readFileSync } from 'fs';
import { resolve } from 'path';
import { feature } from 'topojson-client';
import { electionData } from './electionData';
import { PartyCode } from './types';

// Loads the COMMITTED converted TopoJSON and verifies the join is airtight.
const topo = JSON.parse(
  readFileSync(resolve(__dirname, '../../../../public/data/nigeria-states.json'), 'utf8')
);
const fc: any = feature(topo, topo.objects.states);
const geomIsos: string[] = fc.features.map((f: any) => f.properties.shapeISO);
const dataIsos = Object.keys(electionData.states);

const PARTY_CODES: PartyCode[] = ['APC', 'PDP', 'LP', 'APGA', 'Accord', 'APM', 'NNPP', 'OTHER'];

describe('Nigeria data integrity', () => {
  test('TopoJSON object is named "states"', () => {
    expect(Object.keys(topo.objects)).toContain('states');
  });

  test('exactly 37 boundary features and 37 election records', () => {
    expect(geomIsos.length).toBe(37);
    expect(dataIsos.length).toBe(37);
  });

  test('FCT key NG-FC present on both sides', () => {
    expect(geomIsos).toContain('NG-FC');
    expect(dataIsos).toContain('NG-FC');
  });

  test('every boundary shapeISO has exactly one election record', () => {
    const missing = geomIsos.filter((iso) => !electionData.states[iso]);
    expect(missing).toEqual([]);
  });

  test('every election record maps to a real boundary', () => {
    const orphan = dataIsos.filter((iso) => !geomIsos.includes(iso));
    expect(orphan).toEqual([]);
  });

  test('no duplicate boundary shapeISO', () => {
    expect(new Set(geomIsos).size).toBe(geomIsos.length);
  });

  test('every party code is valid (catches seed typos / trailing spaces)', () => {
    for (const s of Object.values(electionData.states)) {
      expect(PARTY_CODES).toContain(s.currentParty);
      if (s.electedParty !== null) expect(PARTY_CODES).toContain(s.electedParty);
    }
  });

  test('every record has a well-formed asOf date', () => {
    for (const s of Object.values(electionData.states)) {
      expect(s.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test('record iso matches its key', () => {
    for (const [k, s] of Object.entries(electionData.states)) {
      expect(s.iso).toBe(k);
    }
  });
});
