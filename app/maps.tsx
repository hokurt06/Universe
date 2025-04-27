import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentLocation } from "../backend/location"; // Assuming this path is correct

// Define the interface for location data
interface LocationData {
  id: string;
  name: string;
  description: string;
  // Add latitude/longitude if needed for map focusing in handleLocationPress
  // latitude: number;
  // longitude: number;
}

// Define the interface for user location state
interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// --- Refactor 1: Moved constant data outside the component ---
// This prevents redefining the array on every render.
const nearbyLocations: LocationData[] = [
  {
    id: "1",
    name: "The Franklin Institute",
    description: "Science museum with interactive exhibits, 0.8 miles away",
  },
  {
    id: "2",
    name: "Reading Terminal Market",
    description: "Historic food market with diverse vendors, 1.2 miles away",
  },
  {
    id: "3",
    name: "Rittenhouse Square",
    description: "Vibrant park with events and greenery, 1.0 mile away",
  },
  {
    id: "4",
    name: "Sabrina's Cafe",
    description: "Cozy spot for brunch and comfort food, 0.6 miles away",
  },
];

// --- Refactor 2: Extracted Location Button into its own component ---
// This improves modularity and cleans up the main component's render method.
interface LocationButtonProps {
  location: LocationData;
  onPress: (name: string) => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({
  location,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.locationButton}
    onPress={() => onPress(location.name)}
    activeOpacity={0.8}
  >
    <View style={styles.buttonContent}>
      <Text style={styles.buttonText}>{location.name}</Text>
      <Text style={styles.buttonDescription}>{location.description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#555" />
  </TouchableOpacity>
);

// Main Screen Component
export default function MapScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true); // Ensure loading is true at the start
      setErrorMsg(null); // Clear previous errors
      try {
        const location = await getCurrentLocation();
        if (location) {
          setUserLocation({
            ...location,
            latitudeDelta: 0.01, // Smaller delta for closer zoom initially
            longitudeDelta: 0.01,
          });
        } else {
          // This case might occur if getCurrentLocation returns null without throwing
          throw new Error("Could not determine your location");
        }
      } catch (error: any) {
        const message =
          error.message || "An unknown error occurred while fetching location.";
        setErrorMsg(message);
        Alert.alert(
          "Location Error",
          `Unable to determine your current location. Please ensure location services are enabled and permissions granted.\n\nError: ${message}`,
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false); // Set loading to false in both success and error cases
      }
    };

    fetchLocation();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleLocationPress = (locationName: string) => {
    // In a real app, you might use the location's coordinates
    // to pan/zoom the map using mapRef.current.animateToRegion(...)
    Alert.alert(
      "Location Selected",
      `You selected ${locationName}. In a complete app, the map would focus on this location.`,
      [{ text: "OK" }]
    );
  };

  // Helper function to render map content based on state
  const renderMapContent = () => {
    if (loading) {
      return (
        <View style={[styles.map, styles.loadingContainer]}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      );
    }
    if (errorMsg || !userLocation) {
      return (
        <View style={[styles.map, styles.loadingContainer]}>
          <Text style={styles.loadingText}>
            {errorMsg || "Unable to load map. Location not available."}
          </Text>
        </View>
      );
    }
    // Only render MapView if we have a location and no error
    return (
      <MapView
        style={styles.map}
        region={userLocation}
        showsUserLocation={true}
        followsUserLocation={true} // Might want to disable if user manually pans
      >
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="You are here"
          description="Your current location"
          pinColor="blue" // Consider using a custom marker icon
        />
        {/* Optional: Add markers for nearby locations if they have coordinates */}
        {/* {nearbyLocations.map(loc => (
          loc.latitude && loc.longitude ? (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              title={loc.name}
              description={loc.description.split(',')[0]} // Shorter description
            />
          ) : null
        ))} */}
      </MapView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4682B4" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/")} // Or router.back() if appropriate
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Nearby Places</Text>
        {/* Placeholder for potential right-side header actions */}
        <View style={{ width: 40 }} />
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>{renderMapContent()}</View>

      {/* Location List Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.sectionTitle}>Locations Near You</Text>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false} // Hide scroll bar if desired
        >
          {nearbyLocations.map((location) => (
            <LocationButton
              key={location.id}
              location={location}
              onPress={handleLocationPress}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// Styles remain largely the same, added/adjusted a few
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 100, // Adjust height as needed, consider using react-native-safe-area-context
    backgroundColor: "#4682B4", // Steel Blue
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Better alignment
    paddingTop: StatusBar.currentHeight || 40, // Use StatusBar height or fallback
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    // Removed flex: 1 and marginRight as space-between handles positioning
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    // Slightly less intense background for subtlety
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  mapContainer: {
    flex: 0.5, // Represents 50% of the available space below header
    width: "100%",
    backgroundColor: "#e0e0e0", // Background color while map loads/fails
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Ensures map fills its container
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Light grey background for loading/error state
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  bottomSection: {
    flex: 0.5, // Represents 50% of the available space
    backgroundColor: "#f8f9fa", // Very light grey, almost white
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1, // Add a subtle separator line
    borderTopColor: "#eaeaea",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600", // Semibold
    color: "#333", // Darker grey for title
    marginBottom: 12,
  },
  scrollView: {
    flex: 1, // Ensures ScrollView takes available space in bottomSection
  },
  scrollContentContainer: {
    paddingBottom: 16, // Add padding at the bottom of the scrollable content
  },
  // Styles specific to the LocationButton component (kept here for simplicity)
  locationButton: {
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    // Android Elevation
    elevation: 2,
    // Subtle border
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  buttonContent: {
    flex: 1, // Allow content to take up space, pushing icon to the right
    marginRight: 8, // Add space between text content and chevron icon
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600", // Semibold
    color: "#333",
  },
  buttonDescription: {
    fontSize: 14,
    color: "#666", // Slightly lighter grey for description
    marginTop: 4,
  },
});
