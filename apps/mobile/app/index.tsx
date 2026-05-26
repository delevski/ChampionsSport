import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";

export default function Index() {
  const [dest, setDest] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setDest(session ? "/(tabs)" : "/(auth)/login");
    });
  }, []);

  if (!dest) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#00D68F" />
      </View>
    );
  }

  return <Redirect href={dest} />;
}
