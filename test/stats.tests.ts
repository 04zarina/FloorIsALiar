import { describe, it, expect } from 'vitest';
import { getStats } from '../src/lib/stats';

const s = (score: number, accuracy: number, ms: number, r: number, f: number) => ({
  score, accuracy, avg_reaction_ms: ms, rounds_survived: r, falls: f,
});

describe('getStats', () => {
  it('handles zero sessions safely', () => {
    expect(getStats([])).toEqual({
      totalGames: 0, bestScore: 0, averageScore: 0, averageAccuracy: 0,
      averageDecisionMs: 0, totalRoundsSurvived: 0, totalFalls: 0,
    });
  });
  it('computes totals and averages', () => {
    const r = getStats([s(100, 50, 2000, 1, 2), s(300, 100, 1000, 3, 0)]);
    expect(r.totalGames).toBe(2);
    expect(r.bestScore).toBe(300);
    expect(r.averageScore).toBe(200);
    expect(r.averageAccuracy).toBe(75);
    expect(r.averageDecisionMs).toBe(1500);
    expect(r.totalRoundsSurvived).toBe(4);
    expect(r.totalFalls).toBe(2);
  });
});