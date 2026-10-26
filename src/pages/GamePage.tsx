import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DiscoScene } from '../game/scene/DiscoScene';
import { GameHUD } from '../game/hud/GameHUD';
import { StartOverlay } from '../game/hud/StartOverlay';
import { GameOverOverlay } from '../game/hud/GameOverOverlay';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

type GameScreenState = 'start' | 'playing' | 'gameover';

export const GamePage: React.FC = () => {
  const { addToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const [screenState, setScreenState] = useState<GameScreenState>('start');
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isOverview, setIsOverview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active tile state in the enlarged 7x14 arena graph
  const [currentTileId, setCurrentTileId] = useState<string>('start');
  const [invalidMoveNotice, setInvalidMoveNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);

  // Synchronize browser Fullscreen API state (e.g. Esc key pressed)
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Fullscreen API toggle on user click with graceful failure handling
  const handleToggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {
            // Graceful fallback if iframe or browser blocks request
          });
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      // Fail gracefully
    }
  }, []);

  // Handles smooth tile hop completion
  const handleTileChanged = useCallback((newTileId: string) => {
    setCurrentTileId(newTileId);
    setInvalidMoveNotice(null);
  }, []);

  // Handles invalid non-adjacent clicks
  const handleInvalidMove = useCallback((_tileId: string) => {
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    setInvalidMoveNotice('Only adjacent tiles can be hopped to!');
    noticeTimer.current = window.setTimeout(() => {
      setInvalidMoveNotice(null);
    }, 1800);
  }, []);

  // Requirement 4: Placeholder callback when exit portal is reached
  const handleExitReached = useCallback(() => {
    console.log('Exit reached! Completed demo run.');
    addToast('Exit reached! Stage 5 will handle wave completion.', 'success');
  }, [addToast]);

  // Corner Pause/Exit button: exits fullscreen play and returns to start screen
  const handlePauseOrExit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setScreenState('start');
  }, []);

  // Placeholder HUD values for Stage 4b
  const roundNumber = 1;
  const score = 0;
  const timerSeconds = 30;
  const roundsSurvived = 0;
  const falls = 0;
  const accuracy = 100;
  const comboStreak = 0;
  const announcedRule = 'Mustard tiles are bouncy!';

  const isPlayingFullscreen = screenState === 'playing';

  return (
    <div
      ref={containerRef}
      className={
        isPlayingFullscreen
          ? 'fixed inset-0 z-50 w-screen h-[100dvh] bg-disco-bg flex flex-col overflow-hidden'
          : 'flex-1 flex flex-col p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-4 relative'
      }
    >
      {/* 3D Disco Arena Viewport Container */}
      <div
        className={
          isPlayingFullscreen
            ? 'relative w-full h-full flex-1 overflow-hidden select-none'
            : 'relative w-full h-[650px] lg:h-[720px] rounded-3xl border-3 border-disco-border bg-disco-bg shadow-retro-xl overflow-hidden'
        }
      >
        {/* Three.js Interactive 3D Canvas */}
        <DiscoScene
          currentTileId={currentTileId}
          onTileChanged={handleTileChanged}
          onInvalidMove={handleInvalidMove}
          onExitReached={handleExitReached}
          isOverview={isOverview}
        />

        {/* Regular React HTML HUD Overlay */}
        <GameHUD
          roundNumber={roundNumber}
          score={score}
          timerSeconds={timerSeconds}
          roundsSurvived={roundsSurvived}
          falls={falls}
          accuracy={accuracy}
          comboStreak={comboStreak}
          announcedRule={announcedRule}
          isOverview={isOverview}
          onToggleOverview={() => setIsOverview((prev) => !prev)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onPauseOrExit={handlePauseOrExit}
          invalidMoveNotice={invalidMoveNotice}
          onOpenHelp={() => setIsHowToPlayOpen(true)}
          onSimulateGameOver={() => setScreenState('gameover')}
        />

        {/* Start Screen Overlay */}
        {screenState === 'start' && (
          <StartOverlay
            onStart={() => setScreenState('playing')}
            onOpenRules={() => setIsHowToPlayOpen(true)}
          />
        )}

        {/* Game Over Presentation Overlay */}
        {screenState === 'gameover' && (
          <GameOverOverlay
            score={score}
            roundsSurvived={roundsSurvived}
            falls={falls}
            accuracy={accuracy}
            onPlayAgain={() => {
              setCurrentTileId('start');
              setScreenState('playing');
            }}
          />
        )}
      </div>

      {/* Rules & Guide Modal */}
      <Modal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        title="Dance Floor Guide"
        description="Master the mechanics of FloorIsALiar"
        size="lg"
      >
        <div className="space-y-4 text-sm text-disco-cream">
          <div className="p-4 rounded-2xl border-2 border-disco-border bg-disco-elevated shadow-retro-xs">
            <h4 className="font-bold font-display text-disco-mustard text-base mb-1">
              Move Queuing (Hop Chaining)
            </h4>
            <p className="text-xs text-disco-cream-muted leading-relaxed">
              Click adjacent tiles to hop! You can queue up to 2 moves ahead while mid-air, allowing hops to chain smoothly without stopping.
            </p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-disco-border bg-disco-elevated shadow-retro-xs">
            <h4 className="font-bold font-display text-disco-teal text-base mb-1">
              Three Distinct Routes
            </h4>
            <p className="text-xs text-disco-cream-muted leading-relaxed">
              Explore the 7x14 arena: choose the <strong>Right branch</strong> (fastest & high risk), the <strong>Center branch</strong> (balanced & winding), or the <strong>Left flank</strong> (longest & safest).
            </p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-disco-border bg-disco-elevated shadow-retro-xs">
            <h4 className="font-bold font-display text-disco-pink text-base mb-1">
              Fullscreen & Camera Controls
            </h4>
            <p className="text-xs text-disco-cream-muted leading-relaxed">
              Use the corner buttons to switch to full-screen mode, toggle the high-angle Overview camera, or pause and return to the main floor anytime.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={() => setIsHowToPlayOpen(false)}>
            Close Guide
          </Button>
        </div>
      </Modal>
    </div>
  );
};
