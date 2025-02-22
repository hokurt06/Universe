import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import ModalSelector from "react-native-modal-selector"; // Proper dropdown

const AcademicScreen: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("Fall 2024");

  // Dropdown options
  const termOptions = [
    { key: "Fall 2024", label: "Fall 2024" },
    { key: "Spring 2025", label: "Spring 2025" },
    { key: "Summer 2025", label: "Summer 2025" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Academics</Text>

      {}
      <View style={styles.card}>
        <Text style={styles.gpa}>GPA: <Text style={styles.boldText}>4.00</Text></Text>
        <Text style={styles.credits}>Total Credits: <Text style={styles.boldText}>20</Text></Text>
      </View>

      {/* Dropdown Selector (Now Below GPA & Above Classes) */}
      <View style={styles.dropdownWrapper}>
        <ModalSelector
          data={termOptions}
          initValue={selectedTerm}
          onChange={(option) => setSelectedTerm(option.label)}
          animationType="none" //
          style={styles.dropdown}
          selectTextStyle={styles.dropdownText}
        >
          <TouchableOpacity style={styles.dropdownButton}> 
            <Text style={styles.dropdownText}>{selectedTerm} ▼</Text>
          </TouchableOpacity>
        </ModalSelector>
      </View>

      {/* Class List */}
      <ScrollView style={styles.classesContainer} showsVerticalScrollIndicator={false}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={index} style={styles.classCard}>
            <Text style={styles.classText}>Class {index + 1} </Text>
            <Text style={styles.grade}>A+</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    backgroundColor: "#F9F9F9", 
    paddingTop: 70, 
  },
  header: { 
    fontSize: 26, 
    fontWeight: "600", 
    color: "#1C1C1E", 
    marginBottom: 15,
  },
  card: { // GPA and Total Credits
    backgroundColor: "#FFFFFF",
    width: "90%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  gpa: { 
    fontSize: 22, 
    fontWeight: "500", 
    color: "#333",
    textAlign: "center",
  },
  credits: { 
    fontSize: 18, 
    fontWeight: "400", 
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  boldText: {
    fontWeight: "700",
    color: "#000",
  },
  dropdownWrapper: { // Term Box
    width: "90%",
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  dropdown: { 
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 3,
    alignItems: "center",
  },
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#007AFF",
  },
  classesContainer: { 
    width: "90%", 
    maxHeight: "60%",
  },
  classCard: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  classText: { 
    fontSize: 18, 
    fontWeight: "500",
    color: "#222",
  },
  grade: { 
    fontSize: 18, 
    fontWeight: "600",
    color: "#007AFF",
  },
});

export default AcademicScreen;
