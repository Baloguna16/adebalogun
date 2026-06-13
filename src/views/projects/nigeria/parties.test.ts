import {
  PARTY_COLORS,
  TIMING_COLORS,
  NEUTRAL,
  fillForState,
  partyLabelOf,
  resolve,
  timingBucketOf,
} from './parties';
import { electionData } from './electionData';
import { StateElection } from './types';

const get = (iso: string): StateElection => electionData.states[iso];

describe('timingBucketOf', () => {
  test('general election states bucket to gen2027', () => {
    expect(timingBucketOf(get('NG-LA'))).toBe('gen2027');
  });
  test('off-cycle 2026 votes bucket to v2026', () => {
    expect(timingBucketOf(get('NG-EK'))).toBe('v2026'); // 2026-06-20
    expect(timingBucketOf(get('NG-OS'))).toBe('v2026'); // 2026-08-15
  });
  test('off-cycle later years bucket by year', () => {
    expect(timingBucketOf(get('NG-IM'))).toBe('off2027');
    expect(timingBucketOf(get('NG-ED'))).toBe('off2028');
    expect(timingBucketOf(get('NG-AN'))).toBe('off2029');
  });
  test('FCT buckets to none', () => {
    expect(timingBucketOf(get('NG-FC'))).toBe('none');
  });
});

describe('fillForState', () => {
  test('party layer colours by current party', () => {
    expect(fillForState(get('NG-AB'), 'party', 'light')).toBe(
      resolve(PARTY_COLORS.LP, 'light')
    );
    expect(fillForState(get('NG-OY'), 'party', 'dark')).toBe(
      resolve(PARTY_COLORS.APM, 'dark')
    );
  });

  test('FCT is NEUTRAL on the party layer, not APC', () => {
    const fct = get('NG-FC');
    expect(fct.currentParty).toBe('APC');
    expect(fillForState(fct, 'party', 'light')).toBe(resolve(NEUTRAL, 'light'));
    expect(fillForState(fct, 'party', 'light')).not.toBe(
      resolve(PARTY_COLORS.APC, 'light')
    );
  });

  test('timing layer colours by cycle bucket', () => {
    expect(fillForState(get('NG-EK'), 'timing', 'light')).toBe(
      resolve(TIMING_COLORS.v2026, 'light')
    );
    expect(fillForState(get('NG-FC'), 'timing', 'light')).toBe(
      resolve(TIMING_COLORS.none, 'light')
    );
  });

  test('light and dark resolve to different tokens', () => {
    expect(resolve(PARTY_COLORS.APC, 'light')).not.toBe(
      resolve(PARTY_COLORS.APC, 'dark')
    );
  });
});

describe('partyLabelOf', () => {
  test('returns the code for known parties', () => {
    expect(partyLabelOf('APC')).toBe('APC');
  });
  test('uses partyLabel for OTHER', () => {
    expect(partyLabelOf('OTHER', 'SDP')).toBe('SDP');
    expect(partyLabelOf('OTHER')).toBe('OTHER');
  });
});
