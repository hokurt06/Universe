/* app/(tabs)/activity.tsx
 *
 * Campus Events screen – only future events are shown.
 * Fully‑typed, no implicit‑any errors.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

////////////////////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////////////////////

/** Category object as returned by the events API */
interface ApiCategory {
  CategoryName: string;
  SubCategoryName?: string;
}

/** Top‑level filter tabs */
interface TopCategory {
  id: "academic" | "alumni" | "community" | "arts" | "career" | "student";
  title: string;
  icon: "school" | "ribbon" | "leaf" | "color-palette" | "briefcase" | "happy";
}

/** Event view‑model used by the component */
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

////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////

const CATEGORIES: readonly TopCategory[] = [
  { id: "academic", title: "Academic", icon: "school" },
  { id: "alumni", title: "Alumni", icon: "ribbon" },
  { id: "community", title: "Community", icon: "leaf" },
  { id: "arts", title: "Arts & Culture", icon: "color-palette" },
  { id: "career", title: "Career Dev", icon: "briefcase" },
  { id: "student", title: "Student Life", icon: "happy" },
] as const;

const THEME = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  white: "#FFFFFF",
  text: "#1E3A8A",
  background: "#FFFFFF",
};

////////////////////////////////////////////////////////////////////////////////
// Robust date helpers
////////////////////////////////////////////////////////////////////////////////

/** Extracts a millisecond UNIX timestamp or falls back to Date.parse */
const toMillis = (raw: string): number => {
  const match = raw.match(/\d{9,}/)?.[0];
  return match ? Number(match) : Date.parse(raw);
};

/** “May 12” */
const formatDate = (raw: string) => {
  const ms = toMillis(raw);
  return isNaN(ms)
    ? "--"
    : new Date(ms).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
};

/** “2:07 PM” */
const formatTime = (raw: string) => {
  const ms = toMillis(raw);
  return isNaN(ms)
    ? "--"
    : new Date(ms).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
};

/** True iff the timestamp is in the past */
const isPast = (raw: string) => {
  const ms = toMillis(raw);
  return isNaN(ms) ? false : ms < Date.now();
};

////////////////////////////////////////////////////////////////////////////////
// Data shaping
////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////
// Component
////////////////////////////////////////////////////////////////////////////////

const ActivityScreen: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<TopCategory["id"]>("academic");
  const [events, setEvents] = React.useState<EventVM[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<EventVM | null>(
    null
  );

  /** Fetch + shape data */
  const fetchEvents = React.useCallback(
    async (categoryId: TopCategory["id"]) => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://universe.terabytecomputing.com:3000/api/v1/events",
          { headers: { "Content-Type": "application/json" } }
        );
        const data = await res.json();
        setEvents(formatEvents(data, categoryId));
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchEvents(selectedCategoryId);
  }, [fetchEvents, selectedCategoryId]);

  ////////////////////////////////////////////////////////////////////////////
  // Render helpers
  ////////////////////////////////////////////////////////////////////////////

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.screenTitle}>CAMPUS EVENTS</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((cat: TopCategory) => {
          const selected = cat.id === selectedCategoryId;
          return (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryTab,
                selected && styles.categoryTabSelected,
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
              accessibilityRole="button"
              accessibilityLabel={cat.title}
            >
              <Text
                style={[
                  styles.categoryLabel,
                  selected && styles.categoryLabelSelected,
                ]}
              >
                {cat.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }: { item: EventVM }) => (
    <Pressable
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
              (c: ApiCategory) =>
                `${c.CategoryName}${
                  c.SubCategoryName ? ` – ${c.SubCategoryName}` : ""
                }`
            )
            .join(", ")}
        </Text>
      </View>
    </Pressable>
  );

  ////////////////////////////////////////////////////////////////////////////
  // JSX tree
  ////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      {renderHeader()}

      <View style={styles.eventsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={THEME.primaryDark} />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(it) => it.id}
            renderItem={renderItem}
            contentContainerStyle={styles.eventsList}
            refreshing={loading}
            onRefresh={() => fetchEvents(selectedCategoryId)}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No upcoming events.</Text>
            }
          />
        )}
      </View>

      {/* =========== Modal =========== */}
      <Modal visible={modalVisible} animationType="fade" transparent>
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
                {selectedEvent.categories.map((c: ApiCategory, idx: number) => (
                  <Text key={idx} style={styles.modalText}>
                    • {c.CategoryName}
                    {c.SubCategoryName ? ` – ${c.SubCategoryName}` : ""}
                  </Text>
                ))}
              </>
            )}

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close event details"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Styles
////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },

  // ----- header -----
  headerContainer: {
    backgroundColor: THEME.primary,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontSize: 20,
    color: THEME.white,
    fontWeight: "bold",
    marginBottom: 8,
  },
  categoriesContainer: { flexDirection: "row", gap: 8 },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.white,
    backgroundColor: THEME.primaryDark,
  },
  categoryTabSelected: { backgroundColor: THEME.white },
  categoryLabel: { color: THEME.white, fontSize: 14, fontWeight: "500" },
  categoryLabelSelected: { color: THEME.primaryDark },

  // ----- list -----
  eventsContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  eventsList: { paddingBottom: 60 },
  emptyText: { textAlign: "center", color: "#6B7280", marginTop: 32 },

  // ----- card -----
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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

  // ----- modal -----
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
  modalDescription: { fontSize: 14, marginBottom: 10, color: "#374151" },
  modalLabel: {
    fontWeight: "bold",
    marginTop: 8,
    color: THEME.text,
  },
  modalText: { color: "#374151", fontSize: 14 },

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
