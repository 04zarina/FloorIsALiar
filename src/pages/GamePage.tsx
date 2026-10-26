import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { 
  Play, 
  HelpCircle, 
  Flame, 
  Megaphone, 
  Timer, 
  Target, 
  Disc3, 
  Layers 
} from 'lucide-react';

export const GamePage: React.FC = () => {
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6">
      {/* Game HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-3xl border-2 border-disco-border bg-disco-surface shadow-retro">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-disco-pink border-2 border-disco-border text-white shadow-retro-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-display font-bold text-disco-cream-muted uppercase">Score</div>
            <div className="text-xl font-bold font-display text-disco-cream">0</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-disco-mustard border-2 border-disco-border text-disco-border shadow-retro-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-display font-bold text-disco-cream-muted uppercase">Wave</div>
            <div className="text-xl font-bold font-display text-disco-cream">Round 1</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-disco-teal border-2 border-disco-border text-white shadow-retro-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-display font-bold text-disco-cream-muted uppercase">Trust Rate</div>
            <div className="text-xl font-bold font-display text-disco-teal">100%</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-disco-orange border-2 border-disco-border text-white shadow-retro-xs">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-display font-bold text-disco-cream-muted uppercase">Dance Clock</div>
            <div className="text-xl font-bold font-display text-disco-cream">00:30</div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHowToPlayOpen(true)}
            leftIcon={<HelpCircle className="w-4 h-4" />}
          >
            Rules
          </Button>
        </div>
      </div>

      {/* Rule Broadcast Banner */}
      <div className="relative rounded-3xl border-2 border-disco-border bg-disco-surface p-5 sm:p-6 shadow-retro border-l-8 border-l-disco-mustard flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-disco-mustard border-2 border-disco-border text-disco-border flex items-center justify-center shrink-0 shadow-retro-xs">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold font-display tracking-wider text-disco-mustard uppercase">
              Loudspeaker Announcement
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-disco-cream mt-0.5">
              &quot;Mustard tiles are safe to step on.&quot;
            </h2>
            <p className="text-xs text-disco-cream-muted mt-0.5">
              50% chance: Is the announcer telling the truth, or playing a sneaky trick?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-display font-bold px-4 py-2 rounded-2xl border-2 border-disco-border bg-disco-elevated text-disco-cream shadow-retro-xs">
            Make Your Choice
          </span>
        </div>
      </div>

      {/* 3D Dance Floor Viewport Shell */}
      <Card className="flex-1 min-h-[480px] p-0 flex flex-col items-center justify-center border-2 border-disco-border shadow-retro-lg relative overflow-hidden bg-disco-bg">
        {/* Dance floor checkerboard accent */}
        <div className="absolute inset-0 dancefloor-checkerboard opacity-25 pointer-events-none" />
        
        {/* Centered Staging Indicator */}
        <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-lg">
          <div className="w-20 h-20 rounded-3xl bg-disco-mustard border-2 border-disco-border flex items-center justify-center shadow-retro mb-6">
            <Disc3 className="w-10 h-10 text-disco-border animate-disco-spin" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold font-display text-disco-cream">
            Dance Floor Viewport Ready
          </h3>

          <p className="text-sm text-disco-cream-muted mt-3 leading-relaxed">
            The Three.js 3D dance floor, raycasting tile controls, and character model will be mounted right here in <strong>Stage 4</strong>.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Play className="w-5 h-5" />}
              onClick={() => setIsHowToPlayOpen(true)}
            >
              Check Dance Rules
            </Button>
          </div>
        </div>

        {/* Viewport status footer */}
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-disco-cream-muted border-t-2 border-disco-border/30 pt-3">
          <span>Camera: Orbital Overhead</span>
          <span>Pointer: 3D Raycasting</span>
          <span>Engine: Three.js + R3F</span>
        </div>
      </Card>

      {/* Dance Rules Modal */}
      <Modal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        title="Dance Floor Guide"
        description="Learn the tricks of the disco floor"
        size="lg"
      >
        <div className="space-y-4 text-sm text-disco-cream">
          <div className="p-4 rounded-2xl border-2 border-disco-border bg-disco-elevated shadow-retro-xs">
            <h4 className="font-bold font-display text-disco-teal text-base mb-1">
              Click-to-Move Raycasting
            </h4>
            <p className="text-xs text-disco-cream-muted leading-relaxed">
              Hover over adjacent floor tiles to inspect them. Click a neighboring tile to take your step. Tiles too far away cannot be reached in a single hop.
            </p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-disco-border bg-disco-elevated shadow-retro-xs">
            <h4 className="font-bold font-display text-disco-mustard text-base mb-1">
              Truth or Lie
            </h4>
            <p className="text-xs text-disco-cream-muted leading-relaxed">
              Each wave announces a rule about one tile color. If the loudspeaker says a color is safe, it might bounce, slide, or crumble instead. Decide whether to trust it or take a detour.
            </p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-disco-border bg-disco-elevated shadow-retro-xs">
            <h4 className="font-bold font-display text-disco-pink text-base mb-1">
              Saved High Scores
            </h4>
            <p className="text-xs text-disco-cream-muted leading-relaxed">
              At the end of your run, your score, accuracy, and fastest dance moves are safely saved to PostgreSQL with Row Level Security.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={() => setIsHowToPlayOpen(false)}>
            Ready to Dance
          </Button>
        </div>
      </Modal>
    </div>
  );
};
