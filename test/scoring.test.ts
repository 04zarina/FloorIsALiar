import { describe, it, expect } from 'vitest';
import { computeRoundScore, computeAccuracy, nextStreak, COMBO_MULTIPLIER_CAP } from '../src/game/logic/scoring';

describe('computeRoundScore', () => {
  it('gives higher score for shorter route', () => {
    const short = computeRoundScore(5, 15, 1000, 0, true);
    const long  = computeRoundScore(14, 15, 1000, 0, true);
    expect(short).toBeGreaterThan(long);
  });

  it('gives trust bonus when trustCorrect=true', () => {
    const withTrust    = computeRoundScore(10, 15, 0, 0, true);
    const withoutTrust = computeRoundScore(10, 15, 0, 0, false);
    expect(withTrust).toBeGreaterThan(withoutTrust);
  });

  it('applies combo multiplier (caps at COMBO_MULTIPLIER_CAP)', () => {
    const s1 = computeRoundScore(10, 15, 0, 0, false);
    const s2 = computeRoundScore(10, 15, 0, 4, false);
    const s3 = computeRoundScore(10, 15, 0, 100, false); // huge streak
    expect(s2).toBeGreaterThan(s1);
    // Capped: s3 multiplier should not exceed COMBO_MULTIPLIER_CAP
    const s4 = computeRoundScore(10, 15, 0, 200, false);
    expect(s4).toBe(s3); // both capped
  });

  it('gives 0 speed bonus for decisionTimeMs=0 (unrecorded)', () => {
    const noRecord  = computeRoundScore(10, 15, 0, 0, false);
    const slowMover = computeRoundScore(10, 15, 9999, 0, false);
    expect(noRecord).toBe(slowMover); // both get 0 speed bonus
  });

  it('gives max speed bonus for very fast decision', () => {
    const fast = computeRoundScore(10, 15, 100, 0, false);
    const slow = computeRoundScore(10, 15, 4999, 0, false);
    expect(fast).toBeGreaterThan(slow);
  });
});

describe('computeAccuracy', () => {
  it('returns 0 at zero attempts (not undefined/NaN)', () => {
    expect(computeAccuracy(0, 0)).toBe(0);
  });

  it('returns 100 for all correct', () => {
    expect(computeAccuracy(5, 5)).toBe(100);
  });

  it('returns 50 for half correct', () => {
    expect(computeAccuracy(3, 6)).toBe(50);
  });
});

describe('nextStreak', () => {
  it('increments on win', () => expect(nextStreak(3, true)).toBe(4));
  it('resets on loss',   () => expect(nextStreak(5, false)).toBe(0));
});
