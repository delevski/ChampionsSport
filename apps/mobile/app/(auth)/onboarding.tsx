import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { usernameSchema } from "@championsport/shared";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");

  async function submit() {
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      Alert.alert(t("common.error"), parsed.error.errors[0]?.message);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ username: parsed.data })
      .eq("id", user.id);
    if (error) Alert.alert(t("common.error"), error.message);
    else router.replace("/(tabs)");
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="mb-4 text-xl font-bold text-white">
        {t("auth.onboardingTitle")}
      </Text>
      <TextInput
        className="mb-4 rounded-xl bg-surface px-4 py-3 text-white"
        value={username}
        onChangeText={setUsername}
        placeholder={t("auth.username")}
        placeholderTextColor="#8B95AD"
      />
      <TouchableOpacity className="rounded-xl bg-accent py-3" onPress={submit}>
        <Text className="text-center font-bold text-background">
          {t("auth.continue")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
