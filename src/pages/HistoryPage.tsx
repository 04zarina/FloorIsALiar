import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { GameSession } from '../types/database.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { History, Gamepad2 } from 'lucide-react';
import { formatTime, formatNumber } from '../lib/utils';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!isSupabaseConfigured || !user) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setSessions(data as GameSession[]);
        }
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Looking Up Your Dance Cards..." />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-disco-mustard border-2 border-disco-border text-disco-border text-xs font-bold font-display uppercase tracking-wider mb-2 shadow-retro-xs">
            <History className="w-3.5 h-3.5" />
            <span>Game Records</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-disco-cream">
            Dance Floor History
          </h1>
          <p className="text-sm text-disco-cream-muted mt-1">
            Complete audit trail of all verified runs saved to PostgreSQL.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/game')}
          leftIcon={<Gamepad2 className="w-4 h-4" />}
        >
          New Dance Run
        </Button>
      </div>

      {/* History Table Card */}
      <Card className="border-2 border-disco-border shadow-retro">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                {sessions.length} recorded {sessions.length === 1 ? 'game' : 'games'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <EmptyState
              icon={<History className="w-6 h-6" />}
              title="No Past Games Found"
              description="Play a game on the dance floor to create your first session record."
              actionLabel="Play Now"
              onAction={() => navigate('/game')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-disco-cream">
                <thead className="bg-disco-elevated text-xs font-display font-bold uppercase tracking-wider text-disco-cream border-b-2 border-disco-border">
                  <tr>
                    <th scope="col" className="px-6 py-4">Date</th>
                    <th scope="col" className="px-6 py-4">Score</th>
                    <th scope="col" className="px-6 py-4">Hits / Misses</th>
                    <th scope="col" className="px-6 py-4">Accuracy</th>
                    <th scope="col" className="px-6 py-4">Reaction Time</th>
                    <th scope="col" className="px-6 py-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-disco-border/30 text-xs sm:text-sm">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-disco-elevated/50 transition-colors">
                      <td className="px-6 py-4 text-disco-cream-muted">
                        {new Date(s.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold font-display text-disco-cream text-base">
                        {formatNumber(s.score)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-disco-teal font-bold">{s.hits}</span>
                        <span className="text-disco-cream-dim mx-1">/</span>
                        <span className="text-disco-pink font-bold">{s.misses}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-xl text-xs font-bold border-2 border-disco-border bg-disco-teal text-white shadow-retro-xs">
                          {s.accuracy}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-disco-cream-muted">
                        {s.avg_reaction_ms} ms
                      </td>
                      <td className="px-6 py-4 text-disco-cream-muted">
                        {formatTime(Number(s.duration_seconds))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
