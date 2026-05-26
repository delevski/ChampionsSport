import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

type Match = {
  id: string;
  kickoff_at: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: { name_he?: string; name: string };
  away_team: { name_he?: string; name: string };
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("matches")
      .select(
        `*, home_team:teams!matches_home_team_id_fkey(name, name_he),
         away_team:teams!matches_away_team_id_fkey(name, name_he)`
      )
      .in("status", ["scheduled", "live"])
      .order("kickoff_at")
      .limit(10);
    setMatches((data ?? []) as Match[]);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("mobile-matches")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={async () => {
          setRefreshing(true);
          await load();
          setRefreshing(false);
        }} tintColor="#00D68F" />
      }
    >
      <View className="px-4 pt-12">
        <Text className="text-2xl font-bold text-accent">ChampionsSport</Text>
        <Text className="mb-4 text-muted">{t("home.upcoming")}</Text>
        {matches.map((m) => (
          <TouchableOpacity
            key={m.id}
            className="mb-3 rounded-xl border border-gray-700 bg-surface p-4"
            onPress={() => router.push(`/match/${m.id}`)}
          >
            <Text className="text-center text-white">
              {m.home_team.name_he ?? m.home_team.name} vs{" "}
              {m.away_team.name_he ?? m.away_team.name}
            </Text>
            <Text className="mt-1 text-center text-xs text-muted">
              {new Date(m.kickoff_at).toLocaleString("he-IL")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
