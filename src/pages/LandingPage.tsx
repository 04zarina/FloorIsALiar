import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { 
  Gamepad2, 
  Trophy, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  HelpCircle, 
  Flame, 
  Disc3 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // The 5 theme tile colors defined for the 1970s disco dance floor
  const tileTypes = [
    { name: 'Teal Tile', effect: 'Safe & Solid', bg: 'bg-disco-teal', desc: 'Guaranteed solid footing. Always safe to step on.' },
    { name: 'Mustard Tile', effect: 'Super Bounce', bg: 'bg-disco-mustard', desc: 'Launches you 2 tiles ahead across the dance floor.' },
    { name: 'Tangerine Tile', effect: 'Slick Slide', bg: 'bg-disco-orange', desc: 'Slippery momentum forces you 1 extra tile forward.' },
    { name: 'Hot Pink Tile', effect: 'Floor Crumble', bg: 'bg-disco-pink', desc: 'Shakes and drops away into the void below!' },
    { name: 'Grape Tile', effect: 'Mystery Shuffle', bg: 'bg-disco-grape', desc: 'Bonus points or random surprise lane hops.' },
  ];

  return (
    <div className="flex flex-col gap-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <section className="text-center relative py-10 md:py-16 flex flex-col items-center">
        {/* Playful 1970s badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl border-2 border-disco-border bg-disco-mustard text-disco-border shadow-retro mb-6 text-sm font-bold font-display">
          <Disc3 className="w-5 h-5 animate-disco-spin text-disco-border" />
          <span>The Grooviest Deception Game Around</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-wide text-disco-cream max-w-4xl leading-tight">
          The tiles lie. <br />
          <span className="text-disco-mustard">
            The floor betrays.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-disco-cream-muted max-w-2xl leading-relaxed font-sans">
          Step onto a floating 1970s disco dance floor. Each round, an announcer calls out a rule about a tile color. 
          Is it the truth or a cheeky lie? Pick your groove, cross the floor, and reach the exit!
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/game')}
            leftIcon={<Gamepad2 className="w-5 h-5" />}
            className="text-base px-8 py-4"
          >
            Hit The Dance Floor
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/leaderboard')}
            leftIcon={<Trophy className="w-5 h-5" />}
            className="text-base px-8 py-4"
          >
            Leaderboard
          </Button>
        </div>

        {/* Key Quick Feature Cards */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
          {[
            { label: 'Dynamic Waves', val: 'Endless Mazes', icon: Zap },
            { label: '3D Raycasting', val: 'Point & Step', icon: Sparkles },
            { label: 'Deception Rate', val: '50% Truth / Lie', icon: HelpCircle },
            { label: 'Fair Play', val: 'Postgres RLS', icon: ShieldCheck },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl border-2 border-disco-border bg-disco-surface shadow-retro text-center">
              <item.icon className="w-6 h-6 mx-auto mb-1.5 text-disco-mustard" />
              <div className="text-base font-bold font-display text-disco-cream">{item.val}</div>
              <div className="text-xs text-disco-cream-muted mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mechanics: The Tile Matrix */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-bold font-display text-disco-cream">
            Meet The Dance Floor Tiles
          </h2>
          <p className="text-sm text-disco-cream-muted mt-2 max-w-xl mx-auto leading-relaxed">
            Every tile has a real hidden secret. The announcer tells you what a color does, but they might just be telling fibs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {tileTypes.map((tile) => (
            <div key={tile.name} className="rounded-3xl border-2 border-disco-border bg-disco-surface p-5 shadow-retro hover:-translate-y-1 hover:shadow-retro-lg transition-transform duration-150 flex flex-col">
              <div className={`w-full h-14 rounded-2xl ${tile.bg} border-2 border-disco-border mb-4 flex items-center justify-center font-display font-bold text-disco-border text-sm shadow-retro-xs`}>
                {tile.name}
              </div>
              <h3 className="font-display font-bold text-disco-cream text-lg">{tile.effect}</h3>
              <p className="text-xs text-disco-cream-muted mt-2 leading-relaxed flex-1">{tile.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Play Workflow */}
      <section className="rounded-3xl border-2 border-disco-border bg-disco-surface p-8 md:p-12 shadow-retro-lg relative">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold font-display tracking-wider text-disco-mustard uppercase">Game Rules</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-disco-cream mt-1">
            How To Play
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="pink">
            <CardHeader>
              <div className="w-10 h-10 rounded-2xl bg-disco-pink border-2 border-disco-border text-white flex items-center justify-center font-display font-bold text-lg mb-2 shadow-retro-xs">
                1
              </div>
              <CardTitle>Hear The Rule</CardTitle>
              <CardDescription>
                At the start of each wave, a loudspeaker rule is declared (e.g. &quot;Mustard tiles are safe&quot;).
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-disco-cream-muted leading-relaxed">
              There is a 50/50 chance this rule is an outright fib designed to make you drop into the abyss.
            </CardContent>
          </Card>

          <Card variant="mustard">
            <CardHeader>
              <div className="w-10 h-10 rounded-2xl bg-disco-mustard border-2 border-disco-border text-disco-border flex items-center justify-center font-display font-bold text-lg mb-2 shadow-retro-xs">
                2
              </div>
              <CardTitle>Pick Your Path</CardTitle>
              <CardDescription>
                Choose between a shorter, riskier route or a longer, safer stroll.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-disco-cream-muted leading-relaxed">
              Click on adjacent tiles using 3D raycasting. Riskier routes award higher score bonuses!
            </CardContent>
          </Card>

          <Card variant="teal">
            <CardHeader>
              <div className="w-10 h-10 rounded-2xl bg-disco-teal border-2 border-disco-border text-white flex items-center justify-center font-display font-bold text-lg mb-2 shadow-retro-xs">
                3
              </div>
              <CardTitle>Survive & Boogey</CardTitle>
              <CardDescription>
                Reach the exit tile safely, build your combo streak, and lock in your score.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-disco-cream-muted leading-relaxed">
              Your playthroughs are safely stored in PostgreSQL with Row Level Security and shown on your personal dashboard.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Playful Call To Action Banner */}
      <section className="text-center p-8 md:p-12 rounded-3xl border-2 border-disco-border bg-disco-elevated shadow-retro-lg flex flex-col items-center">
        <Flame className="w-12 h-12 text-disco-mustard mb-3" />
        <h2 className="text-2xl sm:text-4xl font-bold font-display text-disco-cream">
          Ready to test your dancing feet?
        </h2>
        <p className="mt-2 text-sm text-disco-cream-muted max-w-md leading-relaxed">
          Create an account to save your games, see your truth accuracy, and challenge the dance floor leaderboard.
        </p>
        <div className="mt-6">
          <Button size="lg" variant="secondary" onClick={() => navigate('/signup')}>
            Join The Dance Floor
          </Button>
        </div>
      </section>
    </div>
  );
};
