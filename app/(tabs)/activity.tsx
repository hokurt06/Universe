import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Define category data with icons - now using only medium blue theme
interface Category {
  id: string;
  title: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: "academic", title: "Academic", icon: "school" },
  { id: "community", title: "Community", icon: "people" },
  { id: "arts", title: "Arts", icon: "color-palette" },
  { id: "career", title: "Career", icon: "briefcase" },
  { id: "student", title: "Student Life", icon: "happy" }
];

// Theme colors - simplified to medium blue and white only
const THEME = {
  primary: "#3B82F6",     // Medium blue
  primaryDark: "#2563EB", // Slightly darker blue for contrast
  white: "#FFFFFF",
  text: "#1E3A8A",        // Dark blue text
  textSecondary: "#3B82F6", // Medium blue for secondary text
  background: "#FFFFFF",  // White background
  border: "#3B82F6"       // Medium blue for borders
};

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  icon: string;
  categoryId: string;
}

// Mock data with improved structure
const MOCK_EVENTS: Event[] = [
  // Academic Events
  { 
    id: "a1", 
    name: "Advanced AI Lecture Series", 
    description: "Join Professor Lee for an exploration of cutting-edge artificial intelligence concepts and applications.", 
    date: "Apr 15", 
    time: "2:00 PM", 
    location: "Science Hall 302", 
    icon: "school-outline",
    categoryId: "academic" 
  },
  { 
    id: "a2", 
    name: "Math Problem-Solving Workshop", 
    description: "Enhance your analytical thinking with challenging mathematical problems and collaborative solutions.", 
    date: "Apr 20", 
    time: "3:30 PM", 
    location: "Math Building 101", 
    icon: "calculator-outline",
    categoryId: "academic" 
  },
  
  // Community Events
  { 
    id: "c1", 
    name: "Downtown Park Cleanup", 
    description: "Help beautify our local green spaces while connecting with fellow volunteers.", 
    date: "Apr 18", 
    time: "9:00 AM", 
    location: "Central Park Entrance", 
    icon: "leaf-outline",
    categoryId: "community" 
  },
  { 
    id: "c2", 
    name: "Campus Food Drive", 
    description: "Contribute non-perishable items to support families in need within our community.", 
    date: "Apr 22", 
    time: "10:00 AM - 4:00 PM", 
    location: "Student Union", 
    icon: "fast-food-outline",
    categoryId: "community" 
  },
  
  // Arts Events
  { 
    id: "e1", 
    name: "Student Art Exhibition", 
    description: "Celebrate creativity at this showcase featuring works from talented student artists across disciplines.", 
    date: "Apr 10", 
    time: "5:00 PM - 8:00 PM", 
    location: "Fine Arts Gallery", 
    icon: "color-palette-outline",
    categoryId: "arts" 
  },
  { 
    id: "e2", 
    name: "Spring Concert Series", 
    description: "Enjoy live performances by student musicians and special guest artists.", 
    date: "Apr 12", 
    time: "7:00 PM", 
    location: "Auditorium", 
    icon: "musical-notes-outline",
    categoryId: "arts" 
  },
  
  // Career Events
  { 
    id: "d1", 
    name: "Tech Career Fair", 
    description: "Connect with leading employers from the technology sector about internship and job opportunities.", 
    date: "Apr 16", 
    time: "11:00 AM - 3:00 PM", 
    location: "Engineering Building", 
    icon: "briefcase-outline",
    categoryId: "career" 
  },
  { 
    id: "d2", 
    name: "Resume & LinkedIn Workshop", 
    description: "Learn how to optimize your professional profiles for maximum impact with recruiters.", 
    date: "Apr 14", 
    time: "1:00 PM", 
    location: "Career Center", 
    icon: "document-text-outline",
    categoryId: "career" 
  },
  
  // Student Life Events
  { 
    id: "s1", 
    name: "Club Fair", 
    description: "Discover the diverse range of student organizations and find your community on campus.", 
    date: "Apr 17", 
    time: "12:00 PM - 4:00 PM", 
    location: "Main Quad", 
    icon: "people-outline",
    categoryId: "student" 
  },
  { 
    id: "s2", 
    name: "New Student Campus Tour", 
    description: "Get oriented with key locations and resources available to support your success.", 
    date: "Apr 19", 
    time: "10:00 AM", 
    location: "Visitor Center", 
    icon: "navigate-outline",
    categoryId: "student" 
  },
];

const CategoryTab: React.FC<{
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}> = ({ category, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        isSelected && styles.categoryTabSelected
      ]}
      onPress={onPress}
    >
      <Text 
        style={[
          styles.categoryLabel,
          isSelected && styles.categoryLabelSelected
        ]}
      >
        {category.title}
      </Text>
    </TouchableOpacity>
  );
};

const EventCard: React.FC<{
  event: Event;
  onPress: () => void;
}> = ({ event, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.eventCard} 
      onPress={onPress}
    >
      <View style={styles.eventIconContainer}>
        <Ionicons name={event.icon as any} size={24} color={THEME.primary} />
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventName} numberOfLines={1}>{event.name}</Text>
          <View style={styles.dateChip}>
            <Text style={styles.dateText}>{event.date}</Text>
          </View>
        </View>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color={THEME.textSecondary} />
            <Text style={styles.detailText}>{event.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={THEME.textSecondary} />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ActivityScreen: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("academic");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const selectedCategory = CATEGORIES.find(cat => cat.id === selectedCategoryId) || CATEGORIES[0];

  const fetchEvents = async (categoryId: string) => {
    setLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      const filteredEvents = MOCK_EVENTS.filter(event => event.categoryId === categoryId);
      setEvents(filteredEvents);
      setLoading(false);
      setRefreshing(false);
    }, 600);
  };

  useEffect(() => {
    fetchEvents(selectedCategoryId);
  }, [selectedCategoryId]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents(selectedCategoryId);
  };

  const handleEventPress = (event: Event) => {
    // In a real app, this would navigate to event details
    console.log(`Viewing details for: ${event.name}`);
    // Example: navigation.navigate('EventDetails', { eventId: event.id });
  };

  const handleAddEvent = () => {
    // In a real app, this would navigate to add event screen
    console.log(`Adding new event to category: ${selectedCategory.title}`);
    // Example: navigation.navigate('AddEvent', { categoryId: selectedCategory.id });
  };

  // Simplified header with text only
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <Text style={styles.screenTitle}>CAMPUS EVENTS</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => (
          <CategoryTab
            key={category.id}
            category={category}
            isSelected={selectedCategoryId === category.id}
            onPress={() => handleCategoryChange(category.id)}
          />
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No upcoming events
      </Text>
      <Text style={styles.emptyStateSubtext}>
        Check back later for new {selectedCategory.title.toLowerCase()} events
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={handleAddEvent}
      >
        <Text style={styles.emptyStateButtonText}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      
      {renderHeader()}
      
      <View style={styles.eventsContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>{selectedCategory.title} Events</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddEvent}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.eventsList}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                onPress={() => handleEventPress(item)}
              />
            )}
            ListEmptyComponent={renderEmptyState()}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  headerContainer: {
    backgroundColor: THEME.primary,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.white,
    letterSpacing: 1,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.white,
  },
  headerButtonText: {
    fontSize: 14,
    color: THEME.white,
    fontWeight: "500",
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  categoryTab: {
    backgroundColor: THEME.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryTabSelected: {
    backgroundColor: THEME.primaryDark,
  },
  categoryLabel: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: "500",
    textAlign: "center",
  },
  categoryLabelSelected: {
    color: THEME.white,
  },
  eventsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.primary,
  },
  addButton: {
    backgroundColor: THEME.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    color: THEME.white,
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  eventsList: {
    padding: 12,
    paddingBottom: 80,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: THEME.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  eventIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: `${THEME.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    flex: 1,
    marginRight: 8,
  },
  dateChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: `${THEME.primary}15`,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
    color: THEME.primary,
  },
  eventDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  eventDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    color: THEME.primary,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  emptyStateButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: THEME.primary,
  },
  emptyStateButtonText: {
    color: THEME.white,
    fontWeight: "600",
  },
});

export default ActivityScreen;