import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";

export default function BlurTabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        // Use light blur for cloudy white appearance
        tint="light"
        intensity={80}
        style={StyleSheet.absoluteFill}
      />
      {/* Add 3D overlay effect */}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    // Add enhanced 3D effect overlay for curved corners with cloudy white theme
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.15)",
    borderRightColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    // Add subtle cloudy white overlay
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
});

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
