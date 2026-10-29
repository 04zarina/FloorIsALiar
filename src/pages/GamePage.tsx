import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { DiscoScene } from '../game/scene/DiscoScene';
import { GameHUD } from '../game/hud/GameHUD';
import { StartOverlay } from '../game/hud/StartOverlay';
import { GameOverOverlay } from '../game/hud/GameOverOverlay';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { LEVELS, getTile, recolorLevel } from '../game/graph/tileGraph';
import { evaluateTrust } from '../game/logic/rules';
import { createRng } from '../game/logic/seededRng';
import { initAudio, startMusic, stopMusic, play, isMuted, setMuted } from '../game/audio/sound';
import type { TileType } from '../game/scene/types';
import {
  createInitialState, restartGame, startRound, recordFirstMove, tickTimer,
  applyRoundWon, applyRoundFailed, getAccuracy, getAverageDecisionTime, getNextLevelIndex, type GameState,
} from '../game/logic/gameState';
import { saveSession } from '../lib/gameData';

export const GamePage: React.FC = () => {
  const stepsRef = useRef(0);
  const visitedRef = useRef<Set<TileType>>(new Set());
  const noticeTimer = useRef<number | null>(null);
  const failReasonRef = useRef<'fell' | 'time'>('time');
  const runStartRef = useRef(Date.now());
  const savedRunRef = useRef<number | null>(null);

  const [game, setGame] = useState<GameState>(() => createInitialState(LEVELS.length));
  const [paused, setPaused] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isOverview, setIsOverview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOff, setSoundOff] = useState(isMuted());
  const [currentTileId, setCurrentTileId] = useState(LEVELS[0].startId);
  const [invalidMoveNotice, setInvalidMoveNotice] = useState<string | null>(null);

  const baseLevel = LEVELS[Math.min(game.levelIndex, LEVELS.length - 1)];
  const rule = game.currentRule;

  // Random color shuffle each round; the announced color never appears on the guaranteed route
  const level = useMemo(
    () =>
      rule
        ? recolorLevel(
            baseLevel,
            rule.color,
            createRng(game.seed + game.roundNumber * 101 + game.levelIndex * 13)
          )
        : baseLevel,
    [baseLevel, rule, game.seed, game.roundNumber, game.levelIndex]
  );

  const isActive = game.phase === 'announcing' || game.phase === 'playing';
  const inRun = game.phase !== 'idle';

  // Round timer: stops while paused
  useEffect(() => {
    if (!isActive || paused) return;
    const id = window.setInterval(() => setGame((s) => tickTimer(s, 0.25)), 250);
    return () => window.clearInterval(id);
  }, [isActive, paused]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => () => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    stopMusic();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    if (game.phase === 'announcing') play('rule');
  }, [game.phase, game.roundNumber]);

  useEffect(() => {
    if (game.phase === 'roundFailed') play('lose');
    if (game.phase === 'finished') {
      stopMusic();
      if (game.lives <= 0) play('lose');
    }
    if (game.phase === 'roundWon' && game.comboStreak >= 2) {
      const id = window.setTimeout(() => play('combo'), 900);
      return () => window.clearTimeout(id);
    }
  }, [game.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const pauseGame = useCallback(() => {
    setPaused(true);
    stopMusic();
  }, []);

  const resumeGame = useCallback(() => {
    setPaused(false);
    startMusic();
  }, []);

  // Esc or P toggles pause while a round is active
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' && e.key !== 'p' && e.key !== 'P') return;
      if (!isActive) return;
      if (paused) resumeGame();
      else pauseGame();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, paused, pauseGame, resumeGame]);

  // Save a finished run to Supabase (user_id is set server-side)
  const persistRun = useCallback(async (g: GameState) => {
    setSaveStatus('saving');
    try {
      await saveSession({
        score: g.score,
        roundsSurvived: g.roundsSurvived,
        falls: g.falls,
        accuracy: getAccuracy(g),
        avgDecisionMs: getAverageDecisionTime(g),
        durationSeconds: Math.round((Date.now() - runStartRef.current) / 1000),
        level: g.levelIndex + 1,
        reachedExit: g.lives > 0,
      });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, []);

  // Save exactly once when a run finishes
  useEffect(() => {
    if (game.phase !== 'finished') return;
    if (savedRunRef.current === game.seed) return;
    savedRunRef.current = game.seed;
    void persistRun(game);
  }, [game, persistRun]);

  const handleToggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.().catch(() => {});
    } catch { /* fail gracefully */ }
  }, []);

  const handleToggleSound = useCallback(() => {
    const next = !isMuted();
    setMuted(next);
    setSoundOff(next);
  }, []);

  const beginRound = useCallback((fresh: boolean) => {
    initAudio();
    startMusic();
    // Runs from a button click, so the browser allows fullscreen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    const base = fresh ? restartGame(LEVELS.length) : game;
    const next = LEVELS[Math.min(fresh ? 0 : getNextLevelIndex(base), LEVELS.length - 1)];
    stepsRef.current = 0;
    visitedRef.current = new Set();
    failReasonRef.current = 'time';
    if (fresh) {
      runStartRef.current = Date.now();
      setSaveStatus('idle');
    }
    setPaused(false);
    setCurrentTileId(next.startId);
    setInvalidMoveNotice(null);
    setGame(startRound(base, Date.now(), next.timerSeconds));
  }, [game]);

  const handleTileChanged = useCallback((id: string) => {
    const tile = getTile(level, id);
    if (tile) visitedRef.current.add(tile.type);
    setCurrentTileId(id);
    setInvalidMoveNotice(null);
    stepsRef.current += 1;
    setGame((s) => (s.phase === 'announcing' || s.phase === 'playing' ? recordFirstMove(s) : s));
  }, [level]);

  const handleInvalidMove = useCallback(() => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    setInvalidMoveNotice('You can only step to a neighbouring tile!');
    noticeTimer.current = window.setTimeout(() => setInvalidMoveNotice(null), 1800);
  }, []);

  const handleExitReached = useCallback(() => {
    setGame((s) =>
      (s.phase === 'announcing' || s.phase === 'playing') && s.currentRule
        ? applyRoundWon(
            s,
            stepsRef.current,
            level.tiles.length,
            evaluateTrust(s.currentRule, visitedRef.current)
          )
        : s
    );
  }, [level]);

  const handleFell = useCallback(() => {
    failReasonRef.current = 'fell';
    setGame((s) =>
      s.phase === 'announcing' || s.phase === 'playing'
        ? applyRoundFailed(s, s.currentRule ? evaluateTrust(s.currentRule, visitedRef.current) : undefined)
        : s
    );
  }, []);

  const handleExitToMenu = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    stopMusic();
    setPaused(false);
    setGame(createInitialState(LEVELS.length));
    setCurrentTileId(LEVELS[0].startId);
  }, []);

  const accuracy = Math.round(getAccuracy(game));
  const ruleText = rule?.text ?? '';

  // Failure screen wording
  let failTitle = 'The floor lied!';
  let failDetail = '';
  if (game.phase === 'roundFailed') {
    if (failReasonRef.current === 'time') {
      failTitle = "Time's up!";
      failDetail = 'You ran out of time.';
    } else if (rule?.isTrue) {
      failTitle = 'The floor told the truth!';
      failDetail = 'The rule was TRUE, and you fell anyway.';
    } else {
      failTitle = 'The floor lied!';
      failDetail = 'The rule was a LIE.';
    }
  }

  const content = (
    <div
      className={
        inRun
          ? 'fixed inset-0 z-[100] w-screen h-[100dvh] bg-disco-bg flex flex-col overflow-hidden'
          : 'flex-1 flex flex-col p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-4 relative'
      }
    >
      <div
        className={
          inRun
            ? 'relative w-full h-full flex-1 overflow-hidden select-none'
            : 'relative w-full h-[650px] lg:h-[720px] rounded-3xl border-3 border-disco-border bg-disco-bg shadow-retro-xl overflow-hidden'
        }
      >
        <DiscoScene
          level={level}
          effectMap={game.effectMap}
          resetKey={`${game.seed}-${game.roundNumber}-${game.levelIndex}`}
          inputEnabled={isActive && !paused}
          currentTileId={currentTileId}
          onTileChanged={handleTileChanged}
          onInvalidMove={handleInvalidMove}
          onExitReached={handleExitReached}
          onFell={handleFell}
          isOverview={isOverview}
        />

        {inRun && (
          <GameHUD
            roundNumber={game.levelIndex + 1}
            score={game.score}
            timerSeconds={Math.ceil(game.timerSecondsLeft)}
            roundsSurvived={game.roundsSurvived}
            falls={game.falls}
            accuracy={accuracy}
            comboStreak={game.comboStreak}
            lives={game.lives}
            announcedRule={ruleText}
            roundKey={`${game.seed}-${game.roundNumber}`}
            isOverview={isOverview}
            onToggleOverview={() => setIsOverview((p) => !p)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onPauseOrExit={pauseGame}
            invalidMoveNotice={invalidMoveNotice}
            onOpenHelp={() => setIsHowToPlayOpen(true)}
          />
        )}

        {inRun && (
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={soundOff ? 'Unmute sound' : 'Mute sound'}
            title={soundOff ? 'Unmute' : 'Mute'}
            className="absolute bottom-3 right-16 sm:bottom-5 sm:right-20 z-30 p-2 rounded-2xl border-2 border-disco-border bg-disco-surface text-disco-cream shadow-retro hover:bg-disco-elevated active:translate-x-[1px] active:translate-y-[1px]"
          >
            {soundOff ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        {game.phase === 'idle' && (
          <StartOverlay onStart={() => beginRound(true)} onOpenRules={() => setIsHowToPlayOpen(true)} />
        )}

        {(game.phase === 'roundWon' || game.phase === 'roundFailed') && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-disco-bg/60 p-4">
            <div className="max-w-sm w-full rounded-3xl border-3 border-disco-border bg-disco-surface p-6 text-center shadow-retro-xl">
              <h2 className="font-display text-2xl text-disco-cream">
                {game.phase === 'roundWon' ? 'You made it!' : failTitle}
              </h2>
              {rule && (
                <p className="mt-2 text-sm text-disco-cream">&quot;{rule.text}&quot;</p>
              )}
              <p className="mt-1 text-sm text-disco-cream-muted">
                {game.phase === 'roundWon'
                  ? `The rule was ${rule?.isTrue ? 'TRUE' : 'a LIE'}.`
                  : failDetail}
              </p>
              <p className="mt-1 text-sm text-disco-cream-muted">
                Score {game.score} · Lives {game.lives}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Button variant="primary" onClick={() => beginRound(false)}>
                  {game.phase === 'roundWon' ? `Level ${game.levelIndex + 2}` : 'Try Again'}
                </Button>
                <Button variant="outline" onClick={handleExitToMenu}>Exit to menu</Button>
              </div>
            </div>
          </div>
        )}

        {game.phase === 'finished' && (
          <GameOverOverlay
            score={game.score}
            roundsSurvived={game.roundsSurvived}
            falls={game.falls}
            accuracy={accuracy}
            onPlayAgain={() => beginRound(true)}
          />
        )}

        {/* Save status (shown on the game-over screen) */}
        {game.phase === 'finished' && saveStatus !== 'idle' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-disco-border bg-disco-surface text-xs font-display text-disco-cream shadow-retro">
            {saveStatus === 'saving' && <span>Saving your run…</span>}
            {saveStatus === 'saved' && <span>Run saved to your dashboard ✓</span>}
            {saveStatus === 'error' && (
              <>
                <span>Couldn&apos;t save your run.</span>
                <button
                  type="button"
                  onClick={() => void persistRun(game)}
                  className="px-2 py-1 rounded-lg border-2 border-disco-border bg-disco-mustard text-disco-border"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        )}

        {/* Pause menu */}
        {paused && isActive && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-disco-bg/80 p-4">
            <div className="max-w-xs w-full rounded-3xl border-3 border-disco-border bg-disco-surface p-6 text-center shadow-retro-xl">
              <h2 className="font-display text-2xl text-disco-cream">Paused</h2>
              <p className="mt-1 text-xs text-disco-cream-muted">The timer is stopped.</p>
              <div className="mt-5 flex flex-col gap-2">
                <Button variant="primary" onClick={resumeGame}>Resume</Button>
                <Button variant="outline" onClick={() => beginRound(true)}>Restart run</Button>
                <Button variant="outline" onClick={() => setIsHowToPlayOpen(true)}>How to play</Button>
                <Button variant="ghost" onClick={handleExitToMenu}>Exit to menu</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        title="Dance Floor Guide"
        description="Master the mechanics of FloorIsALiar"
        size="lg"
      >
        <div className="space-y-2 text-sm text-disco-cream-muted">
          <p>Each round announces a rule about ONE tile color. It may be true or a lie.</p>
          <p>Only that color can be bouncy (launches you 2 tiles), slippery (slides you on) or crumbly (breaks 1 second after you land). Every other color is safe.</p>
          <p>Tile colors are shuffled every round, so remember the announcement, not the colors.</p>
          <p>Move with WASD / arrow keys or click a neighbouring tile. Stepping off the floor means falling.</p>
          <p>Press Esc or P to pause. Reach the exit before the timer ends. You have 3 lives and 3 levels.</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={() => setIsHowToPlayOpen(false)}>Close Guide</Button>
        </div>
      </Modal>
    </div>
  );

  // While playing, render above the whole site (navbar included)
  return inRun ? createPortal(content, document.body) : content;
};