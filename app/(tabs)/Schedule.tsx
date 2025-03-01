import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CourseSchedule: React.FC = () => {
  const [viewMode, setViewMode] = useState<"initial" | "schedule" | "exams">("initial"); // Start with initial view
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [terms, setTerms] = useState<{ key: string; label: string }[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

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

  // Filter courses based on the selected term (quarter)
  const coursesForTerm = courses.filter(
    (course) => course.quarter === selectedTerm
  );

  const openModal = (enrollmentId: number) => {
    setSelectedClass(enrollmentId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
  };

  const selectedCourse = coursesForTerm.find(
    (course) => course.enrollment_id === selectedClass
  );

  // Initial View with Two Buttons
  if (viewMode === "initial") {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Course Schedule</Text>
        <View style={styles.initialContainer}>
          <TouchableOpacity
            style={styles.initialButton}
            onPress={() => setViewMode("schedule")}
          >
            <Text style={styles.initialButtonText}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.initialButton}
            onPress={() => setViewMode("exams")}
          >
            <Text style={styles.initialButtonText}>Exams</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Schedule View (Your Original Code)
  if (viewMode === "schedule") {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Course Schedule</Text>
        <Text style={styles.subHeader}>Term: {selectedTerm || "Loading..."}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setViewMode("initial")}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <ScrollView
          style={styles.classesContainer}
          showsVerticalScrollIndicator={false}
        >
          {coursesForTerm.length > 0 ? (
            coursesForTerm.map((course) => (
              <TouchableOpacity
                key={course.enrollment_id}
                style={styles.classCard}
                onPress={() => openModal(course.enrollment_id)}
              >
                <Text style={styles.classText}>
                  {course.title} ({course.course_code})
                </Text>
                <Text style={styles.timeText}>
                  Section: {course.section_identifier}
                </Text>
                <Text style={styles.timeText}>Time: {course.meeting_time}</Text>
                <Text style={styles.locationText}>
                  Location: {course.location_address}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noCoursesText}>
              No courses found for {selectedTerm}
            </Text>
          )}
        </ScrollView>

        {showModal && selectedCourse && (
          <Modal transparent animationType="fade" visible={showModal}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>Class Information</Text>
                <Text style={styles.modalText}>
                  Course:{" "}
                  <Text style={styles.boldText}>
                    {selectedCourse.title} ({selectedCourse.course_code})
                  </Text>
                </Text>
                <Text style={styles.modalText}>
                  Section:{" "}
                  <Text style={styles.boldText}>
                    {selectedCourse.section_identifier}{" "}
                    {selectedCourse.class_type
                      ? `(${selectedCourse.class_type})`
                      : ""}
                  </Text>
                </Text>
                <Text style={styles.modalText}>
                  Meeting Time:{" "}
                  <Text style={styles.boldText}>
                    {selectedCourse.meeting_time}
                  </Text>
                </Text>
                <Text style={styles.modalText}>
                  Location:{" "}
                  <Text style={styles.boldText}>
                    {selectedCourse.location_address}
                  </Text>
                </Text>
                <Text style={styles.modalText}>
                  Professor:{" "}
                  <Text style={styles.boldText}>
                    {selectedCourse.section_professor ||
                      selectedCourse.offering_professor}
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
  }

  // Exams View (New Code with Sample Subjects)
  if (viewMode === "exams") {
    // Sample exam data for 3 subjects
    const sampleExams = [
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
    ];

    return (
      <View style={styles.container}>
        <Text style={styles.header}>Exam Schedule</Text>
        <Text style={styles.subHeader}>Term: {selectedTerm || "Loading..."}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setViewMode("initial")}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <ScrollView
          style={styles.examsContainer}
          showsVerticalScrollIndicator={false}
        >
          {sampleExams.map((exam) => (
            <View key={exam.id} style={styles.examCard}>
              <Text style={styles.examCourseText}>{exam.subject}</Text>
              <Text style={styles.examText}>Midterm: {exam.midterm}</Text>
              <Text style={styles.examText}>Final: {exam.final}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return null; // Fallback, should never reach here
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
  subHeader: {
    fontSize: 18,
    fontWeight: "500",
    color: "#007AFF",
    marginBottom: 15,
  },
  initialContainer: {
    width: "90%",
    alignItems: "center",
  },
  initialButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  initialButtonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  classesContainer: {
    width: "90%",
    maxHeight: "75%",
  },
  classCard: {
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
    marginBottom: 5,
  },
  timeText: {
    fontSize: 16,
    color: "#555",
  },
  locationText: {
    fontSize: 16,
    color: "#555",
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
  modalText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
  },
  boldText: {
    fontWeight: "700",
    color: "#000",
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
  examsContainer: {
    width: "90%",
    maxHeight: "75%",
  },
  examCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  examCourseText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#222",
    marginBottom: 5,
  },
  examText: {
    fontSize: 16,
    color: "#555",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default CourseSchedule;