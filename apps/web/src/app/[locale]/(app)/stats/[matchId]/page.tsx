import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@championsport/supabase";

type TeamRow = Database["public"]["Tables"]["teams"]["Row"];

export default async function StatsPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const supabase = await createClient();

  const { data: matchRaw } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  const match = matchRaw as Database["public"]["Tables"]["matches"]["Row"] | null;
  if (!match) notFound();

  const { data: teamsRaw } = await supabase
    .from("teams")
    .select("*")
    .in("id", [match.home_team_id, match.away_team_id]);

  const teams = (teamsRaw ?? []) as TeamRow[];
  const home = teams.find((t) => t.id === match.home_team_id);
  const away = teams.find((t) => t.id === match.away_team_id);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/stats/community/${matchId}`,
    { cache: "no-store" }
  );
  const community = res.ok ? await res.json() : { picks: [], topScores: [] };

  return (
    <div className="space-y-6">
      <Link href={`/he/match/${matchId}`} className="text-sm text-accent">
        חזרה למשחק
      </Link>
      <h1 className="text-xl font-bold">סטטיסטיקות</h1>
      <p className="text-muted">
        {home?.name_he ?? home?.name} vs {away?.name_he ?? away?.name}
      </p>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-bold">בחירות הקהילה</h2>
        <div className="space-y-2">
          {(community.picks as { label: string; percent: number }[]).map(
            (p) => (
              <div key={p.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{p.label}</span>
                  <span>{p.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-elevated">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-bold">ניחושים פופולריים</h2>
        <div className="space-y-2">
          {(community.topScores as { score: string; count: number }[]).map(
            (s) => (
              <div
                key={s.score}
                className="flex justify-between rounded-lg bg-surface-elevated px-3 py-2"
              >
                <span className="font-mono font-bold">{s.score}</span>
                <span className="text-muted">{s.count} ניחושים</span>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
