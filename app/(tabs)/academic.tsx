import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AcademicScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Academic Tab!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
});

export default AcademicScreen;
