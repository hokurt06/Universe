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

  const renderLoadingState = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    </SafeAreaView>
  );

  const renderSettingToggle: React.FC<SettingToggleProps> = ({ title, value, onValueChange }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingText}>{title}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E5EA", true: "#0066CC" }}
        thumbColor={Platform.OS === 'ios' ? undefined : value ? "#FFFFFF" : "#F5F5F7"}
      />
    </View>
  );

  const renderSettingItem: React.FC<SettingItemProps> = ({ title, onPress }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.settingText}>{title}</Text>
      <Text style={styles.settingArrow}>→</Text>
    </TouchableOpacity>
  );

  const renderProfile = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? 8 : 16 }]}>
        <Text style={styles.header}>Profile</Text>
      </View>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* User profile info */}
        <View style={styles.profileContainer}>
          <View style={styles.blankProfileIcon} />
          <View style={styles.profileDetails}>
            <Text style={styles.name}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.university}>
              {user?.university && user.university.name
                ? user.university.name
                : "University Not Set"}
            </Text>
            <View style={styles.idRow}>
              <Text style={styles.userId}>ID: {user?._id}</Text>
              <TouchableOpacity 
                onPress={handleCopyId}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.copyButton}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preferences section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
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
          <Text style={styles.sectionTitle}>Account</Text>
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
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Log Out</Text>
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
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#0066CC",
    fontWeight: "500",
  },
  profileContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F7",
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
    color: "#1D1D1F",
  },
  university: {
    fontSize: 16,
    color: "#86868B",
    marginTop: 4,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  userId: {
    fontSize: 14,
    color: "#86868B",
  },
  copyButton: {
    marginLeft: 8,
    fontSize: 14,
    color: "#0066CC",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logoutSection: {
    backgroundColor: "#F5F5F7",
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
    color: "#1D1D1F",
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
    color: "#1D1D1F",
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
    color: "#FF3B30",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default PersonalScreen;
