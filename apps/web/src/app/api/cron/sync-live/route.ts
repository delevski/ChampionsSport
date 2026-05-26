import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type LiveMatch = {
  id: string;
  api_fixture_id: number;
  home_score: number | null;
  away_score: number | null;
  status: string;
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.rpc("lock_expired_matches");

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: true, synced: 0, note: "no api key" });
  }

  const { data: liveMatches } = await supabase
    .from("matches")
    .select("id, api_fixture_id, home_score, away_score, status")
    .in("status", ["scheduled", "live"]);

  let synced = 0;

  for (const match of (liveMatches ?? []) as LiveMatch[]) {
    try {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures?id=${match.api_fixture_id}`,
        {
          headers: {
            "x-apisports-key": apiKey,
          },
        }
      );
      const json = await res.json();
      const fixture = json.response?.[0];
      if (!fixture) continue;

      const status = mapStatus(fixture.fixture.status.short);
      const homeScore = fixture.goals.home;
      const awayScore = fixture.goals.away;

      const changed =
        match.home_score !== homeScore ||
        match.away_score !== awayScore ||
        match.status !== status;

      if (!changed) continue;

      await supabase
        .from("matches")
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status,
          last_synced_at: new Date().toISOString(),
        })
        .eq("id", match.id);

      if (status === "finished") {
        await supabase.rpc("score_finished_match", { p_match_id: match.id });
      }

      synced++;
    } catch {
      /* continue */
    }
  }

  return NextResponse.json({ ok: true, synced });
}

function mapStatus(short: string): string {
  const map: Record<string, string> = {
    NS: "scheduled",
    TBD: "scheduled",
    "1H": "live",
    HT: "live",
    "2H": "live",
    ET: "live",
    P: "live",
    FT: "finished",
    AET: "finished",
    PEN: "finished",
    PST: "postponed",
  };
  return map[short] ?? "scheduled";
}
