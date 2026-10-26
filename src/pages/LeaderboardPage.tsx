import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { LeaderboardEntry } from '../types/database.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { formatTime, formatNumber } from '../lib/utils';

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        // Query top scores
        const { data, error } = await supabase
          .from('game_sessions')
          .select('score, accuracy, duration_seconds, created_at, profiles(display_name)')
          .order('score', { ascending: false })
          .limit(20);

        if (!error && data) {
          // Format entries safely
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formatted: LeaderboardEntry[] = (data as any[]).map((row) => ({
            display_name: row.profiles?.display_name || 'Anonymous Dancer',
            score: row.score,
            accuracy: row.accuracy,
            duration_seconds: row.duration_seconds,
            created_at: row.created_at,
          }));
          setEntries(formatted);
        }
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" label="Tallying Dance Scores..." />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-disco-mustard border-2 border-disco-border text-disco-border text-xs font-bold font-display uppercase tracking-wider shadow-retro">
          <Trophy className="w-4 h-4" />
          <span>Hall of Disco Stars</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-display text-disco-cream">
          Dance Floor Leaderboard
        </h1>
        <p className="text-sm text-disco-cream-muted">
          The highest-scoring dancers ranked by verified session points and accuracy.
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8" />}
          title="The Floor is Open"
          description="Be the very first dancer to complete a round and claim the #1 spot!"
        />
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Rank 2 (Silver) */}
            {topThree[1] && (
              <div className="order-2 md:order-1 rounded-3xl border-2 border-disco-border bg-disco-surface p-6 shadow-retro flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-disco-teal border-2 border-disco-border text-white flex items-center justify-center mb-3 shadow-retro-xs">
                  <Medal className="w-7 h-7" />
                </div>
                <span className="text-xs font-display font-bold text-disco-teal uppercase tracking-wider">
                  2nd Place
                </span>
                <h3 className="text-xl font-bold font-display text-disco-cream mt-1">
                  {topThree[1].display_name}
                </h3>
                <div className="text-3xl font-bold font-display text-disco-mustard mt-3">
                  {formatNumber(topThree[1].score)} PTS
                </div>
                <div className="text-xs text-disco-cream-muted mt-2 flex items-center gap-3">
                  <span>{topThree[1].accuracy}% Accuracy</span>
                  <span>•</span>
                  <span>{formatTime(Number(topThree[1].duration_seconds))}</span>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold / Grand Champion) */}
            {topThree[0] && (
              <div className="order-1 md:order-2 rounded-3xl border-3 border-disco-border bg-disco-mustard text-disco-border p-6 shadow-retro-lg flex flex-col items-center text-center -mt-0 md:-mt-4">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-disco-border text-disco-border flex items-center justify-center mb-3 shadow-retro-xs">
                  <Crown className="w-9 h-9 text-disco-border animate-bounce" />
                </div>
                <span className="text-xs font-display font-extrabold uppercase tracking-widest text-disco-border">
                  1st Place Champion
                </span>
                <h3 className="text-2xl font-bold font-display text-disco-border mt-1">
                  {topThree[0].display_name}
                </h3>
                <div className="text-4xl font-extrabold font-display text-disco-border mt-3">
                  {formatNumber(topThree[0].score)} PTS
                </div>
                <div className="text-xs text-disco-border/80 font-bold mt-2 flex items-center gap-3">
                  <span>{topThree[0].accuracy}% Accuracy</span>
                  <span>•</span>
                  <span>{formatTime(Number(topThree[0].duration_seconds))}</span>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {topThree[2] && (
              <div className="order-3 rounded-3xl border-2 border-disco-border bg-disco-surface p-6 shadow-retro flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-disco-pink border-2 border-disco-border text-white flex items-center justify-center mb-3 shadow-retro-xs">
                  <Award className="w-7 h-7" />
                </div>
                <span className="text-xs font-display font-bold text-disco-pink uppercase tracking-wider">
                  3rd Place
                </span>
                <h3 className="text-xl font-bold font-display text-disco-cream mt-1">
                  {topThree[2].display_name}
                </h3>
                <div className="text-3xl font-bold font-display text-disco-mustard mt-3">
                  {formatNumber(topThree[2].score)} PTS
                </div>
                <div className="text-xs text-disco-cream-muted mt-2 flex items-center gap-3">
                  <span>{topThree[2].accuracy}% Accuracy</span>
                  <span>•</span>
                  <span>{formatTime(Number(topThree[2].duration_seconds))}</span>
                </div>
              </div>
            )}
          </div>

          {/* Remaining Ranks Table */}
          {remaining.length > 0 && (
            <Card className="border-2 border-disco-border shadow-retro">
              <CardHeader>
                <CardTitle>Other Top Dancers</CardTitle>
                <CardDescription>Ranks 4 through 20</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-disco-cream">
                    <thead className="bg-disco-elevated text-xs font-display font-bold uppercase tracking-wider text-disco-cream border-b-2 border-disco-border">
                      <tr>
                        <th scope="col" className="px-6 py-3">Rank</th>
                        <th scope="col" className="px-6 py-3">Dancer</th>
                        <th scope="col" className="px-6 py-3">Score</th>
                        <th scope="col" className="px-6 py-3">Accuracy</th>
                        <th scope="col" className="px-6 py-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-disco-border/30">
                      {remaining.map((entry, index) => (
                        <tr key={index} className="hover:bg-disco-elevated/50 transition-colors">
                          <td className="px-6 py-4 font-display font-bold text-disco-mustard">
                            #{index + 4}
                          </td>
                          <td className="px-6 py-4 font-bold text-disco-cream">
                            {entry.display_name}
                          </td>
                          <td className="px-6 py-4 font-bold font-display text-disco-cream">
                            {formatNumber(entry.score)}
                          </td>
                          <td className="px-6 py-4 text-disco-teal font-bold">
                            {entry.accuracy}%
                          </td>
                          <td className="px-6 py-4 text-disco-cream-muted">
                            {formatTime(Number(entry.duration_seconds))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
