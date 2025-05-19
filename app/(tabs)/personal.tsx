import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router"; // Import useFocusEffect
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "../../hooks/themeStore";

type UserProfile = {
  _id: string;
  name: string;
  university?: {
    name: string;
  };
};

const PersonalScreen: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const response = await fetch(
          "https://universe.terabytecomputing.com:3000/api/v1/profile",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          console.error("Error fetching profile:", data);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/");
  };

  const handleCopyId = async () => {
    if (user?._id) await Clipboard.setStringAsync(user._id);
  };

  const theme = isDarkMode
    ? {
        background: "#121212",
        text: "#FFFFFF",
        header: "#FFFFFF",
        sectionBackground: "#2C2C2C",
        divider: "#444",
        arrow: "#BBBBBB",
      }
    : {
        background: "#FFFFFF",
        text: "#1D1D1F",
        header: "#1D1D1F",
        sectionBackground: "#F5F5F7",
        divider: "#E5E5EA",
        arrow: "#86868B",
      };

  if (isLoading || !user) {
    return (
      <>
        <SafeAreaView style={{ flex: 0, backgroundColor: theme.background }} />
        <SafeAreaView
          style={[styles.safeArea, { backgroundColor: theme.background }]}
        >
          <StatusBar
            barStyle={isDarkMode ? "light-content" : "dark-content"}
            backgroundColor={theme.background}
          />
          <View style={styles.containerCenter}>
            <ActivityIndicator size="large" color={"#0066CC"} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Loading Profile...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: theme.background }} />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={theme.background}
        />
        <View
          style={[
            styles.headerContainer,
            { paddingTop: insets.top > 0 ? 8 : 16 },
          ]}
        >
          <Text style={[styles.header, { color: theme.header }]}>Profile</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.profileContainer,
              { backgroundColor: theme.sectionBackground },
            ]}
          >
            <View style={styles.blankProfileIcon} />
            <View style={styles.profileDetails}>
              <Text style={[styles.name, { color: theme.text }]}>
                {user.name}
              </Text>
              <Text style={[styles.university, { color: theme.text }]}>
                {user.university?.name || "University Not Set"}
              </Text>
              <View style={styles.idRow}>
                <Text style={[styles.userId, { color: theme.text }]}>
                  ID: {user._id}
                </Text>
                <TouchableOpacity
                  onPress={handleCopyId}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.copyButton, { color: "#0066CC" }]}>
                    Copy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.section,
              { backgroundColor: theme.sectionBackground },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Preferences
            </Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingText, { color: theme.text }]}>
                Enable Notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#E5E5EA", true: "#0066CC" }}
                thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingText, { color: theme.text }]}>
                Dark Mode
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#E5E5EA", true: "#0066CC" }}
                thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
              />
            </View>
          </View>

          <View
            style={[
              styles.section,
              { backgroundColor: theme.sectionBackground },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Account
            </Text>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push("/edit-profile")}
            >
              <Text style={[styles.settingText, { color: theme.text }]}>Edit Profile</Text>
              <Text style={{ fontSize: 16, color: theme.arrow }}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={[styles.settingText, { color: theme.text }]}>Change Password</Text>
              <Text style={{ fontSize: 16, color: theme.arrow }}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={[styles.settingText, { color: theme.text }]}>Privacy Settings</Text>
              <Text style={{ fontSize: 16, color: theme.arrow }}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push("/maps")}
            >
              <Text style={[styles.settingText, { color: theme.text }]}>
                Maps
              </Text>
              <Text style={{ fontSize: 16, color: theme.arrow }}>→</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.logoutSection,
              { backgroundColor: theme.sectionBackground },
            ]}
          >
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={[styles.logoutText]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  containerCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  header: { fontSize: 28, fontWeight: "600" },
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: "500" },
  profileContainer: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 16,
  },
  blankProfileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1D1D6",
    marginRight: 16,
  },
  profileDetails: { flex: 1 },
  name: { fontSize: 18, fontWeight: "600" },
  university: { fontSize: 16, marginTop: 4 },
  idRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  userId: { fontSize: 14 },
  copyButton: { marginLeft: 8, fontSize: 14, fontWeight: "500" },
  section: {
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  settingText: { fontSize: 16 },
  logoutSection: {
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  logoutButton: { width: "100%", paddingVertical: 12 },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default PersonalScreen;
