import React from 'react';
import { Button } from '../../components/common/Button';
import { Disc3, Play, HelpCircle } from 'lucide-react';

export interface StartOverlayProps {
  onStart: () => void;
  onOpenRules: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({ onStart, onOpenRules }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-disco-border/80 backdrop-blur-xs">
      <div className="max-w-md w-full rounded-3xl border-3 border-disco-border bg-disco-surface p-6 sm:p-8 shadow-retro-xl text-center text-disco-cream">
        {/* Mirror ball emblem */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-disco-mustard border-2 border-disco-border flex items-center justify-center shadow-retro mb-5">
          <Disc3 className="w-11 h-11 text-disco-border animate-disco-spin" />
        </div>

        <h2 className="text-3xl font-bold font-display text-disco-cream">
          FloorIsALiar
        </h2>
        <p className="text-sm font-display text-disco-mustard mt-1 font-bold">
          Don&apos;t trust the floor!
        </p>

        {/* Short "how to play" blurb */}
        <div className="my-6 p-4 rounded-2xl border-2 border-disco-border bg-disco-elevated text-left text-xs text-disco-cream-muted space-y-2 shadow-retro-xs">
          <p className="font-bold text-disco-cream text-sm">
            How The Dance Works:
          </p>
          <p>
            • Each round, a loudspeaker rule is announced about a tile color (e.g. <em>&quot;Mustard tiles are bouncy&quot;</em>).
          </p>
          <p>
            • The rule is <strong>50% TRUE</strong> and <strong>50% LIE</strong>.
          </p>
          <p>
            • Choose whether to trust it or avoid it when picking your route across the floating disco arena.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={onStart}
            leftIcon={<Play className="w-5 h-5" />}
            className="w-full sm:w-auto flex-1 text-base"
          >
            Play Dance Floor
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onOpenRules}
            leftIcon={<HelpCircle className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Rules
          </Button>
        </div>
      </div>
    </div>
  );
};
