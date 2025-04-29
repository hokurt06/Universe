import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentLocation } from "../backend/location";

// Location Data
interface LocationData {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

// User Location State
interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Real nearby places (near CCI Building, Drexel)
const nearbyLocations: LocationData[] = [
  {
    id: "1",
    name: "Drexel Recreation Center",
    description: "Modern gym and fitness classes",
    latitude: 39.9566,
    longitude: -75.1914,
  },
  {
    id: "2",
    name: "Wawa (34th & Market)",
    description: "Convenience store, quick snacks",
    latitude: 39.9559,
    longitude: -75.1910,
  },
  {
    id: "3",
    name: "Sabrina's Cafe",
    description: "Popular brunch spot near campus",
    latitude: 39.9571,
    longitude: -75.1918,
  },
  {
    id: "4",
    name: "Lancaster Walk",
    description: "Nice outdoor seating, event space",
    latitude: 39.9578,
    longitude: -75.1900,
  },
];

// Location Button
interface LocationButtonProps {
  location: LocationData;
  onPress: (location: LocationData) => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ location, onPress }) => (
  <TouchableOpacity
    style={styles.locationButton}
    onPress={() => onPress(location)}
    activeOpacity={0.8}
  >
    <View style={styles.buttonContent}>
      <Text style={styles.buttonTitle}>{location.name}</Text>
      <Text style={styles.buttonDescription}>{location.description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#888" />
  </TouchableOpacity>
);

// Main Screen
export default function MapScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation({
          latitude: location?.latitude ?? 0,
          longitude: location?.longitude ?? 0,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });
      } catch (error: any) {
        setErrorMsg(error.message || "Could not fetch location.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  const handleLocationPress = (location: LocationData) => {
    Alert.alert(
      location.name,
      `Location selected: ${location.description}`,
      [{ text: "OK" }]
    );
  };

  const renderMapContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4682B4" />
          <Text style={styles.loadingText}>Loading your location...</Text>
        </View>
      );
    }
    if (errorMsg || !userLocation) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {errorMsg || "Location unavailable."}
          </Text>
        </View>
      );
    }
    return (
      <MapView
        style={styles.map}
        region={userLocation}
        showsUserLocation={true}
      >
        {nearbyLocations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={loc.description}
          />
        ))}
      </MapView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004B87" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Locations</Text>
        <View style={{ width: 24 }} /> {/* Placeholder to balance layout */}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>{renderMapContent()}</View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <Text style={styles.sectionTitle}>Near Locations </Text>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {nearbyLocations.map((loc) => (
            <LocationButton
              key={loc.id}
              location={loc}
              onPress={handleLocationPress}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#004B87", // Drexel Blue
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
  mapContainer: {
    flex: 0.5,
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  },
  bottomContainer: {
    flex: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  locationButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  buttonDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});
