import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

const AdvisorsScreen: React.FC = () => {
  const [isDatePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const navigation = useNavigation();

  // Fetch user's advisors from the API
  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const response = await fetch(
            "https://universe.terabytecomputing.com:3000/api/v1/advisors",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.advisors && Array.isArray(data.advisors)) {
            setAdvisors(data.advisors);
          }
        }
      } catch (error) {
        console.error("Error fetching advisors:", error);
      }
    };

    fetchAdvisors();
  }, []);

  // Handle date selection from the picker
  const handleDateConfirm = (date: Date) => {
    setSelectedDate(moment(date).format("MMMM Do YYYY, h:mm A"));
    setDatePickerVisible(false);
  };

  // Open date picker for the selected advisor
  const handleSchedulePress = (advisor: any) => {
    setSelectedAdvisor(advisor);
    setDatePickerVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Advisors</Text>

      {/* Advisor List */}
      <ScrollView style={styles.advisorList}>
        {advisors.length > 0 ? (
          advisors.map((advisor, index) => (
            <View key={index} style={styles.advisorCard}>
              {/* Display the advisor title */}
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

              {/* Button to Schedule Appointment */}
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => handleSchedulePress(advisor)}
              >
                <Text style={styles.scheduleButtonText}>
                  Schedule Appointment
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noAdvisorsText}>No advisors found.</Text>
        )}
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
  advisorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 3,
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
  noAdvisorsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
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
