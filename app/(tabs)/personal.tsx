import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

const PersonalScreen = () => {
  const [user, setUser] = React.useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] =
    React.useState<boolean>(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState<boolean>(false);

  const router = useRouter();

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
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
          console.log("Profile API response:", data);
          console.log;
          if (data) {
            setUser(data);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/");
  };

  const handleCopyId = async () => {
    if (user && user._id) {
      await Clipboard.setStringAsync(user._id);
    }
  };

  // While waiting for the profile to load, you can show a loading indicator.
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.containerCenter}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.profileContainer}>
          <Image
            source={require("../../assets/images/home.png")}
            style={styles.profileImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {user.first_name} {user.last_name}
            </Text>
            <Text style={styles.university}>
              {user.university && user.university.name
                ? user.university.name
                : "University Not Set"}
            </Text>
            <View style={styles.idRow}>
              <Text style={styles.userId}>ID: {user._id}</Text>
              <TouchableOpacity onPress={handleCopyId}>
                <Text style={styles.copyButton}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingToggle
            title="Enable Notifications"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingToggle
            title="Dark Mode"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem title="Edit Profile" />
          <SettingItem title="Change Password" />
          <SettingItem title="Privacy Settings" />
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingToggle = ({
  title,
  value,
  onValueChange,
}: {
  title: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingText}>{title}</Text>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
);

const SettingItem = ({ title }: { title: string }) => (
  <TouchableOpacity style={styles.settingRow}>
    <Text style={styles.settingText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    padding: 16,
  },
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#007AFF",
  },
  profileContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  university: {
    fontSize: 16,
    color: "#555",
    marginTop: 2,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  userId: {
    fontSize: 14,
    color: "#888",
  },
  copyButton: {
    marginLeft: 8,
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  settingText: {
    fontSize: 16,
    color: "#111",
  },
  logout: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default PersonalScreen;
