/**
 * Pure scoring functions — no side effects, no Three.js imports.
 */

export const BASE_ROUND_SCORE = 500;
export const SPEED_BONUS_MAX = 300;   // awarded if decision < 1.5s
export const TRUST_BONUS = 150;        // awarded when player correctly trusted/avoided
export const COMBO_MULTIPLIER_CAP = 4;

/**
 * Compute score for a completed round.
 * @param stepsTaken       tiles hopped to reach exit
 * @param maxSteps         longest possible route length
 * @param decisionTimeMs   ms from rule announce to first move (0 means not recorded)
 * @param streak           current combo streak before this round
 * @param trustCorrect     player's route choice matched reality (true=correct, false=incorrect)
 */
export function computeRoundScore(
  stepsTaken: number,
  maxSteps: number,
  decisionTimeMs: number,
  streak: number,
  trustCorrect: boolean
): number {
  // Base: full points for short route, partial for long
  const routeRatio = maxSteps > 0 ? Math.min(stepsTaken, maxSteps) / maxSteps : 1;
  const routeBonus = Math.round(BASE_ROUND_SCORE * (2 - routeRatio)); // shorter = more points

  // Speed bonus: 0–300 linearly over first 5 seconds, then 0
  const speedBonus = decisionTimeMs > 0
    ? Math.round(SPEED_BONUS_MAX * Math.max(0, 1 - decisionTimeMs / 5000))
    : 0;

  // Trust bonus
  const trustBonus = trustCorrect ? TRUST_BONUS : 0;

  // Combo multiplier: 1× at streak 0, caps at COMBO_MULTIPLIER_CAP
  const multiplier = Math.min(1 + Math.floor(streak / 2) * 0.5, COMBO_MULTIPLIER_CAP);

  return Math.round((routeBonus + speedBonus + trustBonus) * multiplier);
}

/**
 * Computes trust accuracy as a percentage (0–100).
 * Returns 0 when there are no attempts (not undefined).
 */
export function computeAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Returns new combo streak after a round.
 */
export function nextStreak(current: number, won: boolean): number {
  return won ? current + 1 : 0;
}
