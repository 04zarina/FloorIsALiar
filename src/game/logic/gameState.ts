/**
 * FloorIsALiar game state machine.
 * idle -> announcing -> playing -> roundWon | roundFailed -> (next level / retry | finished)
 * Pure data/transitions: no React, no Three.js.
 */

import { createRng } from './seededRng';
import { generateRule, TILE_EFFECTS, type AnnouncedRule, type EffectMap } from './rules';
import { computeRoundScore, computeAccuracy, nextStreak } from './scoring';

export type GamePhase =
  | 'idle'
  | 'announcing'
  | 'playing'
  | 'roundWon'
  | 'roundFailed'
  | 'finished';

export const LIVES_PER_RUN = 3;
export const ROUND_TIMER_SECONDS = 30;

export interface RoundStats {
  roundNumber: number;
  score: number;
  stepsTaken: number;
  decisionTimeMs: number;
  trustCorrect: boolean;
}

export interface GameState {
  phase: GamePhase;
  lives: number;
  roundNumber: number;       // attempts so far (retries count)
  levelIndex: number;        // 0-based current level
  totalLevels: number;
  score: number;
  roundsSurvived: number;
  falls: number;
  comboStreak: number;
  trustCorrect: number;
  trustTotal: number;
  decisionTimesMs: number[];
  currentRule: AnnouncedRule | null;
  effectMap: EffectMap;      // real effects this round
  timerSecondsLeft: number;
  /** Date.now() when the rule was announced: start of decision-time measurement */
  ruleAnnouncedAt: number;
  /** Date.now() when the player first moved this round (0 = not yet) */
  firstMoveAt: number;
  seed: number;
}

export function createInitialState(totalLevels: number, seed = Date.now()): GameState {
  return {
    phase: 'idle',
    lives: LIVES_PER_RUN,
    roundNumber: 0,
    levelIndex: 0,
    totalLevels,
    score: 0,
    roundsSurvived: 0,
    falls: 0,
    comboStreak: 0,
    trustCorrect: 0,
    trustTotal: 0,
    decisionTimesMs: [],
    currentRule: null,
    effectMap: { ...TILE_EFFECTS },
    timerSecondsLeft: ROUND_TIMER_SECONDS,
    ruleAnnouncedAt: 0,
    firstMoveAt: 0,
    seed,
  };
}

/** Level the next round will use: advances only after a win. */
export function getNextLevelIndex(state: GameState): number {
  return state.phase === 'roundWon' ? state.levelIndex + 1 : state.levelIndex;
}

/** Begin the announcing phase for a new round. */
export function startRound(
  state: GameState,
  now = Date.now(),
  timerSeconds = ROUND_TIMER_SECONDS
): GameState {
  const rng = createRng(state.seed + state.roundNumber);
  const rule = generateRule(rng);
  return {
    ...state,
    phase: 'announcing',
    roundNumber: state.roundNumber + 1,
    levelIndex: getNextLevelIndex(state),
    currentRule: rule,
    effectMap: rule.effectMap,
    timerSecondsLeft: timerSeconds,
    ruleAnnouncedAt: now,
    firstMoveAt: 0,
  };
}

/** Player moved for the first time this round. */
export function recordFirstMove(state: GameState, now = Date.now()): GameState {
  if (state.firstMoveAt !== 0) return state;
  return { ...state, phase: 'playing', firstMoveAt: now };
}

/** Tick the round timer. Phase becomes failed (or finished) at 0. */
export function tickTimer(state: GameState, deltaSeconds: number): GameState {
  if (state.phase !== 'announcing' && state.phase !== 'playing') return state;
  const next = Math.max(0, state.timerSecondsLeft - deltaSeconds);
  if (next <= 0) return applyRoundFailed(state);
  return { ...state, timerSecondsLeft: next };
}

/** Player reached the exit. */
export function applyRoundWon(
  state: GameState,
  stepsTaken: number,
  maxSteps: number,
  trustCorrect: boolean,
): GameState {
  if (state.phase === 'finished') return state;

  // Decision time = rule announcement -> first move.
  const decisionTimeMs =
    state.firstMoveAt > 0 && state.ruleAnnouncedAt > 0
      ? Math.max(0, state.firstMoveAt - state.ruleAnnouncedAt)
      : 0;

  const roundScore = computeRoundScore(
    stepsTaken, maxSteps, decisionTimeMs, state.comboStreak, trustCorrect
  );

  const lastLevel = state.levelIndex >= state.totalLevels - 1;

  return {
    ...state,
    phase: lastLevel ? 'finished' : 'roundWon',
    score: state.score + roundScore,
    roundsSurvived: state.roundsSurvived + 1,
    comboStreak: nextStreak(state.comboStreak, true),
    trustCorrect: state.trustCorrect + (trustCorrect ? 1 : 0),
    trustTotal: state.trustTotal + 1,
    decisionTimesMs: [...state.decisionTimesMs, decisionTimeMs],
  };
}

/** Player fell or timer expired. Pass trustCorrect to also score the trust decision. */
export function applyRoundFailed(state: GameState, trustCorrect?: boolean): GameState {
  if (state.phase === 'finished') return state;

  const newLives = state.lives - 1;
  const evaluated = trustCorrect !== undefined;

  return {
    ...state,
    phase: newLives <= 0 ? 'finished' : 'roundFailed',
    lives: newLives,
    falls: state.falls + 1,
    comboStreak: 0,
    timerSecondsLeft: 0,
    trustCorrect: state.trustCorrect + (evaluated && trustCorrect ? 1 : 0),
    trustTotal: state.trustTotal + (evaluated ? 1 : 0),
  };
}

export function restartGame(totalLevels: number, seed = Date.now()): GameState {
  return createInitialState(totalLevels, seed);
}

export function getAccuracy(state: GameState): number {
  return computeAccuracy(state.trustCorrect, state.trustTotal);
}

export function getAverageDecisionTime(state: GameState): number {
  if (state.decisionTimesMs.length === 0) return 0;
  return Math.round(
    state.decisionTimesMs.reduce((a, b) => a + b, 0) / state.decisionTimesMs.length
  );
}