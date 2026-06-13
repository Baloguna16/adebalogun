import { StateElection } from './types';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Human date from a 'YYYY-MM-DD' / 'YYYY-MM' / 'YYYY' string. Parsed manually
 * (not via Date) to avoid timezone-shift surprises on month-only values.
 */
export const humanDate = (d?: string): string => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  if (!m) return y;
  const month = MONTHS[parseInt(m, 10) - 1] ?? '';
  return day ? `${parseInt(day, 10)} ${month} ${y}` : `${month} ${y}`;
};

/** Derived "next race" label — never stored, always computed from cycle. */
export const cycleLabel = (rec: StateElection): string => {
  if (rec.cycle.type === 'none') return 'No governorship (federal capital)';
  if (rec.cycle.type === 'general') return 'General election — 6 Feb 2027';
  const when = humanDate(rec.cycle.date);
  return when ? `Off-cycle — ${when}` : 'Off-cycle';
};
