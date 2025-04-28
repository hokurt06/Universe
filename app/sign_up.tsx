import React, { useState, useEffect, useMemo } from "react";
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

interface University {
  id: string;
  name: string;
}

const SignUpScreen = () => {
  const router = useRouter();
  // ---------------------- form state ---------------------- //
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  // ------------------- university search ------------------ //
  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uniLoading, setUniLoading] = useState(true);

  // ---------------------- request state ------------------- //
  const [loading, setLoading] = useState(false);

  // =========================================================
  // Fetch universities once when the component mounts.
  // =========================================================
  useEffect(() => {
    const controller = new AbortController();

    const fetchUniversities = async () => {
      try {
        const res = await fetch(
          "https://universe.terabytecomputing.com:3000/api/v1/universities",
          { signal: controller.signal }
        );
        const json = await res.json();
        if (res.ok && json?.universities) {
          const sorted: University[] = json.universities.sort(
            (a: University, b: University) => a.name.localeCompare(b.name)
          );
          setUniversities(sorted);
        } else {
          console.warn("Unexpected universities payload", json);
          Alert.alert(
            "Notice",
            "Could not load universities from the server. You may try again later."
          );
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("University fetch error", err);
        Alert.alert(
          "Network Error",
          "Unable to fetch university list. Please check your connection."
        );
      } finally {
        setUniLoading(false);
      }
    };

    fetchUniversities();

    return () => controller.abort();
  }, []);

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------
  const filteredUniversities = useMemo(() => {
    if (!search) return universities;
    return universities.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, universities]);

  const handleSelect = (uni: University) => {
    setSelectedUniversity(uni);
    setSearch(uni.name);
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  const handleRegister = async () => {
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !selectedUniversity
    ) {
      Alert.alert(
        "Error",
        "Please fill in all fields and select a university."
      );
      return;
    }

    setLoading(true);

    try {
      // 1) Create the account ------------------------------------ //
      const regRes = await fetch(
        "https://universe.terabytecomputing.com:3000/api/v1/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            username,
            password,
            email,
            universityId: selectedUniversity.id,
          }),
        }
      );

      const regData = await regRes.json();

      if (!regRes.ok) {
        Alert.alert(
          "Registration Failed",
          regData.message || "Could not register. Please try again."
        );
        return;
      }

      // 2) If registration returns a token, save it and go -------- //
      if (regData?.token) {
        await AsyncStorage.setItem("authToken", regData.token);
        router.replace("/(tabs)/personal");
        return;
      }

      // 3) Otherwise, immediately sign the new user in ------------ //
      const loginRes = await fetch(
        "https://universe.terabytecomputing.com:3000/api/v1/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const loginData = await loginRes.json();

      if (loginRes.ok && loginData.token) {
        await AsyncStorage.setItem("authToken", loginData.token);
        router.replace("/(tabs)/personal");
      } else {
        // Registration succeeded but automatic login failed.
        Alert.alert(
          "Almost there!",
          "Account created successfully. Please sign in with your new credentials."
        );
        router.replace("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign Up</Text>

        {/* First Name */}
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
          editable={!loading}
          autoCapitalize="words"
        />

        {/* Last Name */}
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
          editable={!loading}
          autoCapitalize="words"
        />

        {/* Username */}
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          editable={!loading}
          autoCapitalize="none"
        />

        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
          editable={!loading}
          autoCapitalize="none"
        />

        {/* Password */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            style={styles.passwordInput}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? "eye" : "eye-off"}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        {/* University Search */}
        {uniLoading ? (
          <ActivityIndicator style={{ marginVertical: 20 }} />
        ) : (
          <>
            <TextInput
              placeholder="Select University"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                if (selectedUniversity && text !== selectedUniversity.name) {
                  setSelectedUniversity(null);
                }
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              style={styles.input}
              editable={!loading}
            />

            {showDropdown && (
              <FlatList
                data={filteredUniversities}
                keyExtractor={(item) => item.id}
                style={styles.dropdown}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelect(item)}>
                    <Text style={styles.dropdownItem}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}

        {/* Register Button */}
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
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  passwordContainer: {
    width: "90%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  dropdown: {
    width: "90%",
    maxHeight: 250,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 5,
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
