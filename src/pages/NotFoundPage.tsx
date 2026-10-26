import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home, Disc3 } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-3xl bg-disco-mustard border-3 border-disco-border text-disco-border flex items-center justify-center shadow-retro mb-6">
        <Disc3 className="w-14 h-14 animate-disco-spin" />
      </div>

      <div className="font-display font-extrabold text-7xl sm:text-8xl text-disco-mustard">
        404
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold font-display text-disco-cream mt-2">
        Lost Off The Dance Floor!
      </h1>

      <p className="text-sm text-disco-cream-muted max-w-md mt-3 mb-8 leading-relaxed">
        The tile you jumped toward doesn&apos;t exist in this corner of the club. Hop back to the main room before the music stops!
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate('/')}
        leftIcon={<Home className="w-5 h-5" />}
      >
        Back to The Floor
      </Button>
    </div>
  );
};
