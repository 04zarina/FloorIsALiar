import { describe, it, expect } from 'vitest';
import { generateRule, evaluateTrust } from '../src/game/logic/rules';
import { createRng } from '../src/game/logic/seededRng';
import type { TileType } from '../src/game/scene/types';

const seeds = Array.from({ length: 200 }, (_, i) => i + 1);
const COLORS: TileType[] = ['safe', 'bounce', 'slide', 'crumble', 'mystery'];

describe('generateRule', () => {
  it('true rules claim the real effect, false rules claim a different one', () => {
    for (const seed of seeds) {
      const r = generateRule(createRng(seed));
      const real = r.effectMap[r.color];
      if (r.isTrue) expect(r.claimedEffect).toBe(real);
      else expect(r.claimedEffect).not.toBe(real);
    }
  });

  it('every color except the announced one is safe', () => {
    for (const seed of seeds) {
      const r = generateRule(createRng(seed));
      for (const c of COLORS) {
        if (c !== r.color) expect(r.effectMap[c]).toBe('safe');
      }
    }
  });

  it('is deterministic for a seed and names a color', () => {
    const a = generateRule(createRng(42));
    const b = generateRule(createRng(42));
    expect(a).toEqual(b);
    expect(a.text).toMatch(/^(Teal|Mustard|Orange|Pink|Purple) tiles /);
  });

  it('announces every color across many seeds', () => {
    const seen = new Set(seeds.map((s) => generateRule(createRng(s)).color));
    expect(seen.size).toBe(5);
  });
});

describe('evaluateTrust', () => {
  const base = generateRule(createRng(1));
  const rule = (claimedEffect: typeof base.claimedEffect, isTrue: boolean) => ({
    ...base, color: 'bounce' as const, claimedEffect, isTrue,
  });
  const stepped = new Set<TileType>(['bounce']);
  const avoided = new Set<TileType>();

  it('trusting a true "safe" rule by stepping is correct', () => {
    expect(evaluateTrust(rule('safe', true), stepped)).toBe(true);
  });
  it('trusting a lying "safe" rule is incorrect', () => {
    expect(evaluateTrust(rule('safe', false), stepped)).toBe(false);
  });
  it('avoiding a truly dangerous color is correct', () => {
    expect(evaluateTrust(rule('crumble', true), avoided)).toBe(true);
  });
  it('avoiding a color that was lied about is incorrect', () => {
    expect(evaluateTrust(rule('crumble', false), avoided)).toBe(false);
  });
  it('ignoring a lying warning by stepping is correct', () => {
    expect(evaluateTrust(rule('crumble', false), stepped)).toBe(true);
  });
});