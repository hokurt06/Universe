import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";

const AdvisorScreen: React.FC = () => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const [showAdvisorModal, setShowAdvisorModal] = useState<boolean>(false);

  // Advisor options
  const advisorOptions = [
    { key: "Academic", name: "Academic Advisor", email: "academic@university.com", phone: "123-456-7890", office: "Building A, Room 101" },
    { key: "Career", name: "Career Advisor", email: "career@university.com", phone: "123-555-7890", office: "Building B, Room 202" },
    { key: "Financial", name: "Financial Aid Advisor", email: "financial@university.com", phone: "123-777-7890", office: "Building C, Room 303" },
    { key: "International", name: "International Student Advisor", email: "international@university.com", phone: "123-888-7890", office: "Building D, Room 404" }
  ];

  const openModal = (advisor: string) => {
    setSelectedAdvisor(advisor);
    setShowAdvisorModal(true);
  };

  const closeModal = () => {
    setShowAdvisorModal(false);
    setSelectedAdvisor(null);
  };

  const selectedAdvisorDetails = advisorOptions.find(advisor => advisor.key === selectedAdvisor);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Advisors</Text>

      {/* Advisor List */}
      <ScrollView style={styles.classesContainer} showsVerticalScrollIndicator={false}>
        {advisorOptions.map(advisor => (
          <TouchableOpacity
            key={advisor.key}
            style={styles.classCard}
            onPress={() => openModal(advisor.key)}
          >
            <Text style={styles.classText}>{advisor.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showAdvisorModal && selectedAdvisorDetails && (
        <Modal transparent animationType="fade" visible={showAdvisorModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>{selectedAdvisorDetails.name} Information</Text>
              <Text style={styles.modalText}>
                Email: <Text style={styles.boldText}>{selectedAdvisorDetails.email}</Text>
              </Text>
              <Text style={styles.modalText}>
                Phone: <Text style={styles.boldText}>{selectedAdvisorDetails.phone}</Text>
              </Text>
              <Text style={styles.modalText}>
                Office: <Text style={styles.boldText}>{selectedAdvisorDetails.office}</Text>
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  classesContainer: { 
    width: "90%", 
    maxHeight: "60%",
  },
  classCard: { 
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
  modalText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
  },
  boldText: {
    fontWeight: "700",
    color: "#000",
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
});

export default AdvisorScreen;
