import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert(t("common.error"), error.message);
    else router.replace("/(auth)/onboarding");
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="mb-8 text-center text-xl font-bold text-white">
        {t("auth.register")}
      </Text>
      <TextInput
        className="mb-3 rounded-xl bg-surface px-4 py-3 text-white"
        placeholder={t("auth.email")}
        placeholderTextColor="#8B95AD"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        className="mb-4 rounded-xl bg-surface px-4 py-3 text-white"
        placeholder={t("auth.password")}
        placeholderTextColor="#8B95AD"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity className="rounded-xl bg-accent py-3" onPress={register}>
        <Text className="text-center font-bold text-background">
          {t("auth.register")}
        </Text>
      </TouchableOpacity>
      <Link href="/(auth)/login" asChild>
        <TouchableOpacity className="mt-4">
          <Text className="text-center text-accent">{t("auth.login")}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
