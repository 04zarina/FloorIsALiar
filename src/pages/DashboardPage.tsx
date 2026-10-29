import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getLeaderboard, getMySessions } from '../lib/gameData';
import { getStats } from '../lib/stats';
import { useLoad } from '../lib/useLoad';

const card = 'rounded-3xl border-3 border-disco-border bg-disco-surface p-4 shadow-retro';

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className={card}>
    <div className="text-xs text-disco-cream-muted">{label}</div>
    <div className="mt-1 font-display text-2xl text-disco-mustard">{value}</div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const sessions = useLoad(() => getMySessions(100));
  const board = useLoad(() => getLeaderboard(5));

  const rows = sessions.data ?? [];
  const stats = useMemo(() => getStats(rows), [rows]);
  const history = useMemo(
    () => [...rows].reverse().map((s, i) => ({ n: i + 1, score: s.score })),
    [rows]
  );

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
      <h1 className="font-display text-3xl text-disco-cream">Your Dashboard</h1>

      {sessions.loading && <p className="text-disco-cream-muted">Loading your stats…</p>}

      {sessions.error && (
        <div className={card}>
          <p className="text-disco-pink">Couldn&apos;t load your stats: {sessions.error}</p>
          <button
            type="button"
            onClick={() => sessions.reload()}
            className="mt-3 px-3 py-1.5 rounded-xl border-2 border-disco-border bg-disco-mustard text-disco-border font-display text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {!sessions.loading && !sessions.error && rows.length === 0 && (
        <div className={`${card} text-center`}>
          <p className="text-disco-cream">No runs yet. Finish a run and your stats will show up here.</p>
          <Link to="/game" className="inline-block mt-3 px-4 py-2 rounded-xl border-2 border-disco-border bg-disco-pink text-white font-display shadow-retro-sm">
            Play now
          </Link>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total games" value={stats.totalGames} />
            <Stat label="Best score" value={stats.bestScore} />
            <Stat label="Average score" value={stats.averageScore} />
            <Stat label="Trust accuracy" value={`${stats.averageAccuracy}%`} />
            <Stat label="Avg decision time" value={`${(stats.averageDecisionMs / 1000).toFixed(1)}s`} />
            <Stat label="Rounds survived" value={stats.totalRoundsSurvived} />
            <Stat label="Falls" value={stats.totalFalls} />
          </div>

          <div className={card}>
            <h2 className="font-display text-lg text-disco-cream mb-3">Score history</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid stroke="#471D57" strokeDasharray="3 3" />
                  <XAxis dataKey="n" stroke="#D8CBB6" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#D8CBB6" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#381645', border: '2px solid #18091D', color: '#FFF4DC' }} />
                  <Line type="monotone" dataKey="score" stroke="#FFC83B" strokeWidth={3} dot={{ fill: '#FF3377', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-disco-cream">Recent runs</h2>
              <Link to="/history" className="text-sm text-disco-mustard underline">See all</Link>
            </div>
            <ul className="divide-y divide-disco-border/40 text-sm">
              {rows.slice(0, 5).map((s) => (
                <li key={s.id} className="flex justify-between py-2 text-disco-cream">
                  <span>{new Date(s.created_at).toLocaleString()}</span>
                  <span className="font-bold">{s.score} pts · Level {s.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-disco-cream">Top players</h2>
          <Link to="/leaderboard" className="text-sm text-disco-mustard underline">Full leaderboard</Link>
        </div>
        {board.loading && <p className="text-disco-cream-muted text-sm">Loading…</p>}
        {board.error && <p className="text-disco-pink text-sm">Leaderboard unavailable.</p>}
        {board.data && board.data.length === 0 && <p className="text-disco-cream-muted text-sm">No scores yet.</p>}
        <ol className="space-y-1 text-sm text-disco-cream">
          {(board.data ?? []).map((r, i) => (
            <li key={`${r.display_name}-${i}`} className="flex justify-between">
              <span>{i + 1}. {r.display_name}</span>
              <span className="font-bold">{r.best_score}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default DashboardPage;