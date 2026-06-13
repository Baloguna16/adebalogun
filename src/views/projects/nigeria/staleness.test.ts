import { isStale } from './staleness';

// Fixed clock so the test is deterministic and never spontaneously reddens.
const NOW = Date.parse('2026-06-13T00:00:00Z');

describe('isStale', () => {
  test('fresh data (same day) is not stale', () => {
    expect(isStale('2026-06-13', NOW, 120)).toBe(false);
  });

  test('data within the threshold is not stale', () => {
    expect(isStale('2026-04-01', NOW, 120)).toBe(false);
  });

  test('data older than the threshold is stale', () => {
    expect(isStale('2025-12-01', NOW, 120)).toBe(true);
  });

  test('empty asOf is treated as stale', () => {
    expect(isStale('', NOW, 120)).toBe(true);
  });

  test('malformed asOf is treated as stale', () => {
    expect(isStale('June 2026', NOW, 120)).toBe(true);
    expect(isStale('2026-6-1', NOW, 120)).toBe(true);
  });
});
