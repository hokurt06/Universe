import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeStore } from "../../hooks/themeStore";

const SegmentedControl: React.FC<{
  options: { key: string; label: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}> = ({ options, selectedValue, onValueChange }) => {
  const { isDarkMode } = useThemeStore();
  return (
    <View style={[styles.segmentedControlContainer, isDarkMode && { backgroundColor: "#2C2C2E" }]}> 
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[styles.segmentButton, selectedValue === option.key && { backgroundColor: isDarkMode ? "#3A3A3C" : "#FFFFFF" }]}
          onPress={() => onValueChange(option.key)}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.segmentButtonText, selectedValue === option.key && { color: isDarkMode ? "#FFFFFF" : "#1D1D1F" }, selectedValue !== option.key && { color: isDarkMode ? "#D3D3D3" : "#8E8E93" }]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CourseSchedule: React.FC = () => {
  const [viewMode, setViewMode] = useState<"schedule" | "exams">("schedule");
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [terms, setTerms] = useState<{ key: string; label: string }[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [showTermDropdown, setShowTermDropdown] = useState(false);
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();

  const theme = isDarkMode
    ? {
        background: "#121212",
        text: "#FFFFFF",
        card: "#2C2C2E",
        divider: "#333",
        segmentBackground: "#2C2C2E",
        segmentText: "#D3D3D3",
        segmentActiveBackground: "#3A3A3C",
        segmentActiveText: "#FFFFFF",
        avatarBackground: "#0A84FF",
        modalOverlay: "rgba(28,28,30,0.9)",
      }
    : {
        background: "#FFFFFF",
        text: "#1D1D1F",
        card: "#F5F5F7",
        divider: "#E5E5EA",
        segmentBackground: "#F5F5F7",
        segmentText: "#8E8E93",
        segmentActiveBackground: "#FFFFFF",
        segmentActiveText: "#1D1D1F",
        avatarBackground: "#0066CC",
        modalOverlay: "rgba(0,0,0,0.4)",
      };

  const fetchTerms = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const response = await fetch("https://universe.terabytecomputing.com:3000/api/v1/terms", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.terms && Array.isArray(data.terms)) {
          const termOptions = data.terms.map((term: string) => ({ key: term, label: term }));
          setTerms(termOptions);
          if (!selectedTerm && termOptions.length > 0) {
            setSelectedTerm(termOptions[0].label);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const response = await fetch("https://universe.terabytecomputing.com:3000/api/v1/enrollments", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.enrollments) {
          setCourses(data.enrollments);
        }
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, [selectedTerm]);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const coursesForTerm = courses.filter((enrollment) => enrollment.quarter === selectedTerm);

  const openModal = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setShowModal(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      setSelectedEnrollment(null);
    });
  };

  const renderCourseItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.classCard, { backgroundColor: theme.card }]}
      onPress={() => openModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}>{item.course.title}</Text>
        <Text style={{ color: theme.segmentText }}>{item.course.course_code}</Text>
        <Text style={{ color: theme.segmentText }}>Section: {item.section}</Text>
        <Text style={{ color: theme.segmentText }}>Time: {item.meeting_time}</Text>
        <Text style={{ color: theme.segmentText }}>Professor: {item.professor}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderModalContent = () => {
    const translateY = modalAnimation.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });
    return (
      <Modal transparent animationType="none" visible={showModal}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <Animated.View style={[styles.modalContent, { backgroundColor: theme.card, transform: [{ translateY }] }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderText, { color: theme.text }]}>Class Information</Text>
              <TouchableOpacity onPress={closeModal}><Text style={{ color: theme.avatarBackground }}>Done</Text></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}>{selectedEnrollment?.course.title}</Text>
              <Text style={{ color: theme.segmentText }}>{selectedEnrollment?.course.course_code}</Text>
              <Text style={{ color: theme.segmentText }}>Section: {selectedEnrollment?.section}</Text>
              <Text style={{ color: theme.segmentText }}>Time: {selectedEnrollment?.meeting_time}</Text>
              <Text style={{ color: theme.segmentText }}>Professor: {selectedEnrollment?.professor}</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.headerContainer, { backgroundColor: theme.background, borderBottomColor: theme.divider }]}> 
        <Text style={[styles.header, { color: theme.text }]}> 
          {viewMode === "schedule" ? "Course Schedule" : "Exam Schedule"}
        </Text>
        <TouchableOpacity
          style={[styles.termSelector, { backgroundColor: theme.segmentBackground, borderColor: theme.divider }]}
          onPress={() => setShowTermDropdown(!showTermDropdown)}
          activeOpacity={0.7}
        >
          <Text style={[styles.termSelectorText, { color: theme.text }]}>{selectedTerm || "Select Term"}</Text>
          <Text style={[styles.termSelectorIcon, { color: theme.segmentText }]}>▼</Text>
        </TouchableOpacity>
        {showTermDropdown && (
          <View style={[styles.termDropdown, { backgroundColor: theme.card, borderColor: theme.divider }]}> 
            <FlatList
              data={terms}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.termItem}
                  onPress={() => setSelectedTerm(item.label)}
                >
                  <Text
                    style={[styles.termItemText,
                      { color: selectedTerm === item.label ? theme.avatarBackground : theme.text }
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.key}
            />
          </View>
        )}
        <SegmentedControl
          options={[{ key: "schedule", label: "Schedule" }, { key: "exams", label: "Exams" }]}
          selectedValue={viewMode}
          onValueChange={(value) => setViewMode(value as "schedule" | "exams")}
        />
      </View>
      <FlatList
        data={coursesForTerm}
        renderItem={renderCourseItem}
        keyExtractor={(item, index) => `${item.enrolled_at}-${index}`}
        contentContainerStyle={styles.listContent}
      />
      {showModal && renderModalContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: 1 },
  header: { fontSize: 30, fontWeight: "600", marginBottom: 15 },
  segmentedControlContainer: { flexDirection: "row", borderRadius: 8, marginVertical: 10, padding: 2 },
  segmentButton: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  segmentButtonText: { fontSize: 15, fontWeight: "500" },
  termSelector: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, marginBottom: 10, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15 },
  termSelectorText: { fontSize: 16, fontWeight: "500" },
  termSelectorIcon: { fontSize: 12 },
  termDropdown: { position: "absolute", top: 110, left: 20, right: 20, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 5, zIndex: 2, borderWidth: 1, maxHeight: 200 },
  termItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1 },
  termItemText: { fontSize: 16},
  classCard: { marginVertical: 8, borderRadius: 12, overflow: "hidden" },
  cardContent: { padding: 16 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: Platform.OS === "ios" ? 30 : 20, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 16 },
  modalHeaderText: { fontSize: 18, fontWeight: "600" },
  modalBody: { padding: 16 },
  listContent: { padding: 16 },
});

export default CourseSchedule;