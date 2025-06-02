import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { useRouter } from "expo-router";
import { useThemeStore } from "../hooks/themeStore";

const AdvisorsScreen: React.FC = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);
  const router = useRouter();
  const { isDarkMode } = useThemeStore();

  const theme = isDarkMode
    ? {
        background: "#121212",
        text: "#FFFFFF",
        card: "#2C2C2E",
        buttonBackground: "#0A84FF",
        modalOverlay: "rgba(28,28,30,0.9)",
      }
    : {
        background: "#F9F9F9",
        text: "#1C1C1E",
        card: "#FFFFFF",
        buttonBackground: "#007BFF",
        modalOverlay: "rgba(0,0,0,0.5)",
      };

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

  const handleSchedulePress = (advisor: any) => {
    setSelectedAdvisor(advisor);
    setTempDate(new Date());
    setShowPicker(true);
  };

  const handleConfirm = () => {
    setSelectedDate(tempDate);
    setShowPicker(false);
  };

  const handleBackToAcademics = () => {
    router.replace("/(tabs)/academic");
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.header, { color: theme.text }]}>Advisors</Text>
        <ScrollView style={styles.advisorList} contentContainerStyle={styles.advisorListContent}>
          {advisors.map((advisor, index) => (
            <View key={index} style={[styles.advisorCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.advisorTitle, { color: theme.text }]}>{advisor.title}</Text>
              <Text style={[styles.advisorName, { color: theme.text }]}>{advisor.name}</Text>
              <Text style={[styles.advisorDetail, { color: theme.text }]}>
                Phone: {advisor.phone_number}
              </Text>
              <Text style={[styles.advisorDetail, { color: theme.text }]}>
                Office: {advisor.office_address}
              </Text>
              <Text style={[styles.advisorDetail, { color: theme.text }]}>
                Office Hours: {advisor.office_hours}
              </Text>
              <TouchableOpacity
                style={[styles.scheduleButton, { backgroundColor: theme.buttonBackground }]}
                onPress={() => handleSchedulePress(advisor)}
              >
                <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.buttonBackground }]}
          onPress={handleBackToAcademics}
        >
          <Text style={styles.backButtonText}>Back to Academics</Text>
        </TouchableOpacity>

        <Modal transparent animationType="fade" visible={showPicker}>
          <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalHeader, { color: theme.text }]}>Select Appointment Time</Text>
              {Platform.OS === "ios" && (
                <DateTimePicker
                  value={tempDate}
                  mode="datetime"
                  display="spinner"
                  onChange={(event, date) => date && setTempDate(date)}
                  textColor={theme.text}
                  themeVariant={isDarkMode ? "dark" : "light"}
                />
              )}
              {Platform.OS === "android" && (
                <DateTimePicker
                  value={tempDate}
                  mode="datetime"
                  display="default"
                  onChange={(event, date) => {
                    if (event.type === "set" && date) {
                      setTempDate(date);
                      handleConfirm();
                    } else {
                      setShowPicker(false);
                    }
                  }}
                />
              )}
              {Platform.OS === "ios" && (
                <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                  <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: "#000" }]}
                    onPress={() => setShowPicker(false)}
                  >
                    <Text style={styles.closeButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: theme.buttonBackground }]}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.closeButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {selectedDate && selectedAdvisor && (
          <Modal transparent animationType="slide" visible={!!selectedDate}>
            <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <Text style={[styles.modalHeader, { color: theme.text }]}>
                  Appointment Scheduled with {selectedAdvisor.name}
                </Text>
                <Text style={[styles.modalBody, { color: theme.text }]}>
                  Your appointment is scheduled for:{" "}
                  {moment(selectedDate).format("MMMM Do YYYY, h:mm A")}
                </Text>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: theme.buttonBackground }]}
                  onPress={() => setSelectedDate(null)}
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
  safeContainer: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  advisorList: { flex: 1 },
  advisorListContent: { paddingBottom: 80 },
  advisorCard: {
    padding: 20,
    marginBottom: 16,
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
    textAlign: "center",
    marginBottom: 4,
  },
  advisorName: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 12,
  },
  advisorDetail: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 6,
  },
  scheduleButton: {
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
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
  },
  modalContent: {
    width: "85%",
    padding: 20,
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
    marginBottom: 12,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default AdvisorsScreen;
