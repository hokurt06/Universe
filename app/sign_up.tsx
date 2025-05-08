import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uniLoading, setUniLoading] = useState(true);
  const [loading, setLoading] = useState(false);

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
          const sorted: University[] = json.universities.sort((a: University, b: University) =>
            a.name.localeCompare(b.name)
          );
          setUniversities(sorted);
        } else {
          Alert.alert("Notice", "Could not load universities from the server.");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        Alert.alert("Network Error", "Unable to fetch university list.");
      } finally {
        setUniLoading(false);
      }
    };

    fetchUniversities();
    return () => controller.abort();
  }, []);

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
      Alert.alert("Error", "Please fill in all fields and select a university.");
      return;
    }

    setLoading(true);
    try {
      const regRes = await fetch(
        "https://universe.terabytecomputing.com:3000/api/v1/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

      if (regData?.token) {
        await AsyncStorage.setItem("authToken", regData.token);
        router.replace("/(tabs)/personal");
        return;
      }

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
        Alert.alert("Almost there!", "Account created. Please sign in manually.");
        router.replace("/");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>Fill in your details to get started</Text>

          <View style={styles.formContainer}>
            {[{ label: "First Name", value: firstName, setter: setFirstName },
              { label: "Last Name", value: lastName, setter: setLastName },
              { label: "Username", value: username, setter: setUsername },
              { label: "Email", value: email, setter: setEmail }].map((field, i) => (
              <View key={i}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.label}
                  value={field.value}
                  onChangeText={field.setter}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            ))}

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Ionicons name={passwordVisible ? "eye" : "eye-off"} size={22} color="#86868B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>University</Text>
            {uniLoading ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Search University"
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

            <TouchableOpacity
              style={[styles.signInButton, loading ? styles.buttonDisabled : styles.signInButtonActive]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.signInButtonText}>Register</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Text style={styles.bottomText}>
                Already have an account? <Text style={styles.signUpLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: "#86868B",
    textAlign: "center",
    marginBottom: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 360,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "500",
    color: "#1D1D1F",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    width: "100%",
    height: 44,
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 17,
    color: "#1D1D1F",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingHorizontal: 16,
    height: 44,
  },
  passwordInput: {
    flex: 1,
    fontSize: 17,
    color: "#1D1D1F",
  },
  dropdown: {
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    maxHeight: 200,
    marginTop: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1D1D1F",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  signInButton: {
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  signInButtonActive: {
    backgroundColor: "#0066CC",
  },
  signInButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    backgroundColor: "#0066CC80",
  },
  bottomContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 15,
    color: "#1D1D1F",
  },
  signUpLink: {
    color: "#0066CC",
    fontWeight: "500",
  },
});

export default SignUpScreen;
