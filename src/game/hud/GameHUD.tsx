import React, { useState, useEffect } from 'react';
import {
  Flame,
  Layers,
  Timer,
  Zap,
  HelpCircle,
  Skull,
  Eye,
  Camera,
  Maximize2,
  Minimize2,
  Pause,
  Megaphone,
  AlertTriangle,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export interface GameHUDProps {
  roundNumber?: number;
  score?: number;
  timerSeconds?: number;
  roundsSurvived?: number;
  falls?: number;
  accuracy?: number;
  comboStreak?: number;
  lives?: number;
  announcedRule?: string;
  roundKey?: string;
  isOverview: boolean;
  onToggleOverview: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onPauseOrExit: () => void;
  invalidMoveNotice?: string | null;
  onOpenHelp?: () => void;
  onSimulateGameOver?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  roundNumber = 1,
  score = 0,
  timerSeconds = 30,
  roundsSurvived = 0,
  falls = 0,
  accuracy = 100,
  comboStreak = 0,
  lives = 3,
  announcedRule = '',
  roundKey = '',
  isOverview,
  onToggleOverview,
  isFullscreen,
  onToggleFullscreen,
  onPauseOrExit,
  invalidMoveNotice,
  onOpenHelp,
  onSimulateGameOver,
}) => {
  // Rule starts large in center for ~2.5s, then shrinks to a compact chip at top center
  const [showLargeRule, setShowLargeRule] = useState(true);

    useEffect(() => {
    if (!announcedRule) return;
    setShowLargeRule(true);
    const timer = setTimeout(() => setShowLargeRule(false), 6000);
    return () => clearTimeout(timer);
  }, [roundKey, announcedRule]);

  const lowTime = timerSeconds <= 5;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 z-20">
      {/* ================= TOP SECTION ================= */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Score & Combo Streak */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl border-2 border-disco-border bg-disco-surface/95 shadow-retro">
          <div className="flex items-center gap-1.5 px-2">
            <div className="p-1 rounded-lg bg-disco-pink border border-disco-border text-white shadow-retro-xs">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs sm:text-sm font-bold font-display text-disco-cream">
              {score} <span className="text-[10px] text-disco-cream-muted uppercase">PTS</span>
            </div>
          </div>

          <div className="h-5 w-[2px] bg-disco-border/40" />

          <div className="flex items-center gap-1.5 px-2">
            <div className="p-1 rounded-lg bg-disco-mustard border border-disco-border text-disco-border shadow-retro-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs sm:text-sm font-bold font-display text-disco-mustard">
              {comboStreak}x <span className="text-[10px] text-disco-cream-muted uppercase">Streak</span>
            </div>
          </div>
        </div>

        {/* Top-Center: Compact Rule Chip (after the 2.5s large intro) */}
      {showLargeRule && announcedRule && (
        <div className="pointer-events-auto self-center max-w-lg w-full px-4">
          <div className="rounded-3xl border-3 border-disco-border bg-disco-surface p-5 sm:p-6 shadow-retro-xl text-center border-t-8 border-t-disco-mustard">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-disco-mustard border border-disco-border text-disco-border font-display text-xs uppercase tracking-wider mb-2 shadow-retro-xs">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Round {roundNumber} announcement</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-disco-cream mt-1 leading-snug">
              &quot;{announcedRule}&quot;
            </h2>
            <p className="text-xs text-disco-cream-muted mt-1.5">
              Could be true, could be a lie. Choose your route wisely!
            </p>
            <button
              type="button"
              onClick={() => setShowLargeRule(false)}
              className="mt-3 px-4 py-1.5 rounded-xl border-2 border-disco-border bg-disco-mustard text-disco-border font-display text-xs shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

        {/* Top-Right: Timer, Camera, Fullscreen, Exit */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border-2 border-disco-border shadow-retro text-xs sm:text-sm font-bold font-display ${
              lowTime ? 'bg-disco-pink text-white' : 'bg-disco-surface/95 text-disco-cream'
            }`}
            aria-live="off"
          >
            <div className="p-1 rounded-lg bg-disco-orange border border-disco-border text-white shadow-retro-xs">
              <Timer className="w-3 h-3" />
            </div>
            <span>{timerSeconds}s</span>
          </div>

          <button
            type="button"
            onClick={onToggleOverview}
            className={`p-2 rounded-2xl border-2 border-disco-border shadow-retro transition-transform active:translate-x-[1px] active:translate-y-[1px] ${
              isOverview
                ? 'bg-disco-mustard text-disco-border'
                : 'bg-disco-surface/95 text-disco-cream hover:bg-disco-elevated'
            }`}
            title={isOverview ? 'Switch to Follow Camera' : 'Switch to Overview Camera'}
            aria-label="Toggle Camera Mode"
          >
            {isOverview ? <Camera className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded-2xl border-2 border-disco-border bg-disco-surface/95 text-disco-cream hover:bg-disco-elevated shadow-retro transition-transform active:translate-x-[1px] active:translate-y-[1px]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onPauseOrExit}
            className="p-2 rounded-2xl border-2 border-disco-border bg-disco-pink text-white hover:bg-disco-pink-dark shadow-retro transition-transform active:translate-x-[1px] active:translate-y-[1px]"
            title="Pause (Esc)"
            aria-label="Pause"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invalid Move Notice */}
      {invalidMoveNotice && (
        <div className="pointer-events-none self-center max-w-md px-4 py-1.5 rounded-xl border-2 border-disco-border bg-disco-pink text-white shadow-retro font-display text-xs font-bold animate-wobble-subtle flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{invalidMoveNotice}</span>
        </div>
      )}

      {/* ================= BOTTOM SECTION ================= */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom-Left: Lives, Trust, Survived, Falls */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-x-3 gap-y-1 p-1.5 sm:p-2 rounded-2xl border-2 border-disco-border bg-disco-surface/95 shadow-retro text-xs font-display max-w-[75vw]">
          <div className="flex items-center gap-1.5 px-1.5 text-disco-pink" aria-label={`${lives} lives left`}>
            <Heart className="w-3.5 h-3.5 fill-current" />
            <strong>{Math.max(0, lives)}</strong>
          </div>

          <div className="h-4 w-[2px] bg-disco-border/40" />

          <div className="flex items-center gap-1.5 px-1.5 text-disco-cream">
            <ShieldCheck className="w-3.5 h-3.5 text-disco-teal" />
            <span>Trust: <strong>{accuracy}%</strong></span>
          </div>

          <div className="h-4 w-[2px] bg-disco-border/40" />

          <div className="flex items-center gap-1.5 px-1.5 text-disco-cream">
            <Layers className="w-3.5 h-3.5 text-disco-teal" />
            <span>Survived: <strong>{roundsSurvived}</strong></span>
          </div>

          <div className="h-4 w-[2px] bg-disco-border/40" />

          <div className="flex items-center gap-1.5 px-1.5 text-disco-pink">
            <Skull className="w-3.5 h-3.5" />
            <span>Falls: <strong>{falls}</strong></span>
          </div>
        </div>

        {/* Bottom-center intentionally empty to keep the playfield visible */}

        {/* Bottom-Right: Help & demo fall */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {onOpenHelp && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHelp}
              className="h-8 px-2.5 text-xs rounded-xl"
              aria-label="View Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </Button>
          )}

          {onSimulateGameOver && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSimulateGameOver}
              className="h-8 px-2 text-[10px] text-disco-cream-dim hover:text-disco-pink rounded-xl"
              title="Dev only: trigger a fall"
            >
              Demo Fall
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};