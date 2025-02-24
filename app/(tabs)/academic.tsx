import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";

const AcademicScreen: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("Fall 2024");
  const [showTermModal, setShowTermModal] = useState<boolean>(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const [showAdvisorModal, setShowAdvisorModal] = useState<boolean>(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Term options
  const termOptions = [
    { key: "Fall 2024", label: "Fall 2024" },
    { key: "Spring 2025", label: "Spring 2025" },
    { key: "Summer 2025", label: "Summer 2025" },
  ];

  // Advisor options
  const advisorOptions = [
    { key: "Academic", name: "Academic Advisor", email: "academic@university.com", phone: "123-456-7890", office: "Building A, Room 101", dropInHours: "Mon-Fri: 10 AM - 2 PM" },
    { key: "Career", name: "Career Advisor", email: "career@university.com", phone: "123-555-7890", office: "Building B, Room 202", dropInHours: "Mon, Wed, Fri: 1 PM - 4 PM" },
    { key: "Financial", name: "Financial Aid Advisor", email: "financial@university.com", phone: "123-777-7890", office: "Building C, Room 303", dropInHours: "Tue, Thu: 9 AM - 12 PM" },
    { key: "International", name: "International Student Advisor", email: "international@university.com", phone: "123-888-7890", office: "Building D, Room 404", dropInHours: "Mon-Fri: 11 AM - 3 PM" }
  ];

  // Appointment time slots
  const timeSlots = ["10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"];

  // Open Advisor Details Modal
  const openAdvisorModal = (advisorKey: string) => {
    setSelectedAdvisor(advisorKey);
    setShowAdvisorModal(true);
  };

  // Close Advisor Details Modal
  const closeAdvisorModal = () => {
    setShowAdvisorModal(false);
    setSelectedAdvisor(null);
  };

  // Open Appointment Modal
  const openAppointmentModal = () => {
    setShowAppointmentModal(true);
  };

  // Close Appointment Modal
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

      {/* Term Selection */}
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowTermModal(true)}>
        <Text style={styles.dropdownText}>{selectedTerm} ▼</Text>
      </TouchableOpacity>

      {/* Modal for selecting term */}
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

// Styles remain the same from previous code

export default AcademicScreen;
