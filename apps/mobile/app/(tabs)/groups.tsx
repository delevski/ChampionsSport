import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function GroupsScreen() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("group_members")
      .select("groups(id, name)")
      .eq("user_id", user.id);
    setGroups(
      data?.map((d) => d.groups as { id: string; name: string }).filter(Boolean) ?? []
    );
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create() {
    if (!name.trim()) return;
    const { data } = await supabase.rpc("create_group", { p_name: name });
    if (data) router.push(`/group/${data}`);
    load();
  }

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-12">
      <Text className="mb-4 text-xl font-bold text-white">{t("groups.title")}</Text>
      <View className="mb-4 flex-row gap-2">
        <TextInput
          className="flex-1 rounded-xl bg-surface px-3 py-2 text-white"
          value={name}
          onChangeText={setName}
          placeholder={t("groups.create")}
          placeholderTextColor="#8B95AD"
        />
        <TouchableOpacity className="rounded-xl bg-accent px-4 justify-center" onPress={create}>
          <Text className="font-bold text-background">+</Text>
        </TouchableOpacity>
      </View>
      {groups.map((g) => (
        <TouchableOpacity
          key={g.id}
          className="mb-2 rounded-xl bg-surface p-4"
          onPress={() => router.push(`/group/${g.id}`)}
        >
          <Text className="text-white font-medium">{g.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
