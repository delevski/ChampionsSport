export type Score = { home: number; away: number };

export type MatchOutcome = "home" | "away" | "draw";

export function getWinner(score: Score): MatchOutcome {
  if (score.home > score.away) return "home";
  if (score.away > score.home) return "away";
  return "draw";
}

export type MatchPredictionResult = {
  points: number;
  isExact: boolean;
  isWinnerCorrect: boolean;
  isFailed: boolean;
};

export function scoreMatchPrediction(
  predicted: Score,
  actual: Score
): MatchPredictionResult {
  const winnerCorrect = getWinner(predicted) === getWinner(actual);
  let points = winnerCorrect ? 3 : 0;
  const exact =
    predicted.home === actual.home && predicted.away === actual.away;
  if (exact) points += 2;
  return {
    points,
    isExact: exact,
    isWinnerCorrect: winnerCorrect,
    isFailed: !winnerCorrect,
  };
}

export const TOURNAMENT_WINNER_POINTS = 10;
export const TOP_SCORER_POINTS = 10;
export const LOCK_MINUTES_BEFORE_KICKOFF = 5;

export function getLockAt(kickoffAt: Date): Date {
  return new Date(
    kickoffAt.getTime() - LOCK_MINUTES_BEFORE_KICKOFF * 60 * 1000
  );
}

export function isPredictionLocked(lockAt: Date, now = new Date()): boolean {
  return now >= lockAt;
}
