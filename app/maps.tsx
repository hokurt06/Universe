import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text, // Make sure Text is imported
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, MapMarker } from "react-native-maps"; // Import MapMarker type
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Assuming getCurrentLocation is available and works correctly
// import { getCurrentLocation } from "../backend/location";

// Mock getCurrentLocation for demonstration if the actual backend file is not available
interface Location {
  latitude: number;
  longitude: number;
}

const getCurrentLocation = async (): Promise<Location> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        latitude: 39.9566, // Mocking a location near Drexel
        longitude: -75.1914, // Mocking a location near Drexel
      });
    }, 1500); // Simulate a network request delay
  });
};

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

// Location Data
interface LocationData {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  distance?: number;
  photoUrl?: string;
  directionsUrl?: string;
}

// User Location State
interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Real Drexel University Campus Locations (with categories and example URLs)
const nearbyLocations: LocationData[] = [
  {
    id: "1",
    name: "Drexel Recreation Center",
    description: "Modern gym, fitness classes, and athletic facilities.",
    latitude: 39.9566,
    longitude: -75.1914,
    category: "Recreation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rec+Center", // Example placeholder URL
    directionsUrl: "http://maps.google.com/?q=Drexel+Recreation+Center", // Example Google Maps URL
  },
  {
    id: "2",
    name: "Wawa (34th & Market)",
    description: "Convenience store for quick snacks, drinks, and hoagies.",
    latitude: 39.9559,
    longitude: -75.1910,
    category: "Food/Convenience",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Wawa",
    directionsUrl: "http://maps.google.com/?q=Wawa+34th+Market+Philadelphia",
  },
  {
    id: "3",
    name: "Sabrina's Cafe",
    description: "Popular brunch and breakfast restaurant near campus.",
    latitude: 39.9571,
    longitude: -75.1918,
    category: "Food",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Sabrina's+Cafe",
    directionsUrl: "http://maps.google.com/?q=Sabrina's+Cafe+University+City",
  },
  {
    id: "4",
    name: "Lancaster Walk",
    description: "Pedestrian walkway with outdoor seating and event space.",
    latitude: 39.9578,
    longitude: -75.1900,
    category: "Campus Landmark",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Lancaster+Walk",
    directionsUrl: "http://maps.google.com/?q=Lancaster+Walk+Drexel+University",
  },
  {
    id: "5",
    name: "Main Building",
    description: "Historic building housing university administration and classrooms.",
    latitude: 39.9540,
    longitude: -75.1930,
    category: "Academic/Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Main+Building",
    directionsUrl: "http://maps.google.com/?q=Drexel+Main+Building",
  },
  {
    id: "6",
    name: "Gerri C. LeBow Hall",
    description: "Home to the LeBow College of Business.",
    latitude: 39.9548,
    longitude: -75.1925,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=LeBow+Hall",
    directionsUrl: "http://maps.google.com/?q=Gerri+C.+LeBow+Hall+Drexel",
  },
  {
    id: "7",
    name: "Creese Student Union",
    description: "Student services, dining options, and event spaces.",
    latitude: 39.9555,
    longitude: -75.1920,
    category: "Student Services/Food",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Creese+Student+Union",
    directionsUrl: "http://maps.google.com/?q=Creese+Student+Union+Drexel",
  },
  {
    id: "8",
    name: "W. W. Hagerty Library",
    description: "Main university library with study spaces and resources.",
    latitude: 39.9560,
    longitude: -75.1928,
    category: "Study Place/Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Hagerty+Library",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+Drexel",
  },
  {
    id: "9",
    name: "MacAlister Hall",
    description: "Houses various academic departments and classrooms.",
    latitude: 39.9550,
    longitude: -75.1935,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=MacAlister+Hall",
    directionsUrl: "http://maps.google.com/?q=MacAlister+Hall+Drexel",
  },
  {
    id: "10",
    name: "Pearlstein Gallery",
    description: "University art gallery showcasing diverse exhibitions.",
    latitude: 39.9575,
    longitude: -75.1910,
    category: "Arts/Culture",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Pearlstein+Gallery",
    directionsUrl: "http://maps.google.com/?q=Pearlstein+Gallery+Drexel",
  },
  {
    id: "11",
    name: "Vidas Athletic Complex",
    description: "Outdoor athletic fields for various sports.",
    latitude: 39.9600,
    longitude: -75.1950,
    category: "Recreation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Vidas+Complex",
    directionsUrl: "http://maps.google.com/?q=Vidas+Athletic+Complex+Drexel",
  },
  {
    id: "12",
    name: "Nesbitt Hall",
    description: "College of Nursing and Health Professions building.",
    latitude: 39.9542,
    longitude: -75.1942,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Nesbitt+Hall",
    directionsUrl: "http://maps.google.com/?q=Nesbitt+Hall+Drexel",
  },
  {
    id: "13",
    name: "Stratton Hall",
    description: "Academic building with classrooms and labs.",
    latitude: 39.9535,
    longitude: -75.1938,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Stratton+Hall",
    directionsUrl: "http://maps.google.com/?q=Stratton+Hall+Drexel",
  },
  {
    id: "14",
    name: "Randell Hall",
    description: "Houses the College of Arts and Sciences.",
    latitude: 39.9530,
    longitude: -75.1935,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Randell+Hall",
    directionsUrl: "http://maps.google.com/?q=Randell+Hall+Drexel",
  },
  {
    id: "15",
    name: "Curtis Hall",
    description: "Academic building with classrooms and offices.",
    latitude: 39.9525,
    longitude: -75.1932,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Curtis+Hall",
    directionsUrl: "http://maps.google.com/?q=Curtis+Hall+Drexel",
  },
  {
    id: "16",
    name: "CAT Building (Center for Automation Technology)",
    description: "Houses engineering and technology programs.",
    latitude: 39.9568,
    longitude: -75.1945,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=CAT+Building",
    directionsUrl: "http://maps.google.com/?q=CAT+Building+Drexel",
  },
  {
    id: "17",
    name: "Bossone Research Center",
    description: "Interdisciplinary research facility.",
    latitude: 39.9572,
    longitude: -75.1950,
    category: "Academic/Research",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Bossone+Research+Center",
    directionsUrl: "http://maps.google.com/?q=Bossone+Research+Center+Drexel",
  },
  {
    id: "18",
    name: "Biomedical Engineering and Biotechnology Building",
    description: "Houses BME and Biotech departments.",
    latitude: 39.9576,
    longitude: -75.1955,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=BME+Biotech+Building",
    directionsUrl: "http://maps.google.com/?q=Biomedical+Engineering+Building+Drexel",
  },
  {
    id: "19",
    name: "Papadakis Integrated Sciences Building (PISB)",
    description: "Modern science building with labs and classrooms.",
    latitude: 39.9580,
    longitude: -75.1960,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=PISB",
    directionsUrl: "http://maps.google.com/?q=Papadakis+Integrated+Sciences+Building+Drexel",
  },
  {
    id: "20",
    name: "Academic Building",
    description: "General purpose academic building.",
    latitude: 39.9584,
    longitude: -75.1965,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Academic+Building",
    directionsUrl: "http://maps.google.com/?q=Academic+Building+Drexel",
  },
  {
    id: "21",
    name: "Hill Hall",
    description: "Academic and administrative offices.",
    latitude: 39.9588,
    longitude: -75.1970,
    category: "Academic/Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Hill+Hall",
    directionsUrl: "http://maps.google.com/?q=Hill+Hall+Drexel",
  },
  {
    id: "22",
    name: "Kelly Hall",
    description: "Academic building.",
    latitude: 39.9592,
    longitude: -75.1975,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Kelly+Hall",
    directionsUrl: "http://maps.google.com/?q=Kelly+Hall+Drexel",
  },
  {
    id: "23",
    name: "Towers Hall",
    description: "Residence hall.",
    latitude: 39.9550,
    longitude: -75.1950,
    category: "Residence Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Towers+Hall",
    directionsUrl: "http://maps.google.com/?q=Towers+Hall+Drexel",
  },
  {
    id: "24",
    name: "Van Rensselaer Hall",
    description: "Residence hall.",
    latitude: 39.9555,
    longitude: -75.1955,
    category: "Residence Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Van+Rensselaer+Hall",
    directionsUrl: "http://maps.google.com/?q=Van+Rensselaer+Hall+Drexel",
  },
  {
    id: "25",
    name: "Myers Hall",
    description: "Residence hall.",
    latitude: 39.9560,
    longitude: -75.1960,
    category: "Residence Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Myers+Hall",
    directionsUrl: "http://maps.google.com/?q=Myers+Hall+Drexel",
  },
  {
    id: "26",
    name: "Race Street Residence Hall",
    description: "Large residence hall complex.",
    latitude: 39.9565,
    longitude: -75.1965,
    category: "Residence Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Race+Street+Hall",
    directionsUrl: "http://maps.google.com/?q=Race+Street+Residence+Hall+Drexel",
  },
  {
    id: "27",
    name: "Bentley Hall",
    description: "Residence hall.",
    latitude: 39.9570,
    longitude: -75.1970,
    category: "Residence Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Bentley+Hall",
    directionsUrl: "http://maps.google.com/?q=Bentley+Hall+Drexel",
  },
  {
    id: "28",
    name: "Caneris Hall",
    description: "Residence hall.",
    latitude: 39.9575,
    longitude: -75.1975,
    category: "Residence Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Caneris+Hall",
    directionsUrl: "http://maps.google.com/?q=Caneris+Hall+Drexel",
  },
  {
    id: "29",
    name: "North Hall",
    description: "Residence hall.",
    latitude: 39.9580,
    longitude: -75.1980,
    category: "Residence Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=North+Hall",
    directionsUrl: "http://maps.google.com/?q=North+Hall+Drexel",
  },
  {
    id: "30",
    name: "University Crossings",
    description: "Apartment-style student housing.",
    latitude: 39.9585,
    longitude: -75.1985,
    category: "Residence Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=University+Crossings",
    directionsUrl: "http://maps.google.com/?q=University+Crossings+Drexel",
  },
  {
    id: "31",
    name: "The Summit",
    description: "Student apartment building.",
    latitude: 39.9590,
    longitude: -75.1990,
    category: "Residence Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=The+Summit",
    directionsUrl: "http://maps.google.com/?q=The+Summit+Drexel",
  },
  {
    id: "32",
    name: "Chestnut Square",
    description: "Mixed-use building with student housing and retail.",
    latitude: 39.9530,
    longitude: -75.1910,
    category: "Mixed Use",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Chestnut+Square",
    directionsUrl: "http://maps.google.com/?q=Chestnut+Square+Philadelphia",
  },
  {
    id: "33",
    name: "The Study at University City",
    description: "Hotel and event space near campus.",
    latitude: 39.9518,
    longitude: -75.1958,
    category: "Hotel/Event Space",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=The+Study+Hotel",
    directionsUrl: "http://maps.google.com/?q=The+Study+at+University+City",
  },
  {
    id: "34",
    name: "Drexel University Bookstore",
    description: "Campus bookstore for textbooks, apparel, and supplies.",
    latitude: 39.9552,
    longitude: -75.1905,
    category: "Retail",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Drexel+Bookstore",
    directionsUrl: "http://maps.google.com/?q=Drexel+University+Bookstore",
  },
  {
    id: "35",
    name: "Campus Express",
    description: "Convenience store in the Creese Student Union.",
    latitude: 39.9556,
    longitude: -75.1922,
    category: "Food/Convenience",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Campus+Express",
    directionsUrl: "http://maps.google.com/?q=Campus+Express+Drexel",
  },
  {
    id: "36",
    name: "Starbucks (Gerri C. LeBow Hall)",
    description: "Campus Starbucks location.",
    latitude: 39.9549,
    longitude: -75.1927,
    category: "Food/Cafe",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Starbucks+LeBow",
    directionsUrl: "http://maps.google.com/?q=Starbucks+LeBow+Hall+Drexel",
  },
  {
    id: "37",
    name: "Chick-fil-A (Creese Student Union)",
    description: "Dining option in the Creese Student Union.",
    latitude: 39.9557,
    longitude: -75.1921,
    category: "Food",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Chick-fil-A+Creese",
    directionsUrl: "http://maps.google.com/?q=Chick-fil-A+Creese+Student+Union+Drexel",
  },
  {
    id: "38",
    name: "Urban Eatery",
    description: "Dining hall in the Creese Student Union.",
    latitude: 39.9558,
    longitude: -75.1923,
    category: "Food/Dining Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Urban+Eatery",
    directionsUrl: "http://maps.google.com/?q=Urban+Eatery+Drexel",
  },
  {
    id: "39",
    name: "Handschumacher Dining Center",
    description: "Main campus dining hall.",
    latitude: 39.9562,
    longitude: -75.1958,
    category: "Food/Dining Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Handschumacher+Dining",
    directionsUrl: "http://maps.google.com/?q=Handschumacher+Dining+Center+Drexel",
  },
  {
    id: "40",
    name: "Northside Dining Terrace",
    description: "Dining options in North Hall.",
    latitude: 39.9581,
    longitude: -75.1982,
    category: "Food/Dining Hall",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Northside+Dining",
    directionsUrl: "http://maps.google.com/?q=Northside+Dining+Terrace+Drexel",
  },
  {
    id: "41",
    name: "Drexel Central",
    description: "Student services for billing, financial aid, and registration.",
    latitude: 39.9545,
    longitude: -75.1920,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Drexel+Central",
    directionsUrl: "http://maps.google.com/?q=Drexel+Central",
  },
  {
    id: "42",
    name: "Student Health Center",
    description: "On-campus health services for students.",
    latitude: 39.9550,
    longitude: -75.1915,
    category: "Student Services/Health",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Student+Health+Center",
    directionsUrl: "http://maps.google.com/?q=Drexel+Student+Health+Center",
  },
  {
    id: "43",
    name: "Counseling Center",
    description: "Mental health counseling services for students.",
    latitude: 39.9552,
    longitude: -75.1917,
    category: "Student Services/Health",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Counseling+Center",
    directionsUrl: "http://maps.google.com/?q=Drexel+Counseling+Center",
  },
  {
    id: "44",
    name: "Career Services",
    description: "Assistance with co-ops, internships, and job searching.",
    latitude: 39.9547,
    longitude: -75.1922,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Career+Services",
    directionsUrl: "http://maps.google.com/?q=Steinbright+Career+Development+Center+Drexel",
  },
  {
    id: "45",
    name: "Admissions Office",
    description: "University admissions information and tours.",
    latitude: 39.9538,
    longitude: -75.1932,
    category: "Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Admissions+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+Admissions+Office",
  },
  {
    id: "46",
    name: "International Students and Scholars Services (ISSS)",
    description: "Support for international students.",
    latitude: 39.9549,
    longitude: -75.1918,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=ISSS+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+ISSS+Office",
  },
  {
    id: "47",
    name: "Office of Equality and Diversity",
    description: "Promoting diversity and inclusion on campus.",
    latitude: 39.9540,
    longitude: -75.1928,
    category: "Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Equality+Diversity+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+Office+of+Equality+and+Diversity",
  },
  {
    id: "48",
    name: "Public Safety Building",
    description: "Campus police and security services.",
    latitude: 39.9570,
    longitude: -75.1938,
    category: "Campus Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Public+Safety",
    directionsUrl: "http://maps.google.com/?q=Drexel+Public+Safety+Building",
  },
  {
    id: "49",
    name: "Parking Garage (33rd & Market)",
    description: "University parking garage.",
    latitude: 39.9562,
    longitude: -75.1935,
    category: "Parking",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Parking+33rd+Market",
    directionsUrl: "http://maps.google.com/?q=Drexel+Parking+Garage+33rd+Market",
  },
  {
    id: "50",
    name: "Parking Garage (34th & Chestnut)",
    description: "University parking garage.",
    latitude: 39.9530,
    longitude: -75.1915,
    category: "Parking",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Parking+34th+Chestnut",
    directionsUrl: "http://maps.google.com/?q=Drexel+Parking+Garage+34th+Chestnut",
  },
  {
    id: "51",
    name: "SEPTA Trolley Stop (33rd & Market)",
    description: "Public transportation stop.",
    latitude: 39.9560,
    longitude: -75.1938,
    category: "Transportation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Trolley+Stop",
    directionsUrl: "http://maps.google.com/?q=SEPTA+Trolley+33rd+Market+Philadelphia",
  },
  {
    id: "52",
    name: "Market-Frankford Line (34th St Station)",
    description: "Subway station.",
    latitude: 39.9560,
    longitude: -75.1912,
    category: "Transportation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=MFL+34th+St",
    directionsUrl: "http://maps.google.com/?q=34th+St+Station+Market-Frankford+Line+Philadelphia",
  },
  {
    id: "53",
    name: "University City Station (SEPTA)",
    description: "Regional Rail station.",
    latitude: 39.9535,
    longitude: -75.1950,
    category: "Transportation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=University+City+Station",
    directionsUrl: "http://maps.google.com/?q=University+City+Station+SEPTA",
  },
  {
    id: "54",
    name: "Drexel Dragon Statue",
    description: "Popular meeting point and campus landmark.",
    latitude: 39.9550,
    longitude: -75.1925,
    category: "Campus Landmark",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Dragon+Statue",
    directionsUrl: "http://maps.google.com/?q=Drexel+Dragon+Statue",
  },
  {
    id: "55",
    name: "Perelman Plaza",
    description: "Outdoor plaza area on campus.",
    latitude: 39.9548,
    longitude: -75.1932,
    category: "Campus Landmark",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Perelman+Plaza",
    directionsUrl: "http://maps.google.com/?q=Perelman+Plaza+Drexel",
  },
  {
    id: "56",
    name: "Mario the Magnificent Statue",
    description: "Statue of Drexel's mascot.",
    latitude: 39.9568,
    longitude: -75.1918,
    category: "Campus Landmark",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Mario+Statue",
    directionsUrl: "http://maps.google.com/?q=Mario+the+Magnificent+Statue+Drexel",
  },
  {
    id: "57",
    name: "Rush Building",
    description: "Academic building.",
    latitude: 39.9520,
    longitude: -75.1928,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rush+Building",
    directionsUrl: "http://maps.google.com/?q=Rush+Building+Drexel",
  },
  {
    id: "58",
    name: "Disque Hall",
    description: "Academic building.",
    latitude: 39.9515,
    longitude: -75.1925,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Disque+Hall",
    directionsUrl: "http://maps.google.com/?q=Disque+Hall+Drexel",
  },
  {
    id: "59",
    name: "Stratton Skyspace",
    description: "Art installation and gathering space.",
    latitude: 39.9536,
    longitude: -75.1939,
    category: "Arts/Culture",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Stratton+Skyspace",
    directionsUrl: "http://maps.google.com/?q=Stratton+Skyspace+Drexel",
  },
  {
    id: "60",
    name: "Steinbright Career Development Center",
    description: "Co-op and career services building.",
    latitude: 39.9547,
    longitude: -75.1922,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Steinbright+Center",
    directionsUrl: "http://maps.google.com/?q=Steinbright+Career+Development+Center+Drexel",
  },
  {
    id: "61",
    name: "College of Computing and Informatics (CCI)",
    description: "Home to computer science and information science programs.",
    latitude: 39.9565,
    longitude: -75.1930,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=CCI+Building",
    directionsUrl: "http://maps.google.com/?q=College+of+Computing+and+Informatics+Drexel",
  },
  {
    id: "62",
    name: "Paul Peck Problem Solving and Research Building",
    description: "Academic and research building.",
    latitude: 39.9568,
    longitude: -75.1933,
    category: "Academic/Research",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Paul+Peck+Building",
    directionsUrl: "http://maps.google.com/?q=Paul+Peck+Problem+Solving+and+Research+Building+Drexel",
  },
  {
    id: "63",
    name: "Kline Institute of Trial Advocacy",
    description: "Law school building.",
    latitude: 39.9570,
    longitude: -75.1936,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Kline+Institute",
    directionsUrl: "http://maps.google.com/?q=Kline+Institute+of+Trial+Advocacy+Drexel",
  },
  {
    id: "64",
    name: "Drexel University College of Medicine (Queen Lane Campus)",
    description: "Medical school campus (Note: Further from main campus).",
    latitude: 40.0371,
    longitude: -75.1828,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Queen+Lane+Campus",
    directionsUrl: "http://maps.google.com/?q=Drexel+College+of+Medicine+Queen+Lane+Campus",
  },
  {
    id: "65",
    name: "New College Building (College of Medicine)",
    description: "College of Medicine building near Hahnemann Hospital (Note: Further from main campus).",
    latitude: 39.9575,
    longitude: -75.1630,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=New+College+Building",
    directionsUrl: "http://maps.google.com/?q=New+College+Building+Drexel",
  },
  {
    id: "66",
    name: "Academy of Natural Sciences of Drexel University",
    description: "Natural history museum affiliated with Drexel.",
    latitude: 39.9577,
    longitude: -75.1740,
    category: "Arts/Culture",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Academy+of+Natural+Sciences",
    directionsUrl: "http://maps.google.com/?q=Academy+of+Natural+Sciences+of+Drexel+University",
  },
  {
    id: "67",
    name: "Drexel University Online",
    description: "Office for online learning programs.",
    latitude: 39.9540,
    longitude: -75.1918,
    category: "Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Drexel+Online",
    directionsUrl: "http://maps.google.com/?q=Drexel+University+Online+Office",
  },
  {
    id: "68",
    name: "URBN Center",
    description: "Home to the Antoinette Westphal College of Media Arts & Design.",
    latitude: 39.9585,
    longitude: -75.1905,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=URBN+Center",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Drexel",
  },
  {
    id: "69",
    name: "URBN Center Annex",
    description: "Additional facilities for Media Arts & Design.",
    latitude: 39.9588,
    longitude: -75.1908,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=URBN+Center+Annex",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Annex+Drexel",
  },
  {
    id: "70",
    name: "ExCITe Center (Expressive & Creative Interaction Technologies)",
    description: "Interdisciplinary research and learning space.",
    latitude: 39.9572,
    longitude: -75.1900,
    category: "Academic/Research",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=ExCITe+Center",
    directionsUrl: "http://maps.google.com/?q=ExCITe+Center+Drexel",
  },
  {
    id: "71",
    name: "Drexel Solutions",
    description: "University-wide resource connecting industry with Drexel expertise.",
    latitude: 39.9542,
    longitude: -75.1916,
    category: "Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Drexel+Solutions",
    directionsUrl: "http://maps.google.com/?q=Drexel+Solutions",
  },
  {
    id: "72",
    name: "Close School of Entrepreneurship",
    description: "Focuses on entrepreneurial education.",
    latitude: 39.9550,
    longitude: -75.1928,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Close+School",
    directionsUrl: "http://maps.google.com/?q=Close+School+of+Entrepreneurship+Drexel",
  },
  {
    id: "73",
    name: "Honors College",
    description: "Programs for honors students.",
    latitude: 39.9544,
    longitude: -75.1930,
    category: "Academic/Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Honors+College",
    directionsUrl: "http://maps.google.com/?q=Drexel+Honors+College",
  },
  {
    id: "74",
    name: "Graduate College",
    description: "Services for graduate students.",
    latitude: 39.9546,
    longitude: -75.1932,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Graduate+College",
    directionsUrl: "http://maps.google.com/?q=Drexel+Graduate+College",
  },
  {
    id: "75",
    name: "Study Abroad Office",
    description: "Information on international study opportunities.",
    latitude: 39.9548,
    longitude: -75.1934,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Study+Abroad+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+Study+Abroad+Office",
  },
  {
    id: "76",
    name: "Office of Undergraduate Research",
    description: "Support for undergraduate research opportunities.",
    latitude: 39.9550,
    longitude: -75.1936,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Undergraduate+Research+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+Office+of+Undergraduate+Research",
  },
  {
    id: "77",
    name: "Writing Center",
    description: "Academic support for writing.",
    latitude: 39.9552,
    longitude: -75.1938,
    category: "Academic Support",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Writing+Center",
    directionsUrl: "http://maps.google.com/?q=Drexel+Writing+Center",
  },
  {
    id: "78",
    name: "Math Resource Center",
    description: "Academic support for mathematics.",
    latitude: 39.9554,
    longitude: -75.1940,
    category: "Academic Support",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Math+Resource+Center",
    directionsUrl: "http://maps.google.com/?q=Drexel+Math+Resource+Center",
  },
  {
    id: "79",
    name: "Academic Advising",
    description: "Guidance on academic planning.",
    latitude: 39.9556,
    longitude: -75.1942,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Academic+Advising",
    directionsUrl: "http://maps.google.com/?q=Drexel+Academic+Advising",
  },
  {
    id: "80",
    name: "Registrar's Office",
    description: "Student records and registration.",
    latitude: 39.9558,
    longitude: -75.1944,
    category: "Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Registrar's+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+Registrar's+Office",
  },
  {
    id: "81",
    name: "Bursar's Office",
    description: "Student billing and payments.",
    latitude: 39.9560,
    longitude: -75.1946,
    category: "Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Bursar's+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+Bursar's+Office",
  },
  {
    id: "82",
    name: "Financial Aid Office",
    description: "Assistance with financial aid.",
    latitude: 39.9562,
    longitude: -75.1948,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Financial+Aid+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+Financial+Aid+Office",
  },
  {
    id: "83",
    name: "Student Life Office",
    description: "Information on student organizations and activities.",
    latitude: 39.9554,
    longitude: -75.1924,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Student+Life+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+Student+Life+Office",
  },
  {
    id: "84",
    name: "Campus Engagement Office",
    description: "Involvement and leadership opportunities.",
    latitude: 39.9556,
    longitude: -75.1926,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Campus+Engagement+Office",
    directionsUrl: "http://maps.google.com/?q=Drexel+Campus+Engagement+Office",
  },
  {
    id: "85",
    name: "Disability Resources",
    description: "Support services for students with disabilities.",
    latitude: 39.9558,
    longitude: -75.1928,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Disability+Resources",
    directionsUrl: "http://maps.google.com/?q=Drexel+Disability+Resources",
  },
  {
    id: "86",
    name: "Veteran Student Services",
    description: "Support for student veterans.",
    latitude: 39.9560,
    longitude: -75.1930,
    category: "Student Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Veteran+Student+Services",
    directionsUrl: "http://maps.google.com/?q=Drexel+Veteran+Student+Services",
  },
  {
    id: "87",
    name: "Information Technology (IT) Support",
    description: "Tech support for students.",
    latitude: 39.9562,
    longitude: -75.1932,
    category: "Student Services/Tech",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=IT+Support",
    directionsUrl: "http://maps.google.com/?q=Drexel+IT+Support",
  },
  {
    id: "88",
    name: "University Archives",
    description: "Historical records of the university.",
    latitude: 39.9564,
    longitude: -75.1934,
    category: "Library/Archives",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=University+Archives",
    directionsUrl: "http://maps.google.com/?q=Drexel+University+Archives",
  },
  {
    id: "89",
    name: "Picture Collection (Hagerty Library)",
    description: "Visual resources collection.",
    latitude: 39.9561,
    longitude: -75.1929,
    category: "Library",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Picture+Collection+Hagerty",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+Picture+Collection+Drexel",
  },
  {
    id: "90",
    name: "Special Collections (Hagerty Library)",
    description: "Rare books and manuscripts.",
    latitude: 39.9562,
    longitude: -75.1930,
    category: "Library",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Special+Collections+Hagerty",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+Special+Collections+Drexel",
  },
  {
    id: "91",
    name: "Library Learning Terrace",
    description: "Collaborative study space in the library.",
    latitude: 39.9563,
    longitude: -75.1931,
    category: "Study Place/Library",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Learning+Ter",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+Learning+Terrace+Drexel",
  },
  {
    id: "92",
    name: "One Button Studio (Hagerty Library)",
    description: "Simple video recording studio.",
    latitude: 39.9564,
    longitude: -75.1932,
    category: "Library/Resources",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=One+Button+Studio",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+One+Button+Studio+Drexel",
  },
  {
    id: "93",
    name: "Presentation Practice Room (Hagerty Library)",
    description: "Space to practice presentations.",
    latitude: 39.9565,
    longitude: -75.1933,
    category: "Library/Resources",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Presentation+Room",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+Presentation+Practice+Room+Drexel",
  },
  {
    id: "94",
    name: "Group Study Rooms (Hagerty Library)",
    description: "Rooms for group study sessions.",
    latitude: 39.9566,
    longitude: -75.1934,
    category: "Study Place/Library",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Group+Study+Rooms",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+Group+Study+Rooms+Drexel",
  },
  {
    id: "95",
    name: "Quiet Study Area (Hagerty Library)",
    description: "Designated quiet study space.",
    latitude: 39.9567,
    longitude: -75.1935,
    category: "Study Place/Library",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Quiet+Study+Area",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+Quiet+Study+Area+Drexel",
  },
  {
    id: "96",
    name: "Printing Stations (Hagerty Library)",
    description: "Printers and copiers available.",
    latitude: 39.9568,
    longitude: -75.1936,
    category: "Library/Resources",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Printing+Stations",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+Printing+Stations+Drexel",
  },
  {
    id: "97",
    name: "IT Help Desk (Hagerty Library)",
    description: "On-site tech support.",
    latitude: 39.9569,
    longitude: -75.1937,
    category: "Library/Tech",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=IT+Help+Desk+Hagerty",
    directionsUrl: "http://maps.google.com/?q=Hagerty+Library+IT+Help+Desk+Drexel",
  },
  {
    id: "98",
    name: "Academic Bistro",
    description: "Student-run restaurant in Nesbitt Hall.",
    latitude: 39.9543,
    longitude: -75.1943,
    category: "Food",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Academic+Bistro",
    directionsUrl: "http://maps.google.com/?q=Academic+Bistro+Drexel",
  },
  {
    id: "99",
    name: "Drexel Food Lab",
    description: "Culinary research and development space.",
    latitude: 39.9544,
    longitude: -75.1944,
    category: "Academic/Food",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Food+Lab",
    directionsUrl: "http://maps.google.com/?q=Drexel+Food+Lab",
  },
  {
    id: "100",
    name: "Center for Food and Hospitality Management",
    description: "Academic center for hospitality programs.",
    latitude: 39.9545,
    longitude: -75.1945,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Hospitality+Center",
    directionsUrl: "http://maps.google.com/?q=Center+for+Food+and+Hospitality+Management+Drexel",
  },
  {
    id: "101",
    name: "Mandell Theater",
    description: "Performing arts venue on campus.",
    latitude: 39.9528,
    longitude: -75.1920,
    category: "Arts/Culture",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Mandell+Theater",
    directionsUrl: "http://maps.google.com/?q=Mandell+Theater+Drexel",
  },
  {
    id: "102",
    name: "Leonard Pearlstein Gallery",
    description: "Contemporary art gallery.",
    latitude: 39.9575,
    longitude: -75.1910,
    category: "Arts/Culture",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Pearlstein+Gallery",
    directionsUrl: "http://maps.google.com/?q=Leonard+Pearlstein+Gallery+Drexel",
  },
  {
    id: "103",
    name: "Drexel Collection",
    description: "University art collection.",
    latitude: 39.9540,
    longitude: -75.1930, // Located within Main Building
    category: "Arts/Culture",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Drexel+Collection",
    directionsUrl: "http://maps.google.com/?q=Drexel+Collection",
  },
  {
    id: "104",
    name: "Rehearsal Studios (URBN Center)",
    description: "Practice spaces for performing arts.",
    latitude: 39.9586,
    longitude: -75.1906,
    category: "Academic/Arts",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rehearsal+Studios+URBN",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Rehearsal+Studios+Drexel",
  },
  {
    id: "105",
    name: "Sound Recording Studios (URBN Center)",
    description: "Facilities for audio recording.",
    latitude: 39.9587,
    longitude: -75.1907,
    category: "Academic/Arts",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Recording+Studios+URBN",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Recording+Studios+Drexel",
  },
  {
    id: "106",
    name: "Film Production Studios (URBN Center)",
    description: "Facilities for film and video production.",
    latitude: 39.9588,
    longitude: -75.1908,
    category: "Academic/Arts",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Film+Studios+URBN",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Film+Production+Studios+Drexel",
  },
  {
    id: "107",
    name: "Photography Studios (URBN Center)",
    description: "Facilities for photography.",
    latitude: 39.9589,
    longitude: -75.1909,
    category: "Academic/Arts",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Photography+Studios+URBN",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Photography+Studios+Drexel",
  },
  {
    id: "108",
    name: "Fashion Design Studios (URBN Center)",
    description: "Spaces for fashion design students.",
    latitude: 39.9590,
    longitude: -75.1910,
    category: "Academic/Arts",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Fashion+Studios+URBN",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Fashion+Design+Studios+Drexel",
  },
  {
    id: "109",
    name: "Graphic Design Studios (URBN Center)",
    description: "Spaces for graphic design students.",
    latitude: 39.9591,
    longitude: -75.1911,
    category: "Academic/Arts",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Graphic+Design+Studios+URBN",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Graphic+Design+Studios+Drexel",
  },
  {
    id: "110",
    name: "Animation Capture Studios (URBN Center)",
    description: "Facilities for animation and motion capture.",
    latitude: 39.9592,
    longitude: -75.1912,
    category: "Academic/Arts",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Animation+Studios+URBN",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Animation+Capture+Studios+Drexel",
  },
  {
    id: "111",
    name: "Game Design Lab (ExCITe Center)",
    description: "Space for game development.",
    latitude: 39.9573,
    longitude: -75.1901,
    category: "Academic/Tech",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Game+Design+Lab+ExCITe",
    directionsUrl: "http://maps.google.com/?q=ExCITe+Center+Game+Design+Lab+Drexel",
  },
  {
    id: "112",
    name: "Virtual Reality Lab (ExCITe Center)",
    description: "Space for VR development and research.",
    latitude: 39.9574,
    longitude: -75.1902,
    category: "Academic/Tech",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=VR+Lab+ExCITe",
    directionsUrl: "http://maps.google.com/?q=ExCITe+Center+Virtual+Reality+Lab+Drexel",
  },
  {
    id: "113",
    name: "Music & Audio Research Lab (MARL)",
    description: "Research lab for music and audio technology.",
    latitude: 39.9575,
    longitude: -75.1903, // Located within ExCITe Center
    category: "Academic/Research",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=MARL+Lab+ExCITe",
    directionsUrl: "http://maps.google.com/?q=ExCITe+Center+MARL+Lab+Drexel",
  },
  {
    id: "114",
    name: "Dana and David Dornsife School of Public Health",
    description: "Academic building for public health programs.",
    latitude: 39.9510,
    longitude: -75.1985,
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Dornsife+School+of+Public+Health",
    directionsUrl: "http://maps.google.com/?q=Dornsife+School+of+Public+Health+Drexel",
  },
  {
    id: "115",
    name: "College of Engineering",
    description: "Houses various engineering departments.",
    latitude: 39.9560,
    longitude: -75.1940, // Represents a general area for engineering buildings
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=College+of+Engineering",
    directionsUrl: "http://maps.google.com/?q=Drexel+College+of+Engineering",
  },
  {
    id: "116",
    name: "College of Arts and Sciences",
    description: "Houses various arts and sciences departments.",
    latitude: 39.9530,
    longitude: -75.1935, // Represents a general area for Arts & Sciences buildings
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=College+of+Arts+and+Sciences",
    directionsUrl: "http://maps.google.com/?q=Drexel+College+of+Arts+and+Sciences",
  },
  {
    id: "117",
    name: "College of Nursing and Health Professions",
    description: "Houses nursing and health professions programs.",
    latitude: 39.9542,
    longitude: -75.1942, // Located in Nesbitt Hall
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=College+of+Nursing+and+Health+Professions",
    directionsUrl: "http://maps.google.com/?q=Drexel+College+of+Nursing+and+Health+Professions",
  },
  {
    id: "118",
    name: "College of Computing and Informatics",
    description: "Home to computer science and information science programs.",
    latitude: 39.9565,
    longitude: -75.1930, // Located in the CCI building
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=College+of+Computing+and+Informatics",
    directionsUrl: "http://maps.google.com/?q=Drexel+College+of+Computing+and+Informatics",
  },
  {
    id: "119",
    name: "School of Education",
    description: "Houses education programs.",
    latitude: 39.9535,
    longitude: -75.1925, // Represents a general area for Education
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=School+of+Education",
    directionsUrl: "http://maps.google.com/?q=Drexel+School+of+Education",
  },
  {
    id: "120",
    name: "Kline School of Law",
    description: "Drexel's law school.",
    latitude: 39.9570,
    longitude: -75.1936, // Located in the Kline Institute
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Kline+School+of+Law",
    directionsUrl: "http://maps.google.com/?q=Kline+School+of+Law+Drexel",
  },
  {
    id: "121",
    name: "College of Medicine",
    description: "Drexel's medical school.",
    latitude: 39.9575,
    longitude: -75.1630, // Represents the New College Building location
    category: "Academic",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=College+of+Medicine",
    directionsUrl: "http://maps.google.com/?q=Drexel+College+of+Medicine",
  },
  {
    id: "122",
    name: "College of Nursing and Health Professions Simulation Lab",
    description: "Hands-on learning space for health professions.",
    latitude: 39.9543,
    longitude: -75.1940, // Near Nesbitt Hall
    category: "Academic/Lab",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Nursing+Sim+Lab",
    directionsUrl: "http://maps.google.com/?q=Drexel+Nursing+Simulation+Lab",
  },
  {
    id: "123",
    name: "Engineering Teaching and Learning Center",
    description: "Support and resources for engineering students.",
    latitude: 39.9561,
    longitude: -75.1941, // Near engineering buildings
    category: "Academic Support",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Engineering+TLC",
    directionsUrl: "http://maps.google.com/?q=Drexel+Engineering+Teaching+and+Learning+Center",
  },
  {
    id: "124",
    name: "Chemistry Lab",
    description: "Chemistry teaching and research labs.",
    latitude: 39.9581,
    longitude: -75.1961, // Near PISB
    category: "Academic/Lab",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Chemistry+Lab",
    directionsUrl: "http://maps.google.com/?q=Drexel+Chemistry+Lab",
  },
  {
    id: "125",
    name: "Biology Lab",
    description: "Biology teaching and research labs.",
    latitude: 39.9582,
    longitude: -75.1962, // Near PISB
    category: "Academic/Lab",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Biology+Lab",
    directionsUrl: "http://maps.google.com/?q=Drexel+Biology+Lab",
  },
  {
    id: "126",
    name: "Physics Lab",
    description: "Physics teaching and research labs.",
    latitude: 39.9583,
    longitude: -75.1963, // Near PISB
    category: "Academic/Lab",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Physics+Lab",
    directionsUrl: "http://maps.google.com/?q=Drexel+Physics+Lab",
  },
  {
    id: "127",
    name: "Computer Lab (various)",
    description: "Various computer labs across campus.",
    latitude: 39.9555,
    longitude: -75.1930, // Represents a general location
    category: "Academic/Lab",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Computer+Lab",
    directionsUrl: "http://maps.google.com/?q=Drexel+Computer+Lab",
  },
  {
    id: "128",
    name: "Design Studio (various)",
    description: "Various design studios in the URBN Center.",
    latitude: 39.9589,
    longitude: -75.1907, // Represents a general location in URBN
    category: "Academic/Studio",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Design+Studio",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Design+Studio+Drexel",
  },
  {
    id: "129",
    name: "Architecture Studio",
    description: "Studio space for architecture students.",
    latitude: 39.9522,
    longitude: -75.1929, // Near Rush Building
    category: "Academic/Studio",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Architecture+Studio",
    directionsUrl: "http://maps.google.com/?q=Drexel+Architecture+Studio",
  },
  {
    id: "130",
    name: "CoAD Photo Lab",
    description: "Photography lab for College of Arts and Design.",
    latitude: 39.9588,
    longitude: -75.1909, // In URBN Center
    category: "Academic/Lab",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=CoAD+Photo+Lab",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Photo+Lab+Drexel",
  },
  {
    id: "131",
    name: "CoAD Print Lab",
    description: "Printing facilities for College of Arts and Design.",
    latitude: 39.9587,
    longitude: -75.1908, // In URBN Center
    category: "Academic/Resources",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=CoAD+Print+Lab",
    directionsUrl: "http://maps.google.com/?q=URBN+Center+Print+Lab+Drexel",
  },
  {
    id: "132",
    name: "Fabrication Lab (ExCITe Center)",
    description: "Workshop with tools for making and prototyping.",
    latitude: 39.9574,
    longitude: -75.1900, // In ExCITe Center
    category: "Academic/Lab",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Fabrication+Lab+ExCITe",
    directionsUrl: "http://maps.google.com/?q=ExCITe+Center+Fabrication+Lab+Drexel",
  },
  {
    id: "133",
    name: "Drexel Recreation Center Pool",
    description: "Indoor swimming pool.",
    latitude: 39.9567,
    longitude: -75.1915, // Within Rec Center
    category: "Recreation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rec+Center+Pool",
    directionsUrl: "http://maps.google.com/?q=Drexel+Recreation+Center+Pool",
  },
  {
    id: "134",
    name: "Drexel Recreation Center Gymnasiums",
    description: "Basketball and multi-purpose courts.",
    latitude: 39.9568,
    longitude: -75.1916, // Within Rec Center
    category: "Recreation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rec+Center+Gyms",
    directionsUrl: "http://maps.google.com/?q=Drexel+Recreation+Center+Gymnasiums",
  },
  {
    id: "135",
    name: "Drexel Recreation Center Fitness Floor",
    description: "Area with cardio and weightlifting equipment.",
    latitude: 39.9569,
    longitude: -75.1917, // Within Rec Center
    category: "Recreation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rec+Center+Fitness",
    directionsUrl: "http://maps.google.com/?q=Drexel+Recreation+Center+Fitness+Floor",
  },
  {
    id: "136",
    name: "Drexel Recreation Center Squash Courts",
    description: "Squash and racquetball courts.",
    latitude: 39.9570,
    longitude: -75.1918, // Within Rec Center
    category: "Recreation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rec+Center+Squash",
    directionsUrl: "http://maps.google.com/?q=Drexel+Recreation+Center+Squash+Courts",
  },
  {
    id: "137",
    name: "Drexel Recreation Center Climbing Wall",
    description: "Indoor climbing facility.",
    latitude: 39.9571,
    longitude: -75.1919, // Within Rec Center
    category: "Recreation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rec+Center+Climbing",
    directionsUrl: "http://maps.google.com/?q=Drexel+Recreation+Center+Climbing+Wall",
  },
  {
    id: "138",
    name: "Drexel Recreation Center Group Exercise Studios",
    description: "Rooms for fitness classes.",
    latitude: 39.9572,
    longitude: -75.1920, // Within Rec Center
    category: "Recreation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rec+Center+Group+Ex",
    directionsUrl: "http://maps.google.com/?q=Drexel+Recreation+Center+Group+Exercise+Studios",
  },
  {
    id: "139",
    name: "Drexel Recreation Center Pro Shop",
    description: "Shop for athletic gear and apparel.",
    latitude: 39.9565,
    longitude: -75.1913, // Within Rec Center
    category: "Retail",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rec+Center+Pro+Shop",
    directionsUrl: "http://maps.google.com/?q=Drexel+Recreation+Center+Pro+Shop",
  },
  {
    id: "140",
    name: "Drexel Recreation Center Administrative Offices",
    description: "Offices for Rec Center staff.",
    latitude: 39.9566,
    longitude: -75.1912, // Within Rec Center
    category: "Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rec+Center+Admin",
    directionsUrl: "http://maps.google.com/?q=Drexel+Recreation+Center+Administrative+Offices",
  },
  {
    id: "141",
    name: "Drexel University Police Station",
    description: "Main station for campus police.",
    latitude: 39.9570,
    longitude: -75.1938, // Same as Public Safety Building
    category: "Campus Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Police+Station",
    directionsUrl: "http://maps.google.com/?q=Drexel+University+Police+Station",
  },
  {
    id: "142",
    name: "Emergency Blue Light Phone (various)",
    description: "Emergency call boxes located around campus.",
    latitude: 39.9550,
    longitude: -75.1945, // Represents a general location
    category: "Campus Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Blue+Light+Phone",
    directionsUrl: "http://maps.google.com/?q=Drexel+University+Blue+Light+Phone",
  },
  {
    id: "143",
    name: "Welcome Center",
    description: "Starting point for campus visits and tours.",
    latitude: 39.9538,
    longitude: -75.1932, // Same as Admissions Office
    category: "Admin",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Welcome+Center",
    directionsUrl: "http://maps.google.com/?q=Drexel+Welcome+Center",
  },
  {
    id: "144",
    name: "Campus Bookstore Annex",
    description: "Additional retail space for the bookstore.",
    latitude: 39.9553,
    longitude: -75.1906, // Near main bookstore
    category: "Retail",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Bookstore+Annex",
    directionsUrl: "http://maps.google.com/?q=Drexel+Bookstore+Annex",
  },
  {
    id: "145",
    name: "Drexel Dragon Shop",
    description: "Store for Drexel merchandise.",
    latitude: 39.9554,
    longitude: -75.1907, // Near bookstore
    category: "Retail",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Dragon+Shop",
    directionsUrl: "http://maps.google.com/?q=Drexel+Dragon+Shop",
  },
  {
    id: "146",
    name: "Copy and Print Services (Campus)",
    description: "Printing and copying facilities on campus.",
    latitude: 39.9559,
    longitude: -75.1909, // Near Wawa
    category: "Campus Services/Resources",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Campus+Copy+Print",
    directionsUrl: "http://maps.google.com/?q=Drexel+Copy+and+Print+Services",
  },
  {
    id: "147",
    name: "FedEx Office Print & Ship Center (near campus)",
    description: "Off-campus printing and shipping services.",
    latitude: 39.9570,
    longitude: -75.1895,
    category: "Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=FedEx+Office",
    directionsUrl: "http://maps.google.com/?q=FedEx+Office+34th+Market+Philadelphia",
  },
  {
    id: "148",
    name: "UPS Store (near campus)",
    description: "Off-campus shipping and printing services.",
    latitude: 39.9572,
    longitude: -75.1898,
    category: "Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=UPS+Store",
    directionsUrl: "http://maps.google.com/?q=UPS+Store+34th+Market+Philadelphia",
  },
  {
    id: "149",
    name: "PNC Bank ATM (on campus)",
    description: "ATM located on campus.",
    latitude: 39.9555,
    longitude: -75.1920, // In Creese
    category: "Banking",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=PNC+ATM",
    directionsUrl: "http://maps.google.com/?q=PNC+Bank+ATM+Drexel",
  },
  {
    id: "150",
    name: "Wells Fargo ATM (near campus)",
    description: "ATM located near campus.",
    latitude: 39.9560,
    longitude: -75.1900, // On Market St
    category: "Banking",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Wells+Fargo+ATM",
    directionsUrl: "http://maps.google.com/?q=Wells+Fargo+ATM+34th+Market+Philadelphia",
  },
  {
    id: "151",
    name: "Bank of America ATM (near campus)",
    description: "ATM located near campus.",
    latitude: 39.9558,
    longitude: -75.1902, // On Market St
    category: "Banking",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Bank+of+America+ATM",
    directionsUrl: "http://maps.google.com/?q=Bank+of+America+ATM+34th+Market+Philadelphia",
  },
  {
    id: "152",
    name: "Post Office (near campus)",
    description: "US Post Office location.",
    latitude: 39.9540,
    longitude: -75.1950, // Near University City Station
    category: "Services",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Post+Office",
    directionsUrl: "http://maps.google.com/?q=Post+Office+University+City+Philadelphia",
  },
  {
    id: "153",
    name: "CVS Pharmacy (near campus)",
    description: "Pharmacy and convenience store.",
    latitude: 39.9555,
    longitude: -75.1905, // On Market St
    category: "Pharmacy/Retail",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=CVS+Pharmacy",
    directionsUrl: "http://maps.google.com/?q=CVS+Pharmacy+34th+Market+Philadelphia",
  },
  {
    id: "154",
    name: "Rite Aid Pharmacy (near campus)",
    description: "Pharmacy and convenience store.",
    latitude: 39.9550,
    longitude: -75.1900, // On Market St
    category: "Pharmacy/Retail",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Rite+Aid+Pharmacy",
    directionsUrl: "http://maps.google.com/?q=Rite+Aid+Pharmacy+34th+Market+Philadelphia",
  },
  {
    id: "155",
    name: "Grocery Store (Fresh Grocer)",
    description: "Supermarket near campus.",
    latitude: 39.9535,
    longitude: -75.1990,
    category: "Retail/Food",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Fresh+Grocer",
    directionsUrl: "http://maps.google.com/?q=Fresh+Grocer+40th+Walnut+Philadelphia",
  },
  {
    id: "156",
    name: "Trader Joe's (near campus)",
    description: "Grocery store.",
    latitude: 39.9510,
    longitude: -75.1970,
    category: "Retail/Food",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Trader+Joe's",
    directionsUrl: "http://maps.google.com/?q=Trader+Joe's+22nd+Market+Philadelphia",
  },
  {
    id: "157",
    name: "Whole Foods Market (near campus)",
    description: "Grocery store.",
    latitude: 39.9570,
    longitude: -75.1780,
    category: "Retail/Food",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Whole+Foods",
    directionsUrl: "http://maps.google.com/?q=Whole+Foods+Market+21st+Callowhill+Philadelphia",
  },
  {
    id: "158",
    name: "Farmers Market (seasonal, various locations)",
    description: "Seasonal outdoor market for produce and goods.",
    latitude: 39.9550,
    longitude: -75.1900, // Represents a general area
    category: "Food/Market",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Farmers+Market",
    directionsUrl: "http://maps.google.com/?q=University+City+Farmers+Market+Philadelphia",
  },
  {
    id: "159",
    name: "University City Science Center",
    description: "Innovation hub and research park.",
    latitude: 39.9545,
    longitude: -75.1940,
    category: "Research/Business",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Science+Center",
    directionsUrl: "http://maps.google.com/?q=University+City+Science+Center+Philadelphia",
  },
  {
    id: "160",
    name: "Cira Green",
    description: "Elevated park with city views.",
    latitude: 39.9520,
    longitude: -75.1870,
    category: "Recreation/Park",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Cira+Green",
    directionsUrl: "http://maps.google.com/?q=Cira+Green+Philadelphia",
  },
  {
    id: "161",
    name: "Amtrak 30th Street Station",
    description: "Major train station with Amtrak, SEPTA, and NJ Transit.",
    latitude: 39.9556,
    longitude: -75.1820,
    category: "Transportation",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=30th+Street+Station",
    directionsUrl: "http://maps.google.com/?q=30th+Street+Station+Philadelphia",
  },
  {
    id: "162",
    name: "Schuylkill River Trail Access",
    description: "Entrance to a popular trail for walking, running, and biking.",
    latitude: 39.9525,
    longitude: -75.1835,
    category: "Recreation/Outdoors",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Schuylkill+River+Trail",
    directionsUrl: "http://maps.google.com/?q=Schuylkill+River+Trail+Access+Philadelphia",
  },
  {
    id: "163",
    name: "Franklin Field (UPenn)",
    description: "Historic stadium at the University of Pennsylvania.",
    latitude: 39.9515,
    longitude: -75.1945,
    category: "Sports/Venue",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Franklin+Field",
    directionsUrl: "http://maps.google.com/?q=Franklin+Field+Philadelphia",
  },
  {
    id: "164",
    name: "The Palestra (UPenn)",
    description: "Historic basketball arena at the University of Pennsylvania.",
    latitude: 39.9508,
    longitude: -75.1948,
    category: "Sports/Venue",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=The+Palestra",
    directionsUrl: "http://maps.google.com/?q=The+Palestra+Philadelphia",
  },
  {
    id: "165",
    name: "Penn Museum (University of Pennsylvania Museum of Archaeology and Anthropology)",
    description: "Museum with extensive collections from around the world.",
    latitude: 39.9505,
    longitude: -75.1960,
    category: "Arts/Culture",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Penn+Museum",
    directionsUrl: "http://maps.google.com/?q=Penn+Museum+Philadelphia",
  },
  {
    id: "166",
    name: "Hospital of the University of Pennsylvania (HUP)",
    description: "Major teaching hospital.",
    latitude: 39.9500,
    longitude: -75.1980,
    category: "Health",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=HUP",
    directionsUrl: "http://maps.google.com/?q=Hospital+of+the+University+of+Pennsylvania",
  },
  {
    id: "167",
    name: "Children's Hospital of Philadelphia (CHOP)",
    description: "Leading pediatric hospital.",
    latitude: 39.9480,
    longitude: -75.1995,
    category: "Health",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=CHOP",
    directionsUrl: "http://maps.google.com/?q=Children's+Hospital+of+Philadelphia",
  },
  {
    id: "168",
    name: "Perelman Center for Advanced Medicine (UPenn)",
    description: "Outpatient facility part of Penn Medicine.",
    latitude: 39.9502,
    longitude: -75.1975,
    category: "Health",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Perelman+Center",
    directionsUrl: "http://maps.google.com/?q=Perelman+Center+for+Advanced+Medicine+Philadelphia",
  },
  {
    id: "169",
    name: "University of Pennsylvania Campus",
    description: "Adjacent university campus.",
    latitude: 39.9520,
    longitude: -75.1980, // Represents a central area of Penn's campus
    category: "Campus",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=UPenn+Campus",
    directionsUrl: "http://maps.google.com/?q=University+of+Pennsylvania+Philadelphia",
  },
  {
    id: "170",
    name: "Powelton Village",
    description: "Residential neighborhood north of Drexel.",
    latitude: 39.9620,
    longitude: -75.1980, // Represents a central area of Powelton Village
    category: "Neighborhood",
    photoUrl: "https://placehold.co/600x400/004B87/white?text=Powelton+Village",
    directionsUrl: "http://maps.google.com/?q=Powelton+Village+Philadelphia",
  },
];


// Location Item View (Now a TouchableOpacity again)
interface LocationItemProps {
  location: LocationData;
  onPress: (location: LocationData) => void; // Added onPress prop
}

const LocationItem: React.FC<LocationItemProps> = ({ location, onPress }) => (
  <TouchableOpacity // Changed back to TouchableOpacity
    style={styles.locationItem}
    onPress={() => onPress(location)} // Call onPress when pressed
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
    <Ionicons name="chevron-forward" size={20} color="#888" /> {/* Re-added arrow icon */}
  </TouchableOpacity>
);

// Main Screen
export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null); // Create a ref for the MapView
  // Use a ref to store marker references, explicitly typing the ref
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationsWithDistance, setLocationsWithDistance] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationAndCalculateDistances = async () => {
      try {
        const location = await getCurrentLocation(); // Get user's current location
        const userLat = location?.latitude ?? 0;
        const userLon = location?.longitude ?? 0;

        setUserLocation({
          latitude: userLat,
          longitude: userLon,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        });

        // Calculate distance for each nearby location
        const updatedLocations = nearbyLocations.map(loc => {
          const distance = calculateDistance(userLat, userLon, loc.latitude, loc.longitude);
          return { ...loc, distance };
        });

        setLocationsWithDistance(updatedLocations);

      } catch (error: any) {
        setErrorMsg(error.message || "Could not fetch location.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndCalculateDistances();
  }, []); // Empty dependency array means this runs once on mount

  const handleLocationPress = (location: LocationData) => {
    // Animate the map to the selected location's coordinates
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005, // Zoom in slightly
        longitudeDelta: 0.005, // Zoom in slightly
      }, 500); // Animation duration in milliseconds

      // Show the callout for the corresponding marker
      // Use the stored marker ref
      if (markerRefs.current[location.id]) {
        markerRefs.current[location.id]?.showCallout();
      }
    }

    // Removed the Alert that was just confirming the press
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
            {errorMsg || "Location unavailable. Please check permissions."}
          </Text>
        </View>
      );
    }
    return (
      <MapView
        ref={mapRef} // Assign the map ref
        style={styles.map}
        region={userLocation}
        showsUserLocation={true}
        // Optional: Add onRegionChangeComplete to update userLocation state if map is moved
        // onRegionChangeComplete={(region) => setUserLocation(region)}
      >
        {/* Render markers for all nearby locations */}
        {locationsWithDistance.map((loc) => (
          <Marker
            key={loc.id}
            ref={ref => {
              // Explicitly type the ref as MapMarker or null
              markerRefs.current[loc.id] = ref as MapMarker | null;
            }} // Assign a ref to each marker
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={`${loc.category} - ${loc.distance?.toFixed(2)} miles away`}
            // pinColor="red" // Markers are red by default
          />
        ))}
      </MapView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Status bar styling */}
      <StatusBar barStyle="light-content" backgroundColor="#004B87" />

      {/* Header */}
      <View style={styles.header}>
        {/* Back button - uses expo-router */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Locations</Text>
        {/* Placeholder to balance layout */}
        <View style={{ width: 24 }} />
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>{renderMapContent()}</View>

      {/* Bottom Section - Scrollable list of locations */}
      <View style={styles.bottomContainer}>
        <Text style={styles.sectionTitle}>Near Locations </Text>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Render a pressable item for each nearby location */}
          {locationsWithDistance.map((loc) => (
            <LocationItem
              key={loc.id}
              location={loc}
              onPress={handleLocationPress} // Pass the press handler
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
