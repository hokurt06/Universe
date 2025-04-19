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

// AsyncStorage for storing/retrieving auth tokens
import AsyncStorage from "@react-native-async-storage/async-storage";

// Navigation hook from Expo Router
import { useRouter } from "expo-router";

// Clipboard for copying text to clipboard
import * as Clipboard from "expo-clipboard";

const PersonalScreen = () => {
  // State to store user profile data
  const [user, setUser] = React.useState<any>(null);

  // State for enabling/disabling notifications
  const [notificationsEnabled, setNotificationsEnabled] =
    React.useState<boolean>(true);

  // State for toggling dark mode
  const [darkModeEnabled, setDarkModeEnabled] = React.useState<boolean>(false);

  const router = useRouter();

  // Fetch user profile on component mount
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get the stored authentication token
        const token = await AsyncStorage.getItem("authToken");

        if (token) {
          // Fetch user profile using token for authentication
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

          // Save user data to state
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

  // Handle logout by clearing the token and navigating to the login screen
  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/");
  };

  // Copy user ID to clipboard
  const handleCopyId = async () => {
    if (user && user._id) {
      await Clipboard.setStringAsync(user._id);
    }
  };

  // Show loading indicator while profile is being fetched
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

  // Main UI rendering when user data is available
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* User profile info */}
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
            <View   style={styles.idRow}>
              <Text style={styles.userId}>ID: {user._id}</Text>
              <TouchableOpacity onPress={handleCopyId}>
                <Text style={styles.copyButton}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preferences section */}
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

        {/* Account settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem title="Edit Profile" />
          <SettingItem title="Change Password" />
          <SettingItem title="Privacy Settings" />
          <SettingItem title="Maps" onPress={() => router.push("/maps")} />         
        </View>
        {/* Logout button */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable toggle component for settings
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

// Reusable setting item (button-style)
const SettingItem = ({
  title,
  onPress,
}: {
  title: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress}>
    <Text style={styles.settingText}>{title}</Text>
  </TouchableOpacity>
);


// Styles for the screen and components
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
