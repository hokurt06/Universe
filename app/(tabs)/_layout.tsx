import { Asset } from "expo-asset";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Image } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Preload images (optional but recommended)
  const homeIcon = Asset.fromModule(require("../../assets/images/favicon.png")).uri;
  const academicIcon = Asset.fromModule(require("../../assets/images/applogo.png")).uri;
  const scheduleIcon = Asset.fromModule(require("../../assets/images/applogo.png")).uri;
  const inboxIcon = Asset.fromModule(require("../../assets/images/applogo.png")).uri;

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
              source={{ uri: homeIcon }}
              style={{ width: 25, height: 25 }}
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
              source={{ uri: academicIcon }}
              style={{ width: 25, height: 25 }}
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
              source={{ uri: scheduleIcon }}
              style={{ width: 25, height: 25 }}
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
              source={{ uri: inboxIcon }}
              style={{ width: 25, height: 25 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
