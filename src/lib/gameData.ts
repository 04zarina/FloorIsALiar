import { supabase } from './supabase';

export interface GameSessionRow {
  id: string;
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  avg_reaction_ms: number;
  duration_seconds: number;
  level: number;
  rounds_survived: number;
  falls: number;
  reached_exit: boolean;
  created_at: string;
}

export interface NewSession {
  score: number;
  roundsSurvived: number;
  falls: number;
  accuracy: number;
  avgDecisionMs: number;
  durationSeconds: number;
  level: number;
  reachedExit: boolean;
}

export interface LeaderboardRow {
  display_name: string;
  best_score: number;
  best_level: number;
  games_played: number;
}

const int = (n: number, max: number) => Math.min(max, Math.max(0, Math.round(Number.isFinite(n) ? n : 0)));

function requireClient() {
  if (!supabase) throw new Error('Database is not configured.');
  return supabase;
}

/** Saves one finished run. The server sets user_id from the login. Retries once. */
export async function saveSession(s: NewSession): Promise<string> {
  const client = requireClient();
  const args = {
    p_score: int(s.score, 50000),
    p_hits: int(s.roundsSurvived, 10),
    p_misses: int(s.falls, 50),
    p_accuracy: Math.min(100, Math.max(0, Number.isFinite(s.accuracy) ? s.accuracy : 0)),
    p_avg_reaction_ms: int(s.avgDecisionMs, 600000),
    p_duration_seconds: int(s.durationSeconds, 7200),
    p_level: Math.max(1, int(s.level, 10)),
    p_rounds_survived: int(s.roundsSurvived, 10),
    p_falls: int(s.falls, 50),
    p_reached_exit: s.reachedExit,
  };
  let lastError = 'Could not save your run.';
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await client.rpc('save_game_session', args);
    if (!error) return data as string;
    lastError = error.message;
  }
  throw new Error(lastError);
}

/** RLS guarantees only the signed-in user's own rows come back. */
export async function getMySessions(limit = 100): Promise<GameSessionRow[]> {
  const { data, error } = await requireClient()
    .from('game_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as GameSessionRow[];
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardRow[]> {
  const { data, error } = await requireClient().rpc('get_leaderboard', { p_limit: limit });
  if (error) throw new Error(error.message);
  return (data ?? []) as LeaderboardRow[];
}