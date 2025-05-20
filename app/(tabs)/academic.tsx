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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "../../hooks/themeStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SegmentedControl: React.FC<{
  options: { key: string; label: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  theme: any;
}> = ({ options, selectedValue, onValueChange, theme }) => {
  return (
    <View
      style={[
        styles.segmentedControlContainer,
        { backgroundColor: theme.segmentBackground },
      ]}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.segmentButton,
            selectedValue === option.key
              ? [
                  styles.segmentButtonActive,
                  { backgroundColor: theme.segmentActiveBackground },
                ]
              : null,
          ]}
          onPress={() => onValueChange(option.key)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentButtonText,
              { color: theme.segmentText },
              selectedValue === option.key
                ? { color: theme.segmentActiveText }
                : null,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AcademicScreen: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [terms, setTerms] = useState<{ key: string; label: string }[]>([]);
  const [showTermDropdown, setShowTermDropdown] = useState<boolean>(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"courses" | "summary">("courses");

  const modalAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  const { isDarkMode } = useThemeStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const viewOptions = [
    { key: "courses", label: "Courses" },
    { key: "summary", label: "Summary" },
  ];

  const theme = isDarkMode
    ? {
        background: "#121212",
        text: "#FFFFFF",
        header: "#FFFFFF",
        sectionBackground: "#2A2A2A",
        divider: "#3E3E3E",
        accent: "#0A84FF",
        cardBorder: "#3A3A3A",
        avatarBackground: "#0A84FF",
        segmentBackground: "#2C2C2E",
        segmentText: "#D3D3D3",
        segmentActiveBackground: "#3A3A3C",
        segmentActiveText: "#FFFFFF",
        listBackground: "#121212",
        modalOverlay: "rgba(28,28,30,0.9)",
        cardTitle: "#FFFFFF", 
        card: "#2C2C2E",
      }
    : {
        background: "#FFFFFF",
        text: "#1C1C1E",
        header: "#1C1C1E",
        sectionBackground: "#F5F5F7",
        divider: "#E5E5EA",
        accent: "#007AFF",
        cardBorder: "#E5E5EA",
        avatarBackground: "#007AFF",
        segmentBackground: "#F2F2F7",
        segmentText: "#696969",
        segmentActiveBackground: "#FFFFFF",
        segmentActiveText: "#1C1C1E",
        listBackground: "#FFFFFF",
        modalOverlay: "rgba(0,0,0,0.5)",
        cardTitle: "#000000", 
        card: "#F5F5F7",
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
  }, []);

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

    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeCourse = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSelectedCourse(null);
    });
  };

  const handleTermSelection = (term: string) => {
    setSelectedTerm(term);
    setShowTermDropdown(false);
  };

  // Calculate GPA and total credits
  const calculateAcademicSummary = () => {
    if (courses.length === 0) return { gpa: 0, totalCredits: 0 };

    const completedCourses = courses.filter((course) => course.grade);

    if (completedCourses.length === 0) return { gpa: 0, totalCredits: 0 };

    const gradePoints = (grade: number): number => {
      if (grade >= 93) return 4.0;
      if (grade >= 90) return 3.7;
      if (grade >= 87) return 3.3;
      if (grade >= 83) return 3.0;
      if (grade >= 80) return 2.7;
      if (grade >= 77) return 2.3;
      if (grade >= 73) return 2.0;
      if (grade >= 70) return 1.7;
      if (grade >= 67) return 1.3;
      if (grade >= 63) return 1.0;
      if (grade >= 60) return 0.7;
      return 0.0;
    };

    const totalCredits = completedCourses.reduce(
      (sum, course) => sum + (course.course.credits || 0),
      0
    );

    const totalPoints = completedCourses.reduce((sum, course) => {
      const points = course.grade ? gradePoints(course.grade) || 0 : 0;
      return sum + points * (course.course.credits || 0);
    }, 0);

    const gpa = totalPoints / totalCredits || 0;

    return { gpa: parseFloat(gpa.toFixed(2)), totalCredits };
  };

  const { gpa, totalCredits } = calculateAcademicSummary();

  const renderCourseItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.classCard, { backgroundColor: theme.card }]}
      onPress={() => openCourse(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.courseIdentifier}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: theme.avatarBackground },
            ]}
          >
            <Text style={styles.avatarText}>
              {item.course.course_code.substring(0, 1)}
            </Text>
          </View>
          <View style={styles.courseDetails}>
            <Text
              style={[styles.classText, { color: theme.cardTitle }]}
              numberOfLines={1}
            >
              {item.course.title}
            </Text>
            <Text style={[styles.courseCode, { color: theme.segmentText }]}>
              {item.course.course_code}
            </Text>
          </View>
        </View>
        <View style={styles.courseInfo}>
          <Text style={[styles.timeText, { color: theme.segmentText }]}>
            Professor: {item.professor}
          </Text>
          <Text style={[styles.timeText, { color: theme.segmentText }]}>
            Time: {item.meeting_time}
          </Text>
          {item.grade && (
            <View style={styles.gradeContainer}>
              <Text style={[styles.timeText, { color: theme.segmentText }]}>
                Grade:
              </Text>
              <View
                style={[
                  styles.gradeBadge,
                  { backgroundColor: theme.avatarBackground },
                ]}
              >
                <Text style={styles.gradeBadgeText}>{item.grade}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyStateIcon,
          { backgroundColor: theme.segmentBackground },
        ]}
      >
        <Text style={styles.emptyStateIconText}>📚</Text>
      </View>
      <Text style={[styles.noCoursesText, { color: theme.text }]}>
        No courses found for {selectedTerm}
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: theme.segmentText }]}>
        Courses will appear here once you're enrolled
      </Text>
    </View>
  );

  const renderSummaryView = () => (
    <View style={styles.summaryContainer}>
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: theme.sectionBackground },
        ]}
      >
        <Text style={[styles.summaryCardTitle, { color: theme.segmentText }]}>
          Current GPA
        </Text>
        <Text style={[styles.summaryCardValue, { color: theme.text }]}>
          {gpa}
        </Text>
        <View
          style={[
            styles.gpaIndicator,
            { backgroundColor: theme.segmentBackground },
          ]}
        >
          <View
            style={[
              styles.gpaProgress,
              {
                backgroundColor: theme.avatarBackground,
                width: `${(gpa / 4.0) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.summaryCardRange, { color: theme.segmentText }]}>
          Scale: 0.0 - 4.0
        </Text>
      </View>

      <View
        style={[
          styles.summaryCard,
          { backgroundColor: theme.sectionBackground },
        ]}
      >
        <Text style={[styles.summaryCardTitle, { color: theme.segmentText }]}>
          Credits Completed
        </Text>
        <Text style={[styles.summaryCardValue, { color: theme.text }]}>
          {totalCredits}
        </Text>
      </View>

      <View
        style={[
          styles.summaryCard,
          { backgroundColor: theme.sectionBackground },
        ]}
      >
        <Text style={[styles.summaryCardTitle, { color: theme.segmentText }]}>
          Academic Standing
        </Text>
        <Text style={[styles.summaryCardValue, { color: theme.text }]}>
          {gpa >= 3.5
            ? "Dean's List"
            : gpa >= 2.0
            ? "Good Standing"
            : "Academic Probation"}
        </Text>
      </View>
    </View>
  );

  const renderModalContent = () => {
    if (!selectedCourse) return null;

    const translateY = modalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    });

    return (
      <Modal transparent animationType="none" visible={!!selectedCourse}>
        <View
          style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.sectionBackground,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderText, { color: theme.header }]}>
                Course Information
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeCourse}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.closeButtonText, { color: theme.accent }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: theme.segmentText }]}>
                  Course
                </Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>
                  {selectedCourse.course.title}
                </Text>
                <Text
                  style={[styles.modalSubvalue, { color: theme.segmentText }]}
                >
                  {selectedCourse.course.course_code}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: theme.segmentText }]}>
                  Quarter
                </Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>
                  {selectedCourse.quarter}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: theme.segmentText }]}>
                  Section
                </Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>
                  {selectedCourse.section}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: theme.segmentText }]}>
                  Meeting Time
                </Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>
                  {selectedCourse.meeting_time}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: theme.segmentText }]}>
                  Professor
                </Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>
                  {selectedCourse.professor}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: theme.segmentText }]}>
                  Grade
                </Text>
                <View style={styles.gradeRow}>
                  <Text style={[styles.modalValue, { color: theme.text }]}>
                    {selectedCourse.grade || "Not Graded"}
                  </Text>
                  {selectedCourse.grade && (
                    <View
                      style={[
                        styles.gradeBadge,
                        { backgroundColor: theme.avatarBackground },
                      ]}
                    >
                      <Text style={styles.gradeBadgeText}>
                        {selectedCourse.grade}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top > 0 ? 8 : 16 },
        ]}
      >
        <Text style={[styles.header, { color: theme.header }]}>
          Academic Records
        </Text>

        <TouchableOpacity
          style={[
            styles.termSelector,
            {
              backgroundColor: theme.segmentBackground,
              borderColor: theme.cardBorder,
            },
          ]}
          onPress={() => setShowTermDropdown(!showTermDropdown)}
          activeOpacity={0.7}
        >
          <Text style={[styles.termSelectorText, { color: theme.text }]}>
            {selectedTerm || "Select Term"}
          </Text>
          <Text style={[styles.termSelectorIcon, { color: theme.segmentText }]}>
            ▼
          </Text>
        </TouchableOpacity>

        {showTermDropdown && (
          <View
            style={[
              styles.termDropdown,
              {
                backgroundColor: theme.sectionBackground,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <FlatList
              data={terms}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.termItem,
                    { borderBottomColor: theme.divider },
                  ]}
                  onPress={() => handleTermSelection(item.label)}
                >
                  <Text
                    style={[
                      styles.termItemText,
                      { color: theme.text },
                      selectedTerm === item.label && {
                        color: theme.accent,
                        fontWeight: "500",
                      },
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
          options={viewOptions}
          selectedValue={viewMode}
          onValueChange={(value) => setViewMode(value as "courses" | "summary")}
          theme={theme}
        />
      </View>

      <View style={{ flex: 1 }}>
        {viewMode === "courses" && (
          <FlatList
            data={coursesForTerm}
            renderItem={renderCourseItem}
            keyExtractor={(item, index) => `${item.enrolled_at}-${index}`}
            contentContainerStyle={[
              styles.listContent,
              { backgroundColor: theme.listBackground },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={
              <TouchableOpacity
                style={[
                  styles.advisorsButton,
                  { backgroundColor: theme.accent },
                ]}
                onPress={() => router.push("/advisors")}
              >
                <Text style={styles.advisorsButtonText}>View Advisors</Text>
              </TouchableOpacity>
            }
          />
        )}

        {viewMode === "summary" && (
          <View style={{ flex: 1 }}>
            {renderSummaryView()}
            <TouchableOpacity
              style={[styles.advisorsButton, { backgroundColor: theme.accent }]}
              onPress={() => router.push("/advisors")}
            >
              <Text style={styles.advisorsButtonText}>View Advisors</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {renderModalContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 12,
  },
  segmentedControlContainer: {
    flexDirection: "row",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  termSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  termSelectorText: {
    fontSize: 16,
    fontWeight: "500",
  },
  termSelectorIcon: {
    fontSize: 12,
  },
  termDropdown: {
    position: "absolute",
    top: 110,
    left: 20,
    right: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 2,
    borderWidth: 1,
    maxHeight: 200,
  },
  termItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  termItemText: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 100, 
  },
  classCard: {
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
  },
  courseCode: {
    fontSize: 14,
    marginTop: 2,
  },
  courseInfo: {
    paddingLeft: 52,
  },
  timeText: {
    fontSize: 14,
    marginTop: 4,
  },
  gradeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  gradeBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
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
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  advisorsButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
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
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
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
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalSubvalue: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryContainer: {
    padding: 16,
    paddingBottom: 100, // Space for button
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  summaryCardValue: {
    fontSize: 36,
    fontWeight: "600",
    marginBottom: 10,
  },
  summaryCardRange: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 5,
  },
  gpaIndicator: {
    height: 8,
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
  },
  gpaProgress: {
    height: "100%",
    borderRadius: 4,
  },
  advisorsButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: "center",
  },
});

export default AcademicScreen;
