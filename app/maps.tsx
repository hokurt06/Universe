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
import { getCurrentLocation } from "../backend/location";

interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const nearbyLocations = [
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

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation({
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        setErrorMsg("Could not determine your location");
        Alert.alert(
          "Location Error",
          "Unable to determine your current location. Please enable location permissions and try again.",
          [{ text: "OK" }]
        );
      }
      setLoading(false);
    };

    fetchLocation();
  }, []);

  const handleLocationPress = (locationName: string) => {
    Alert.alert(
      "Location Selected",
      `You selected ${locationName}. In a complete app, the map would focus on this location.`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Nearby Places</Text>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {userLocation ? (
          <MapView
            style={styles.map}
            region={userLocation}
            showsUserLocation={true}
            followsUserLocation={true}
          >
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="You are here"
              description="Your current location"
              pinColor="blue"
            />
          </MapView>
        ) : (
          <View style={[styles.map, styles.loadingContainer]}>
            <Text style={styles.loadingText}>
              {loading ? "Loading map..." : errorMsg || "Unable to load map"}
            </Text>
          </View>
        )}
      </View>

      {/* Location List */}
      <View style={styles.bottomSection}>
        <Text style={styles.sectionTitle}>Locations Near You</Text>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.buttonContainer}
        >
          {nearbyLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={styles.locationButton}
              onPress={() => handleLocationPress(location.name)}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{location.name}</Text>
                <Text style={styles.buttonDescription}>
                  {location.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 100,
    backgroundColor: "#4682B4",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  mapContainer: {
    flex: 0.5,
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  bottomSection: {
    flex: 0.5,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 16,
  },
  locationButton: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  buttonContent: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  buttonDescription: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
});
