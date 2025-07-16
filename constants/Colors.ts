/**
 * Color constants for AgriMedTrack - Lovely White Mode Design System
 * Unified color palette following the design system specifications
 */

import { ThemeColors } from "./Theme";

// Legacy AppColors for backward compatibility - now uses the new theme
export const AppColors = {
  primary: ThemeColors.primary, // Deep Indigo
  secondary: ThemeColors.secondary, // Rich Violet
  accent: ThemeColors.accent, // Soft Coral Pink
  background: ThemeColors.background, // Pearl White
  text: ThemeColors.text, // Charcoal Gray
  textSecondary: ThemeColors.textSecondary, // Medium Gray
  textMuted: ThemeColors.textMuted, // Light Gray
  white: ThemeColors.white,
  success: ThemeColors.success,
  warning: ThemeColors.warning,
  error: ThemeColors.error,
  border: ThemeColors.border,
  shadow: ThemeColors.shadow,
  overlay: ThemeColors.overlay,
};

const tintColorLight = ThemeColors.primary;
const tintColorDark = ThemeColors.white;

export const Colors = {
  light: {
    text: ThemeColors.text,
    background: ThemeColors.background,
    tint: tintColorLight,
    icon: ThemeColors.textMuted,
    tabIconDefault: ThemeColors.textMuted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
