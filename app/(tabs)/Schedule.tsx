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

const SegmentedControl: React.FC<{
  options: { key: string; label: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}> = ({ options, selectedValue, onValueChange }) => {
  return (
    <View style={styles.segmentedControlContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.segmentButton,
            selectedValue === option.key ? styles.segmentButtonActive : null,
          ]}
          onPress={() => onValueChange(option.key)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentButtonText,
              selectedValue === option.key ? styles.segmentButtonTextActive : null,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const BackIcon = () => (
  <View style={styles.backIcon}>
    <Text style={styles.backIconText}>{"←"}</Text>
  </View>
);

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

  const renderCourseItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => openModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.courseIdentifier}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.course.course_code.substring(0, 1)}
            </Text>
          </View>
          <View style={styles.courseDetails}>
            <Text style={styles.classText} numberOfLines={1}>
              {item.course.title}
            </Text>
            <Text style={styles.courseCode}>
              {item.course.course_code}
            </Text>
          </View>
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.timeText}>
            Section: {item.section}
          </Text>
          <Text style={styles.timeText}>
            Time: {item.meeting_time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExamItem = ({ item }: { item: any }) => (
    <View style={styles.classCard}>
      <View style={styles.cardContent}>
        <View style={styles.courseIdentifier}>
          <View style={[styles.avatarContainer, styles.examAvatar]}>
            <Text style={styles.avatarText}>
              {item.subject.substring(0, 1)}
            </Text>
          </View>
          <View style={styles.courseDetails}>
            <Text style={styles.classText} numberOfLines={1}>
              {item.subject}
            </Text>
          </View>
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.timeText}>
            Midterm: {item.midterm}
          </Text>
          <Text style={styles.timeText}>
            Final: {item.final}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Text style={styles.emptyStateIconText}>📚</Text>
      </View>
      <Text style={styles.noCoursesText}>
        No courses found for {selectedTerm}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        Courses will appear here once you're enrolled
      </Text>
    </View>
  );

  const handleTermSelection = (term: string) => {
    setSelectedTerm(term);
    setShowTermDropdown(false);
  };

  const exams = [
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

  const renderModalContent = () => {
    const translateY = modalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    });

    return (
      <Modal transparent animationType="none" visible={showModal}>
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Class Information</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={closeModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Course</Text>
                <Text style={styles.modalValue}>
                  {selectedEnrollment?.course.title}
                </Text>
                <Text style={styles.modalSubvalue}>
                  {selectedEnrollment?.course.course_code}
                </Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Section</Text>
                <Text style={styles.modalValue}>
                  {selectedEnrollment?.section}
                </Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Meeting Time</Text>
                <Text style={styles.modalValue}>
                  {selectedEnrollment?.meeting_time}
                </Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Professor</Text>
                <Text style={styles.modalValue}>
                  {selectedEnrollment?.professor}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? 8 : 16 }]}>
        <Text style={styles.header}>
          {viewMode === "schedule" ? "Course Schedule" : "Exam Schedule"}
        </Text>
        
        <TouchableOpacity 
          style={styles.termSelector}
          onPress={() => setShowTermDropdown(!showTermDropdown)}
          activeOpacity={0.7}
        >
          <Text style={styles.termSelectorText}>
            {selectedTerm || "Select Term"}
          </Text>
          <Text style={styles.termSelectorIcon}>▼</Text>
        </TouchableOpacity>
        
        {showTermDropdown && (
          <View style={styles.termDropdown}>
            <FlatList
              data={terms}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.termItem}
                  onPress={() => handleTermSelection(item.label)}
                >
                  <Text style={[
                    styles.termItemText,
                    selectedTerm === item.label && styles.termItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.key}
            />
          </View>
        )}
        
        <SegmentedControl
          options={viewOptions}
          selectedValue={viewMode}
          onValueChange={(value) => setViewMode(value as "schedule" | "exams")}
        />
      </View>

      {viewMode === "schedule" && (
        <FlatList
          data={coursesForTerm}
          renderItem={renderCourseItem}
          keyExtractor={(item, index) => `${item.enrolled_at}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {viewMode === "exams" && (
        <FlatList
          data={exams}
          renderItem={renderExamItem}
          keyExtractor={(item) => `exam-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {showModal && selectedEnrollment && renderModalContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 12,
  },
  segmentedControlContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F7",
    borderRadius: 8,
    marginVertical: 10,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  segmentButtonTextActive: {
    color: "#1D1D1F",
  },
  termSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F5F5F7",
  },
  termSelectorText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1D1D1F",
  },
  termSelectorIcon: {
    fontSize: 12,
    color: "#8E8E93",
  },
  termDropdown: {
    position: "absolute",
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 2,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    maxHeight: 200,
  },
  termItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  termItemText: {
    fontSize: 16,
    color: "#1D1D1F",
  },
  termItemTextSelected: {
    color: "#0066CC",
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  classCard: {
    backgroundColor: "#F5F5F7",
    marginVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  courseIdentifier: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0066CC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  examAvatar: {
    backgroundColor: "#FF9500",
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  courseDetails: {
    flex: 1,
  },
  classText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1D1D1F",
  },
  courseCode: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  courseInfo: {
    paddingLeft: 52,
  },
  timeText: {
    fontSize: 14,
    color: "#3C3C43",
    opacity: 0.6,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F5F5F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  noCoursesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#F5F5F7",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#0066CC",
    fontWeight: "500",
  },
  modalBody: {
    padding: 16,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1D1D1F",
  },
  modalSubvalue: {
    fontSize: 14,
    color: "#3C3C43",
    opacity: 0.6,
    marginTop: 2,
  },
  backIcon: {
    marginRight: 4,
  },
  backIconText: {
    fontSize: 18,
    color: "#0066CC",
  },
});

export default CourseSchedule;