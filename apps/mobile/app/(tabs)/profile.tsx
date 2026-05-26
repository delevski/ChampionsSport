import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<{
    username: string | null;
    total_points: number;
    global_rank: number | null;
    exact_predictions: number;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => setProfile(data));
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  }

  return (
    <View className="flex-1 bg-background px-4 pt-12">
      <Text className="mb-6 text-2xl font-bold text-white">
        {profile?.username ?? "שחקן"}
      </Text>
      <View className="mb-4 flex-row flex-wrap gap-3">
        <Stat label="נקודות" value={profile?.total_points ?? 0} />
        <Stat label="דירוג" value={profile?.global_rank ?? "-"} />
        <Stat label="מדויקים" value={profile?.exact_predictions ?? 0} />
      </View>
      <TouchableOpacity className="rounded-xl border border-red-500 py-3" onPress={logout}>
        <Text className="text-center text-red-500">{t("auth.logout")}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="min-w-[45%] rounded-xl bg-surface p-4">
      <Text className="text-2xl font-bold text-accent">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}
