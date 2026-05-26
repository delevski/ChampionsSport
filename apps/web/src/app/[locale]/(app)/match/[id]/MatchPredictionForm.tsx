"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScorePicker } from "@/components/match/ScorePicker";
import { useCountdown } from "@/hooks/useCountdown";
import { createClient } from "@/lib/supabase/client";
import { rpc } from "@championsport/supabase";

type Props = {
  matchId: string;
  lockAt: string;
  isLocked: boolean;
  initialHome: number;
  initialAway: number;
};

export function MatchPredictionForm({
  matchId,
  lockAt,
  isLocked,
  initialHome,
  initialAway,
}: Props) {
  const router = useRouter();
  const [home, setHome] = useState(initialHome);
  const [away, setAway] = useState(initialAway);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { locked } = useCountdown(lockAt);
  const disabled = isLocked || locked;

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await rpc.upsertMatchPrediction(supabase, {
      p_match_id: matchId,
      p_home_score: home,
      p_away_score: away,
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("הניחוש נשמר!");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-center font-medium">ניחוש תוצאה</h2>
      <ScorePicker
        homeScore={home}
        awayScore={away}
        onChange={(h, a) => {
          setHome(h);
          setAway(a);
        }}
        disabled={disabled}
      />
      {!disabled && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-accent py-3 font-bold text-background disabled:opacity-50"
        >
          {saving ? "שומר..." : "שמור ניחוש"}
        </button>
      )}
      {message && (
        <p
          className={`text-center text-sm ${message.includes("נשמר") ? "text-accent" : "text-danger"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
