/**
 * Pure staleness check. The clock is injected so tests are deterministic —
 * a test must never assert "fresh as of real today" (it would spontaneously
 * fail later). The runtime banner passes the real `Date.now()`; tests pass a
 * fixed `now`.
 */

/** Default age (days) after which curated data is considered stale. */
export const DEFAULT_STALE_DAYS = 120;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns true if `asOf` is missing, malformed, or older than `thresholdDays`. */
export const isStale = (
  asOf: string,
  now: number,
  thresholdDays: number = DEFAULT_STALE_DAYS
): boolean => {
  if (!asOf || !DATE_RE.test(asOf)) return true;
  const then = Date.parse(`${asOf}T00:00:00Z`);
  if (Number.isNaN(then)) return true;
  const ageDays = (now - then) / 86_400_000;
  return ageDays > thresholdDays;
};
