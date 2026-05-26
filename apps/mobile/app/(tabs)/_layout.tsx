import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#12182A",
          borderTopColor: "#2A3550",
        },
        tabBarActiveTintColor: "#00D68F",
        tabBarInactiveTintColor: "#8B95AD",
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("nav.home") }} />
      <Tabs.Screen name="tournament" options={{ title: t("nav.tournament") }} />
      <Tabs.Screen name="groups" options={{ title: t("nav.groups") }} />
      <Tabs.Screen name="leaderboard" options={{ title: t("nav.leaderboard") }} />
      <Tabs.Screen name="profile" options={{ title: t("nav.profile") }} />
    </Tabs>
  );
}
