import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      {/* Academic Tab */}
      <Tabs.Screen name="academic" options={{ title: "Academic" }} />
      {/* Calendar Tab */}
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
    </Tabs>
  );
}
