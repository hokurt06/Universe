import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Removed local file import for campusData.
// The events will be fetched from the API endpoint.

const CATEGORIES = [
  { id: "academic", title: "Academic", icon: "school" },
  { id: "alumni", title: "Alumni", icon: "ribbon" },
  { id: "community", title: "Community", icon: "leaf" },
  { id: "arts", title: "Arts & Culture", icon: "color-palette" },
  { id: "career", title: "Career Dev", icon: "briefcase" },
  { id: "student", title: "Student Life", icon: "happy" },
];

const THEME = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  white: "#FFFFFF",
  text: "#1E3A8A",
  textSecondary: "#3B82F6",
  background: "#FFFFFF",
  border: "#3B82F6",
};

// Parse a raw date string (assumes numeric timestamp in a string) to a short date.
const parseDate = (raw) => {
  const timestamp = parseInt(raw.match(/\d+/)?.[0] || "0", 10);
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

// Parse time from a raw date string (assumes numeric timestamp in a string).
const parseTime = (raw) => {
  const timestamp = parseInt(raw.match(/\d+/)?.[0] || "0", 10);
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

// Formats events data from the API based on the selected category.
const formatEvents = (data, categoryId) => {
  const categoryTitle = CATEGORIES.find((c) => c.id === categoryId)?.title;
  if (!categoryTitle) return [];

  return data
    .filter((item) =>
      item.Categories?.some((cat) =>
        cat.CategoryName.toLowerCase().includes(categoryTitle.toLowerCase())
      )
    )
    .map((item) => ({
      id: item.EventKey,
      name: item.Title,
      description: item.Description || "No description available.",
      date: parseDate(item.Start),
      time: parseTime(item.Start),
      location: "TBD",
      icon: "calendar-outline",
      categoryId,
      categories: item.Categories,
    }));
};

const ActivityScreen = () => {
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState("academic");
  const [events, setEvents] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  // Fetch events data from the endpoint and filter/format it for the selected category.
  const fetchEvents = async (categoryId) => {
    setRefreshing(true);
    try {
      const response = await fetch(
        "https://universe.terabytecomputing.com:3000/api/v1/events",
        {
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header here if needed:
            // Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      const filteredEvents = formatEvents(data, categoryId);
      setEvents(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    setRefreshing(false);
  };

  React.useEffect(() => {
    fetchEvents(selectedCategoryId);
  }, [selectedCategoryId]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.screenTitle}>CAMPUS EVENTS</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
      >
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategoryId === category.id &&
                  styles.categoryTabSelected,
              ]}
              onPress={() => setSelectedCategoryId(category.id)}
            >
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategoryId === category.id &&
                    styles.categoryLabelSelected,
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => {
        setSelectedEvent(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.eventIconContainer}>
        <Ionicons name={item.icon} size={24} color={THEME.primary} />
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.dateChip}>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.categories
            .map(
              (cat) =>
                `${cat.CategoryName}${
                  cat.SubCategoryName ? ` – ${cat.SubCategoryName}` : ""
                }`
            )
            .join(", ")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      {renderHeader()}
      <View style={styles.eventsContainer}>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
          refreshing={refreshing}
          onRefresh={() => fetchEvents(selectedCategoryId)}
          renderItem={renderItem}
        />
      </View>

      {/* Modal for event details */}
      <Modal visible={modalVisible} animationType="none" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedEvent && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.name}</Text>
                <Text style={styles.modalDateTime}>
                  {selectedEvent.date} at {selectedEvent.time}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedEvent.description}
                </Text>
                <Text style={styles.modalLabel}>Location:</Text>
                <Text style={styles.modalText}>{selectedEvent.location}</Text>
                <Text style={styles.modalLabel}>Categories:</Text>
                {selectedEvent.categories.map((cat, idx) => (
                  <Text key={idx} style={styles.modalText}>
                    • {cat.CategoryName}
                    {cat.SubCategoryName ? ` – ${cat.SubCategoryName}` : ""}
                  </Text>
                ))}
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  headerContainer: {
    backgroundColor: THEME.primary,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 20,
    color: THEME.white,
    fontWeight: "bold",
  },
  categoriesScroll: { marginTop: 8 },
  categoriesContainer: { flexDirection: "row", paddingHorizontal: 12 },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.white,
    backgroundColor: THEME.primaryDark,
  },
  categoryTabSelected: { backgroundColor: THEME.white },
  categoryLabel: { color: THEME.white, fontSize: 14, fontWeight: "500" },
  categoryLabelSelected: { color: THEME.primaryDark },
  eventsContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  eventsList: { paddingBottom: 60 },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  eventContent: { flex: 1 },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventName: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.text,
    flex: 1,
    marginRight: 8,
  },
  dateChip: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dateText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: "600",
  },
  eventDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: THEME.text,
  },
  modalDateTime: {
    fontSize: 14,
    marginBottom: 12,
    color: "#374151",
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 10,
    color: "#374151",
  },
  modalLabel: {
    fontWeight: "bold",
    marginTop: 8,
    color: "#1E3A8A",
  },
  modalText: {
    color: "#374151",
    fontSize: 14,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: THEME.primaryDark,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: THEME.white,
    fontWeight: "bold",
  },
});

export default ActivityScreen;
