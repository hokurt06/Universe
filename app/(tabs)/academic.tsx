import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  Advisors: undefined;
  // Add other routes here if necessary
};

const AcademicScreen: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [terms, setTerms] = useState<{ key: string; label: string }[]>([]);
  const [showTermModal, setShowTermModal] = useState<boolean>(false);
  const [courses, setCourses] = useState<any[]>([]);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Fetch terms from the API
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const response = await fetch("http://localhost:3000/api/v1/terms", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
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

  // Fetch user's enrollments from the API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const response = await fetch(
            "http://localhost:3000/api/v1/enrollments",
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

  // Filter courses based on the selected term (quarter)
  const coursesForTerm = courses.filter(
    (course) => course.quarter === selectedTerm
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Academics</Text>

      <View style={styles.card}>
        <Text style={styles.gpa}>
          GPA: <Text style={styles.boldText}>4.00</Text>
        </Text>
        <Text style={styles.credits}>
          Total Credits: <Text style={styles.boldText}>20</Text>
        </Text>
      </View>

      {/* Term Dropdown Button */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowTermModal(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedTerm ? `${selectedTerm} ▼` : "Select Term"}
        </Text>
      </TouchableOpacity>

      {/* Term Modal */}
      <Modal transparent animationType="fade" visible={showTermModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Term</Text>
            {terms.map((option) => (
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTermModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Class List */}
      <ScrollView
        style={styles.classesContainer}
        showsVerticalScrollIndicator={false}
      >
        {coursesForTerm.length > 0 ? (
          coursesForTerm.map((course) => (
            <View key={course.enrollment_id} style={styles.classCard}>
              <View>
                <Text style={styles.classText}>
                  {course.title} ({course.course_code})
                </Text>
                <Text style={styles.classSubText}></Text>
                <Text style={styles.sectionText}>
                  Section: {course.section_identifier}{" "}
                  {course.class_type ? `(${course.class_type})` : ""}
                </Text>
                <Text style={styles.sectionText}>
                  Meeting Time: {course.meeting_time}
                </Text>
                <Text style={styles.sectionText}>
                  Location: {course.location_address}
                </Text>
                <Text style={styles.sectionText}>
                  Professor:{" "}
                  {course.section_professor || course.offering_professor}
                </Text>
              </View>
              <Text style={styles.grade}>
                {course.grade ? course.grade : "N/A"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noCoursesText}>
            No courses found for {selectedTerm}
          </Text>
        )}
      </ScrollView>

      {/* Button to Navigate to Advisors Screen */}
      <TouchableOpacity
        style={styles.advisorsButton}
        onPress={() => navigation.navigate("Advisors")}
      >
        <Text style={styles.advisorsButtonText}>View Advisors</Text>
      </TouchableOpacity>
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
  card: {
    backgroundColor: "#FFFFFF",
    width: "90%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  gpa: {
    fontSize: 22,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  credits: {
    fontSize: 18,
    fontWeight: "400",
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  boldText: {
    fontWeight: "700",
    color: "#000",
  },
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
    marginBottom: 15,
    width: "90%",
  },
  dropdownText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#007AFF",
  },
  classesContainer: {
    width: "90%",
    maxHeight: "60%",
  },
  classCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  classSubText: {
    fontSize: 14,
    color: "#666",
  },
  sectionText: {
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },
  grade: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  noCoursesText: {
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
  termOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  termOptionText: {
    fontSize: 18,
    color: "#007AFF",
    textAlign: "center",
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
  advisorsButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  advisorsButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default AcademicScreen;
