// byteme/app/(tabs)/activity.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
};

const clubEvents: Event[] = [
  {
    id: "c1",
    title: "Photography Club Meetup",
    date: "May 5, 2025",
    description:
      "Join fellow photography enthusiasts for a campus photo walk. All skill levels welcome!",
  },
  {
    id: "c2",
    title: "Chess Tournament",
    date: "May 12, 2025",
    description:
      "Compete in our annual chess tournament. Prizes for top 3 players. Register by May 10.",
  },
];

const universityEvents: Event[] = [
  {
    id: "u1",
    title: "Commencement Ceremony",
    date: "June 1, 2025",
    description:
      "Celebrate the Class of 2025 at the main quad. Ceremony starts at 10:00 AM.",
  },
  {
    id: "u2",
    title: "Research Expo",
    date: "June 15, 2025",
    description:
      "Showcase of student research projects across all departments. Open to public.",
  },
];

const sportsNews: Event[] = [
  {
    id: "s1",
    title: "Basketball Finals",
    date: "May 20, 2025",
    description:
      "Men’s basketball team faces their rivals in the championship game at the arena.",
  },
  {
    id: "s2",
    title: "Soccer Tryouts",
    date: "May 25, 2025",
    description:
      "Open tryouts for the varsity soccer team. Bring your own gear. Register on-site.",
  },
];

export default function ActivityScreen() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Detail view
  if (selectedEvent) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.detailContainer}>
          <Text style={styles.detailHeader}>Event Details</Text>
          <Text style={styles.detailTitle}>{selectedEvent.title}</Text>
          <Text style={styles.detailDate}>{selectedEvent.date}</Text>
          <Text style={styles.detailDescription}>
            {selectedEvent.description}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedEvent(null)}
          >
            <Text style={styles.backButtonText}>Back to Activities</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main columns view
  const renderColumn = (title: string, items: Event[]) => (
    <View style={[styles.column, { width: screenWidth }]} key={title}>
      <Text style={styles.columnHeader}>{title}</Text>
      {items.map((evt) => (
        <TouchableOpacity
          key={evt.id}
          style={styles.card}
          onPress={() => setSelectedEvent(evt)}
        >
          <Text style={styles.cardTitle}>{evt.title}</Text>
          <Text style={styles.cardDate}>{evt.date}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Text style={styles.screenHeader}>Activity</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columnsContainer}
      >
        {renderColumn("Club Events", clubEvents)}
        {renderColumn("University Events", universityEvents)}
        {renderColumn("Sports News", sportsNews)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  screenHeader: {
    fontSize: 26,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "center",
    marginVertical: 12,
  },
  columnsContainer: {
    flexDirection: "row",
  },
  column: {
    padding: 16,
  },
  columnHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  cardDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  detailContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  detailHeader: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 12,
    textAlign: "center",
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
  },
  backButton: {
    marginTop: 24,
    alignSelf: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
