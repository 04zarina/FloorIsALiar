import React from 'react';
import { Button } from '../../components/common/Button';
import { RotateCcw, Trophy, Layers, Target, Skull, Home, PartyPopper } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

export interface GameOverOverlayProps {
  score?: number;
  roundsSurvived?: number;
  falls?: number;
  accuracy?: number;
  won?: boolean;
  onPlayAgain: () => void;
  onReturnToMenu?: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score = 0,
  roundsSurvived = 0,
  falls = 0,
  accuracy = 0,
  won = false,
  onPlayAgain,
  onReturnToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-disco-border/85">
      <div className="max-w-md w-full rounded-3xl border-3 border-disco-border bg-disco-surface p-6 sm:p-8 shadow-retro-xl text-center text-disco-cream">
        <div
          className={`w-16 h-16 mx-auto rounded-3xl border-2 border-disco-border flex items-center justify-center shadow-retro mb-4 ${
            won ? 'bg-disco-mustard text-disco-border' : 'bg-disco-pink text-white'
          }`}
        >
          {won ? <PartyPopper className="w-9 h-9" /> : <Skull className="w-9 h-9" />}
        </div>

        <h2 className="text-3xl font-bold font-display text-disco-cream">
          {won ? 'You cleared the floor!' : 'Music Stopped!'}
        </h2>
        <p className="text-sm text-disco-cream-muted mt-1">
          {won
            ? 'All 3 levels beaten. You outsmarted the liar!'
            : 'You ran out of lives. The floor wins this time.'}
        </p>

        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="p-3.5 rounded-2xl border-2 border-disco-border bg-disco-elevated text-center shadow-retro-xs">
            <div className="flex items-center justify-center gap-1.5 text-disco-mustard mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-display font-bold uppercase">Final Score</span>
            </div>
            <div className="text-2xl font-bold font-display text-disco-cream">
              {formatNumber(score)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border-2 border-disco-border bg-disco-elevated text-center shadow-retro-xs">
            <div className="flex items-center justify-center gap-1.5 text-disco-teal mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-display font-bold uppercase">Levels Cleared</span>
            </div>
            <div className="text-2xl font-bold font-display text-disco-cream">
              {roundsSurvived}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border-2 border-disco-border bg-disco-elevated text-center shadow-retro-xs">
            <div className="flex items-center justify-center gap-1.5 text-disco-pink mb-1">
              <Skull className="w-4 h-4" />
              <span className="text-xs font-display font-bold uppercase">Total Falls</span>
            </div>
            <div className="text-2xl font-bold font-display text-disco-cream">{falls}</div>
          </div>

          <div className="p-3.5 rounded-2xl border-2 border-disco-border bg-disco-elevated text-center shadow-retro-xs">
            <div className="flex items-center justify-center gap-1.5 text-disco-orange mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-display font-bold uppercase">Trust Accuracy</span>
            </div>
            <div className="text-2xl font-bold font-display text-disco-cream">{accuracy}%</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            size="lg"
            onClick={onPlayAgain}
            leftIcon={<RotateCcw className="w-5 h-5" />}
            className="w-full justify-center text-base py-4"
          >
            Play Again
          </Button>
          {onReturnToMenu && (
            <Button
              variant="outline"
              size="lg"
              onClick={onReturnToMenu}
              leftIcon={<Home className="w-5 h-5" />}
              className="w-full justify-center text-base py-3"
            >
              Return to main menu
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};