import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CourseSchedule: React.FC = () => {
  const [viewMode, setViewMode] = useState<"schedule" | "exams">("schedule");
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [terms, setTerms] = useState<{ key: string; label: string }[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const viewOptions = [
    { key: "schedule", label: "Schedule" },
    { key: "exams", label: "Exams" },
  ];

  // Fetch terms from the API
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

  // Fetch user's enrollments (schedule data) from the API
  useEffect(() => {
    const fetchEnrollments = async () => {
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
        console.error("Error fetching enrollments:", error);
      }
    };

    fetchEnrollments();
  }, []);

  // Filter enrollments for the selected term.
  const coursesForTerm = courses.filter(
    (enrollment) => enrollment.quarter === selectedTerm
  );

  // Open the modal by passing the entire enrollment object
  const openModal = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEnrollment(null);
  };

  const renderDropdownItem = ({
    item,
  }: {
    item: { key: string; label: string };
  }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setViewMode(item.key as "schedule" | "exams");
        setShowDropdown(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Dropdown Button */}
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={styles.dropdownButtonText}>
            {viewMode === "schedule" ? "Schedule" : "Exams"}
          </Text>
        </TouchableOpacity>
        {showDropdown && (
          <View style={styles.dropdownOverlay}>
            <FlatList
              data={viewOptions}
              renderItem={renderDropdownItem}
              keyExtractor={(item) => item.key}
            />
          </View>
        )}
      </View>

      {/* Main Content (Hidden when dropdown is open) */}
      {!showDropdown && (
        <>
          <Text style={styles.header}>
            {viewMode === "schedule" ? "Course Schedule" : "Exam Schedule"}
          </Text>
          <Text style={styles.subHeader}>
            Term: {selectedTerm || "Loading..."}
          </Text>

          {/* Schedule View */}
          {viewMode === "schedule" && (
            <ScrollView
              style={styles.classesContainer}
              showsVerticalScrollIndicator={false}
            >
              {coursesForTerm.length > 0 ? (
                coursesForTerm.map((enrollment, index) => (
                  <TouchableOpacity
                    key={`${enrollment.enrolled_at}-${index}`}
                    style={styles.classCard}
                    onPress={() => openModal(enrollment)}
                  >
                    <Text style={styles.classText}>
                      {enrollment.course.title} ({enrollment.course.course_code}
                      )
                    </Text>
                    <Text style={styles.timeText}>
                      Section: {enrollment.section}
                    </Text>
                    <Text style={styles.timeText}>
                      Time: {enrollment.meeting_time}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noCoursesText}>
                  No courses found for {selectedTerm}
                </Text>
              )}
            </ScrollView>
          )}

          {/* Exams View */}
          {viewMode === "exams" && (
            <ScrollView
              style={styles.examsContainer}
              showsVerticalScrollIndicator={false}
            >
              {[
                {
                  id: 1,
                  subject: "Calculus I (MATH 101)",
                  midterm: "March 15, 2025, 10:00 AM - 12:00 PM",
                  final: "April 25, 2025, 2:00 PM - 4:00 PM",
                },
                {
                  id: 2,
                  subject: "Introduction to Physics (PHYS 101)",
                  midterm: "March 17, 2025, 1:00 PM - 3:00 PM",
                  final: "April 27, 2025, 9:00 AM - 11:00 AM",
                },
                {
                  id: 3,
                  subject: "Computer Science Fundamentals (CS 101)",
                  midterm: "March 20, 2025, 11:00 AM - 1:00 PM",
                  final: "April 28, 2025, 3:00 PM - 5:00 PM",
                },
              ].map((exam) => (
                <View key={exam.id} style={styles.examCard}>
                  <Text style={styles.examCourseText}>{exam.subject}</Text>
                  <Text style={styles.examText}>Midterm: {exam.midterm}</Text>
                  <Text style={styles.examText}>Final: {exam.final}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* Modal for Class Details */}
      {showModal && selectedEnrollment && (
        <Modal transparent animationType="fade" visible={showModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Class Information</Text>
              <Text style={styles.modalText}>
                Course:{" "}
                <Text style={styles.boldText}>
                  {selectedEnrollment.course.title} (
                  {selectedEnrollment.course.course_code})
                </Text>
              </Text>
              <Text style={styles.modalText}>
                Section:{" "}
                <Text style={styles.boldText}>
                  {selectedEnrollment.section}
                </Text>
              </Text>
              <Text style={styles.modalText}>
                Meeting Time:{" "}
                <Text style={styles.boldText}>
                  {selectedEnrollment.meeting_time}
                </Text>
              </Text>
              <Text style={styles.modalText}>
                Professor:{" "}
                <Text style={styles.boldText}>
                  {selectedEnrollment.professor}
                </Text>
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
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
    backgroundColor: "#F9F9F9",
    paddingTop: 60,
  },
  dropdownContainer: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 20,
    zIndex: 10, // Ensure dropdown stays on top
  },
  dropdownButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  dropdownButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownOverlay: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    elevation: 5,
    position: "absolute",
    top: 45,
    width: "100%",
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownItemText: {
    fontSize: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 15,
    color: "#666",
  },
  classesContainer: {
    paddingHorizontal: 20,
  },
  classCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  classText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  noCoursesText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  examsContainer: {
    paddingHorizontal: 20,
  },
  examCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  examCourseText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  examText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CourseSchedule;
