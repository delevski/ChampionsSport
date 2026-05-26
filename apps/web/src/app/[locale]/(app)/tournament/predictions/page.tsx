import { createClient } from "@/lib/supabase/server";
import { TournamentPredictionForm } from "./TournamentPredictionForm";
import Link from "next/link";
import type { Database } from "@championsport/supabase";

export default async function TournamentPredictionsPage() {
  const supabase = await createClient();
  const { data: tournamentRaw } = await supabase
    .from("tournaments")
    .select("id, tournament_lock_at")
    .eq("slug", "world-cup-2026")
    .single();

  const tournament = tournamentRaw as Pick<
    Database["public"]["Tables"]["tournaments"]["Row"],
    "id" | "tournament_lock_at"
  > | null;

  const { data: teamsRaw } = await supabase
    .from("teams")
    .select("id, name, name_he")
    .eq("tournament_id", tournament?.id ?? "");

  const { data: playersRaw } = await supabase
    .from("players")
    .select("id, name, team_id")
    .eq("tournament_id", tournament?.id ?? "");

  const teams = (teamsRaw ?? []) as { id: string; name: string; name_he?: string | null }[];
  const players = (playersRaw ?? []) as { id: string; name: string }[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existing = null;
  if (user && tournament) {
    const { data } = await supabase
      .from("tournament_predictions")
      .select("*")
      .eq("user_id", user.id)
      .eq("tournament_id", tournament.id)
      .maybeSingle();
    existing = data as Database["public"]["Tables"]["tournament_predictions"]["Row"] | null;
  }

  const locked =
    tournament?.tournament_lock_at &&
    new Date(tournament.tournament_lock_at) <= new Date();

  return (
    <div className="space-y-6">
      <Link href="/he/tournament" className="text-sm text-accent">
        חזרה
      </Link>
      <h1 className="text-xl font-bold">ניחושי טורניר</h1>
      <p className="text-sm text-muted">
        זוכה הטורניר = 10 נקודות | מלך שערים = 10 נקודות
      </p>
      {tournament && (
        <TournamentPredictionForm
          tournamentId={tournament.id}
          teams={teams}
          players={players}
          initialWinner={existing?.winner_team_id ?? ""}
          initialScorer={existing?.top_scorer_player_id ?? ""}
          locked={!!locked}
        />
      )}
    </div>
  );
}
