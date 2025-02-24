import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useNavigation, NavigationProp } from '@react-navigation/native';
type RootStackParamList = {
  Advisors: undefined;
  // Add other routes here if necessary
};

const AcademicScreen: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("Fall 2024");
  const [showTermModal, setShowTermModal] = useState<boolean>(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Term options
  const termOptions = [
    { key: "Fall 2024", label: "Fall 2024" },
    { key: "Spring 2025", label: "Spring 2025" },
    { key: "Summer 2025", label: "Summer 2025" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Academics</Text>

      <View style={styles.card}>
        <Text style={styles.gpa}>
          GPA: <Text style={styles.boldText}>4.00</Text>
        </Text>
        <Text style={styles.credits}>
          Total Credits: <Text style={styles.boldText}>20</Text>
        </Text>
      </View>

      {/* Term Dropdown Button */}
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowTermModal(true)}>
        <Text style={styles.dropdownText}>{selectedTerm} ▼</Text>
      </TouchableOpacity>

      {/* Term Modal */}
      <Modal transparent animationType="fade" visible={showTermModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Term</Text>
            {termOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.termOption}
                onPress={() => {
                  setSelectedTerm(option.label);
                  setShowTermModal(false);
                }}
              >
                <Text style={styles.termOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowTermModal(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Class List */}
      <ScrollView style={styles.classesContainer} showsVerticalScrollIndicator={false}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={index} style={styles.classCard}>
            <Text style={styles.classText}>Class {index + 1}</Text>
            <Text style={styles.grade}>A+</Text>
          </View>
        ))}
      </ScrollView>

      {/* Button to Navigate to Advisors Screen */}
      <TouchableOpacity style={styles.advisorsButton} onPress={() => navigation.navigate('Advisors')}>
        <Text style={styles.advisorsButtonText}>View Advisors</Text>
      </TouchableOpacity>
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
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
    marginBottom: 15,
    width: "90%",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "80%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 15,
  },
  termOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  termOptionText: {
    fontSize: 18,
    color: "#007AFF",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  advisorsButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  advisorsButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default AcademicScreen;
