import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "../hooks/themeStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PrivacyState = {
  shareGradesWithAdvisor: boolean;
  allowClassmateContact: boolean;
  showScheduleToFriends: boolean;
  enableStudyGroupDiscovery: boolean;
  shareAcademicProgress: boolean;
  allowCampusLocationSharing: boolean;
  enableNotifications: boolean;
  shareAttendanceData: boolean;
  allowTutoringMatching: boolean;
  dataRetentionConsent: boolean;
};

export default function PrivacySettingsScreen() {
  const [privacy, setPrivacy] = useState<PrivacyState>({
    shareGradesWithAdvisor: true,
    allowClassmateContact: true,
    showScheduleToFriends: false,
    enableStudyGroupDiscovery: true,
    shareAcademicProgress: false,
    allowCampusLocationSharing: false,
    enableNotifications: true,
    shareAttendanceData: true,
    allowTutoringMatching: true,
    dataRetentionConsent: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { isDarkMode } = useThemeStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const theme = isDarkMode
    ? {
        background: "#121212",
        text: "#FFFFFF",
        header: "#FFFFFF",
        sectionBackground: "#2C2C2C",
        divider: "#444",
        accent: "#0A84FF",
        cardBorder: "#3A3A3C",
        segmentText: "#8E8E93",
        switchTrack: "#3A3A3C",
        switchThumb: "#FFFFFF",
        dangerText: "#FF453A",
      }
    : {
        background: "#F9F9F9",
        text: "#1C1C1E",
        header: "#1C1C1E",
        sectionBackground: "#FFFFFF",
        divider: "#E5E5EA",
        accent: "#007AFF",
        cardBorder: "#E5E5EA",
        segmentText: "#8E8E93",
        switchTrack: "#E5E5EA",
        switchThumb: "#FFFFFF",
        dangerText: "#FF3B30",
      };

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      // In a real app, you'd fetch these from your API
      // For now, we'll load from AsyncStorage or use defaults
      const savedSettings = await AsyncStorage.getItem("privacySettings");
      if (savedSettings) {
        setPrivacy(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error("Error loading privacy settings:", err);
      Alert.alert("Error", "Could not load your privacy settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof PrivacyState, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }));
  };

  const handleVisibilityChange = (enabled: boolean) => {
    // This could control overall privacy mode if needed
    console.log("Privacy mode changed:", enabled);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      // Save to AsyncStorage (in a real app, you'd send to your API)
      await AsyncStorage.setItem("privacySettings", JSON.stringify(privacy));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert("Saved", "Your privacy settings have been updated.", [
        { 
          text: "OK", 
          onPress: () => router.back()
        }
      ]);
    } catch (err) {
      console.error("Save failed:", err);
      Alert.alert("Error", "Could not save your privacy settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Contact Registrar",
      "To request deletion of your academic records, please contact the Office of the Registrar. Note that some academic data must be retained by law for transcript and degree verification purposes.",
      [
        { text: "OK" }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading privacy settings…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header with back arrow */}
      <View style={[
        styles.headerContainer,
        { 
          paddingTop: insets.top > 0 ? 8 : 16,
          borderBottomColor: theme.divider
        }
      ]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={theme.accent} 
            />
          </TouchableOpacity>
          <Text style={[styles.header, { color: theme.header }]}>
            Privacy Settings
          </Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Academic Information Sharing */}
        <View style={[styles.section, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Academic Information</Text>
          <Text style={[styles.sectionDescription, { color: theme.segmentText }]}>
            Control how your academic information is shared within the university
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Share Grades with Academic Advisor</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Allow your advisor to view your current grades and GPA
              </Text>
            </View>
            <Switch
              value={privacy.shareGradesWithAdvisor}
              onValueChange={(value) => handleToggle("shareGradesWithAdvisor", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Share Academic Progress</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Allow department to track your degree progress and requirements
              </Text>
            </View>
            <Switch
              value={privacy.shareAcademicProgress}
              onValueChange={(value) => handleToggle("shareAcademicProgress", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Share Attendance Data</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Allow professors to access your class attendance records
              </Text>
            </View>
            <Switch
              value={privacy.shareAttendanceData}
              onValueChange={(value) => handleToggle("shareAttendanceData", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>
        </View>

        {/* Student Collaboration */}
        <View style={[styles.section, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Student Collaboration</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Allow Classmate Contact</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Let students in your classes contact you for academic purposes
              </Text>
            </View>
            <Switch
              value={privacy.allowClassmateContact}
              onValueChange={(value) => handleToggle("allowClassmateContact", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Show Schedule to Friends</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Allow friends to see your class schedule for coordination
              </Text>
            </View>
            <Switch
              value={privacy.showScheduleToFriends}
              onValueChange={(value) => handleToggle("showScheduleToFriends", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Study Group Discovery</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Allow other students to find you for study groups in your classes
              </Text>
            </View>
            <Switch
              value={privacy.enableStudyGroupDiscovery}
              onValueChange={(value) => handleToggle("enableStudyGroupDiscovery", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Tutoring Matching</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Allow the system to match you with tutors or tutoring opportunities
              </Text>
            </View>
            <Switch
              value={privacy.allowTutoringMatching}
              onValueChange={(value) => handleToggle("allowTutoringMatching", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>
        </View>

        {/* Campus Services */}
        <View style={[styles.section, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Campus Services</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Campus Location Sharing</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Allow location access for campus navigation and emergency services
              </Text>
            </View>
            <Switch
              value={privacy.allowCampusLocationSharing}
              onValueChange={(value) => handleToggle("allowCampusLocationSharing", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Academic Notifications</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Receive notifications about grades, assignments, and important deadlines
              </Text>
            </View>
            <Switch
              value={privacy.enableNotifications}
              onValueChange={(value) => handleToggle("enableNotifications", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={[styles.section, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Management</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Academic Data Retention</Text>
              <Text style={[styles.settingDescription, { color: theme.segmentText }]}>
                Allow university to retain your academic data for transcripts and records
              </Text>
            </View>
            <Switch
              value={privacy.dataRetentionConsent}
              onValueChange={(value) => handleToggle("dataRetentionConsent", value)}
              trackColor={{ false: theme.switchTrack, true: theme.accent }}
              thumbColor={theme.switchThumb}
            />
          </View>
        </View>

        {/* Export Academic Data */}
        <View style={[styles.section, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.accent }]}>Data Export</Text>
          
          <TouchableOpacity 
            style={[styles.exportButton, { borderColor: theme.accent }]}
            onPress={() => {
              Alert.alert("Data Export", "Your academic data export will be sent to your university email within 24 hours.");
            }}
          >
            <Ionicons name="download-outline" size={20} color={theme.accent} />
            <Text style={[styles.exportButtonText, { color: theme.accent }]}>
              Export My Academic Data
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.exportDescription, { color: theme.segmentText }]}>
            Download a copy of your grades, transcripts, and academic records in PDF format.
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { backgroundColor: theme.accent },
            saving && { opacity: 0.7 }
          ]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Privacy Settings</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 8, 
    fontSize: 16 
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionGroup: {
    gap: 12,
  },
  radioOption: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  radioContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 12,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  exportDescription: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: { 
    fontSize: 18, 
    color: "#fff", 
    fontWeight: "600" 
  },
});