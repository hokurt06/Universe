import React, { useState } from "react";
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

type PasswordState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordScreen() {
  const [passwords, setPasswords] = useState<PasswordState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
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
        errorText: "#FF453A",
        successText: "#30D158",
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
        errorText: "#FF3B30",
        successText: "#34C759",
      };

  const handleChange = (field: keyof PasswordState, val: string) => {
    setPasswords((prev) => ({ ...prev, [field]: val }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswords = (): string | null => {
    if (!passwords.currentPassword) {
      return "Please enter your current password";
    }
    if (!passwords.newPassword) {
      return "Please enter a new password";
    }
    if (passwords.newPassword.length < 8) {
      return "New password must be at least 8 characters long";
    }
    if (passwords.newPassword === passwords.currentPassword) {
      return "New password must be different from current password";
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return "New passwords do not match";
    }
    return null;
  };

  const handleChangePassword = async () => {
    const validationError = validatePasswords();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const body = {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      };

      const res = await fetch("https://universe.terabytecomputing.com:3000/api/v1/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      Alert.alert(
        "Success", 
        "Your password has been changed successfully.",
        [
          { 
            text: "OK", 
            onPress: () => router.back()
          }
        ]
      );

      // Clear form
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (err: any) {
      console.error("Change password failed:", err);
      Alert.alert(
        "Error", 
        err.message === "HTTP 401" 
          ? "Current password is incorrect" 
          : "Could not change your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length === 0) return { strength: "", color: theme.segmentText };
    if (password.length < 6) return { strength: "Weak", color: theme.errorText };
    if (password.length < 8) return { strength: "Fair", color: "#FF9500" };
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criteriaCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (criteriaCount >= 3 && password.length >= 10) return { strength: "Strong", color: theme.successText };
    if (criteriaCount >= 2 && password.length >= 8) return { strength: "Good", color: "#FF9500" };
    return { strength: "Fair", color: "#FF9500" };
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);

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
            Change Password
          </Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Security Notice */}
        <View style={[styles.noticeContainer, { backgroundColor: theme.sectionBackground }]}>
          <Ionicons name="shield-checkmark" size={24} color={theme.accent} />
          <Text style={[styles.noticeText, { color: theme.segmentText }]}>
            For your security, you'll need to enter your current password to make changes.
          </Text>
        </View>

        {/* Password Fields */}
        <View style={[styles.section, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Password Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  { 
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.text
                  }
                ]}
                value={passwords.currentPassword}
                onChangeText={(t) => handleChange("currentPassword", t)}
                placeholder="Enter your current password"
                placeholderTextColor={theme.segmentText}
                secureTextEntry={!showPasswords.current}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('current')}
              >
                <Ionicons 
                  name={showPasswords.current ? "eye-off" : "eye"} 
                  size={20} 
                  color={theme.segmentText} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  { 
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.text
                  }
                ]}
                value={passwords.newPassword}
                onChangeText={(t) => handleChange("newPassword", t)}
                placeholder="Enter your new password"
                placeholderTextColor={theme.segmentText}
                secureTextEntry={!showPasswords.new}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('new')}
              >
                <Ionicons 
                  name={showPasswords.new ? "eye-off" : "eye"} 
                  size={20} 
                  color={theme.segmentText} 
                />
              </TouchableOpacity>
            </View>
            {passwords.newPassword.length > 0 && (
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                Strength: {passwordStrength.strength}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.segmentText }]}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  { 
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.text
                  }
                ]}
                value={passwords.confirmPassword}
                onChangeText={(t) => handleChange("confirmPassword", t)}
                placeholder="Confirm your new password"
                placeholderTextColor={theme.segmentText}
                secureTextEntry={!showPasswords.confirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('confirm')}
              >
                <Ionicons 
                  name={showPasswords.confirm ? "eye-off" : "eye"} 
                  size={20} 
                  color={theme.segmentText} 
                />
              </TouchableOpacity>
            </View>
            {passwords.confirmPassword.length > 0 && passwords.newPassword !== passwords.confirmPassword && (
              <Text style={[styles.errorText, { color: theme.errorText }]}>
                Passwords do not match
              </Text>
            )}
          </View>
        </View>

        {/* Password Requirements */}
        <View style={[styles.section, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Password Requirements</Text>
          <View style={styles.requirementsList}>
            <Text style={[styles.requirement, { color: theme.segmentText }]}>
              • At least 8 characters long
            </Text>
            <Text style={[styles.requirement, { color: theme.segmentText }]}>
              • Different from your current password
            </Text>
            <Text style={[styles.requirement, { color: theme.segmentText }]}>
              • Consider using a mix of letters, numbers, and symbols
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.changeButton, 
            { 
              backgroundColor: theme.accent,
              opacity: loading ? 0.6 : 1
            }
          ]} 
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.changeButtonText}>Change Password</Text>
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
  noticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
  passwordContainer: {
    position: "relative",
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  passwordInput: {
    paddingRight: 50, // Make room for eye icon
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 4,
  },
  strengthText: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
  },
  requirementsList: {
    marginTop: 8,
  },
  requirement: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  changeButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 52,
  },
  changeButtonText: { 
    fontSize: 18, 
    color: "#fff", 
    fontWeight: "600" 
  },
});