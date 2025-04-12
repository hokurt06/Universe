// byteme/app/tabs/tablayout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Image } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme ?? "light"].tint; // Blue color for active tab

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
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
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/home.png")}
              style={{
                width: 27,
                height: 27,
                tintColor: focused ? activeColor : "gray",
              }}
            />
          ),
        }}
      />

      {/* Academic Tab */}
      <Tabs.Screen
        name="academic"
        options={{
          title: "Academic",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/academic.png")}
              style={{
                width: 30,
                height: 30,
                tintColor: focused ? activeColor : "gray",
              }}
            />
          ),
        }}
      />

      {/* Schedule Tab */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/schedule.png")}
              style={{
                width: 23,
                height: 23,
                tintColor: focused ? activeColor : "gray",
              }}
            />
          ),
        }}
      />

      {/* Inbox Tab */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/inbox-icon.png")}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? activeColor : "gray",
              }}
            />
          ),
        }}
      />
      {/* Activity Tab */}
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/activityclubs.png")}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? activeColor : "gray",
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
