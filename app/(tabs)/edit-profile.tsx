import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Button, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  StatusBar 
} from "react-native";

const EditProfileScreen = () => {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    universityId: "U123456789",
    pronouns: "They/Them",
    bio: "Computer Science student passionate about mobile app development and AI. Looking to connect with like-minded students for study groups and projects.",
    gender: "Non-binary",
    major: "Computer Science",  // Pre-filled and not editable
    birthday: "05/12/1998",
    contactInfo: "alex.j@university.edu"
  });

  const handleChange = (field: keyof typeof profile, value: string) => {
    // Don't allow changes to major field
    if (field === "major") return;
    
    setProfile(prevProfile => ({
      ...prevProfile,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically send this data to your backend
    console.log("Profile data to save:", profile);
    Alert.alert(
      "Profile Updated",
      "Your profile information has been saved successfully.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text) => handleChange("name", text)}
          placeholder="Enter your name"
          placeholderTextColor="#90caf9"
        />

        <Text style={styles.label}>University ID:</Text>
        <TextInput
          style={styles.input}
          value={profile.universityId}
          onChangeText={(text) => handleChange("universityId", text)}
          placeholder="Enter your university ID"
          placeholderTextColor="#90caf9"
        />

        <Text style={styles.label}>Pronouns:</Text>
        <TextInput
          style={styles.input}
          value={profile.pronouns}
          onChangeText={(text) => handleChange("pronouns", text)}
          placeholder="Enter your pronouns"
          placeholderTextColor="#90caf9"
        />

        <Text style={styles.label}>Bio:</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={profile.bio}
          onChangeText={(text) => handleChange("bio", text)}
          placeholder="Write a short bio about yourself"
          placeholderTextColor="#90caf9"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Gender:</Text>
        <TextInput
          style={styles.input}
          value={profile.gender}
          onChangeText={(text) => handleChange("gender", text)}
          placeholder="Enter your gender"
          placeholderTextColor="#90caf9"
        />

        <Text style={styles.label}>Major:</Text>
        <View style={styles.readOnlyContainer}>
          <Text style={styles.readOnlyText}>{profile.major}</Text>
          <Text style={styles.readOnlyNote}>(Cannot be changed)</Text>
        </View>

        <Text style={styles.label}>Birthday:</Text>
        <TextInput
          style={styles.input}
          value={profile.birthday}
          onChangeText={(text) => handleChange("birthday", text)}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="#90caf9"
        />

        <Text style={styles.label}>Contact Info:</Text>
        <TextInput
          style={styles.input}
          value={profile.contactInfo}
          onChangeText={(text) => handleChange("contactInfo", text)}
          placeholder="Enter your contact information"
          placeholderTextColor="#90caf9"
        />

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e88e5",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    color: "#1e88e5",
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#64b5f6",
    borderRadius: 25,
    padding: 15,
    height: 50,
    backgroundColor: "#fff",
    shadowColor: "#1e88e5",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 15,
    borderRadius: 20,
  },
  readOnlyContainer: {
    borderWidth: 1,
    borderColor: "#90caf9",
    borderRadius: 25,
    padding: 15,
    height: 50,
    backgroundColor: "#e3f2fd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#1e88e5",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  readOnlyText: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "500",
  },
  readOnlyNote: {
    fontSize: 12,
    color: "#42a5f5",
    fontStyle: "italic",
  },
  saveButton: {
    backgroundColor: "#1e88e5",
    padding: 15,
    borderRadius: 25,
    marginTop: 30,
    alignItems: "center",
    shadowColor: "#1565c0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  }
});

export default EditProfileScreen;