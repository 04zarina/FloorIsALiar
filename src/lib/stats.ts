export interface SessionLike {
  score: number;
  accuracy: number;
  avg_reaction_ms: number;
  rounds_survived: number;
  falls: number;
}

export interface Stats {
  totalGames: number;
  bestScore: number;
  averageScore: number;
  averageAccuracy: number;
  averageDecisionMs: number;
  totalRoundsSurvived: number;
  totalFalls: number;
}

export function getStats(sessions: SessionLike[]): Stats {
  const n = sessions.length;
  if (n === 0) {
    return {
      totalGames: 0, bestScore: 0, averageScore: 0, averageAccuracy: 0,
      averageDecisionMs: 0, totalRoundsSurvived: 0, totalFalls: 0,
    };
  }
  const sum = (f: (s: SessionLike) => number) => sessions.reduce((a, s) => a + f(s), 0);
  return {
    totalGames: n,
    bestScore: Math.max(...sessions.map((s) => s.score)),
    averageScore: Math.round(sum((s) => s.score) / n),
    averageAccuracy: Math.round(sum((s) => Number(s.accuracy)) / n),
    averageDecisionMs: Math.round(sum((s) => s.avg_reaction_ms) / n),
    totalRoundsSurvived: sum((s) => s.rounds_survived),
    totalFalls: sum((s) => s.falls),
  };
}