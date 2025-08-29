import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ApiCategory {
  CategoryName: string;
  SubCategoryName?: string;
}

interface TopCategory {
  id: "academic" | "alumni" | "community" | "arts" | "career" | "student";
  title: string;
  icon: "school" | "ribbon" | "leaf" | "color-palette" | "briefcase" | "happy";
}

interface EventVM {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  icon: "calendar-outline";
  categoryId: TopCategory["id"];
  categories: ApiCategory[];
}

const CATEGORIES: readonly TopCategory[] = [
  { id: "academic", title: "Academic", icon: "school" },
  { id: "alumni", title: "Alumni", icon: "ribbon" },
  { id: "community", title: "Community", icon: "leaf" },
  { id: "arts", title: "Arts & Culture", icon: "color-palette" },
  { id: "career", title: "Career Dev", icon: "briefcase" },
  { id: "student", title: "Student Life", icon: "happy" },
] as const;

const COLORS = {
  background: "#FFFFFF",
  cardBackground: "#F5F5F7",
  label: "#1D1D1F",
  secondaryLabel: "#86868B",
  separator: "#E5E5EA",
  systemBlue: "#007AFF",
};


const toMillis = (raw: string): number => {
  const match = raw.match(/\d{9,}/)?.[0];
  return match ? Number(match) : Date.parse(raw);
};

const formatDate = (raw: string) => {
  const ms = toMillis(raw);
  return isNaN(ms)
    ? "--"
    : new Date(ms).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
};

const formatTime = (raw: string) => {
  const ms = toMillis(raw);
  return isNaN(ms)
    ? "--"
    : new Date(ms).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
};

const isPast = (raw: string) => {
  const ms = toMillis(raw);
  return isNaN(ms) ? false : ms < Date.now();
};

const formatEvents = (raw: any[], categoryId: TopCategory["id"]): EventVM[] => {
  const categoryTitle =
    CATEGORIES.find((c) => c.id === categoryId)?.title ?? "";

  return raw
    .filter(
      (e) =>
        !isPast(e.Start) &&
        e.Categories?.some((cat: ApiCategory) =>
          cat.CategoryName.toLowerCase().includes(categoryTitle.toLowerCase())
        )
    )
    .map((e) => ({
      id: e.EventKey,
      name: e.Title,
      description: e.Description || "No description available.",
      date: formatDate(e.Start),
      time: formatTime(e.Start),
      location: e.Location ?? "TBD",
      icon: "calendar-outline",
      categoryId,
      categories: (e.Categories ?? []) as ApiCategory[],
    }));
};


const ActivityScreen: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<TopCategory["id"]>("academic");
  const [events, setEvents] = useState<EventVM[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventVM | null>(null);

  const fetchEvents = useCallback(async (categoryId: TopCategory["id"]) => {
    setLoading(true);
    try {
      const res = await fetch("https://universe.terabytecomputing.com:3000/api/v1/events", {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setEvents(formatEvents(data, categoryId));
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(selectedCategoryId);
  }, [fetchEvents, selectedCategoryId]);

 
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>Events</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryTab, selectedCategoryId === cat.id && styles.categoryTabSelected]} 
            onPress={() => setSelectedCategoryId(cat.id)}
          >
            <Text style={[styles.categoryLabel, selectedCategoryId === cat.id && styles.categoryLabelSelected]}>
              {cat.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }: { item: EventVM }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        setSelectedEvent(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSubtitle}>{item.date} at {item.time}</Text>
      <Text style={styles.cardLocation}>{item.location}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {renderHeader()}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.systemBlue} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No upcoming events</Text>}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          {selectedEvent && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedEvent.name}</Text>
              <Text style={styles.modalSubtitle}>{selectedEvent.date} at {selectedEvent.time}</Text>
              <Text style={styles.modalLocation}>{selectedEvent.location}</Text>
              <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.label,
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 4
  },
  categoryTab: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  categoryTabSelected: {
    backgroundColor: COLORS.systemBlue,
  },
  categoryLabel: {
    fontSize: 15,
    color: COLORS.secondaryLabel,
    fontWeight: "500",
  },
  categoryLabelSelected: {
    color: COLORS.background,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.label,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.secondaryLabel,
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 14,
    color: COLORS.secondaryLabel,
  },
  separator: {
    height: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: COLORS.secondaryLabel,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  modalClose: {
    fontSize: 16,
    color: COLORS.systemBlue,
    fontWeight: "500",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.label,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.secondaryLabel,
    marginBottom: 4,
  },
  modalLocation: {
    fontSize: 16,
    color: COLORS.secondaryLabel,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.label,
  },
});

export default ActivityScreen;
