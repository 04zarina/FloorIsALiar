import React from 'react';
import { Link } from 'react-router-dom';
import { getMySessions } from '../lib/gameData';
import { useLoad } from '../lib/useLoad';

export const HistoryPage: React.FC = () => {
  const { data, error, loading, reload } = useLoad(() => getMySessions(100));
  const rows = data ?? [];

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-4">
      <h1 className="font-display text-3xl text-disco-cream">Game History</h1>

      {loading && <p className="text-disco-cream-muted">Loading…</p>}

      {error && (
        <div className="rounded-3xl border-3 border-disco-border bg-disco-surface p-4 shadow-retro">
          <p className="text-disco-pink">Couldn&apos;t load your history: {error}</p>
          <button type="button" onClick={() => reload()} className="mt-3 px-3 py-1.5 rounded-xl border-2 border-disco-border bg-disco-mustard text-disco-border font-display text-sm">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-3xl border-3 border-disco-border bg-disco-surface p-6 text-center shadow-retro">
          <p className="text-disco-cream">No runs yet.</p>
          <Link to="/game" className="inline-block mt-3 px-4 py-2 rounded-xl border-2 border-disco-border bg-disco-pink text-white font-display shadow-retro-sm">
            Play now
          </Link>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border-3 border-disco-border bg-disco-surface shadow-retro">
          <table className="w-full text-sm text-disco-cream">
            <thead className="text-left text-disco-cream-muted">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Score</th>
                <th className="p-3">Level</th>
                <th className="p-3">Survived</th>
                <th className="p-3">Falls</th>
                <th className="p-3">Trust</th>
                <th className="p-3">Decision</th>
                <th className="p-3">Time</th>
                <th className="p-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-disco-border/40">
                  <td className="p-3 whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="p-3 font-bold">{s.score}</td>
                  <td className="p-3">{s.level}</td>
                  <td className="p-3">{s.rounds_survived}</td>
                  <td className="p-3">{s.falls}</td>
                  <td className="p-3">{Math.round(Number(s.accuracy))}%</td>
                  <td className="p-3">{(s.avg_reaction_ms / 1000).toFixed(1)}s</td>
                  <td className="p-3">{s.duration_seconds}s</td>
                  <td className="p-3">{s.reached_exit ? 'Cleared' : 'Out of lives'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;