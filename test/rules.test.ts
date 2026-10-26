import { describe, it, expect } from 'vitest';
import { createRng } from '../src/game/logic/seededRng';
import { generateRule, TILE_EFFECTS } from '../src/game/logic/rules';

describe('generateRule', () => {
  it('produces reproducible results with fixed seed', () => {
    const r1 = generateRule(createRng(42));
    const r2 = generateRule(createRng(42));
    expect(r1.text).toBe(r2.text);
    expect(r1.isTrue).toBe(r2.isTrue);
  });

  it('when isTrue=true, claimedEffect matches real tile effect', () => {
    // Run many seeds and verify invariant
    for (let seed = 0; seed < 200; seed++) {
      const rule = generateRule(createRng(seed));
      if (rule.isTrue) {
        expect(rule.claimedEffect).toBe(TILE_EFFECTS[rule.color]);
      }
    }
  });

  it('when isTrue=false, claimedEffect differs from real tile effect', () => {
    for (let seed = 0; seed < 200; seed++) {
      const rule = generateRule(createRng(seed));
      if (!rule.isTrue) {
        expect(rule.claimedEffect).not.toBe(TILE_EFFECTS[rule.color]);
      }
    }
  });

  it('rule text is a non-empty string', () => {
    const rule = generateRule(createRng(7));
    expect(typeof rule.text).toBe('string');
    expect(rule.text.length).toBeGreaterThan(0);
  });
});
