import type { TileType } from '../scene/types';

export type TileColorType = TileType;

export type TileEffect = 'safe' | 'bounce' | 'slide' | 'crumble' | 'speedBoost';
export type EffectMap = Record<TileType, TileEffect>;

/** Every color is safe by default. Each round only the announced color gets a real effect. */
export const TILE_EFFECTS: EffectMap = {
  safe: 'safe', bounce: 'safe', slide: 'safe', crumble: 'safe',
  mystery: 'safe', entry: 'safe', exit: 'safe',
};

export const TILE_COLOR_NAMES: Record<TileType, string> = {
  safe: 'Teal', bounce: 'Mustard', slide: 'Orange', crumble: 'Pink',
  mystery: 'Purple', entry: 'Start', exit: 'Exit',
};

export const EFFECT_DESCRIPTIONS: Record<TileEffect, string> = {
  safe: 'are safe to stand on',
  bounce: 'are bouncy',
  slide: 'are slippery',
  crumble: 'crumble when you step on them',
  speedBoost: 'give you a speed boost',
};

export type AnnouncedRule = {
  color: TileType;
  claimedEffect: TileEffect;
  isTrue: boolean;
  text: string;
  /** The REAL effect of every color this round (hidden from the player). */
  effectMap: EffectMap;
};

export const RULE_COLORS: TileType[] = ['safe', 'bounce', 'slide', 'crumble', 'mystery'];
const HAZARDS: TileEffect[] = ['bounce', 'slide', 'crumble'];
const CLAIMABLE: TileEffect[] = ['safe', 'bounce', 'slide', 'crumble'];

export function generateRule(rng: () => number): AnnouncedRule {
  const color = RULE_COLORS[Math.floor(rng() * RULE_COLORS.length)];

  // The announced color's real effect: mostly a hazard, sometimes truly safe
  const real: TileEffect =
    rng() < 0.8 ? HAZARDS[Math.floor(rng() * HAZARDS.length)] : 'safe';

  const effectMap: EffectMap = { ...TILE_EFFECTS };
  effectMap[color] = real;

  const isTrue = rng() < 0.6;
  let claimedEffect: TileEffect = real;
  if (!isTrue) {
    const others = CLAIMABLE.filter((e) => e !== real);
    claimedEffect = others[Math.floor(rng() * others.length)];
  }

  return {
    color, claimedEffect, isTrue, effectMap,
    text: `${TILE_COLOR_NAMES[color]} tiles ${EFFECT_DESCRIPTIONS[claimedEffect]}!`,
  };
}

/**
 * Trust decision: "trusted" = acted as the rule implies.
 *  - rule claims SAFE -> trusted if you stepped on that color
 *  - rule claims a hazard -> trusted if you avoided that color
 * The decision is correct when trusting matched whether the rule was true.
 */
export function evaluateTrust(rule: AnnouncedRule, steppedTypes: ReadonlySet<TileType>): boolean {
  const stepped = steppedTypes.has(rule.color);
  const trusted = rule.claimedEffect === 'safe' ? stepped : !stepped;
  return trusted === rule.isTrue;
}