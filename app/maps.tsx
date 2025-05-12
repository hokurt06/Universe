import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert, // Added Alert for demonstrating error messages more prominently
} from "react-native";
import MapView, { Marker, MapMarker } from "react-native-maps";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Constants from 'expo-constants'; // Import Constants to access extra config

// Assuming getCurrentLocation is available and works correctly
import { getCurrentLocation } from "../backend/location";

// Access the API key from Constants.expoConfig.extra
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey;

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles
  return distance;
};

// Location Data Interface (adjusted to match potential API response)
interface LocationData {
  id: string; // For Google Places, this will be place_id
  name: string;
  description: string; // For Google Places, this might be the address or primary type
  latitude: number;
  longitude: number;
  category: string; // For Google Places, this might be the first type or a custom mapping
  distance?: number;
  photoUrl?: string; // You'd need Google Places Photo API for real photos
  directionsUrl?: string; // Can be constructed using Google Maps URL scheme
}

// User Location State
interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Remove the hardcoded nearbyLocations array
// const nearbyLocations: LocationData[] = [...]

// Location Item View
interface LocationItemProps {
  location: LocationData;
  onPress: (location: LocationData) => void;
}

const LocationItem: React.FC<LocationItemProps> = ({ location, onPress }) => (
  <TouchableOpacity
    style={styles.locationItem}
    onPress={() => onPress(location)}
    activeOpacity={0.8}
  >
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{location.name}</Text>
      <Text style={styles.itemCategory}>{location.category}</Text>
      {location.distance !== undefined && (
        <Text style={styles.itemDistance}>
          {location.distance.toFixed(2)} miles away
        </Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#888" />
  </TouchableOpacity>
);

// Main Screen
export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationsWithDistance, setLocationsWithDistance] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      setErrorMsg(null); // Reset error message

      if (!GOOGLE_PLACES_API_KEY) {
        setErrorMsg("Google Places API Key is not configured.");
        setLoading(false);
        Alert.alert("API Key Missing", "Please configure your Google Places API Key in app.config.js or app.json.");
        return;
      }

      try {
        const location = await getCurrentLocation(); // Get user's current location
        if (!location) {
          setErrorMsg("Could not get current location. Please enable location services.");
          setLoading(false);
          return;
        }

        const userLat = location.latitude;
        const userLon = location.longitude;

        setUserLocation({
          latitude: userLat,
          longitude: userLon,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });

        // Fetch nearby places using Google Places API
        // You can adjust the radius (in meters) and types as needed
        const radius = 1609; // 1 mile radius
        const types = "university|food|restaurant|cafe|library|gym|lodging|store|park|point_of_interest"; // Specific types

        const placesApiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLat},${userLon}&radius=${radius}&type=${types}&key=${GOOGLE_PLACES_API_KEY}`;
        console.log("Places API URL being requested:", placesApiUrl);

        const response = await fetch(placesApiUrl);
        const data = await response.json();

        if (data.status !== 'OK') {
          setErrorMsg(`Google Places API Error: ${data.error_message || data.status}`);
          setLoading(false);
          return;
        }

        // Map API response to your LocationData interface
        const fetchedLocations: LocationData[] = data.results.map((place: any) => {
          const placeLat = place.geometry.location.lat;
          const placeLon = place.geometry.location.lng;
          const distance = calculateDistance(userLat, userLon, placeLat, placeLon);

          // Construct a Google Maps directions URL
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${placeLat},${placeLon}&travelmode=walking`;

          return {
            id: place.place_id,
            name: place.name,
            description: place.vicinity || place.types[0] || 'N/A', // Use vicinity or first type as description
            latitude: placeLat,
            longitude: placeLon,
            category: place.types[0] ? place.types[0].replace(/_/g, ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Other', // Capitalize first type for category
            distance: distance,
            // photoUrl: you would need to use the Google Places Photo API for real images
            directionsUrl: directionsUrl,
          };
        });

        setLocationsWithDistance(fetchedLocations);

      } catch (error: any) {
        console.error('Error fetching locations:', error);
        setErrorMsg(`Error fetching nearby locations: ${error.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []); // Empty dependency array means this runs once on mount

  const handleLocationPress = (location: LocationData) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);

      if (markerRefs.current[location.id]) {
        markerRefs.current[location.id]?.showCallout();
      }
    }
    // You could also navigate to a detail screen here:
    // router.push({ pathname: "/location-details", params: { id: location.id } });
  };

  const renderMapContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4682B4" />
          <Text style={styles.loadingText}>Loading your location and nearby places...</Text>
        </View>
      );
    }
    if (errorMsg || !userLocation) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {errorMsg || "Location unavailable. Please check permissions or API key configuration."}
          </Text>
        </View>
      );
    }
    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        region={userLocation}
        showsUserLocation={true}
      >
        {/* Render markers for all nearby locations */}
        {locationsWithDistance.map((loc) => (
          <Marker
            key={loc.id}
            ref={ref => {
              markerRefs.current[loc.id] = ref as MapMarker | null;
            }}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={`${loc.category} - ${loc.distance?.toFixed(2)} miles away`}
          />
        ))}
      </MapView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004B87" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Locations</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapContainer}>{renderMapContent()}</View>

      <View style={styles.bottomContainer}>
        <Text style={styles.sectionTitle}>Near Locations </Text>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {locationsWithDistance.length > 0 ? (
            locationsWithDistance.map((loc) => (
              <LocationItem
                key={loc.id}
                location={loc}
                onPress={handleLocationPress}
              />
            ))
          ) : (
            <Text style={styles.loadingText}>No nearby locations found or still loading...</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// Styles (no changes needed unless you want to adjust appearance)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#004B87", // Drexel Blue
    height: 90, // Increased height for status bar padding
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: StatusBar.currentHeight || 40, // Dynamic padding based on status bar height
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
  mapContainer: {
    flex: 0.5, // Map takes up half the screen
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Map fills its container
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center", // Center text
    paddingHorizontal: 20, // Add padding
  },
  bottomContainer: {
    flex: 0.5, // List takes up the other half
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#f9f9f9", // Light grey background for the list
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  scrollContainer: {
    paddingBottom: 20, // Add some padding at the bottom of the scroll view
  },
  locationItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2, // Add shadow for Android
    shadowColor: "#000", // Add shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemCategory: {
    fontSize: 13,
    color: "#004B87", // Drexel Blue for category
    marginTop: 2,
    fontWeight: "bold",
  },
  itemDistance: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});