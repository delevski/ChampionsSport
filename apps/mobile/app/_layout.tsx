import "../global.css";
import "../lib/i18n";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nManager } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A0E17" } }} />
    </QueryClientProvider>
  );
}
