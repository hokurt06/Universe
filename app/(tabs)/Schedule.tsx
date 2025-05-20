/*  CourseSchedule.tsx  –– schedule + exams with dark-mode and spaced-out modals */
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

/* ────────── segmented control ────────── */
const SegmentedControl: React.FC<{
  options: { key: string; label: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}> = ({ options, selectedValue, onValueChange }) => {
  // subscribe only to the flag so the control re-renders on theme toggle
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  // palette just for the control
  const segmentBackground      = isDarkMode ? "#2C2C2E" : "#F5F5F7";
  const segmentActiveBackground = isDarkMode ? "#3A3A3C" : "#FFFFFF";
  const segmentText            = isDarkMode ? "#D3D3D3" : "#8E8E93";
  const segmentActiveText      = isDarkMode ? "#FFFFFF" : "#1D1D1F";

  return (
    <View
      style={[
        styles.segmentedControlContainer,
        { backgroundColor: segmentBackground },        // ← gray pill track
      ]}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.segmentButton,
            selectedValue === option.key && {
              backgroundColor: segmentActiveBackground, // selected pill
            },
          ]}
          onPress={() => onValueChange(option.key)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentButtonText,
              {
                color:
                  selectedValue === option.key ? segmentActiveText : segmentText,
              },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};


/* ────────── main component ────────── */
const CourseSchedule: React.FC = () => {
  const [viewMode, setViewMode] = useState<"schedule" | "exams">("schedule");

  /* schedule modal */
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  /* exam modal */
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showExamModal, setShowExamModal] = useState(false);

  /* term + data */
  const [selectedTerm, setSelectedTerm] = useState("");
  const [terms, setTerms] = useState<{ key: string; label: string }[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [showTermDropdown, setShowTermDropdown] = useState(false);

  const modalAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  /* theme palette */
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
        avatar: "#0A84FF",
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
        avatar: "#0066CC",
        modalOverlay: "rgba(0,0,0,0.4)",
      };

  /* demo exam data */
  type Exam = { id: number; subject: string; midterm: string; final: string };
  const exams: Exam[] = [
    {
      id: 1,
      subject: "Calculus I (MATH 101)",
      midterm: "Mar 15 2025 10:00 – 12:00",
      final: "Apr 25 2025 14:00 – 16:00",
    },
    {
      id: 2,
      subject: "Introduction to Physics (PHYS 101)",
      midterm: "Mar 17 2025 13:00 – 15:00",
      final: "Apr 27 2025 09:00 – 11:00",
    },
    {
      id: 3,
      subject: "Computer Science Fundamentals (CS 101)",
      midterm: "Mar 20 2025 11:00 – 13:00",
      final: "Apr 28 2025 15:00 – 17:00",
    },
  ];

  /* ─── fetch terms & enrollments ─── */
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;
        const r = await fetch(
          "https://universe.terabytecomputing.com:3000/api/v1/terms",
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        );
        const d = await r.json();
        if (d.terms) {
          const opts = d.terms.map((t: string) => ({ key: t, label: t }));
          setTerms(opts);
          if (!selectedTerm && opts.length) setSelectedTerm(opts[0].label);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedTerm]);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;
        const r = await fetch(
          "https://universe.terabytecomputing.com:3000/api/v1/enrollments",
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        );
        const d = await r.json();
        if (d.enrollments) setCourses(d.enrollments);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const coursesForTerm = courses.filter((c) => c.quarter === selectedTerm);

  /* ─── schedule card ─── */
  const renderCourseItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.classCard, { backgroundColor: theme.card }]}
      activeOpacity={0.7}
      onPress={() => openScheduleModal(item)}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {item.course.title}
        </Text>
        <Text style={[styles.subtle, { color: theme.segmentText }]}>
          {item.course.course_code}
        </Text>
        <Text style={[styles.subtle, { color: theme.segmentText }]}>
          Section: {item.section}
        </Text>
        <Text style={[styles.subtle, { color: theme.segmentText }]}>
          Time: {item.meeting_time}
        </Text>
        <Text style={[styles.subtle, { color: theme.segmentText }]}>
          Professor: {item.professor}
        </Text>
      </View>
    </TouchableOpacity>
  );

  /* ─── exam card ─── */
  const renderExamItem = ({ item }: { item: Exam }) => (
    <TouchableOpacity
      style={[styles.classCard, { backgroundColor: theme.card }]}
      activeOpacity={0.7}
      onPress={() => openExamModal(item)}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {item.subject}
        </Text>
        <Text style={[styles.subtle, { color: theme.segmentText }]}>
          Midterm: {item.midterm}
        </Text>
        <Text style={[styles.subtle, { color: theme.segmentText }]}>
          Final: {item.final}
        </Text>
      </View>
    </TouchableOpacity>
  );

  /* ─── modal helpers ─── */
  const translateY = modalAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });

  const openScheduleModal = (e: any) => {
    setSelectedEnrollment(e);
    setShowModal(true);
    Animated.timing(modalAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };
  const closeScheduleModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setShowModal(false);
      setSelectedEnrollment(null);
    });
  };

  const openExamModal = (ex: Exam) => {
    setSelectedExam(ex);
    setShowExamModal(true);
    Animated.timing(modalAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };
  const closeExamModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setShowExamModal(false);
      setSelectedExam(null);
    });
  };

  /* ─── schedule info modal (spaced rows) ─── */
  const ScheduleModal = () => (
    <Modal transparent visible={showModal}>
      <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
        <Animated.View
          style={[
            styles.modalContent,
            { backgroundColor: theme.card, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalHeaderText, { color: theme.text }]}>Class Information</Text>
            <TouchableOpacity onPress={closeScheduleModal}>
              <Text style={{ color: theme.avatar }}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.segmentText }]}>Course</Text>
              <Text style={[styles.modalValue, { color: theme.text }]} numberOfLines={2}>
                {selectedEnrollment?.course.title}
              </Text>
              <Text style={[styles.modalSub, { color: theme.segmentText }]}>
                {selectedEnrollment?.course.course_code}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.segmentText }]}>Section</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>
                {selectedEnrollment?.section}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.segmentText }]}>Meeting Time</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>
                {selectedEnrollment?.meeting_time}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.segmentText }]}>Professor</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>
                {selectedEnrollment?.professor}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  /* ─── exam info modal ─── */
  const ExamModal = () => (
    <Modal transparent visible={showExamModal}>
      <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
        <Animated.View
          style={[
            styles.modalContent,
            { backgroundColor: theme.card, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalHeaderText, { color: theme.text }]}>Exam Information</Text>
            <TouchableOpacity onPress={closeExamModal}>
              <Text style={{ color: theme.avatar }}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.segmentText }]}>Subject</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>{selectedExam?.subject}</Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.segmentText }]}>Midterm</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>{selectedExam?.midterm}</Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.segmentText }]}>Final</Text>
              <Text style={[styles.modalValue, { color: theme.text }]}>{selectedExam?.final}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  /* ─── render ─── */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top ? 8 : 16,
            backgroundColor: theme.background,
            borderBottomColor: theme.divider,
          },
        ]}
      >
        <Text style={[styles.header, { color: theme.text }]}>
          {viewMode === "schedule" ? "Course Schedule" : "Exam Schedule"}
        </Text>

        {/* term picker */}
        <TouchableOpacity
          style={[
            styles.termSelector,
            { backgroundColor: theme.segmentBackground, borderColor: theme.divider },
          ]}
          onPress={() => setShowTermDropdown(!showTermDropdown)}
          activeOpacity={0.7}
        >
          <Text style={[styles.termSelectorText, { color: theme.text }]}>
            {selectedTerm || "Select Term"}
          </Text>
          <Text style={[styles.termSelectorIcon, { color: theme.segmentText }]}>▼</Text>
        </TouchableOpacity>

        {showTermDropdown && (
          <View
            style={[
              styles.termDropdown,
              { backgroundColor: theme.card, borderColor: theme.divider },
            ]}
          >
            <FlatList
              data={terms}
              keyExtractor={(i) => i.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.termItem}
                  onPress={() => {
                    setSelectedTerm(item.label);
                    setShowTermDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.termItemText,
                      {
                        color: selectedTerm === item.label ? theme.avatar : theme.text,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <SegmentedControl
          options={[
            { key: "schedule", label: "Schedule" },
            { key: "exams", label: "Exams" },
          ]}
          selectedValue={viewMode}
          onValueChange={(v) => setViewMode(v as "schedule" | "exams")}
        />
      </View>

      {viewMode === "schedule" ? (
        <FlatList
          data={coursesForTerm}
          renderItem={renderCourseItem}
          keyExtractor={(item, idx) => `${item.enrolled_at}-${idx}`}
          contentContainerStyle={styles.listContent}
          extraData={isDarkMode}
        />
      ) : (
        <FlatList
          data={exams}
          renderItem={renderExamItem}
          keyExtractor={(item) => `exam-${item.id}`}
          contentContainerStyle={styles.listContent}
          extraData={isDarkMode}
        />
      )}

      {showModal && <ScheduleModal />}
      {showExamModal && <ExamModal />}
    </SafeAreaView>
  );
};

/* ────────── styles ────────── */
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
  termItemText: { fontSize: 16 },
  listContent: { padding: 16 },
  classCard: { marginVertical: 8, borderRadius: 12 },
  cardContent: { padding: 16 },
  title: { fontSize: 16, fontWeight: "600" },
  subtle: { fontSize: 14, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: Platform.OS === "ios" ? 30 : 20, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 16 },
  modalHeaderText: { fontSize: 18, fontWeight: "600" },
  modalBody: { padding: 16 },
  /* new spaced-row styles */
  modalSection: { marginBottom: 18 },
  modalLabel: { fontSize: 13, marginBottom: 4 },
  modalValue: { fontSize: 16, fontWeight: "600" },
  modalSub: { fontSize: 14, marginTop: 2 },
});

export default CourseSchedule;
