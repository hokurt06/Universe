import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

const AdvisorsScreen: React.FC = () => {
  const [isDatePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);
  const router = useRouter();

  // Hardcoded 
  const advisors = [
    {
      title: "Financial Advisor",
      name: "Jane Smith",
      phone_number: "(555) 123-4567",
      office_address: "Room 101, Finance Bldg",
      office_hours: "Mon-Fri, 9 AM - 5 PM",
    },
    {
      title: "International Advisor",
      name: "Carlos Rivera",
      phone_number: "(555) 987-6543",
      office_address: "Room 202, Global Center",
      office_hours: "Tue-Thu, 10 AM - 4 PM",
    },
    {
      title: "Academic Advisor",
      name: "Emily Johnson",
      phone_number: "(555) 456-7890",
      office_address: "Room 305, Academic Hall",
      office_hours: "Mon-Wed, 8 AM - 3 PM",
    },
  ];

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(moment(date).format("MMMM Do YYYY, h:mm A"));
    setDatePickerVisible(false);
  };

  const handleSchedulePress = (advisor: any) => {
    setSelectedAdvisor(advisor);
    setDatePickerVisible(true);
  };

  const handleBackToAcademics = () => {
    router.back(); // Navigate back to the previous screen (AcademicScreen)
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Advisors</Text>
        <ScrollView
          style={styles.advisorList}
          contentContainerStyle={styles.advisorListContent}
        >
          {advisors.map((advisor, index) => (
            <View key={index} style={styles.advisorCard}>
              <Text style={styles.advisorTitle}>{advisor.title}</Text>
              <Text style={styles.advisorName}>{advisor.name}</Text>
              <Text style={styles.advisorDetail}>
                Phone: {advisor.phone_number}
              </Text>
              <Text style={styles.advisorDetail}>
                Office: {advisor.office_address}
              </Text>
              <Text style={styles.advisorDetail}>
                Office Hours: {advisor.office_hours}
              </Text>
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => handleSchedulePress(advisor)}
              >
                <Text style={styles.scheduleButtonText}>
                  Schedule Appointment
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Back to Academics Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToAcademics}
        >
          <Text style={styles.backButtonText}>Back to Academics</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
        />
        {selectedDate && selectedAdvisor && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={selectedDate !== ""}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>
                  Appointment Scheduled with {selectedAdvisor.name}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
    marginBottom: 20,
  },
  advisorList: {
    flex: 1,
  },
  advisorListContent: {
    paddingBottom: 80, // Increased to ensure space for the back button
  },
  advisorCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  advisorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  advisorName: {
    fontSize: 18,
    color: "#222",
    textAlign: "center",
    marginBottom: 12,
  },
  advisorDetail: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 6,
  },
  scheduleButton: {
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#007BFF",
    borderRadius: 20,
    alignSelf: "center",
  },
  scheduleButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  backButton: {
    position: "absolute",
    bottom: 20,
    left: "5%",
    width: "90%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#007BFF",
    borderRadius: 20,
    alignItems: "center",
    zIndex: 10,
  },
  backButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 12,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 18,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#007BFF",
    borderRadius: 20,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default AdvisorsScreen;