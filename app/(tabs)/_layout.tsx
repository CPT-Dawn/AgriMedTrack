import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "../../constants/Colors";

export default function TabLayout() {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: AppColors.background,
      }}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarBackground: TabBarBackground,
          tabBarActiveTintColor: AppColors.primary,
          tabBarInactiveTintColor: AppColors.text + "80",
          tabBarStyle: {
            backgroundColor: AppColors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 0,
            height: Platform.OS === "ios" ? 88 : 68,
            paddingBottom: Platform.OS === "ios" ? 28 : 8,
            paddingTop: 12,
            elevation: 12,
            shadowColor: AppColors.text,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
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
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={24} name="gearshape.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
