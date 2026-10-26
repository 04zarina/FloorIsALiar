import React from 'react';
import { Disc3, Sparkles, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t-2 border-disco-border bg-disco-bg mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-disco-cream-muted">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-disco-mustard border border-disco-border flex items-center justify-center shadow-retro-xs">
              <Disc3 className="w-4 h-4 text-disco-border" />
            </div>
            <span className="font-display font-bold text-disco-cream tracking-wide">
              FloorIsALiar
            </span>
            <span className="text-disco-cream-dim">•</span>
            <span className="text-disco-mustard font-medium">Keep dancing, stay balanced</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-disco-cream-muted">
              <Sparkles className="w-3.5 h-3.5 text-disco-pink" />
              <span>Three.js 3D Dance Floor</span>
            </span>
            <span className="flex items-center gap-1.5 text-disco-cream-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-disco-teal" />
              <span>Row Level Security Active</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
