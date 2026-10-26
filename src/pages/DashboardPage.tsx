import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { GameSession } from '../types/database.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Trophy, 
  Layers, 
  Target, 
  Zap, 
  Gamepad2, 
  History, 
  Flame, 
  Calendar 
} from 'lucide-react';
import { formatTime, formatNumber } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserStats() {
      if (!isSupabaseConfigured || !user) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && data) {
          setSessions(data as GameSession[]);
        }
      } catch {
        // Handle network error
      } finally {
        setIsLoading(false);
      }
    }
    loadUserStats();
  }, [user]);

  // Aggregate stats from real database sessions
  const totalGames = sessions.length;
  const highScore = sessions.reduce((max, s) => Math.max(max, s.score), 0);
  const avgAccuracy = totalGames > 0
    ? (sessions.reduce((acc, s) => acc + Number(s.accuracy), 0) / totalGames).toFixed(1)
    : '0.0';
  const bestReaction = totalGames > 0
    ? Math.min(...sessions.map((s) => Number(s.avg_reaction_ms) || 9999)).toFixed(0)
    : '0';

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Loading Dance Records..." />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Pilot / Dancer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border-2 border-disco-border bg-disco-surface shadow-retro">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-disco-mustard border-2 border-disco-border text-disco-border text-xs font-bold font-display uppercase tracking-wider mb-2 shadow-retro-xs">
            <Flame className="w-3.5 h-3.5" />
            <span>Dancer Dossier</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-disco-cream">
            Welcome, {profile?.display_name || user?.email?.split('@')[0] || 'Floor Dancer'}!
          </h1>
          <p className="text-sm text-disco-cream-muted mt-1">
            Check your personal stats, accuracy rating, and recent playthroughs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/game')}
            leftIcon={<Gamepad2 className="w-4 h-4" />}
          >
            Start Dancing
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/history')}
            leftIcon={<History className="w-4 h-4" />}
          >
            All Logs
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="pink">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-disco-cream-muted">
              Personal Best Score
            </span>
            <div className="p-2 rounded-xl bg-disco-pink border-2 border-disco-border text-white shadow-retro-xs">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-disco-cream mt-3">
            {formatNumber(highScore)}
          </div>
          <div className="text-xs text-disco-cream-muted mt-1">
            Highest score saved in database
          </div>
        </Card>

        <Card variant="teal">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-disco-cream-muted">
              Trust Accuracy
            </span>
            <div className="p-2 rounded-xl bg-disco-teal border-2 border-disco-border text-white shadow-retro-xs">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-disco-teal mt-3">
            {avgAccuracy}%
          </div>
          <div className="text-xs text-disco-cream-muted mt-1">
            Truth/Lie deduction rate
          </div>
        </Card>

        <Card variant="mustard">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-disco-cream-muted">
              Games Played
            </span>
            <div className="p-2 rounded-xl bg-disco-mustard border-2 border-disco-border text-disco-border shadow-retro-xs">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-disco-cream mt-3">
            {totalGames}
          </div>
          <div className="text-xs text-disco-cream-muted mt-1">
            Total completed sessions
          </div>
        </Card>

        <Card variant="orange">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-disco-cream-muted">
              Reaction Speed
            </span>
            <div className="p-2 rounded-xl bg-disco-orange border-2 border-disco-border text-white shadow-retro-xs">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-display text-disco-orange mt-3">
            {totalGames > 0 ? `${bestReaction} ms` : '—'}
          </div>
          <div className="text-xs text-disco-cream-muted mt-1">
            Fastest decision time
          </div>
        </Card>
      </div>

      {/* Analytics Visualizer & Recent Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics preview card */}
        <Card className="lg:col-span-2 border-2 border-disco-border shadow-retro">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analytics Visualizer</CardTitle>
                <CardDescription>Performance trends across recent dance floor runs</CardDescription>
              </div>
              <span className="text-xs px-3 py-1 rounded-xl border-2 border-disco-border bg-disco-mustard text-disco-border font-display font-bold shadow-retro-xs">
                Stage 7 Recharts
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-disco-border rounded-2xl bg-disco-elevated/40 text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-disco-mustard border-2 border-disco-border flex items-center justify-center text-disco-border mb-3 shadow-retro-xs">
              <Zap className="w-6 h-6" />
            </div>
            <p className="text-base font-bold font-display text-disco-cream">
              Telemetry Charts Ready
            </p>
            <p className="text-xs text-disco-cream-muted max-w-sm mt-1 leading-relaxed">
              Interactive charts for score trends, trust accuracy, and reaction speed will be built here in <strong>Stage 7</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Recent sessions column */}
        <Card className="border-2 border-disco-border shadow-retro">
          <CardHeader>
            <CardTitle>Recent Playthroughs</CardTitle>
            <CardDescription>Latest games logged in PostgreSQL</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <EmptyState
                icon={<Gamepad2 className="w-6 h-6" />}
                title="No Games Yet"
                description="Play a game on the dance floor to record your first set of stats."
                actionLabel="Play Now"
                onAction={() => navigate('/game')}
              />
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl border-2 border-disco-border bg-disco-elevated flex items-center justify-between shadow-retro-xs"
                  >
                    <div>
                      <div className="text-sm font-bold font-display text-disco-cream">
                        {formatNumber(s.score)} PTS
                      </div>
                      <div className="text-xs text-disco-cream-muted flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-disco-mustard" />
                          {new Date(s.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{formatTime(Number(s.duration_seconds))}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-disco-teal">
                        {s.accuracy}% Accuracy
                      </div>
                      <div className="text-[10px] text-disco-cream-dim">
                        {s.hits} hits / {s.misses} misses
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
