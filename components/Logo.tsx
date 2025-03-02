import React from "react";
import { Image, StyleSheet } from "react-native";

const Logo: React.FC = () => {
  return (
    <Image
      source={require("../assets/images/applogo.png")} // Path to your local image
      style={styles.logo}
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 120, 
    height: 120, 
    marginBottom: 30, 
  },
});

export default Logo;
