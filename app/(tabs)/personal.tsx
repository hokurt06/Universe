import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage"; // For persistent storage (e.g., auth token)
import { useRouter } from "expo-router"; // For navigation between screens
import * as Clipboard from 'expo-clipboard'; // For copying text to clipboard

const PersonalScreen = () => {
  // State for user preferences
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const router = useRouter(); // Get router for navigation

  // Log the user out by removing auth token and navigating to login screen
  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/");
  };

  // Copy user ID to clipboard
  const handleCopyId = async () => {
    await Clipboard.setStringAsync("123456789");
  };

  return (
    <SafeAreaView style={styles.safeArea}> {/* Keep UI within safe boundaries on devices */}
      <ScrollView style={styles.container}> {/* Allow screen to scroll */}
        
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={require("../../assets/images/home.png")} // Profile image
            style={styles.profileImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Jane Doe</Text> {/* User name */}
            <Text style={styles.university}>Harvard University</Text> {/* University name */}
            <View style={styles.idRow}>
              <Text style={styles.userId}>ID: 123456789</Text> {/* User ID */}
              <TouchableOpacity onPress={handleCopyId}>
                <Text style={styles.copyButton}>Copy</Text> {/* Copy button */}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
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

        {/* Account Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem title="Edit Profile" />
          <SettingItem title="Change Password" />
          <SettingItem title="Privacy Settings" />
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable toggle setting component
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
    <Switch value={value} onValueChange={onValueChange} /> {/* Toggle switch */}
  </View>
);

// Reusable touchable setting item
const SettingItem = ({ title }: { title: string }) => (
  <TouchableOpacity style={styles.settingRow}>
    <Text style={styles.settingText}>{title}</Text>
  </TouchableOpacity>
);

// StyleSheet for styling the UI
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Light gray background
  },
  container: {
    padding: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32, // Makes it circular
    marginRight: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  university: {
    fontSize: 16,
    color: '#555',
    marginTop: 2,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userId: {
    fontSize: 14,
    color: '#888',
  },
  copyButton: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF', // iOS-style blue
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  settingText: {
    fontSize: 16,
    color: '#111',
  },
  logout: {
    fontSize: 16,
    color: '#FF3B30', // Red for log out
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PersonalScreen;
