import { useUser } from "@/hooks/useUser";
import FirstTimeLoginScreen from "@/screens/FirstTimeLoginScreen";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Theme } from "@/constants/Theme";
import { useColorScheme } from "@/hooks/useColorScheme";

// Create a custom light theme based on our design system
const LovelyWhiteTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Theme.colors.primary,
    background: Theme.colors.background,
    card: Theme.colors.surface,
    text: Theme.colors.text,
    border: Theme.colors.border,
    notification: Theme.colors.accent,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { currentUser, hasCompletedOnboarding, loading, loadUserData } =
    useUser();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Force refresh user data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Add debugging
  console.log("RootLayout state:", {
    currentUser,
    hasCompletedOnboarding,
    loading,
  });

  // Only show loading for font loading, not user data loading
  if (!loaded) {
    return null;
  }

  // Show onboarding if not completed and not loading
  if (!hasCompletedOnboarding && !loading) {
    console.log("Showing FirstTimeLoginScreen");
    return <FirstTimeLoginScreen key={`login-${Date.now()}`} />;
  }

  // Show main app if onboarding is completed or still loading (to avoid flash)
  if (hasCompletedOnboarding || loading) {
    return (
      <SafeAreaProvider style={{ backgroundColor: Theme.colors.background }}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : LovelyWhiteTheme}
        >
          <Stack key={currentUser?.id || "no-user"}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="log" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar
            style={colorScheme === "dark" ? "light" : "dark"}
            animated={true}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return null;
}
