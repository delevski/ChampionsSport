import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { supabase } from "@/lib/supabase";
import { isPredictionLocked } from "@championsport/shared";

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [lockAt, setLockAt] = useState<Date | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    supabase.from("matches").select("lock_at").eq("id", id).single().then(({ data }) => {
      if (data?.lock_at) {
        const la = new Date(data.lock_at);
        setLockAt(la);
        setLocked(isPredictionLocked(la));
      }
    });
    supabase.from("predictions").select("home_score, away_score").eq("match_id", id).maybeSingle().then(({ data }) => {
      if (data) { setHome(data.home_score); setAway(data.away_score); }
    });
  }, [id]);

  async function save() {
    const { error } = await supabase.rpc("upsert_match_prediction", {
      p_match_id: id,
      p_home_score: home,
      p_away_score: away,
    });
    if (error) alert(error.message);
  }

  return (
    <View className="flex-1 bg-background px-4 pt-12">
      <Text className="mb-4 text-xl font-bold text-white">ניחוש תוצאה</Text>
      {locked ? (
        <Text className="text-red-500">הניחושים נסגרו</Text>
      ) : (
        <>
          <View className="mb-4 flex-row items-center justify-center gap-8">
            <ScoreBtn value={home} onInc={() => setHome((h) => Math.min(20, h + 1))} onDec={() => setHome((h) => Math.max(0, h - 1))} />
            <Text className="text-2xl text-white">:</Text>
            <ScoreBtn value={away} onInc={() => setAway((a) => Math.min(20, a + 1))} onDec={() => setAway((a) => Math.max(0, a - 1))} />
          </View>
          <TouchableOpacity className="rounded-xl bg-accent py-3" onPress={save}>
            <Text className="text-center font-bold text-background">שמור</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function ScoreBtn({ value, onInc, onDec }: { value: number; onInc: () => void; onDec: () => void }) {
  return (
    <View className="items-center">
      <TouchableOpacity onPress={onInc} className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-accent">
        <Text className="text-background font-bold">+</Text>
      </TouchableOpacity>
      <Text className="text-3xl font-bold text-white">{value}</Text>
      <TouchableOpacity onPress={onDec} className="mt-2 h-10 w-10 items-center justify-center rounded-full bg-surface">
        <Text className="text-white font-bold">-</Text>
      </TouchableOpacity>
    </View>
  );
}
