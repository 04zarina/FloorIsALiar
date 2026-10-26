import type { TileColorType } from '../scene/materials';

/** Real hidden tile effects */
export type TileEffect = 'safe' | 'bounce' | 'slide' | 'crumble' | 'speedBoost';

/** Per-color real effects (hidden from player unless rule is true) */
export const TILE_EFFECTS: Record<TileColorType, TileEffect> = {
  safe:    'safe',
  bounce:  'bounce',
  slide:   'slide',
  crumble: 'crumble',
  mystery: 'safe',      // mystery tiles are secretly safe
  entry:   'safe',
  exit:    'safe',
};

/** Human-readable rule descriptions */
export const EFFECT_DESCRIPTIONS: Record<TileEffect, string> = {
  safe:       'are completely safe',
  bounce:     'are bouncy (launch you forward)',
  slide:      'are slippery (slide 2 tiles)',
  crumble:    'crumble after you step on them',
  speedBoost: 'give you a speed boost',
};

export type AnnouncedRule = {
  color: TileColorType;
  claimedEffect: TileEffect;
  isTrue: boolean;          // whether the claimed effect matches reality
  text: string;             // human-readable announcement
};

const ANNOUNCEABLE: TileColorType[] = ['safe', 'bounce', 'slide', 'crumble', 'mystery'];

/**
 * Generates a rule announcement for the round using a seeded RNG.
 * @param rng  next() returns [0, 1)
 */
export function generateRule(rng: () => number): AnnouncedRule {
  const color = ANNOUNCEABLE[Math.floor(rng() * ANNOUNCEABLE.length)] as TileColorType;
  const realEffect = TILE_EFFECTS[color];

  // 60% chance the announced rule is true
  const isTrue = rng() < 0.60;

  let claimedEffect: TileEffect;
  if (isTrue) {
    claimedEffect = realEffect;
  } else {
    // Pick a random different effect
    const others: TileEffect[] = (['safe', 'bounce', 'slide', 'crumble', 'speedBoost'] as TileEffect[])
      .filter(e => e !== realEffect);
    claimedEffect = others[Math.floor(rng() * others.length)];
  }

  const colorName = color.charAt(0).toUpperCase() + color.slice(1);
  return {
    color,
    claimedEffect,
    isTrue,
    text: `${colorName} tiles ${EFFECT_DESCRIPTIONS[claimedEffect]}!`,
  };
}
