import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

type Row = {
  rank: number;
  username: string | null;
  total_points: number;
};

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("global_leaderboard")
      .select("rank, username, total_points")
      .order("rank")
      .limit(50);
    setRows((data ?? []) as Row[]);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("mobile-lb")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-12">
      <Text className="mb-4 text-xl font-bold text-white">{t("leaderboard.global")}</Text>
      {rows.map((r) => (
        <View key={r.rank} className="mb-2 flex-row items-center justify-between rounded-xl bg-surface p-3">
          <Text className="text-accent-gold font-bold">#{r.rank}</Text>
          <Text className="text-white">{r.username ?? "שחקן"}</Text>
          <Text className="font-bold text-accent">{r.total_points}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
