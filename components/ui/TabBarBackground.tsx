import React from "react";
import { StyleSheet, View } from "react-native";
// If you have react-native-linear-gradient installed, you can use it for a better effect:
// import LinearGradient from 'react-native-linear-gradient';

// This is a shim for web and Android where the tab bar is generally opaque.
export default function VibrantTabBarBackground() {
  // Uncomment below if using LinearGradient
  // return (
  //   <LinearGradient
  //     colors={['#43cea2', '#185a9d']}
  //     start={{ x: 0, y: 0 }}
  //     end={{ x: 1, y: 0 }}
  //     style={StyleSheet.absoluteFill}
  //   />
  // );
  return <View style={styles.gradient} />;
}

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)", // fallback for web/Android
    // If LinearGradient is used, this will be replaced
  },
});

export function useBottomTabOverflow() {
  return 0;
}
