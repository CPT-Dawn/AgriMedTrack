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
            borderTopLeftRadius: Theme.borderRadius["2xl"],
            borderTopRightRadius: Theme.borderRadius["2xl"],
            borderTopWidth: 0,
            height: Platform.OS === "ios" ? 88 : 68,
            paddingBottom: Platform.OS === "ios" ? 28 : 8,
            paddingTop: Theme.spacing.md,
            // Enhanced 3D shadows for depth
            elevation: 20,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            // Additional inner shadow effect
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.1)",
            // Position and spacing
            position: "absolute",
            left: Theme.spacing.sm,
            right: Theme.spacing.sm,
            bottom: Platform.OS === "android" ? 0 : 0,
          },
          tabBarLabelStyle: {
            fontSize: Theme.typography.fontSize.xs,
            fontWeight: Theme.typography.fontWeight.semibold,
            marginTop: 4,
            // Enhanced 3D text styling
            textShadowColor: "rgba(0, 0, 0, 0.1)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
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
                  transform: [{ scale: focused ? 1.1 : 1 }],
                  shadowColor: focused ? color : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: focused ? 0.3 : 0,
                  shadowRadius: 4,
                  elevation: focused ? 8 : 0,
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
                  transform: [{ scale: focused ? 1.1 : 1 }],
                  shadowColor: focused ? color : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: focused ? 0.3 : 0,
                  shadowRadius: 4,
                  elevation: focused ? 8 : 0,
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
                  transform: [{ scale: focused ? 1.1 : 1 }],
                  shadowColor: focused ? color : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: focused ? 0.3 : 0,
                  shadowRadius: 4,
                  elevation: focused ? 8 : 0,
                }}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
