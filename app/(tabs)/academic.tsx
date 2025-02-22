import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AcademicScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Academics</Text>
      <Text style={styles.gpa}>GPA: 0.00</Text>
      <Text style={styles.credits}>Total Credits: 20</Text> {/* Added line here */}
      
      <View style={styles.classesContainer}>
        <Text style={styles.classText}>Class 1 - Name of Class - Grade: A+</Text>
        <Text style={styles.classText}>Class 2 - Name of Class - Grade: A+</Text>
        <Text style={styles.classText}>Class 3 - Name of Class - Grade: A+</Text>
        <Text style={styles.classText}>Class 4 - Name of Class - Grade: A+</Text>
        <Text style={styles.classText}>Class 5 - Name of Class - Grade: A+</Text>
        <Text style={styles.classText}>Class 6 - Name of Class - Grade: A+</Text>
        <Text style={styles.classText}>Class 7 - Name of Class - Grade: A+</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    paddingTop: 50,  
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 5, 
  },
  gpa: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 2,  
  },
  credits: { 
    fontSize: 18,  
    marginBottom: 15,
  },
  classesContainer: { 
    width: "80%", 
  },
  classText: { 
    fontSize: 18, 
    paddingVertical: 5, 
    borderBottomWidth: 1, 
    borderBottomColor: "#ccc", 
    textAlign: "center",
  },
});

export default AcademicScreen;
