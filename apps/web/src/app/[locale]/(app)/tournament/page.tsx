import { createClient } from "@/lib/supabase/server";
import { MatchCard } from "@/components/match/MatchCard";
import Link from "next/link";
import type { Database } from "@championsport/supabase";

type MatchRow = Database["public"]["Tables"]["matches"]["Row"];
type TeamRow = Database["public"]["Tables"]["teams"]["Row"];

export default async function TournamentPage() {
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", "world-cup-2026")
    .single();

  const tournamentData = tournament as Database["public"]["Tables"]["tournaments"]["Row"] | null;

  const { data: matchesRaw } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentData?.id ?? "")
    .order("kickoff_at", { ascending: true });

  const matchesList = (matchesRaw ?? []) as MatchRow[];
  const teamIds = [
    ...new Set(matchesList.flatMap((m) => [m.home_team_id, m.away_team_id])),
  ];

  const { data: teamsRaw } = teamIds.length
    ? await supabase.from("teams").select("*").in("id", teamIds)
    : { data: [] };

  const teamMap = new Map(((teamsRaw ?? []) as TeamRow[]).map((t) => [t.id, t]));

  const matches = matchesList
    .map((m) => ({
      ...m,
      home_team: teamMap.get(m.home_team_id)!,
      away_team: teamMap.get(m.away_team_id)!,
    }))
    .filter((m) => m.home_team && m.away_team);

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("tournament_id", tournamentData?.id ?? "")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{tournamentData?.name_he ?? "מונדיאל 2026"}</h1>
        <p className="text-sm text-muted capitalize">{tournamentData?.status}</p>
      </div>

      <Link
        href="/he/tournament/predictions"
        className="block rounded-xl border border-accent/50 bg-accent/10 px-4 py-3 text-center font-medium text-accent"
      >
        ניחוש זוכה ומלך שערים
      </Link>

      <section>
        <h2 className="mb-3 font-bold">קבוצות</h2>
        <div className="flex flex-wrap gap-2">
          {((teams ?? []) as TeamRow[]).map((t) => (
            <span
              key={t.id}
              className="rounded-full border border-border bg-surface px-3 py-1 text-sm"
            >
              {t.name_he ?? t.name}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-bold">כל המשחקים</h2>
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
