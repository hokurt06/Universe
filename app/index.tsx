import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../components/Logo";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  const TEST_MODE = false; // "True" for bypass.

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (TEST_MODE) {
      router.replace("/(tabs)/personal"); // <<< BYPASS added here
    }
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Sign In Failed", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "https://universe.terabytecomputing.com:3000/api/v1/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem("authToken", data.token);
        router.replace("/(tabs)/personal");
      } else {
        Alert.alert("Sign In Failed", data.message || "Your email or password was incorrect. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "We couldn't establish a connection. Please check your internet and try again.");
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
        <Animated.View 
          style={[
            styles.contentContainer, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.logoContainer}>
            <Logo />
          </View>
          
          <Text style={styles.welcomeText}>Sign in</Text>
          <Text style={styles.subtitleText}>Enter your account details below</Text>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#C7C7CC"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              selectionColor="#0066CC"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor="#C7C7CC"
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              selectionColor="#0066CC"
            />

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.signInButton, 
                (email.length > 0 && password.length > 0) ? styles.signInButtonActive : styles.signInButtonInactive,
                loading && styles.signInButtonLoading
              ]}
              onPress={handleSignIn}
              disabled={loading || !email || !password}
            >
              <Text style={[
                styles.signInButtonText, 
                (email.length > 0 && password.length > 0) ? styles.signInButtonTextActive : styles.signInButtonTextInactive
              ]}>
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={() => router.push("/sign_up")}>
            <Text style={styles.signUpText}>
              Don't have an account? <Text style={styles.signUpLink}>Create yours now</Text>
            </Text>
          </TouchableOpacity>
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
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 17,
    color: "#86868B",
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: -0.2,
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: "#0066CC",
    fontSize: 15,
    fontWeight: "500",
  },
  signInButton: {
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  signInButtonActive: {
    backgroundColor: "#0066CC",
  },
  signInButtonInactive: {
    backgroundColor: "#F5F5F7",
  },
  signInButtonLoading: {
    backgroundColor: "#0066CC80",
  },
  signInButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  signInButtonTextActive: {
    color: "#FFFFFF",
  },
  signInButtonTextInactive: {
    color: "#86868B",
  },
  bottomContainer: {
    paddingVertical: 20,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
  },
  signUpText: {
    fontSize: 15,
    color: "#1D1D1F",
  },
  signUpLink: {
    color: "#0066CC",
    fontWeight: "500",
  },
});

export default LoginScreen;
