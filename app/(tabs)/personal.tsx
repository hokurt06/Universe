import React, { useState, useEffect } from "react";
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
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// User Profile and other props
type UserProfile = {
  _id: string;
  first_name: string;
  last_name: string;
  university?: {
    name: string;
  };
};

type SettingToggleProps = {
  title: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
};

type SettingItemProps = {
  title: string;
  onPress?: () => void;
};

type Props = {
  navigation?: any;
};

const PersonalScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchProfile = async () => {
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
          console.log("Profile API response:", data);

          if (data) {
            setUser(data);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
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

  // Light and Dark Theme
  const lightTheme = {
    background: "#FFFFFF",
    text: "#1D1D1F",
    header: "#0066CC",
    sectionBackground: "#F5F5F7",
    buttonText: "#FF3B30",
  };

  const darkTheme = {
    background: "#121212",
    text: "#FFFFFF",
    header: "#0066CC",
    sectionBackground: "#2C2C2C",
    buttonText: "#FF3B30",
  };

  // Theme selector
  const currentTheme = darkModeEnabled ? darkTheme : lightTheme;

  const renderLoadingState = () => (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color={currentTheme.header} />
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>Loading Profile...</Text>
      </View>
    </SafeAreaView>
  );

  const renderSettingToggle: React.FC<SettingToggleProps> = ({ title, value, onValueChange }) => (
    <View style={[styles.settingRow, { backgroundColor: currentTheme.sectionBackground }]}>
      <Text style={[styles.settingText, { color: currentTheme.text }]}>{title}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E5EA", true: currentTheme.header }}
        thumbColor={Platform.OS === 'ios' ? undefined : value ? "#FFFFFF" : "#F5F5F7"}
      />
    </View>
  );

  const renderSettingItem: React.FC<SettingItemProps> = ({ title, onPress }) => (
    <TouchableOpacity 
      style={[styles.settingRow, { backgroundColor: currentTheme.sectionBackground }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.settingText, { color: currentTheme.text }]}>{title}</Text>
      <Text style={[styles.settingArrow, { color: currentTheme.text }]}>→</Text>
    </TouchableOpacity>
  );

  const renderProfile = () => (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? 8 : 16 }]}>
        <Text style={[styles.header, { color: currentTheme.header }]}>Profile</Text>
      </View>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* User profile info */}
        <View style={styles.profileContainer}>
          <View style={styles.blankProfileIcon} />
          <View style={styles.profileDetails}>
            <Text style={[styles.name, { color: currentTheme.text }]}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={[styles.university, { color: currentTheme.text }]}>
              {user?.university && user.university.name
                ? user.university.name
                : "University Not Set"}
            </Text>
            <View style={styles.idRow}>
              <Text style={[styles.userId, { color: currentTheme.text }]}>ID: {user?._id}</Text>
              <TouchableOpacity 
                onPress={handleCopyId}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.copyButton, { color: currentTheme.header }]}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preferences section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Preferences</Text>
          {renderSettingToggle({
            title: "Enable Notifications",
            value: notificationsEnabled,
            onValueChange: setNotificationsEnabled,
          })}
          {renderSettingToggle({
            title: "Dark Mode",
            value: darkModeEnabled,
            onValueChange: setDarkModeEnabled,
          })}
        </View>

        {/* Account settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Account</Text>
          {renderSettingItem({ title: "Edit Profile" })}
          {renderSettingItem({ title: "Change Password" })}
          {renderSettingItem({ title: "Privacy Settings" })}
          {renderSettingItem({ 
            title: "Maps", 
            onPress: () => router.push("/maps") 
          })}         
        </View>
        
        {/* Logout button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: currentTheme.sectionBackground }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.logoutText, { color: currentTheme.buttonText }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (isLoading || !user) {
    return renderLoadingState();
  }

  return renderProfile();
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
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
  profileDetails: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  university: {
    fontSize: 16,
    marginTop: 4,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  userId: {
    fontSize: 14,
  },
  copyButton: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logoutSection: {
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  settingText: {
    fontSize: 16,
  },
  settingArrow: {
    fontSize: 16,
    color: "#86868B",
  },
  logoutButton: {
    width: "100%",
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default PersonalScreen;
