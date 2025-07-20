import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Theme } from "../../constants/Theme";

export default function VibrantTabBarBackground() {
  return <View style={styles.background} />;
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    // Clean modern border
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: Theme.colors.border,
    borderRightColor: Theme.colors.border,
    // Subtle shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export function useBottomTabOverflow() {
  return 0;
}
