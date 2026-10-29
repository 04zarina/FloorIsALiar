import React from 'react';
import { getLeaderboard } from '../lib/gameData';
import { useLoad } from '../lib/useLoad';

export const LeaderboardPage: React.FC = () => {
  const { data, error, loading, reload } = useLoad(() => getLeaderboard(20));
  const rows = data ?? [];

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-4">
      <h1 className="font-display text-3xl text-disco-cream">Leaderboard</h1>
      <p className="text-sm text-disco-cream-muted">Each player&apos;s best score. Only display names are shown.</p>

      {loading && <p className="text-disco-cream-muted">Loading…</p>}

      {error && (
        <div className="rounded-3xl border-3 border-disco-border bg-disco-surface p-4 shadow-retro">
          <p className="text-disco-pink">Couldn&apos;t load the leaderboard: {error}</p>
          <button type="button" onClick={() => reload()} className="mt-3 px-3 py-1.5 rounded-xl border-2 border-disco-border bg-disco-mustard text-disco-border font-display text-sm">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-3xl border-3 border-disco-border bg-disco-surface p-6 text-center shadow-retro text-disco-cream">
          No scores yet. Be the first!
        </div>
      )}

      {rows.length > 0 && (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li
              key={`${r.display_name}-${i}`}
              className="flex items-center justify-between rounded-2xl border-3 border-disco-border bg-disco-surface px-4 py-3 shadow-retro-sm text-disco-cream"
            >
              <span className="flex items-center gap-3">
                <span className={`font-display text-xl w-8 ${i === 0 ? 'text-disco-mustard' : ''}`}>{i + 1}</span>
                <span className="font-bold">{r.display_name}</span>
              </span>
              <span className="text-right text-sm">
                <span className="font-display text-lg text-disco-mustard">{r.best_score}</span>
                <span className="block text-disco-cream-muted">Level {r.best_level} · {r.games_played} runs</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default LeaderboardPage;