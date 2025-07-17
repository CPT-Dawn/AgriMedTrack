import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { AppColors } from "../../constants/Colors";
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    // Add 3D effect with multiple layers and curved corners for cloudy white theme
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.08)',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        // Add inner shadow effect for curved corners
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.25)",
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderLeftColor: "rgba(255, 255, 255, 0.12)",
        borderRightColor: "rgba(255, 255, 255, 0.12)",
      },
      android: {
        elevation: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.25)",
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderLeftColor: "rgba(255, 255, 255, 0.12)",
        borderRightColor: "rgba(255, 255, 255, 0.12)",
      },
    }),
  },
});

export function useBottomTabOverflow() {
  return 0;
}
