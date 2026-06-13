/** Shared types for the Nigeria election tracker. */

export type PartyCode =
  | 'APC'
  | 'PDP'
  | 'LP'
  | 'APGA'
  | 'Accord'
  | 'APM'
  | 'NNPP'
  | 'OTHER';

/** Factual, colored map layers. "Races to watch" is an opt-in annotation, not a layer. */
export type Layer = 'party' | 'timing';

/** Timing colour buckets, derived from a state's cycle. */
export type TimingBucket =
  | 'v2026'
  | 'gen2027'
  | 'off2027'
  | 'off2028'
  | 'off2029'
  | 'none';

export type Confidence = 'verified' | 'fluid' | 'contested';

export interface Source {
  label: string;
  url: string;
}

export interface StateElection {
  /** shapeISO, e.g. 'NG-LA'. FCT is exactly 'NG-FC'. Join key to boundary geometry. */
  iso: string;
  name: string;
  governor: string;
  currentParty: PartyCode;
  /** null for FCT; drives the "⇄ defection" flag when it differs from currentParty. */
  electedParty: PartyCode | null;
  /** Display name when a party is 'OTHER'. */
  partyLabel?: string;
  /** The reader's real question: can the incumbent run again? */
  termLimited: boolean;
  termNote?: string;
  cycle: {
    type: 'general' | 'offcycle' | 'none';
    /** ISO date or 'YYYY-MM'/'YYYY' when known. Display label is derived, never stored. */
    date?: string;
  };
  /** Editorial "races to watch" annotation. Optional and sourced. */
  watch?: { level: 'high' | 'med'; note: string; sources: Source[] };
  confidence: Confidence;
  /** Per-state freshness 'YYYY-MM-DD' (non-empty; validated by test). */
  asOf: string;
  source: Source;
  notes?: string;
  /** Reserved for live-ready-later; shape intentionally unspecified in v1. */
  result?: null;
}

export interface Candidate {
  name: string;
  party: string;
  runningMate?: string;
  confidence: Confidence;
  note?: string;
}

export interface KeyDate {
  label: string;
  date: string; // 'YYYY-MM-DD'
  kind: 'offcycle' | 'general';
}

export interface ElectionDataset {
  /** When the whole set was last swept — distinct from per-state asOf. */
  siteReviewed: string;
  presidentialAsOf: string;
  states: Record<string, StateElection>;
  presidential: Candidate[];
  keyDates: KeyDate[];
  sources: Source[];
}
