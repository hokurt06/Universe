import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import universityListRaw from "./assets/Universities.json";

interface University {
  institution: string;
}

const SignUpScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility

  // Extract & alphabetize university names
  const parsedUniversityList: string[] = useMemo(() => {
    return (universityListRaw as University[])
      .map((uni) => uni.institution)
      .sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredUniversities = parsedUniversityList.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (name: string) => {
    setSearch(name);
    setSelectedUniversity(name);
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  const handleRegister = async () => {
    if (!fullName || !password || !selectedUniversity) {
      Alert.alert("Error", "Please fill in all fields and select a university.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://universe.terabytecomputing.com:3000/api/v1/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: fullName,
          password,
          email: "teett@df.com",
          universityId: "edd750a7-1972-463d-a983-4fab60b2e9be",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          await AsyncStorage.setItem("authToken", data.token);
          router.replace("/(tabs)/personal");
        } else {
          Alert.alert("Success", "Registration successful! Please log in.");
          router.replace("/");
        }
      } else {
        Alert.alert("Registration Failed", data.message || "Could not register. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            style={styles.input}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={passwordVisible ? "eye" : "eye-off"} // Show "eye" when password is hidden
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Select University"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            if (selectedUniversity && text !== selectedUniversity) {
              setSelectedUniversity(null);
            }
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 150);
          }}
          style={styles.input}
          editable={!loading}
        />

        {showDropdown && (
          <FlatList
            data={filteredUniversities}
            keyExtractor={(item, index) => `${item}-${index}`}
            style={styles.dropdown}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)}>
                <Text style={styles.dropdownItem}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity
          style={[styles.registerButton, loading ? styles.buttonDisabled : {}]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
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
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
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
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  passwordContainer: {
    width: "90%",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: "38%",
    transform: [{ translateY: -12 }],
  },
  dropdown: {
    width: "90%",
    maxHeight: 250,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    position: "absolute",
    top: 510,
    zIndex: 20,
    left: "5%",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  registerButton: {
    backgroundColor: "#000",
    width: "90%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    height: 50,
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
  },
});

export default SignUpScreen;
