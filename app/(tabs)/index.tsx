import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  return (
    <View style={styles.container}>
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

      {/* Sign In Button */}
      <TouchableOpacity style={styles.signInButton} onPress={() => console.log('Sign In Pressed')}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <TouchableOpacity>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  signInButton: {
    backgroundColor: '#007bff',  // Blue for Sign In
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    marginVertical: 5,
  },
});

export default LoginScreen;
