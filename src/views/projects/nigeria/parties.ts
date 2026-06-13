import { PaletteMode } from '@mui/material';
import { Layer, PartyCode, StateElection, TimingBucket } from './types';

/**
 * Self-contained categorical colour tokens — deliberately INDEPENDENT of
 * theme.palette.primary (whose dark value is neon green #08FF00 and would
 * collide). Hues are chosen for cross-mode legibility and to maximise
 * separation; colour is never the sole channel (states also carry an inline
 * party abbreviation — see §6 of the spec).
 */
type ModeColor = { light: string; dark: string };

export const PARTY_COLORS: Record<PartyCode, ModeColor> = {
  APC: { light: '#1f6feb', dark: '#5aa0f2' }, // blue
  PDP: { light: '#d23b3b', dark: '#f06d6d' }, // red
  LP: { light: '#1a9850', dark: '#46c97e' }, // green
  NNPP: { light: '#0f9b9b', dark: '#3fc7c7' }, // teal
  APGA: { light: '#7b4fd6', dark: '#a587e6' }, // purple
  Accord: { light: '#e07b1a', dark: '#f29d4d' }, // orange
  APM: { light: '#c2348a', dark: '#e368b0' }, // magenta
  OTHER: { light: '#8a94a6', dark: '#9aa3b2' }, // grey
};

export const TIMING_COLORS: Record<TimingBucket, ModeColor> = {
  v2026: { light: '#e23b3b', dark: '#f06d6d' }, // votes 2026 — imminent
  gen2027: { light: '#1f6feb', dark: '#5aa0f2' }, // Feb 2027 general — the main event
  off2027: { light: '#0f9b9b', dark: '#3fc7c7' }, // off-cycle 2027
  off2028: { light: '#7b4fd6', dark: '#a587e6' }, // off-cycle 2028
  off2029: { light: '#64748b', dark: '#94a3b8' }, // off-cycle 2029
  none: { light: '#c7ccd6', dark: '#3a414f' }, // FCT — no governorship
};

/** Fallback fill when a feature has no matching election record. */
export const NEUTRAL: ModeColor = { light: '#c7ccd6', dark: '#3a414f' };

export const PARTY_FULL_NAME: Record<PartyCode, string> = {
  APC: 'All Progressives Congress',
  PDP: 'Peoples Democratic Party',
  LP: 'Labour Party',
  APGA: 'All Progressives Grand Alliance',
  Accord: 'Accord Party',
  APM: 'Allied Peoples Movement',
  NNPP: 'New Nigeria Peoples Party',
  OTHER: 'Other',
};

export const resolve = (c: ModeColor, mode: PaletteMode): string =>
  mode === 'dark' ? c.dark : c.light;

/** Display label for a party, honouring partyLabel when the code is 'OTHER'. */
export const partyLabelOf = (
  code: PartyCode,
  partyLabel?: string
): string => (code === 'OTHER' && partyLabel ? partyLabel : code);

/** Derive the timing colour bucket from a state's cycle. */
export const timingBucketOf = (s: StateElection): TimingBucket => {
  if (s.cycle.type === 'none') return 'none';
  if (s.cycle.type === 'general') return 'gen2027';
  const year = s.cycle.date ? s.cycle.date.slice(0, 4) : '';
  switch (year) {
    case '2026':
      return 'v2026';
    case '2027':
      return 'off2027';
    case '2028':
      return 'off2028';
    case '2029':
      return 'off2029';
    default:
      return 'off2027';
  }
};

/** Pure colour selector for a state under a given layer + mode. */
export const fillForState = (
  s: StateElection,
  layer: Layer,
  mode: PaletteMode
): string => {
  if (layer === 'party') {
    // FCT has a party-aligned Minister but no governorship — render neutral,
    // not APC, so the party layer only colours actual governorships.
    if (s.cycle.type === 'none') return resolve(NEUTRAL, mode);
    return resolve(PARTY_COLORS[s.currentParty], mode);
  }
  return resolve(TIMING_COLORS[timingBucketOf(s)], mode);
};
