import React, { useState, useEffect } from "react";
import {
View,
Text,
StyleSheet,
ScrollView,
TextInput,
TouchableOpacity,
Alert,
SafeAreaView,
StatusBar,
Platform,
Modal,
TouchableWithoutFeedback,
ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

type ProfileState = {
name: string;
universityId: string;
pronouns: string;
bio: string;
gender: string;
major: string; // still read-only
birthday: string; // stored in MM/DD/YYYY
contactInfo: string;
};

export default function EditProfileScreen() {
const [profile, setProfile] = useState<ProfileState>({
name: "",
universityId: "",
pronouns: "",
bio: "",
gender: "",
major: "Computer Science",
birthday: "",
contactInfo: "",
});
const [birthdayDate, setBirthdayDate] = useState<Date>(new Date());
const [showIosModal, setShowIosModal] = useState(false);
const [loading, setLoading] = useState(true);
const router = useRouter();

// 1) On mount, fetch the profile from our API and prefill state
useEffect(() => {
(async () => {
try {
const token = await AsyncStorage.getItem("authToken");
if (!token) throw new Error("No auth token");
const res = await fetch(
"https://universe.terabytecomputing.com:3000/api/v1/profile",
{
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`,
},
}
);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();

// parse birthday from ISO into MM/DD/YYYY
let mmddyyyy = "";
if (data.birthday) {
const dt = new Date(data.birthday);
const mm = String(dt.getMonth() + 1).padStart(2, "0");
const dd = String(dt.getDate()).padStart(2, "0");
const yy = dt.getFullYear();
mmddyyyy = `${mm}/${dd}/${yy}`;
setBirthdayDate(dt);
}

setProfile({
name: data.name || "",
universityId: data.university?.id || "",
pronouns: data.pronouns || "",
bio: data.bio || "",
gender: data.gender || "",
major: "Computer Science", // unchanged
birthday: mmddyyyy,
contactInfo: data.contactInfo || "",
});
} catch (err) {
console.error("Error loading profile:", err);
Alert.alert("Error", "Could not load your profile.");
} finally {
setLoading(false);
}
})();
}, []);

const handleChange = (field: keyof ProfileState, val: string) => {
if (field === "major") return;
setProfile((p) => ({ ...p, [field]: val }));
};

const onDateChange = (_: any, selected?: Date) => {
const dt = selected ?? birthdayDate;
setBirthdayDate(dt);
const mm = String(dt.getMonth() + 1).padStart(2, "0");
const dd = String(dt.getDate()).padStart(2, "0");
const yy = dt.getFullYear();
handleChange("birthday", `${mm}/${dd}/${yy}`);
if (Platform.OS === "ios") setShowIosModal(false);
};

const openDatePicker = () => {
if (Platform.OS === "android") {
DateTimePickerAndroid.open({
value: birthdayDate,
onChange: onDateChange,
mode: "date",
});
} else {
setShowIosModal(true);
}
};

const handleSave = async () => {
try {
const token = await AsyncStorage.getItem("authToken");
if (!token) throw new Error("No auth token");

// Build patch body with only editable fields
const body: any = {
name: profile.name,
pronouns: profile.pronouns,
bio: profile.bio,
gender: profile.gender,
birthday: profile.birthday,
contactInfo: profile.contactInfo,
};
if (profile.universityId) {
body.universityId = profile.universityId;
}

const res = await fetch(
"https://universe.terabytecomputing.com:3000/api/v1/profile",
{
method: "PATCH",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify(body),
}
);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
Alert.alert("Saved", "Your profile was updated.", [
{ text: "OK", onPress: () => router.back() },
]);
} catch (err) {
console.error("Save failed:", err);
Alert.alert("Error", "Could not save your profile.");
}
};

// Show spinner while fetching
if (loading) {
return (
<SafeAreaView style={styles.safeArea}>
<StatusBar barStyle="dark-content" backgroundColor="#fff" />
<View style={styles.center}>
<ActivityIndicator size="large" color="#1e88e5" />
<Text style={styles.loadingText}>Loading your profile…</Text>
</View>
</SafeAreaView>
);
}

return (
<SafeAreaView style={styles.safeArea}>
<StatusBar barStyle="dark-content" backgroundColor="#fff" />
<ScrollView contentContainerStyle={styles.container}>
<Text style={styles.title}>Edit Profile</Text>

<Text style={styles.label}>Name</Text>
<TextInput
style={styles.input}
value={profile.name}
onChangeText={(t) => handleChange("name", t)}
placeholder="Enter your name"
placeholderTextColor="#90caf9"
/>

<Text style={styles.label}>University ID</Text>
<TextInput
style={styles.input}
value={profile.universityId}
onChangeText={(t) => handleChange("universityId", t)}
placeholder="Enter your university ID"
placeholderTextColor="#90caf9"
/>

<Text style={styles.label}>Pronouns</Text>
<TextInput
style={styles.input}
value={profile.pronouns}
onChangeText={(t) => handleChange("pronouns", t)}
placeholder="They/Them, She/Her, etc."
placeholderTextColor="#90caf9"
/>

<Text style={styles.label}>Bio</Text>
<TextInput
style={[styles.input, styles.multiline]}
value={profile.bio}
onChangeText={(t) => handleChange("bio", t)}
placeholder="Tell us about yourself"
placeholderTextColor="#90caf9"
multiline
numberOfLines={4}
/>

<Text style={styles.label}>Gender</Text>
<TextInput
style={styles.input}
value={profile.gender}
onChangeText={(t) => handleChange("gender", t)}
placeholder="Enter your gender"
placeholderTextColor="#90caf9"
/>

<Text style={styles.label}>Major</Text>
<View style={styles.readOnly}>
<Text style={styles.readOnlyText}>{profile.major}</Text>
<Text style={styles.readOnlyNote}>(Cannot change)</Text>
</View>

<Text style={styles.label}>Birthday</Text>
<TouchableOpacity
style={styles.input}
onPress={openDatePicker}
accessibilityLabel="Select birthday"
>
<Text
style={{
fontSize: 16,
color: profile.birthday ? "#000" : "#90caf9",
}}
>
{profile.birthday || "MM/DD/YYYY"}
</Text>
</TouchableOpacity>
{Platform.OS === "ios" && showIosModal && (
<Modal
visible
transparent
animationType="fade"
onRequestClose={() => setShowIosModal(false)}
>
<TouchableWithoutFeedback onPress={() => setShowIosModal(false)}>
<View style={styles.modalOverlay}>
<View style={styles.modalContent}>
<DateTimePicker
value={birthdayDate}
mode="date"
display="spinner"
onChange={onDateChange}
style={styles.picker}
/>
</View>
</View>
</TouchableWithoutFeedback>
</Modal>
)}

<Text style={styles.label}>Contact Info</Text>
<TextInput
style={styles.input}
value={profile.contactInfo}
onChangeText={(t) => handleChange("contactInfo", t)}
placeholder="Email, phone…"
placeholderTextColor="#90caf9"
/>

<TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
<Text style={styles.saveText}>Save Profile</Text>
</TouchableOpacity>
</ScrollView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
safeArea: { flex: 1, backgroundColor: "#fff" },
center: { flex: 1, justifyContent: "center", alignItems: "center" },
loadingText: { marginTop: 8, fontSize: 16, color: "#1e88e5" },

container: { padding: 20, paddingBottom: 40 },
title: {
fontSize: 24,
fontWeight: "700",
marginBottom: 20,
textAlign: "center",
color: "#1e88e5",
},
label: {
fontSize: 16,
fontWeight: "600",
marginTop: 16,
color: "#1e88e5",
marginBottom: 6,
},
input: {
fontSize: 16,
borderWidth: 1,
borderColor: "#64b5f6",
borderRadius: 25,
padding: 15,
height: 50,
backgroundColor: "#fff",
justifyContent: "center",
shadowColor: "#1e88e5",
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.1,
shadowRadius: 1,
elevation: 1,
},
multiline: {
height: 120,
textAlignVertical: "top",
paddingTop: 15,
borderRadius: 20,
},
readOnly: {
borderWidth: 1,
borderColor: "#90caf9",
borderRadius: 25,
padding: 15,
height: 50,
backgroundColor: "#e3f2fd",
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
shadowColor: "#1e88e5",
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.1,
shadowRadius: 1,
elevation: 1,
},
readOnlyText: { fontSize: 16, color: "#1976d2", fontWeight: "500" },
readOnlyNote: { fontSize: 12, color: "#42a5f5", fontStyle: "italic" },

saveBtn: {
backgroundColor: "#1e88e5",
padding: 15,
borderRadius: 25,
marginTop: 30,
alignItems: "center",
shadowColor: "#1565c0",
shadowOffset: { width: 0, height: 3 },
shadowOpacity: 0.3,
shadowRadius: 5,
elevation: 3,
},
saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },

modalOverlay: {
flex: 1,
backgroundColor: "rgba(0,0,0,0.3)",
justifyContent: "center",
alignItems: "center",
},
modalContent: {
backgroundColor: "#fff",
borderRadius: 12,
padding: 20,
width: "80%",
},
picker: { width: "100%" },
});