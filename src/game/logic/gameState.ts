/**
 * FloorIsALiar game state machine.
 * States: idle -> ready -> playing -> roundWon | roundFailed -> (next round | finished)
 * Pure data/transitions — no React, no Three.js.
 */

import { createRng } from './seededRng';
import { generateRule, type AnnouncedRule } from './rules';
import { computeRoundScore, computeAccuracy, nextStreak } from './scoring';

export type GamePhase =
  | 'idle'       // before first play
  | 'announcing' // rule is being shown (~2.5s)
  | 'playing'    // player is moving
  | 'roundWon'   // reached exit
  | 'roundFailed'// fell or timer expired
  | 'finished';  // no lives left or last level complete

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
  roundNumber: number;
  levelIndex: number;        // 0-based
  totalLevels: number;
  score: number;
  roundsSurvived: number;
  falls: number;
  comboStreak: number;
  trustCorrect: number;      // rounds where player's choice paid off
  trustTotal: number;        // rounds trust could be evaluated
  decisionTimesMs: number[]; // one per completed round
  currentRule: AnnouncedRule | null;
  timerSecondsLeft: number;
  /** Timestamp (Date.now()) when rule was announced — for decision time measurement */
  ruleAnnouncedAt: number;
  /** Timestamp (Date.now()) when player made first move — set once per round */
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
    timerSecondsLeft: ROUND_TIMER_SECONDS,
    ruleAnnouncedAt: 0,
    firstMoveAt: 0,
    seed,
  };
}

// --- Transitions ---

/** Begin the announcing phase for a new round. Returns new state. */
export function startRound(state: GameState, now = Date.now()): GameState {
  const rng = createRng(state.seed + state.roundNumber);
  const rule = generateRule(rng);
  return {
    ...state,
    phase: 'announcing',
    roundNumber: state.roundNumber + 1,
    currentRule: rule,
    timerSecondsLeft: ROUND_TIMER_SECONDS,
    ruleAnnouncedAt: now,
    firstMoveAt: 0,
  };
}

/** Player moved for the first time this round — record decision time. */
export function recordFirstMove(state: GameState, now = Date.now()): GameState {
  if (state.firstMoveAt !== 0) return state; // already recorded
  return {
    ...state,
    phase: 'playing',
    firstMoveAt: now,
  };
}

/** Tick the round timer. Returns updated state; phase becomes 'roundFailed' at 0. */
export function tickTimer(state: GameState, deltaSeconds: number): GameState {
  if (state.phase !== 'announcing' && state.phase !== 'playing') return state;
  const next = Math.max(0, state.timerSecondsLeft - deltaSeconds);
  if (next <= 0) {
    return applyRoundFailed(state);
  }
  return { ...state, timerSecondsLeft: next };
}

/** Player reached the exit. */
export function applyRoundWon(
  state: GameState,
  stepsTaken: number,
  maxSteps: number,
  trustCorrect: boolean,
  now = Date.now()
): GameState {
  if (state.phase === 'finished') return state;

  const decisionTimeMs = state.firstMoveAt > 0 ? now - state.firstMoveAt : 0;
  const newStreak = nextStreak(state.comboStreak, true);
  const roundScore = computeRoundScore(stepsTaken, maxSteps, decisionTimeMs, state.comboStreak, trustCorrect);
  const newTrustTotal = state.trustTotal + 1;
  const newTrustCorrect = state.trustCorrect + (trustCorrect ? 1 : 0);

  const levelComplete = state.roundNumber >= state.totalLevels;
  const phase: GamePhase = levelComplete ? 'finished' : 'roundWon';

  return {
    ...state,
    phase,
    score: state.score + roundScore,
    roundsSurvived: state.roundsSurvived + 1,
    comboStreak: newStreak,
    trustCorrect: newTrustCorrect,
    trustTotal: newTrustTotal,
    decisionTimesMs: [...state.decisionTimesMs, decisionTimeMs],
  };
}

/** Player fell or timer expired. */
export function applyRoundFailed(state: GameState): GameState {
  if (state.phase === 'finished') return state;

  const newLives = state.lives - 1;
  const phase: GamePhase = newLives <= 0 ? 'finished' : 'roundFailed';

  return {
    ...state,
    phase,
    lives: newLives,
    falls: state.falls + 1,
    comboStreak: 0,
    timerSecondsLeft: 0,
  };
}

/** Full restart (new game). */
export function restartGame(totalLevels: number, seed = Date.now()): GameState {
  return createInitialState(totalLevels, seed);
}

// --- Derived getters ---

export function getAccuracy(state: GameState): number {
  return computeAccuracy(state.trustCorrect, state.trustTotal);
}

export function getAverageDecisionTime(state: GameState): number {
  if (state.decisionTimesMs.length === 0) return 0;
  return Math.round(state.decisionTimesMs.reduce((a, b) => a + b, 0) / state.decisionTimesMs.length);
}
