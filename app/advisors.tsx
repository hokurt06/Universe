import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

const AdvisorsScreen: React.FC = () => {
  const [isDatePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const router = useRouter();

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

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(moment(date).format("MMMM Do YYYY, h:mm A"));
    setDatePickerVisible(false);
  };

  const handleSchedulePress = (advisor: any) => {
    setSelectedAdvisor(advisor);
    setDatePickerVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Advisors</Text>
      <ScrollView style={styles.advisorList}>
        {advisors.length > 0 ? (
          advisors.map((advisor, index) => (
            <View key={index} style={styles.advisorCard}>
              <Text style={styles.advisorTitle}>{advisor.title}</Text>
              <Text style={styles.advisorName}>{advisor.name}</Text>
              <Text style={styles.advisorDetail}>Phone: {advisor.phone_number}</Text>
              <Text style={styles.advisorDetail}>Office: {advisor.office_address}</Text>
              <Text style={styles.advisorDetail}>Office Hours: {advisor.office_hours}</Text>
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => handleSchedulePress(advisor)}
              >
                <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noAdvisorsText}>No advisors found.</Text>
        )}
      </ScrollView>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
      />
      {selectedDate && selectedAdvisor && (
        <Modal transparent={true} animationType="slide" visible={selectedDate !== ""}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Appointment Scheduled with {selectedAdvisor.name}</Text>
              <Text style={styles.modalBody}>Your appointment is scheduled for: {selectedDate}</Text>
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
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center", // Ensure visibility
  },
  advisorList: {
    flex: 1,
  },
  advisorCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  advisorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center", // Center advisor title for visibility
  },
  advisorName: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center", // Center name
  },
  advisorDetail: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center", // Center details for better readability
  },
  scheduleButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 4,
  },
  scheduleButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  noAdvisorsText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 16,
    marginBottom: 16,
  },
  closeButton: {
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 4,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default AdvisorsScreen;
