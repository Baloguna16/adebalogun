import { ElectionDataset, Source, StateElection } from './types';

/**
 * Curated election data for the Nigeria tracker. Seeded 2026-06-13 from the
 * research brief: docs/superpowers/research/2026-06-13-nigeria-elections-2027.md
 *
 * MAINTENANCE: this is hand-maintained. Nigerian alignments shift fast — see
 * MAINTENANCE.md and bump each state's `asOf` when you re-verify it. The
 * data-integrity test enforces that every state matches a map boundary.
 */

const SEEDED = '2026-06-13';

// Shared sources (per-state `source` points at the most relevant one)
const S_GOVS: Source = {
  label: 'Wikipedia — current Nigerian state governors',
  url: 'https://en.wikipedia.org/wiki/List_of_current_state_governors_in_Nigeria',
};
const S_INEC_TT: Source = {
  label: 'INEC — revised 2027 timetable',
  url: 'https://www.inecnigeria.org/revised-timetable-and-schedule-of-activities-for-the-2027-general-elections-and-rescheduling-of-osun-state-governorship-election/',
};
const S_INEC_EKITI: Source = {
  label: 'INEC — 2026 Ekiti governorship candidates',
  url: 'https://www.inecnigeria.org/governorship-candidates-for-the-2026-ekiti-governorship-election/',
};
const S_DEFECT: Source = {
  label: 'Intelpoint — 86% of governors now APC (Mar 2026)',
  url: 'https://intelpoint.co/insights/86-of-nigerias-36-state-governors-are-now-in-the-apc-as-of-march-15-2026/',
};
const S_BATTLES: Source = {
  label: 'Vanguard — 2027 governors face fierce battles',
  url: 'https://www.vanguardngr.com/2026/06/2027-govs-face-fierce-battles-to-retain-seats-produce-successors/',
};
const S_OPP: Source = {
  label: 'Premium Times — are any governors truly in opposition?',
  url: 'https://www.premiumtimesng.com/news/headlines/850318-analysis-2027-are-there-any-governors-truly-in-opposition-to-tinubus-reelection.html',
};

const GEN = { type: 'general' as const, date: '2027-02-06' };

// Concise constructor to keep 37 records readable. Defaults: asOf=SEEDED,
// source=S_GOVS, confidence='verified', cycle=GEN.
type Seed = Omit<StateElection, 'asOf' | 'source' | 'confidence' | 'cycle'> &
  Partial<Pick<StateElection, 'asOf' | 'source' | 'confidence' | 'cycle'>>;

const make = (s: Seed): StateElection => ({
  asOf: SEEDED,
  source: S_GOVS,
  confidence: 'verified',
  cycle: GEN,
  ...s,
});

const list: StateElection[] = [
  make({ iso: 'NG-AB', name: 'Abia', governor: 'Alex Otti', currentParty: 'LP', electedParty: 'LP', termLimited: false }),
  make({ iso: 'NG-AD', name: 'Adamawa', governor: 'Ahmadu Fintiri', currentParty: 'APC', electedParty: 'PDP', termLimited: true, termNote: '2nd/final term; defected to APC Feb 2026 — must produce a successor.', source: S_DEFECT, watch: { level: 'med', note: 'Term-limited governor + a historically swing state make the APC succession contest live.', sources: [S_BATTLES] } }),
  make({ iso: 'NG-AK', name: 'Akwa Ibom', governor: 'Umo Eno', currentParty: 'APC', electedParty: 'PDP', termLimited: false, source: S_DEFECT }),
  make({ iso: 'NG-AN', name: 'Anambra', governor: 'Charles Soludo', currentParty: 'APGA', electedParty: 'APGA', termLimited: true, termNote: 'Re-elected Nov 2025 for a 2nd/final term.', cycle: { type: 'offcycle', date: '2029-11' }, source: S_INEC_TT }),
  make({ iso: 'NG-BA', name: 'Bauchi', governor: 'Bala Mohammed', currentParty: 'PDP', electedParty: 'PDP', termLimited: true, termNote: '2nd/final term.', confidence: 'fluid', source: S_OPP, watch: { level: 'high', note: 'One of the last PDP governors; flirted with APC (collapsed Apr 2026) and the ADC. Party could still shift.', sources: [S_OPP] } }),
  make({ iso: 'NG-BY', name: 'Bayelsa', governor: 'Douye Diri', currentParty: 'APC', electedParty: 'PDP', termLimited: false, cycle: { type: 'offcycle', date: '2027-11' }, source: S_INEC_TT }),
  make({ iso: 'NG-BE', name: 'Benue', governor: 'Hyacinth Alia', currentParty: 'APC', electedParty: 'APC', termLimited: false }),
  make({ iso: 'NG-BO', name: 'Borno', governor: 'Babagana Zulum', currentParty: 'APC', electedParty: 'APC', termLimited: true, termNote: '2nd/final term.' }),
  make({ iso: 'NG-CR', name: 'Cross River', governor: 'Bassey Otu', currentParty: 'APC', electedParty: 'APC', termLimited: false }),
  make({ iso: 'NG-DE', name: 'Delta', governor: 'Sheriff Oborevwori', currentParty: 'APC', electedParty: 'PDP', termLimited: false, termNote: 'Defected to APC Apr 2025 with the state PDP structure.', source: S_DEFECT }),
  make({ iso: 'NG-EB', name: 'Ebonyi', governor: 'Francis Nwifuru', currentParty: 'APC', electedParty: 'APC', termLimited: false }),
  make({ iso: 'NG-ED', name: 'Edo', governor: 'Monday Okpebholo', currentParty: 'APC', electedParty: 'APC', termLimited: false, cycle: { type: 'offcycle', date: '2028-09' }, source: S_INEC_TT }),
  make({ iso: 'NG-EK', name: 'Ekiti', governor: 'Biodun Oyebanji', currentParty: 'APC', electedParty: 'APC', termLimited: false, cycle: { type: 'offcycle', date: '2026-06-20' }, source: S_INEC_EKITI, watch: { level: 'high', note: 'Off-cycle vote on 20 Jun 2026 — incumbent Oyebanji (APC) seeks re-election against PDP/ADC/SDP challengers.', sources: [S_INEC_EKITI] } }),
  make({ iso: 'NG-EN', name: 'Enugu', governor: 'Peter Mbah', currentParty: 'APC', electedParty: 'PDP', termLimited: false, termNote: 'Defected to APC Oct 2025.', source: S_DEFECT }),
  make({ iso: 'NG-GO', name: 'Gombe', governor: 'Inuwa Yahaya', currentParty: 'APC', electedParty: 'APC', termLimited: true, termNote: '2nd/final term.' }),
  make({ iso: 'NG-IM', name: 'Imo', governor: 'Hope Uzodimma', currentParty: 'APC', electedParty: 'APC', termLimited: true, termNote: '2nd term, but the count is contested — court-installed Jan 2020, then won 2023. Reportedly eyeing a Senate seat.', confidence: 'contested', cycle: { type: 'offcycle', date: '2027-11' }, source: S_INEC_TT }),
  make({ iso: 'NG-JI', name: 'Jigawa', governor: 'Umar Namadi', currentParty: 'APC', electedParty: 'APC', termLimited: false }),
  make({ iso: 'NG-KD', name: 'Kaduna', governor: 'Uba Sani', currentParty: 'APC', electedParty: 'APC', termLimited: false, watch: { level: 'med', note: 'Religiously and ethnically mixed; historically a tense, closely-watched race.', sources: [S_BATTLES] } }),
  make({ iso: 'NG-KN', name: 'Kano', governor: 'Abba Kabir Yusuf', currentParty: 'APC', electedParty: 'NNPP', termLimited: false, termNote: 'Elected on NNPP; defected to APC Jan 2026.', source: S_DEFECT, watch: { level: 'high', note: "Kwankwaso's stronghold and Nigeria's second-largest electorate; the NNPP→APC flip makes 2027 volatile.", sources: [S_OPP] } }),
  make({ iso: 'NG-KT', name: 'Katsina', governor: 'Dikko Radda', currentParty: 'APC', electedParty: 'APC', termLimited: false }),
  make({ iso: 'NG-KE', name: 'Kebbi', governor: 'Nasir Idris', currentParty: 'APC', electedParty: 'APC', termLimited: false }),
  make({ iso: 'NG-KO', name: 'Kogi', governor: 'Ahmed Ododo', currentParty: 'APC', electedParty: 'APC', termLimited: false, cycle: { type: 'offcycle', date: '2027-11' }, source: S_INEC_TT }),
  make({ iso: 'NG-KW', name: 'Kwara', governor: 'AbdulRahman AbdulRazaq', currentParty: 'APC', electedParty: 'APC', termLimited: true, termNote: '2nd/final term.' }),
  make({ iso: 'NG-LA', name: 'Lagos', governor: 'Babajide Sanwo-Olu', currentParty: 'APC', electedParty: 'APC', termLimited: true, termNote: '2nd/final term — an open seat for Nigeria\'s biggest prize.', watch: { level: 'med', note: 'Term-limited incumbent; the APC succession in the commercial capital is a marquee contest.', sources: [S_BATTLES] } }),
  make({ iso: 'NG-NA', name: 'Nasarawa', governor: 'Abdullahi Sule', currentParty: 'APC', electedParty: 'APC', termLimited: true, termNote: '2nd/final term.' }),
  make({ iso: 'NG-NI', name: 'Niger', governor: 'Mohammed Bago', currentParty: 'APC', electedParty: 'APC', termLimited: false }),
  make({ iso: 'NG-OG', name: 'Ogun', governor: 'Dapo Abiodun', currentParty: 'APC', electedParty: 'APC', termLimited: true, termNote: '2nd/final term.' }),
  make({ iso: 'NG-ON', name: 'Ondo', governor: 'Lucky Aiyedatiwa', currentParty: 'APC', electedParty: 'APC', termLimited: false, termNote: 'Won the Nov 2024 off-cycle election.', cycle: { type: 'offcycle', date: '2028-11' }, source: S_INEC_TT }),
  make({ iso: 'NG-OS', name: 'Osun', governor: 'Ademola Adeleke', currentParty: 'Accord', electedParty: 'PDP', termLimited: false, termNote: 'Elected on PDP; moved to the Accord Party for his re-election bid.', cycle: { type: 'offcycle', date: '2026-08-15' }, source: S_INEC_TT, watch: { level: 'high', note: 'Off-cycle vote on 15 Aug 2026 — Adeleke (Accord) defends against APC in a perennial swing state.', sources: [S_INEC_TT] } }),
  make({ iso: 'NG-OY', name: 'Oyo', governor: 'Seyi Makinde', currentParty: 'APM', electedParty: 'PDP', termLimited: true, termNote: '2nd/final term; left PDP for the APM (mid-2026) and is among the few openly anti-Tinubu governors. Must produce a successor.', confidence: 'fluid', source: S_OPP, watch: { level: 'high', note: 'Opposition stronghold with a term-limited, nationally-ambitious governor — the succession and party realignment are both live.', sources: [S_OPP] } }),
  make({ iso: 'NG-PL', name: 'Plateau', governor: 'Caleb Mutfwang', currentParty: 'APC', electedParty: 'PDP', termLimited: false, termNote: 'Defected to APC Dec 2025.', source: S_DEFECT, watch: { level: 'med', note: 'Middle-Belt swing state with persistent security strain; a recent PDP→APC flip to defend.', sources: [S_BATTLES] } }),
  make({ iso: 'NG-RI', name: 'Rivers', governor: 'Siminalayi Fubara', currentParty: 'APC', electedParty: 'PDP', termLimited: false, termNote: '1st term, but withdrew from the APC primary — will NOT seek re-election. Survived a 2025 suspension during the Wike crisis. The 2027 seat is effectively open.', confidence: 'fluid', source: S_OPP, watch: { level: 'high', note: 'An open seat in an oil-rich state at the centre of the Fubara–Wike power struggle — the most contested race to watch.', sources: [S_OPP] } }),
  make({ iso: 'NG-SO', name: 'Sokoto', governor: 'Ahmad Aliyu', currentParty: 'APC', electedParty: 'APC', termLimited: false }),
  make({ iso: 'NG-TA', name: 'Taraba', governor: 'Agbu Kefas', currentParty: 'APC', electedParty: 'PDP', termLimited: false, termNote: 'Defected to APC Feb 2026.', source: S_DEFECT }),
  make({ iso: 'NG-YO', name: 'Yobe', governor: 'Mai Mala Buni', currentParty: 'APC', electedParty: 'APC', termLimited: true, termNote: '2nd/final term.' }),
  make({ iso: 'NG-ZA', name: 'Zamfara', governor: 'Dauda Lawal', currentParty: 'APC', electedParty: 'PDP', termLimited: false, termNote: 'Defected to APC Mar 2026.', source: S_DEFECT }),
  make({ iso: 'NG-FC', name: 'FCT (Abuja)', governor: 'Nyesom Wike (Minister)', currentParty: 'APC', electedParty: null, termLimited: false, termNote: 'Federal capital — administered by a Minister (APC-aligned), not a governor. No governorship election.', cycle: { type: 'none' }, source: S_GOVS }),
];

export const electionData: ElectionDataset = {
  siteReviewed: SEEDED,
  presidentialAsOf: SEEDED,
  states: Object.fromEntries(list.map((s) => [s.iso, s])),
  presidential: [
    { name: 'Bola Ahmed Tinubu', party: 'APC', runningMate: 'Kashim Shettima', confidence: 'fluid', note: 'Incumbent seeking re-election. Running mate (Shettima) not yet confirmed for 2027 — a Christian VP swap is rumoured.' },
    { name: 'Atiku Abubakar', party: 'ADC (coalition)', confidence: 'contested', note: 'Won the ADC primary (May 2026), but the result is disputed by runners-up and the party is split into factions. Running mate TBD.' },
    { name: 'Peter Obi', party: 'NDC', runningMate: 'Rabiu Kwankwaso', confidence: 'verified', note: 'Left the Labour Party for the Nigerian Democratic Congress; Kwankwaso (ex-NNPP) is his running mate. NDC and the ADC coalition are now rivals, not allies.' },
    { name: 'PDP — fractured', party: 'PDP', confidence: 'contested', note: 'Hollowed out by defections; two factions name competing candidates (Goodluck Jonathan in absentia vs Sandy Onor). A spoiler more than a contender.' },
  ],
  keyDates: [
    { label: 'Ekiti governorship (off-cycle)', date: '2026-06-20', kind: 'offcycle' },
    { label: 'Osun governorship (off-cycle)', date: '2026-08-15', kind: 'offcycle' },
    { label: 'Presidential & National Assembly', date: '2027-01-16', kind: 'general' },
    { label: 'Governorship & State Assemblies', date: '2027-02-06', kind: 'general' },
  ],
  sources: [S_INEC_TT, S_INEC_EKITI, S_GOVS, S_BATTLES, S_DEFECT, S_OPP],
};
