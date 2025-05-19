import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// Update the import path if the file is in a different location, for example:
import { useThemeStore } from "../hooks/themeStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ProfileState = {
  name: string;
  universityId: string;
  pronouns: string;
  bio: string;
  gender: string;
  major: string;
  birthday: string;
  contactInfo: string;
};

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<ProfileState>({
    name: "",
    universityId: "",
    pronouns: "",
    bio: "",
    gender: "",
    major: "Computer Science",
    birthday: "",
    contactInfo: "",
  });
  const [loading, setLoading] = useState(true);
  
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
        inputBackground: "#2C2C2C",
        inputBorder: "#3A3A3C",
        readOnlyBackground: "#1C1C1C",
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
        inputBackground: "#FFFFFF",
        inputBorder: "#E5E5EA",
        readOnlyBackground: "#F5F5F7",
      };

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) throw new Error("No auth token");

        const res = await fetch("https://universe.terabytecomputing.com:3000/api/v1/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        let mmddyyyy = "";
        if (data.birthday) {
          const dt = new Date(data.birthday);
          const mm = String(dt.getMonth() + 1).padStart(2, "0");
          const dd = String(dt.getDate()).padStart(2, "0");
          const yy = dt.getFullYear();
          mmddyyyy = `${mm}/${dd}/${yy}`;
        }

        setProfile({
          name: data.name || "",
          universityId: data.university?.id || "",
          pronouns: data.pronouns || "",
          bio: data.bio || "",
          gender: data.gender || "",
          major: "Computer Science",
          birthday: mmddyyyy,
          contactInfo: data.contactInfo || "",
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        Alert.alert("Error", "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (field: keyof ProfileState, val: string) => {
    // Only allow changes to bio and contactInfo
    if (field === "bio" || field === "contactInfo") {
      setProfile((p) => ({ ...p, [field]: val }));
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      // Only send bio and contactInfo for update
      const body = {
        bio: profile.bio,
        contactInfo: profile.contactInfo,
      };

      const res = await fetch("https://universe.terabytecomputing.com:3000/api/v1/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      Alert.alert("Saved", "Your profile was updated.", [
        { 
          text: "OK", 
          onPress: () => router.replace("/personal") // Navigate to personal.tsx
        }
      ]);
    } catch (err) {
      console.error("Save failed:", err);
      Alert.alert("Error", "Could not save your profile.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your profile…</Text>
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
            onPress={() => router.replace("/personal")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={theme.accent} 
            />
          </TouchableOpacity>
          <Text style={[styles.header, { color: theme.header }]}>
            Edit Profile
          </Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Read-only fields */}
        <View style={[styles.section, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>Name</Text>
            <View style={[styles.readOnlyField, { backgroundColor: theme.readOnlyBackground }]}>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile.name || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>University ID</Text>
            <View style={[styles.readOnlyField, { backgroundColor: theme.readOnlyBackground }]}>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile.universityId || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>Pronouns</Text>
            <View style={[styles.readOnlyField, { backgroundColor: theme.readOnlyBackground }]}>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile.pronouns || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>Gender</Text>
            <View style={[styles.readOnlyField, { backgroundColor: theme.readOnlyBackground }]}>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile.gender || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>Major</Text>
            <View style={[styles.readOnlyField, { backgroundColor: theme.readOnlyBackground }]}>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile.major}
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>Birthday</Text>
            <View style={[styles.readOnlyField, { backgroundColor: theme.readOnlyBackground }]}>
              <Text style={[styles.fieldValue, { color: theme.text }]}>
                {profile.birthday || "Not set"}
              </Text>
            </View>
          </View>
        </View>

        {/* Editable fields */}
        <View style={[styles.section, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Editable Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>Bio</Text>
            <TextInput
              style={[
                styles.input, 
                styles.multilineInput,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text
                }
              ]}
              value={profile.bio}
              onChangeText={(t) => handleChange("bio", t)}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.segmentText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>Contact Info</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text
                }
              ]}
              value={profile.contactInfo}
              onChangeText={(t) => handleChange("contactInfo", t)}
              placeholder="Email, phone…"
              placeholderTextColor={theme.segmentText}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.accent }]} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Profile</Text>
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
    width: 32, // Same width as back button to center the title
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
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  readOnlyField: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  fieldValue: {
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  multilineInput: {
    height: 100,
    paddingTop: 12,
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