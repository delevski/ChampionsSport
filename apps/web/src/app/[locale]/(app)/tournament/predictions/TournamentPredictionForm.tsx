"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { rpc } from "@championsport/supabase";

type Team = { id: string; name: string; name_he?: string | null };
type Player = { id: string; name: string };

export function TournamentPredictionForm({
  tournamentId,
  teams,
  players,
  initialWinner,
  initialScorer,
  locked,
}: {
  tournamentId: string;
  teams: Team[];
  players: Player[];
  initialWinner: string;
  initialScorer: string;
  locked: boolean;
}) {
  const router = useRouter();
  const [winner, setWinner] = useState(initialWinner);
  const [scorer, setScorer] = useState(initialScorer);
  const [message, setMessage] = useState("");

  async function save() {
    if (!winner || !scorer) return;
    const supabase = createClient();
    const { error } = await rpc.upsertTournamentPrediction(supabase, {
      p_tournament_id: tournamentId,
      p_winner_team_id: winner,
      p_top_scorer_player_id: scorer,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("נשמר!");
    router.refresh();
  }

  if (locked) {
    return <p className="text-danger">ניחושי הטורניר נסגרו</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted">זוכה הטורניר</label>
        <select
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2"
        >
          <option value="">בחר קבוצה</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name_he ?? t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">מלך השערים</label>
        <select
          value={scorer}
          onChange={(e) => setScorer(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2"
        >
          <option value="">בחר שחקן</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={save}
        className="w-full rounded-xl bg-accent py-3 font-bold text-background"
      >
        שמור
      </button>
      {message && <p className="text-sm text-accent">{message}</p>}
    </div>
  );
}
