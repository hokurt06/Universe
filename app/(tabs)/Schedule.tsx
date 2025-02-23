import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";

const CourseSchedule: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string>("Fall 2024");

  const courses = [
    {
      id: 1,
      name: "Placeholder Class",
      professor: "Placeholder Professor",
      credits: 3,
      location: "Room Placeholder",
      time: "Time Placeholder",
    },
    {
      id: 2,
      name: "Placeholder Class",
      professor: "Placeholder Professor",
      credits: 4,
      location: "Room Placeholder",
      time: "Time Placeholder",
    },
    {
      id: 3,
      name: "Placeholder Class",
      professor: "Placeholder Professor",
      credits: 3,
      location: "Room Placeholder",
      time: "Time Placeholder",
    },
  ];

  const openModal = (id: number) => {
    setSelectedClass(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
  };

  const selectedCourse = courses.find(course => course.id === selectedClass);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Course Schedule</Text>
      <Text style={styles.subHeader}>Term: {selectedTerm}</Text>
      <ScrollView style={styles.classesContainer} showsVerticalScrollIndicator={false}>
        {courses.map(course => (
          <TouchableOpacity
            key={course.id}
            style={styles.classCard}
            onPress={() => openModal(course.id)}
          >
            <Text style={styles.classText}>{course.name}</Text>
            <Text style={styles.timeText}>{course.time}</Text>
            <Text style={styles.locationText}>{course.location}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showModal && selectedCourse && (
        <Modal transparent animationType="fade" visible={showModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Class Information</Text>
              <Text style={styles.modalText}>
                Professor: <Text style={styles.boldText}>{selectedCourse.professor}</Text>
              </Text>
              <Text style={styles.modalText}>
                Location: <Text style={styles.boldText}>{selectedCourse.location}</Text>
              </Text>
              <Text style={styles.modalText}>
                Time: <Text style={styles.boldText}>{selectedCourse.time}</Text>
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
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingTop: 70,
  },
  header: {
    fontSize: 26,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "500",
    color: "#007AFF",
    marginBottom: 15,
  },
  classesContainer: {
    width: "90%",
    maxHeight: "60%",
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
});

export default CourseSchedule;
