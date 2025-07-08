import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarInactiveTintColor: "#185a9d",
          headerShown: false,
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarBackground: TabBarBackground,
          tabBarStyle: [
            {
              height: 76,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              backgroundColor: "rgba(67,206,162,0.85)",
              position: "absolute",
              left: 8,
              right: 8,
              bottom: 8,
              elevation: 16,
              shadowColor: "#185a9d",
              shadowOpacity: 0.22,
              shadowRadius: 18,
              borderTopWidth: 0.5,
              borderColor: "#fff8",
              zIndex: 100,
              overflow: "visible",
              backdropFilter: "blur(16px)",
            },
          ],
          tabBarLabelStyle: {
            fontWeight: "bold",
            fontSize: 17,
            marginBottom: 6,
            color: "#fff",
            textShadowColor: "#185a9d88",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 4,
            fontFamily: "SpaceMono",
            letterSpacing: 0.5,
          },
          tabBarIconStyle: {
            marginTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => <>{focused ? "🏠" : "🏠"}</>,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Sales",
            tabBarIcon: ({ focused }) => <>{focused ? "💸" : "💸"}</>,
          }}
        />
        <Tabs.Screen
          name="stock"
          options={{
            title: "Stock",
            tabBarIcon: ({ focused }) => <>{focused ? "💊" : "💊"}</>,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused }) => <>{focused ? "⚙️" : "⚙️"}</>,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
