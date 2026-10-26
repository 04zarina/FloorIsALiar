export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  avg_reaction_ms: number;
  duration_seconds: number;
  created_at: string;
  rounds_survived?: number;
  max_combo?: number;
  falls?: number;
}

export interface LeaderboardEntry {
  display_name: string;
  score: number;
  accuracy: number;
  duration_seconds: number;
  rounds_survived?: number;
  created_at: string;
}
