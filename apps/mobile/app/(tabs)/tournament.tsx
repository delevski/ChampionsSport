import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function TournamentScreen() {
  const [matches, setMatches] = useState<{ id: string; home_team: { name: string }; away_team: { name: string } }[]>([]);

  useEffect(() => {
    supabase
      .from("tournaments")
      .select("id")
      .eq("slug", "world-cup-2026")
      .single()
      .then(({ data: t }) => {
        if (!t) return;
        supabase
          .from("matches")
          .select(`id, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)`)
          .eq("tournament_id", t.id)
          .then(({ data }) => setMatches((data ?? []) as never));
      });
  }, []);

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-12">
      <Text className="mb-4 text-xl font-bold text-white">מונדיאל 2026</Text>
      <TouchableOpacity
        className="mb-4 rounded-xl border border-accent bg-accent/10 p-3"
        onPress={() => router.push("/tournament-predictions")}
      >
        <Text className="text-center text-accent">ניחוש זוכה ומלך שערים</Text>
      </TouchableOpacity>
      {matches.map((m) => (
        <TouchableOpacity
          key={m.id}
          className="mb-2 rounded-xl bg-surface p-3"
          onPress={() => router.push(`/match/${m.id}`)}
        >
          <Text className="text-center text-white">
            {m.home_team.name} vs {m.away_team.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
