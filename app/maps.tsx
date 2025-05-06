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
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";

// ✅ Real Fetch Function using Google Places API
async function fetchNearbyLocations(latitude: number, longitude: number): Promise<LocationData[]> {
  const apiKey = "AIzaSyCQUsFlneb_ij4IeVMNd56HPwThkXH2BDA"; // Your API Key
  const radius = 1000; // meters
  const type = "restaurant"; // Change this to 'cafe', 'library', etc., depending on the places you're looking for

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Places API Error: ${data.status}`);
    }

    return data.results.map((place: any, index: number) => ({
      id: place.place_id || `${index}`,
      name: place.name,
      description: place.vicinity || "No description available",
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    }));
  } catch (error) {
    console.error("Failed to fetch nearby locations:", error);
    throw error;
  }
}

interface LocationData {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const LocationButton: React.FC<{ location: LocationData; onPress: (loc: LocationData) => void }> = ({
  location,
  onPress,
}) => (
  <TouchableOpacity style={styles.locationButton} onPress={() => onPress(location)} activeOpacity={0.8}>
    <View style={styles.buttonContent}>
      <Text style={styles.buttonTitle}>{location.name}</Text>
      <Text style={styles.buttonDescription}>{location.description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#888" />
  </TouchableOpacity>
);

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyLocations, setNearbyLocations] = useState<LocationData[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationAndPlaces = async () => {
      try {
        // Get the user's current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Update the user location state
        const formattedLocation = {
          latitude,
          longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        };
        setUserLocation(formattedLocation);

        // Fetch nearby locations based on the user's location
        const nearby = await fetchNearbyLocations(latitude, longitude);
        setNearbyLocations(nearby);
      } catch (error: any) {
        setErrorMsg(error.message || "Could not fetch location.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndPlaces();
  }, []);

  const handleLocationPress = (location: LocationData) => {
    Alert.alert(location.name, `Location selected: ${location.description}`, [{ text: "OK" }]);
  };

  const renderMapContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4682B4" />
          <Text style={styles.loadingText}>Loading nearby locations...</Text>
        </View>
      );
    }

    if (errorMsg || !userLocation) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{errorMsg || "Location unavailable."}</Text>
        </View>
      );
    }

    return (
      <MapView style={styles.map} region={userLocation} showsUserLocation={true}>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Locations</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapContainer}>{renderMapContent()}</View>

      <View style={styles.bottomContainer}>
        <Text style={styles.sectionTitle}>Nearby Locations</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {nearbyLocations.map((loc) => (
            <LocationButton key={loc.id} location={loc} onPress={handleLocationPress} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#004B87",
    padding: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomContainer: {
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 12,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
});
