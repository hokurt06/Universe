import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "../../hooks/themeStore";

const AcademicScreen: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [terms, setTerms] = useState<{ key: string; label: string }[]>([]);
  const [showTermModal, setShowTermModal] = useState<boolean>(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const { isDarkMode } = useThemeStore();
  const router = useRouter();

  const theme = isDarkMode
    ? {
        background: "#121212",
        text: "#FFFFFF",
        header: "#FFFFFF",
        sectionBackground: "#2C2C2C",
        divider: "#444",
        arrow: "#BBBBBB",
      }
    : {
        background: "#F9F9F9",
        text: "#1C1C1E",
        header: "#1C1C1E",
        sectionBackground: "#FFFFFF",
        divider: "#E5E5EA",
        arrow: "#007AFF",
      };

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const response = await fetch(
            "https://universe.terabytecomputing.com:3000/api/v1/terms",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.terms && Array.isArray(data.terms)) {
            const termOptions = data.terms.map((term: string) => ({
              key: term,
              label: term,
            }));
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

    fetchTerms();
  }, [selectedTerm]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const response = await fetch(
            "https://universe.terabytecomputing.com:3000/api/v1/enrollments",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.enrollments) {
            setCourses(data.enrollments);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const coursesForTerm = courses.filter(
    (enrollment) => enrollment.quarter === selectedTerm
  );

  const openCourse = (course: any) => {
    setSelectedCourse(course);
  };

  const closeCourse = () => {
    setSelectedCourse(null);
  };

  if (selectedCourse) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backIconContainer}
            onPress={closeCourse}
          >
            <Ionicons name="chevron-back" size={28} color={theme.arrow} />
          </TouchableOpacity>

          <Text style={[styles.header, { color: theme.header }]}>Course Details</Text>

          <ScrollView style={[styles.courseDetailContainer, { backgroundColor: theme.sectionBackground }]}>
            <Text style={[styles.detailText, { color: theme.text }]}>
              <Text style={styles.boldText}>Course: </Text>
              {selectedCourse.course.title} ({selectedCourse.course.course_code})
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              <Text style={styles.boldText}>Quarter: </Text>
              {selectedCourse.quarter}
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              <Text style={styles.boldText}>Section: </Text>
              {selectedCourse.section}
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              <Text style={styles.boldText}>Professor: </Text>
              {selectedCourse.professor}
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              <Text style={styles.boldText}>Meeting Time: </Text>
              {selectedCourse.meeting_time}
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              <Text style={styles.boldText}>Grade: </Text>
              {selectedCourse.grade || "N/A"}
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.header, { color: theme.header }]}>Academics</Text>

        <View style={[styles.card, { backgroundColor: theme.sectionBackground }]}>
          <Text style={[styles.gpa, { color: theme.text }]}>
            GPA: <Text style={styles.boldText}>4.00</Text>
          </Text>
          <Text style={[styles.credits, { color: theme.text }]}>
            Total Credits: <Text style={styles.boldText}>20</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.dropdownButton, { backgroundColor: theme.sectionBackground }]}
          onPress={() => setShowTermModal(true)}
        >
          <Text style={[styles.dropdownText, { color: theme.arrow }]}>
            {selectedTerm ? `${selectedTerm} ▼` : "Select Term"}
          </Text>
        </TouchableOpacity>

        <Modal transparent animationType="fade" visible={showTermModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.sectionBackground }]}>
              <Text style={[styles.modalHeader, { color: theme.header }]}>Select Term</Text>
              {terms.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.termOption}
                  onPress={() => {
                    setSelectedTerm(option.label);
                    setShowTermModal(false);
                  }}
                >
                  <Text style={[styles.termOptionText, { color: theme.arrow }]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.arrow }]}
                onPress={() => setShowTermModal(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <ScrollView
          style={styles.classesContainer}
          contentContainerStyle={styles.classesContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {coursesForTerm.length > 0 ? (
            coursesForTerm.map((enrollment, index) => (
              <TouchableOpacity
                key={`${enrollment.enrolled_at}-${index}`}
                style={[styles.classCard, { backgroundColor: theme.sectionBackground }]}
                onPress={() => openCourse(enrollment)}
              >
                <View>
                  <Text style={[styles.classText, { color: theme.text }]}>
                    {enrollment.course.title} ({enrollment.course.course_code})
                  </Text>
                </View>
                <Text style={[styles.grade, { color: theme.arrow }]}>
                  {enrollment.grade || "N/A"}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noCoursesText, { color: theme.text }]}>
              No courses found for {selectedTerm}
            </Text>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.advisorsButton, { backgroundColor: theme.arrow }]}
          onPress={() => router.push("/advisors")}
        >
          <Text style={styles.advisorsButtonText}>View Advisors</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  header: { fontSize: 26, fontWeight: "600", marginBottom: 15 },
  card: {
    width: "90%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  gpa: { fontSize: 22, fontWeight: "500", textAlign: "center" },
  credits: { fontSize: 18, fontWeight: "400", textAlign: "center", marginTop: 5 },
  boldText: { fontWeight: "700" },
  dropdownButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
    marginBottom: 15,
    width: "90%",
  },
  dropdownText: { fontSize: 20, fontWeight: "500" },
  classesContainer: { width: "90%", flexGrow: 0 },
  classesContentContainer: { paddingBottom: 120 },
  classCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  classText: { fontSize: 18, fontWeight: "500" },
  grade: { fontSize: 18, fontWeight: "600" },
  noCoursesText: { fontSize: 18, textAlign: "center", marginTop: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  modalHeader: { fontSize: 22, fontWeight: "600", marginBottom: 15 },
  termOption: { paddingVertical: 12, paddingHorizontal: 15, width: "100%", borderBottomWidth: 1, borderBottomColor: "#eee" },
  termOptionText: { fontSize: 18, textAlign: "center" },
  closeButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, marginTop: 20 },
  closeButtonText: { fontSize: 18, fontWeight: "500", color: "#FFFFFF" },
  advisorsButton: { padding: 12, borderRadius: 30, width: "95%", alignItems: "center", position: "absolute", bottom: 60, left: "5%", zIndex: 10 },
  advisorsButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 18 },
  courseDetailContainer: { width: "90%", padding: 20, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  detailText: { fontSize: 18, marginBottom: 15 },
  backIconContainer: { position: "absolute", top: 20, left: 15, zIndex: 10 },
});

export default AcademicScreen;
