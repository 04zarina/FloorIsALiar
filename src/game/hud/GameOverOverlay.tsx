import React from 'react';
import { Button } from '../../components/common/Button';
import { RotateCcw, Trophy, Layers, Target, Skull } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

export interface GameOverOverlayProps {
  score?: number;
  roundsSurvived?: number;
  falls?: number;
  accuracy?: number;
  onPlayAgain: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score = 0,
  roundsSurvived = 0,
  falls = 1,
  accuracy = 80,
  onPlayAgain,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-disco-border/85 backdrop-blur-xs">
      <div className="max-w-md w-full rounded-3xl border-3 border-disco-border bg-disco-surface p-6 sm:p-8 shadow-retro-xl text-center text-disco-cream">
        <div className="w-18 h-18 mx-auto rounded-3xl bg-disco-pink border-2 border-disco-border text-white flex items-center justify-center shadow-retro mb-4">
          <Skull className="w-10 h-10" />
        </div>

        <h2 className="text-3xl font-bold font-display text-disco-cream">
          Music Stopped!
        </h2>
        <p className="text-sm text-disco-cream-muted mt-1">
          Final performance results on the disco dance floor
        </p>

        {/* Results Grid */}
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
              <span className="text-xs font-display font-bold uppercase">Waves Beat</span>
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
            <div className="text-2xl font-bold font-display text-disco-cream">
              {falls}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border-2 border-disco-border bg-disco-elevated text-center shadow-retro-xs">
            <div className="flex items-center justify-center gap-1.5 text-disco-orange mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-display font-bold uppercase">Accuracy</span>
            </div>
            <div className="text-2xl font-bold font-display text-disco-cream">
              {accuracy}%
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="lg"
          onClick={onPlayAgain}
          leftIcon={<RotateCcw className="w-5 h-5" />}
          className="w-full justify-center text-base py-4"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};
