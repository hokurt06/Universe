// byteme/app/tabs/tablayout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Image } from "react-native";
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
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: () => (
            <Image
              source={require("../../assets/images/home.png")}
              style={{ width: 27, height: 27 }}
            />
          ),
        }}
      />
      
      {/* Academic Tab */}
      <Tabs.Screen
        name="academic"
        options={{
          title: "Academic",
          tabBarIcon: () => (
            <Image
              source={require("../../assets/images/academic.png")}
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />
      
      {/* Schedule Tab */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: () => (
            <Image
              source={require("../../assets/images/schedule.png")}
              style={{ width: 23, height: 23 }}
            />
          ),
        }}
      />
      
      {/* Inbox Tab */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: () => (
            <Image
              source={require("../../assets/images/inbox-icon.png")}
              style={{ width: 25, height: 25 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
