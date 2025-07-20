import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Theme } from "@/constants/Theme";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";
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
          tabBarBackground: TabBarBackground,
          tabBarActiveTintColor: Theme.colors.primary,
          tabBarInactiveTintColor: Theme.colors.textMuted,
          tabBarButton:
            Platform.OS === "android"
              ? ({ children, onPress }) => (
                  <Pressable
                    android_ripple={{
                      color: "#d4dbfc",
                      borderless: false,
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 60,
                        minWidth: 110,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    onPress={onPress}
                  >
                    {children}
                  </Pressable>
                )
              : undefined,
          tabBarStyle: {
            backgroundColor: Theme.colors.surface,
            borderTopLeftRadius: Theme.borderRadius.xl,
            borderTopRightRadius: Theme.borderRadius.xl,
            borderTopWidth: 0,
            height: Platform.OS === "ios" ? 96 : 76,
            paddingBottom: Platform.OS === "ios" ? 32 : 12,
            paddingTop: Theme.spacing.md,
            elevation: 8,
            shadowColor: Theme.colors.shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            position: "absolute",
            left: Theme.spacing.md,
            right: Theme.spacing.md,
            bottom: Platform.OS === "android" ? 0 : 0,
          },
          tabBarItemStyle: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 48,
            minWidth: 64,
          },
          tabBarIconStyle: {
            marginTop: 4,
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarLabelStyle: {
            fontSize: Theme.typography.fontSize.xs,
            fontWeight: Theme.typography.fontWeight.medium,
            marginTop: 2,
            letterSpacing: 0.2,
            textAlign: "center",
          },
          tabBarShowLabel: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={focused ? 26 : 24}
                name="home"
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
                name="receipt"
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
                name="inventory"
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
