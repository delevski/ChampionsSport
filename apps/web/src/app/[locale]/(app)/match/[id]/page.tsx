import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MatchPredictionForm } from "./MatchPredictionForm";
import { CountdownBadge } from "@/components/match/CountdownBadge";
import Link from "next/link";
import type { Database } from "@championsport/supabase";

type TeamRow = Database["public"]["Tables"]["teams"]["Row"];

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: matchRaw } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
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
  if (!home || !away) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingPrediction = null;
  if (user) {
    const { data } = await supabase
      .from("predictions")
      .select("*")
      .eq("match_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    existingPrediction = data as Database["public"]["Tables"]["predictions"]["Row"] | null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/he" className="text-sm text-accent">
          חזרה
        </Link>
        <CountdownBadge lockAt={match.lock_at} />
      </div>

      <div className="text-center">
        <h1 className="text-xl font-bold">
          {home.name_he ?? home.name} vs {away.name_he ?? away.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {new Date(match.kickoff_at).toLocaleString("he-IL")}
        </p>
      </div>

      <MatchPredictionForm
        matchId={match.id}
        lockAt={match.lock_at}
        isLocked={match.is_locked}
        initialHome={existingPrediction?.home_score ?? 0}
        initialAway={existingPrediction?.away_score ?? 0}
      />

      <Link
        href={`/he/stats/${id}`}
        className="block text-center text-sm text-accent"
      >
        סטטיסטיקות ותובנות
      </Link>
    </div>
  );
}
