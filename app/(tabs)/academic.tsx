import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const AcademicScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<"academic" | "advisors">("academic"); // Default to academic
  const [academicItems, setAcademicItems] = useState<any[]>([]);

  // Sample academic data (replace with actual API call if needed)
  useEffect(() => {
    setAcademicItems([
      {
        id: "1",
        course: "Calculus I (MATH 101)",
        type: "Assignment",
        details: "Homework 1 - Due March 10, 2025",
      },
      {
        id: "2",
        course: "Introduction to Physics (PHYS 101)",
        type: "Grade",
        details: "Quiz 1 - 85%",
      },
      {
        id: "3",
        course: "Computer Science Fundamentals (CS 101)",
        type: "Assignment",
        details: "Project 1 - Due March 15, 2025",
      },
    ]);
  }, []);

  // Sample advisor data (replace with actual API call if needed)
  const sampleAdvisors = [
    {
      id: 1,
      name: "Dr. Jane Smith",
      department: "Mathematics",
      email: "jane.smith@university.edu",
      office: "Room 305, Math Building",
    },
    {
      id: 2,
      name: "Prof. Michael Lee",
      department: "Physics",
      email: "michael.lee@university.edu",
      office: "Room 112, Science Hall",
    },
    {
      id: 3,
      name: "Dr. Emily Chen",
      department: "Computer Science",
      email: "emily.chen@university.edu",
      office: "Room 420, Tech Center",
    },
  ];

  // Academic View (initial view)
  if (viewMode === "academic") {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Academic</Text>
        <View style={styles.academicWrapper}>
          <ScrollView
            style={styles.itemsContainer}
            showsVerticalScrollIndicator={false}
          >
            {academicItems.length > 0 ? (
              academicItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <Text style={styles.courseText}>{item.course}</Text>
                  <Text style={styles.itemText}>
                    {item.type}: {item.details}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>No academic items found</Text>
            )}
          </ScrollView>
          {/* View Advisors Button styled like InboxScreen's backButton */}
          <TouchableOpacity
            style={styles.viewAdvisorsButton}
            onPress={() => setViewMode("advisors")}
          >
            <Text style={styles.viewAdvisorsButtonText}>View Advisors</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Advisors View
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Advisors</Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setViewMode("academic")}
      >
        <Text style={styles.backButtonText}>Back to Academic</Text>
      </TouchableOpacity>
      <ScrollView
        style={styles.advisorsContainer}
        showsVerticalScrollIndicator={false}
      >
        {sampleAdvisors.map((advisor) => (
          <View key={advisor.id} style={styles.advisorCard}>
            <Text style={styles.advisorNameText}>{advisor.name}</Text>
            <Text style={styles.advisorText}>
              Department: {advisor.department}
            </Text>
            <Text style={styles.advisorText}>Email: {advisor.email}</Text>
            <Text style={styles.advisorText}>Office: {advisor.office}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Styles - adapted from InboxScreen and CourseSchedule
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
  academicWrapper: {
    flex: 1,
    width: "90%",
    justifyContent: "space-between", // Ensures button stays at bottom
  },
  itemsContainer: {
    flex: 1, // Takes up available space above the button
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  courseText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#222",
    marginBottom: 5,
  },
  itemText: {
    fontSize: 16,
    color: "#555",
  },
  noItemsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  viewAdvisorsButton: {
    backgroundColor: "#007AFF", // Matches InboxScreen backButton
    paddingVertical: 12, // Matches InboxScreen backButton
    paddingHorizontal: 30, // Matches InboxScreen backButton
    borderRadius: 12, // Matches InboxScreen backButton
    alignSelf: "center", // Centers the button horizontally
    marginTop: 10, // Matches InboxScreen backButton spacing
    marginBottom: 20, // Adds some spacing at the bottom
  },
  viewAdvisorsButtonText: {
    fontSize: 18, // Matches InboxScreen backButtonText
    fontWeight: "500", // Matches InboxScreen backButtonText
    color: "#FFFFFF", // Matches InboxScreen backButtonText
  },
  backButton: {
    backgroundColor: "#FF2D55",
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
  advisorsContainer: {
    width: "90%",
    flex: 1, // Takes up available space
  },
  advisorCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  advisorNameText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#222",
    marginBottom: 5,
  },
  advisorText: {
    fontSize: 16,
    color: "#555",
  },
});

export default AcademicScreen;