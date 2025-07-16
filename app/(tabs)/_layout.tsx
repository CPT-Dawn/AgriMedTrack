import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Theme } from "@/constants/Theme";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  // Set Android navigation bar color to match the app background
  useEffect(() => {
    if (Platform.OS === "android") {
      try {
        // Check if the function exists before calling
        if (changeNavigationBarColor) {
          changeNavigationBarColor(Theme.colors.background, false, false);
        }
      } catch (e) {
        console.log("Navigation bar color change not supported:", e);
      }
    }
  }, []);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: Theme.colors.background,
      }}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarBackground: TabBarBackground,
          tabBarActiveTintColor: Theme.colors.primary,
          tabBarInactiveTintColor: Theme.colors.textMuted,
          tabBarStyle: {
            backgroundColor: Theme.colors.surface,
            borderTopLeftRadius: Theme.borderRadius["2xl"],
            borderTopRightRadius: Theme.borderRadius["2xl"],
            borderTopWidth: 0,
            height: Platform.OS === "ios" ? 88 : 68,
            paddingBottom: Platform.OS === "ios" ? 28 : 8,
            paddingTop: Theme.spacing.md,
            elevation: 12,
            shadowColor: Theme.colors.text,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            position: "absolute",
            left: Theme.spacing.sm,
            right: Theme.spacing.sm,
            bottom: Platform.OS === "android" ? 0 : 0,
          },
          tabBarLabelStyle: {
            fontSize: Theme.typography.fontSize.xs,
            fontWeight: Theme.typography.fontWeight.semibold,
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={24} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Sales",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={24} name="chart.bar.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stock"
          options={{
            title: "Stock",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={24} name="shippingbox.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
