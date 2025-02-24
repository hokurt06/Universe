import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";

const AcademicScreen: React.FC = () => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const [showAdvisorModal, setShowAdvisorModal] = useState<boolean>(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const advisorOptions = [
    { key: "Academic", name: "Academic Advisor", email: "academic@university.com", phone: "123-456-7890", office: "Building A, Room 101", dropInHours: "Mon-Fri: 10 AM - 2 PM" },
    { key: "Career", name: "Career Advisor", email: "career@university.com", phone: "123-555-7890", office: "Building B, Room 202", dropInHours: "Mon, Wed, Fri: 1 PM - 4 PM" },
    { key: "Financial", name: "Financial Aid Advisor", email: "financial@university.com", phone: "123-777-7890", office: "Building C, Room 303", dropInHours: "Tue, Thu: 9 AM - 12 PM" },
    { key: "International", name: "International Student Advisor", email: "international@university.com", phone: "123-888-7890", office: "Building D, Room 404", dropInHours: "Mon-Fri: 11 AM - 3 PM" }
  ];

  const timeSlots = ["10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"];

  const openAdvisorModal = (advisorKey: string) => {
    setSelectedAdvisor(advisorKey);
    setShowAdvisorModal(true);
  };

  const closeAdvisorModal = () => {
    setShowAdvisorModal(false);
    setSelectedAdvisor(null);
  };

  const openAppointmentModal = () => {
    setShowAppointmentModal(true);
  };

  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedTimeSlot(null);
  };

  const selectedAdvisorDetails = advisorOptions.find((advisor) => advisor.key === selectedAdvisor);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Academics</Text>

      {/* GPA & Total Credits */}
      <View style={styles.card}>
        <Text style={styles.gpa}>
          GPA: <Text style={styles.boldText}>4.00</Text>
        </Text>
        <Text style={styles.credits}>
          Total Credits: <Text style={styles.boldText}>20</Text>
        </Text>
      </View>

      {/* Advisors Section */}
      <Text style={styles.subHeader}>Advisors</Text>
      <ScrollView style={styles.classesContainer} showsVerticalScrollIndicator={false}>
        {advisorOptions.map((advisor) => (
          <TouchableOpacity key={advisor.key} style={styles.classCard} onPress={() => openAdvisorModal(advisor.key)}>
            <Text style={styles.classText}>{advisor.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Advisor Details Modal */}
      {showAdvisorModal && selectedAdvisorDetails && (
        <Modal transparent animationType="fade" visible={showAdvisorModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>{selectedAdvisorDetails.name}</Text>
              <Text style={styles.modalText}>Email: {selectedAdvisorDetails.email}</Text>
              <Text style={styles.modalText}>Phone: {selectedAdvisorDetails.phone}</Text>
              <Text style={styles.modalText}>Office: {selectedAdvisorDetails.office}</Text>
              <Text style={styles.modalText}>Drop-in Hours: {selectedAdvisorDetails.dropInHours}</Text>
              <TouchableOpacity style={styles.scheduleButton} onPress={openAppointmentModal}>
                <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={closeAdvisorModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Appointment Scheduling Modal */}
      {showAppointmentModal && (
        <Modal transparent animationType="fade" visible={showAppointmentModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Select a Time Slot</Text>
              {timeSlots.map((slot) => (
                <TouchableOpacity key={slot} style={styles.termOption} onPress={() => setSelectedTimeSlot(slot)}>
                  <Text style={styles.termOptionText}>{slot}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.closeButton} onPress={closeAppointmentModal}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  subHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  classesContainer: { marginBottom: 20 },
  card: { padding: 10, marginVertical: 5, backgroundColor: "#e0e0e0", borderRadius: 8 },
  classCard: { padding: 10, marginVertical: 5, backgroundColor: "#f0f0f0", borderRadius: 8 },
  classText: { fontSize: 18 },
  gpa: { fontSize: 18, fontWeight: "bold" },
  credits: { fontSize: 18, marginTop: 8 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 8, width: 300 },
  modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 8 },
  scheduleButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 8, marginTop: 10 },
  scheduleButtonText: { color: "white", textAlign: "center" },
  closeButton: { backgroundColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 10 },
  closeButtonText: { color: "white", textAlign: "center" },
  termOption: { padding: 10 },
  termOptionText: { fontSize: 16 },
  boldText: { fontWeight: "bold" },
});

export default AcademicScreen;