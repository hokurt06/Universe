import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage to handle local storage
import { useRouter } from "expo-router"; // Import useRouter for navigation
import React from "react";

const HomeScreen = () => {
  const router = useRouter(); // Initialize router for navigation

  // Function to handle user logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken"); // Remove the authentication token from storage
    router.replace("/"); // Redirect user to the login screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the Home Screen!</Text> {/* Display welcome message */}
      <Button title="Logout" onPress={handleLogout} color="red" /> {/* Logout button */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Center the content vertically
    alignItems: "center", // Center the content horizontally
    backgroundColor: "#fff", // Set background color to white
  },
  welcomeText: {
    fontSize: 20, // Set font size for welcome text
    fontWeight: "bold", // Make the text bold
    marginBottom: 20, // Add space below the text
  },
});

export default HomeScreen; // Export the HomeScreen component
