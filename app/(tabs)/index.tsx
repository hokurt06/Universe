import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router"; // Note the import of Stack
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen: React.FC = () => {
  const [email, setemail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem("authToken", data.token);
        router.replace("/home");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* This configuration hides both the header and the tab bar */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/logo1.png")}
          style={styles.logo}
        />
        <TextInput
          style={styles.input}
          placeholder="email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setemail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
        <View style={styles.bottomContainer}>
          <TouchableOpacity>
            <Text style={styles.signUpText}>
              Don't have an account?{" "}
              <Text style={styles.signUpLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  logo: { width: 150, height: 150, borderRadius: 75 },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  signInButton: {
    backgroundColor: "#fff",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  signInButtonText: { color: "#000", fontSize: 18, fontWeight: "bold" },
  linkText: { color: "#007bff", fontSize: 16, marginTop: 10 },
  bottomContainer: { position: "absolute", bottom: 30, alignItems: "center" },
  signUpText: { fontSize: 16, color: "#333" },
  signUpLink: { color: "#ffcc00", fontWeight: "bold" },
});

export default LoginScreen;
