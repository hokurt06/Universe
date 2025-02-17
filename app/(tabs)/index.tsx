import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';  // ✅ Import useRouter

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter(); // ✅ Initialize router

  const handleSignIn = () => {
    console.log("Sign In Pressed!");  // ✅ Debugging log
    router.replace('/home');  // ✅ Correct Expo Router navigation
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/images/logo1.png')} style={styles.logo} />

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Sign In Button - Navigate to Home Tab */}
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <TouchableOpacity>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity>
          <Text style={styles.signUpText}>Don't have an account? <Text style={styles.signUpLink}>Sign up</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  logo: { width: 150, height: 150, borderRadius: 75 },
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
  signInButton: { backgroundColor: '#fff', width: '100%', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#000' },
  signInButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#007bff', fontSize: 16, marginTop: 10 },
  bottomContainer: { position: 'absolute', bottom: 30, alignItems: 'center' },
  signUpText: { fontSize: 16, color: '#333' },
  signUpLink: { color: '#ffcc00', fontWeight: 'bold' },
});

export default LoginScreen;
