import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  startRound,
  recordFirstMove,
  tickTimer,
  applyRoundWon,
  applyRoundFailed,
  restartGame,
  getAccuracy,
  LIVES_PER_RUN,
  ROUND_TIMER_SECONDS,
} from '../src/game/logic/gameState';

const LEVELS = 3;

describe('createInitialState', () => {
  it('starts in idle phase with full lives', () => {
    const s = createInitialState(LEVELS, 1);
    expect(s.phase).toBe('idle');
    expect(s.lives).toBe(LIVES_PER_RUN);
    expect(s.score).toBe(0);
    expect(s.falls).toBe(0);
    expect(s.roundNumber).toBe(0);
  });
});

describe('startRound', () => {
  it('moves to announcing phase and generates a rule', () => {
    const s = startRound(createInitialState(LEVELS, 1));
    expect(s.phase).toBe('announcing');
    expect(s.currentRule).not.toBeNull();
    expect(s.roundNumber).toBe(1);
    expect(s.timerSecondsLeft).toBe(ROUND_TIMER_SECONDS);
  });
});

describe('tickTimer', () => {
  it('decrements timer during announcing', () => {
    let s = startRound(createInitialState(LEVELS, 1));
    s = tickTimer(s, 5);
    expect(s.timerSecondsLeft).toBeCloseTo(25);
  });

  it('transitions to roundFailed when timer hits 0', () => {
    let s = startRound(createInitialState(LEVELS, 1));
    s = tickTimer(s, ROUND_TIMER_SECONDS + 1);
    expect(s.phase).toBe('roundFailed');
    expect(s.falls).toBe(1);
    expect(s.lives).toBe(LIVES_PER_RUN - 1);
  });

  it('does not tick in finished phase', () => {
    let s = createInitialState(LEVELS, 1);
    s = { ...s, phase: 'finished' };
    const before = s.timerSecondsLeft;
    s = tickTimer(s, 10);
    expect(s.timerSecondsLeft).toBe(before);
  });
});

describe('applyRoundWon', () => {
  it('increases score and roundsSurvived', () => {
    let s = startRound(createInitialState(LEVELS, 1));
    s = recordFirstMove(s, Date.now() - 1000);
    s = applyRoundWon(s, 8, 15, true);
    expect(s.score).toBeGreaterThan(0);
    expect(s.roundsSurvived).toBe(1);
    expect(s.phase).toBe('roundWon');
  });

  it('no double scoring after finished', () => {
    let s = createInitialState(1, 1);
    s = startRound(s);
    s = applyRoundWon(s, 5, 10, true);
    expect(s.phase).toBe('finished');
    const scoreBefore = s.score;
    const s2 = applyRoundWon(s, 5, 10, true); // called again
    expect(s2.score).toBe(scoreBefore);
  });
});

describe('applyRoundFailed', () => {
  it('loses a life and resets streak', () => {
    let s = startRound(createInitialState(LEVELS, 1));
    s = { ...s, comboStreak: 4 };
    s = applyRoundFailed(s);
    expect(s.falls).toBe(1);
    expect(s.lives).toBe(LIVES_PER_RUN - 1);
    expect(s.comboStreak).toBe(0);
  });

  it('transitions to finished at 0 lives', () => {
    let s = createInitialState(LEVELS, 1);
    s = { ...s, lives: 1 };
    s = startRound(s);
    s = applyRoundFailed(s);
    expect(s.phase).toBe('finished');
  });
});

describe('restartGame', () => {
  it('fully resets all counters', () => {
    let s = startRound(createInitialState(LEVELS, 1));
    s = applyRoundWon(s, 5, 10, true);
    const fresh = restartGame(LEVELS, 2);
    expect(fresh.score).toBe(0);
    expect(fresh.falls).toBe(0);
    expect(fresh.roundsSurvived).toBe(0);
    expect(fresh.comboStreak).toBe(0);
    expect(fresh.lives).toBe(LIVES_PER_RUN);
    expect(fresh.phase).toBe('idle');
  });
});

describe('getAccuracy', () => {
  it('returns 0 at zero rounds (not NaN)', () => {
    expect(getAccuracy(createInitialState(LEVELS, 1))).toBe(0);
  });
});
