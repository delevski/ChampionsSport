import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: predictions } = await supabase
    .from("predictions")
    .select("home_score, away_score")
    .eq("match_id", matchId);

  if (!predictions?.length) {
    return NextResponse.json({ picks: [], topScores: [] });
  }

  const total = predictions.length;
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  const scoreMap = new Map<string, number>();

  for (const p of predictions) {
    if (p.home_score > p.away_score) homeWins++;
    else if (p.away_score > p.home_score) awayWins++;
    else draws++;

    const key = `${p.home_score}:${p.away_score}`;
    scoreMap.set(key, (scoreMap.get(key) ?? 0) + 1);
  }

  const picks = [
    { label: "ניצחון בית", percent: Math.round((homeWins / total) * 100) },
    { label: "תיקו", percent: Math.round((draws / total) * 100) },
    { label: "ניצחון חוץ", percent: Math.round((awayWins / total) * 100) },
  ];

  const topScores = [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([score, count]) => ({ score, count }));

  return NextResponse.json({ picks, topScores });
}
