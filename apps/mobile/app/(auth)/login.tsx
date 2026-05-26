import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert(t("common.error"), error.message);
    else router.replace("/(tabs)");
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <Text className="mb-2 text-center text-2xl font-bold text-accent">
        ChampionsSport
      </Text>
      <Text className="mb-8 text-center text-muted">{t("auth.login")}</Text>
      <TextInput
        className="mb-3 rounded-xl border border-gray-700 bg-surface px-4 py-3 text-white"
        placeholder={t("auth.email")}
        placeholderTextColor="#8B95AD"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="mb-4 rounded-xl border border-gray-700 bg-surface px-4 py-3 text-white"
        placeholder={t("auth.password")}
        placeholderTextColor="#8B95AD"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="rounded-xl bg-accent py-3"
        onPress={login}
        disabled={loading}
      >
        <Text className="text-center font-bold text-background">
          {loading ? t("common.loading") : t("auth.login")}
        </Text>
      </TouchableOpacity>
      <Link href="/(auth)/register" asChild>
        <TouchableOpacity className="mt-4">
          <Text className="text-center text-accent">{t("auth.register")}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
