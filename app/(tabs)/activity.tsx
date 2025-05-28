// app/(tabs)/activity.tsx

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
import { useThemeStore } from "../../hooks/themeStore";

////////////////////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////////////////////

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
];

////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////
// Component
////////////////////////////////////////////////////////////////////////////////

const ActivityScreen: React.FC = () => {
  const { isDarkMode } = useThemeStore();

  const theme = isDarkMode
    ? {
        background: "#121212",
        cardBackground: "#2C2C2E",
        label: "#FFFFFF",
        secondaryLabel: "#A1A1A1",
        separator: "#3E3E3E",
        accent: "#0A84FF",
      }
    : {
        background: "#FFFFFF",
        cardBackground: "#F5F5F7",
        label: "#1D1D1F",
        secondaryLabel: "#86868B",
        separator: "#E5E5EA",
        accent: "#007AFF",
      };

  const [selectedCategoryId, setSelectedCategoryId] = useState<TopCategory["id"]>("academic");
  const [events, setEvents] = useState<EventVM[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventVM | null>(null);

  const fetchEvents = useCallback(async (categoryId: TopCategory["id"]) => {
    setLoading(true);
    try {
      const res = await fetch("https://universe.terabytecomputing.com:3000/api/v1/events");
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

  const renderItem = ({ item }: { item: EventVM }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBackground }]}
      activeOpacity={0.8}
      onPress={() => {
        setSelectedEvent(item);
        setModalVisible(true);
      }}
    >
      <Text style={[styles.cardTitle, { color: theme.label }]}>{item.name}</Text>
      <Text style={[styles.cardSubtitle, { color: theme.secondaryLabel }]}>{item.date} at {item.time}</Text>
      <Text style={[styles.cardLocation, { color: theme.secondaryLabel }]}>{item.location}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={[styles.headerContainer, { backgroundColor: theme.background, borderBottomColor: theme.separator }]}> 
        <Text style={[styles.headerText, { color: theme.label }]}>Events</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTab, 
                { backgroundColor: selectedCategoryId === cat.id ? theme.accent : theme.cardBackground }]} 
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={{ 
                fontSize: 15,
                fontWeight: selectedCategoryId === cat.id ? "600" : "500",
                color: selectedCategoryId === cat.id ? theme.background : theme.secondaryLabel,
              }}>
                {cat.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.secondaryLabel }]}>No upcoming events</Text>}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}> 
          <View style={[styles.modalHeader, { borderBottomColor: theme.separator }]}> 
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalClose, { color: theme.accent }]}>Close</Text>
            </TouchableOpacity>
          </View>
          {selectedEvent && (
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: theme.label }]}>{selectedEvent.name}</Text>
              <Text style={[styles.modalSubtitle, { color: theme.secondaryLabel }]}>{selectedEvent.date} at {selectedEvent.time}</Text>
              <Text style={[styles.modalLocation, { color: theme.secondaryLabel }]}>{selectedEvent.location}</Text>
              <Text style={[styles.modalDescription, { color: theme.label }]}>{selectedEvent.description}</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Styles
////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 4
  },
  categoryTab: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 14,
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
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  modalClose: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  modalLocation: {
    fontSize: 16,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default ActivityScreen;