/**
 * Theme Application Hook
 * A utility hook to easily apply theme styles throughout the app
 */

import { useMemo } from "react";
import { Platform, StatusBar, TextStyle, ViewStyle } from "react-native";
import { Theme } from "../constants/Theme";

export const useTheme = () => {
  const theme = useMemo(
    () => ({
      colors: Theme.colors,
      typography: Theme.typography,
      spacing: Theme.spacing,
      borderRadius: Theme.borderRadius,
      shadows: Theme.shadows,
      components: Theme.components,
      layout: Theme.layout,

      // Helper functions for common patterns
      getHeaderStyle: (): ViewStyle => ({
        backgroundColor: Theme.colors.surface,
        paddingTop:
          Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 20,
        paddingHorizontal: Theme.spacing.xl,
        paddingBottom: Theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
      }),

      getScreenStyle: (): ViewStyle => ({
        flex: 1,
        backgroundColor: Theme.colors.background,
      }),

      getCardStyle: (): ViewStyle => ({
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius["2xl"],
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
        ...Theme.shadows.sm,
      }),

      getButtonStyle: (
        variant: "primary" | "secondary" | "accent" = "primary"
      ): ViewStyle => {
        const baseStyle: ViewStyle = {
          borderRadius: Theme.borderRadius["2xl"],
          paddingHorizontal: Theme.spacing.lg,
          paddingVertical: Theme.spacing.md,
          minHeight: 44,
          minWidth: 44,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          ...Theme.shadows.sm,
        };

        switch (variant) {
          case "secondary":
            return {
              ...baseStyle,
              backgroundColor: Theme.colors.surface,
              borderWidth: 1,
              borderColor: Theme.colors.secondary,
            };
          case "accent":
            return {
              ...baseStyle,
              backgroundColor: Theme.colors.accent,
            };
          default:
            return {
              ...baseStyle,
              backgroundColor: Theme.colors.primary,
            };
        }
      },

      getButtonTextStyle: (
        variant: "primary" | "secondary" | "accent" = "primary"
      ): TextStyle => {
        const baseStyle: TextStyle = {
          fontSize: Theme.typography.fontSize.sm,
          fontWeight: Theme.typography.fontWeight.semibold,
        };

        switch (variant) {
          case "secondary":
            return {
              ...baseStyle,
              color: Theme.colors.secondary,
            };
          default:
            return {
              ...baseStyle,
              color: Theme.colors.white,
            };
        }
      },

      getInputStyle: (
        focused: boolean = false,
        error: boolean = false
      ): ViewStyle => ({
        backgroundColor: Theme.colors.white,
        borderWidth: 2,
        borderColor: error
          ? Theme.colors.error
          : focused
          ? Theme.colors.primary
          : Theme.colors.secondary,
        borderRadius: Theme.borderRadius.xl,
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.md,
        minHeight: 44,
      }),

      getModalStyle: (): ViewStyle => ({
        backgroundColor: Theme.colors.surface,
        borderTopLeftRadius: Theme.borderRadius["3xl"],
        borderTopRightRadius: Theme.borderRadius["3xl"],
        paddingTop: Theme.spacing.lg,
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing["2xl"],
        ...Theme.shadows.xl,
      }),

      // Text style helpers
      h1Style: {
        fontSize: Theme.typography.fontSize["2xl"],
        fontWeight: Theme.typography.fontWeight.bold,
        color: Theme.colors.text,
      } as TextStyle,

      h2Style: {
        fontSize: Theme.typography.fontSize.xl,
        fontWeight: Theme.typography.fontWeight.semibold,
        color: Theme.colors.text,
      } as TextStyle,

      h3Style: {
        fontSize: Theme.typography.fontSize.lg,
        fontWeight: Theme.typography.fontWeight.semibold,
        color: Theme.colors.text,
      } as TextStyle,

      bodyStyle: {
        fontSize: Theme.typography.fontSize.sm,
        color: Theme.colors.text,
        lineHeight:
          Theme.typography.lineHeight.normal * Theme.typography.fontSize.sm,
      } as TextStyle,

      captionStyle: {
        fontSize: Theme.typography.fontSize.xs,
        color: Theme.colors.textMuted,
      } as TextStyle,

      // Animation helpers
      pressedScale: Theme.animations.scale.pressed,
      animationDuration: Theme.animations.timing.normal,
    }),
    []
  );

  return theme;
};

export default useTheme;
