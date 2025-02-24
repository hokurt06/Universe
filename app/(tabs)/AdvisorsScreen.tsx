import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";

// We can use a simple date picker here
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

// Advisor data
const AdvisorDetails = [
  { name: "Academic Advisor", email: "academic@university.com", phone: "123-456-7890", office: "Building A, Room 101", hours: "Mon-Fri: 10 AM - 2 PM" },
  { name: "Career Advisor", email: "career@university.com", phone: "123-555-7890", office: "Building B, Room 202", hours: "Mon, Wed, Fri: 1 PM - 4 PM" },
  { name: "Financial Aid Advisor", email: "financial@university.com", phone: "123-777-7890", office: "Building C, Room 303", hours: "Tue, Thu: 9 AM - 12 PM" },
  { name: "International Student Advisor", email: "international@university.com", phone: "123-888-7890", office: "Building D, Room 404", hours: "Mon-Fri: 11 AM - 3 PM" }
];

const AdvisorsScreen: React.FC = () => {
  const [isDatePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("");
  const navigation = useNavigation();

  // Handle date selection
  const handleDateConfirm = (date: Date) => {
    setSelectedDate(moment(date).format("MMMM Do YYYY, h:mm A"));
    setDatePickerVisible(false);
  };

  // Handle button press to open date picker
  const handleSchedulePress = (advisorName: string) => {
    setSelectedAdvisor(advisorName);
    setDatePickerVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Advisors</Text>
      
      {/* Advisor List */}
      <ScrollView style={styles.advisorList}>
        {AdvisorDetails.map((advisor, index) => (
          <View key={index} style={styles.advisorCard}>
            <Text style={styles.advisorName}>{advisor.name}</Text>
            <Text style={styles.advisorDetail}>Email: {advisor.email}</Text>
            <Text style={styles.advisorDetail}>Phone: {advisor.phone}</Text>
            <Text style={styles.advisorDetail}>Office: {advisor.office}</Text>
            <Text style={styles.advisorDetail}>Office Hours: {advisor.hours}</Text>

            {/* Button to Schedule Appointment */}
            <TouchableOpacity 
              style={styles.scheduleButton} 
              onPress={() => handleSchedulePress(advisor.name)}
            >
              <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
      />

      {/* Appointment Confirmation Modal */}
      {selectedDate && selectedAdvisor && (
        <Modal transparent={true} animationType="slide" visible={selectedDate !== ""}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>
                Appointment Scheduled with {selectedAdvisor}
              </Text>
              <Text style={styles.modalBody}>
                Your appointment is scheduled for: {selectedDate}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setSelectedDate("")} 
              >
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
    paddingTop: 50,
  },
  header: {
    fontSize: 26,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 15,
  },
  advisorList: {
    width: "90%",
  },
  advisorCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  advisorName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  advisorDetail: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  scheduleButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
  },
  scheduleButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
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
    borderRadius: 12,
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
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 18,
    fontWeight: "400",
    color: "#333",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AdvisorsScreen;
