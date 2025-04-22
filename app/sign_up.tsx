import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  Alert, // Import Alert
  ActivityIndicator, // Import ActivityIndicator for loading state
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

import universityListRaw from "./assets/Universities.json";

interface University {
  institution: string;
}

const SignUpScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState(""); // Renamed from username
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState(""); // For the input field text
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(
    null
  ); // To store the chosen university
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for registration

  // Extract & alphabetize university names
  const parsedUniversityList: string[] = useMemo(() => {
    return (universityListRaw as University[])
      .map((uni) => uni.institution)
      .sort((a, b) => a.localeCompare(b));
  }, []);

  // Filter on search
  const filteredUniversities = parsedUniversityList.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle university selection from dropdown
  const handleSelect = (name: string) => {
    setSearch(name); // Update the input field text
    setSelectedUniversity(name); // Store the actual selected university
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  // Handle Registration
  const handleRegister = async () => {
    // Basic Validation
    if (!fullName || !password || !selectedUniversity) {
      Alert.alert(
        "Error",
        "Please fill in all fields and select a university."
      );
      return;
    }

    setLoading(true); // Start loading indicator

    try {
      // *** IMPORTANT: Adjust this URL to your actual registration endpoint ***
      const response = await fetch(
        "https://universe.terabytecomputing.com:3000/api/v1/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: fullName,
            password,
            email: "teett@df.com",
            universityId: "edd750a7-1972-463d-a983-4fab60b2e9be", // Or whatever field name your backend expects (e.g., institution)
            // Add email field if required by your backend
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Assuming registration returns a token similar to login
        if (data.token) {
          await AsyncStorage.setItem("authToken", data.token);
          // Navigate to the main part of the app after successful registration + login
          router.replace("/(tabs)/personal"); // Or wherever appropriate
        } else {
          // Handle cases where registration is successful but doesn't auto-login (e.g., show success message and navigate to login)
          Alert.alert("Success", "Registration successful! Please log in.");
          router.replace("/"); // Navigate to sign-in screen
        }
      } else {
        // Show specific error from backend if available, otherwise generic
        Alert.alert(
          "Registration Failed",
          data.message || "Could not register. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign Up</Text>

        {/* Changed from Username to Full Name */}
        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          editable={!loading} // Disable input when loading
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          editable={!loading} // Disable input when loading
        />

        {/* University Search Input */}
        <TextInput
          placeholder="Select University"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            // If user clears input or types something different after selection, clear selection
            if (selectedUniversity && text !== selectedUniversity) {
              setSelectedUniversity(null);
            }
            setShowDropdown(true); // Show dropdown when typing
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            // Small delay to allow press on dropdown item before hiding
            setTimeout(() => setShowDropdown(false), 150);
          }}
          style={styles.input}
          editable={!loading} // Disable input when loading
        />

        {/* University Dropdown */}
        {showDropdown && (
          <FlatList
            data={filteredUniversities}
            keyExtractor={(item, index) => `${item}-${index}`}
            style={styles.dropdown}
            keyboardShouldPersistTaps="handled" // Important for TouchableOpacity inside FlatList
            nestedScrollEnabled // Useful if the FlatList is inside a ScrollView (though not the case here)
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)}>
                <Text style={styles.dropdownItem}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, loading ? styles.buttonDisabled : {}]} // Apply disabled style
          onPress={handleRegister}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" /> // Show spinner when loading
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Adjusted for potential overlap with status bar/notch
    paddingHorizontal: 20,
    backgroundColor: "#fff", // Added background color
  },
  backButton: {
    position: "absolute",
    top: 50, // Adjust as needed based on status bar height
    left: 20,
    padding: 10,
    zIndex: 10, // Ensure it's above other elements
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50, // Space at the bottom
    // Prevent dropdown from overflowing container horizontally
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    width: "90%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20, // Adjusted spacing
    backgroundColor: "#fff",
    fontSize: 16,
  },
  dropdown: {
    width: "90%", // Match input width
    maxHeight: 250, // Adjusted max height
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    position: "absolute", // Position dropdown absolutely
    top: 240, // Adjust this value based on the position of the University input + title etc. Needs careful tuning or calculation.
    zIndex: 20, // Ensure dropdown is above inputs/button
    left: "5%", // Center the dropdown relative to the formContainer
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  registerButton: {
    backgroundColor: "#000", // Style like the Sign In button
    width: "90%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20, // Space above the button
    height: 50, // Match input height for consistency
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#aaa", // Grey out button when disabled
  },
});

export default SignUpScreen;
