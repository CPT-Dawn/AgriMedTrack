import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Theme } from "@/constants/Theme";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
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
            borderTopLeftRadius: Theme.borderRadius.xl,
            borderTopRightRadius: Theme.borderRadius.xl,
            borderTopWidth: 0,
            height: Platform.OS === "ios" ? 96 : 76,
            paddingBottom: Platform.OS === "ios" ? 32 : 12,
            paddingTop: Theme.spacing.md,
            // Modern subtle shadow
            elevation: 8,
            shadowColor: Theme.colors.shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            // Clean border
            borderWidth: 1,
            borderColor: Theme.colors.border,
            // Position with proper margins
            position: "absolute",
            left: Theme.spacing.md,
            right: Theme.spacing.md,
            bottom: Platform.OS === "android" ? 0 : 0,
          },
          tabBarLabelStyle: {
            fontSize: Theme.typography.fontSize.xs,
            fontWeight: Theme.typography.fontWeight.medium,
            marginTop: 4,
            letterSpacing: 0.2,
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
              <IconSymbol
                size={focused ? 26 : 24}
                name="house.fill"
                color={color}
                style={{
                  transform: [{ scale: focused ? 1.05 : 1 }],
                  opacity: focused ? 1 : 0.7,
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Sales",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={focused ? 26 : 24}
                name="chart.bar.fill"
                color={color}
                style={{
                  transform: [{ scale: focused ? 1.05 : 1 }],
                  opacity: focused ? 1 : 0.7,
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="stock"
          options={{
            title: "Inventory",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={focused ? 26 : 24}
                name="shippingbox.fill"
                color={color}
                style={{
                  transform: [{ scale: focused ? 1.05 : 1 }],
                  opacity: focused ? 1 : 0.7,
                }}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
