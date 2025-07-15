/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Custom color palette for AgriMedTrack
export const AppColors = {
  primary: "#0288D1", // Teal Blue
  secondary: "#F9A825", // Harvest Gold
  accent: "#FF7043", // Coral
  background: "#F5F5F5", // Misty White
  text: "#263238", // Charcoal
  white: "#FFFFFF",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  border: "#E0E0E0",
  shadow: "#000000",
  overlay: "rgba(0, 0, 0, 0.5)",
};

const tintColorLight = AppColors.primary;
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: AppColors.text,
    background: AppColors.background,
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
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
