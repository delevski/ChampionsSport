"use client";

import { useCallback, useEffect, useState } from "react";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtime";

type Row = {
  rank: number;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  total_points: number;
  exact_predictions: number;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("global_leaderboard")
      .select("*")
      .order("rank", { ascending: true })
      .limit(100);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useRealtimeSubscription("profiles", undefined, fetchLeaderboard);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">דירוג עולמי</h1>
      {loading ? (
        <p className="text-muted">טוען...</p>
      ) : (
        <LeaderboardTable rows={rows} />
      )}
    </div>
  );
}
