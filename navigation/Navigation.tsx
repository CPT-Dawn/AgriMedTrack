import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform } from "react-native";
import { IconSymbol } from "../components/ui/IconSymbol";
import { AppColors } from "../constants/Colors";

// Import your existing screens
import HomeScreen from "../screens/HomeScreen";
import SalesScreen from "../screens/SalesScreen";
import StockScreen from "../screens/StockScreen";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Header configuration
        headerShown: false,

        // Tab bar styling
        tabBarStyle: {
          backgroundColor: AppColors.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 12,
          paddingHorizontal: 16,
          elevation: 12,
          shadowColor: AppColors.shadow,
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          position: "absolute",
        },

        // Tab bar item styling
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 4,
          paddingVertical: 4,
        },

        // Label styling
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
          textAlign: "center",
        },

        // Colors
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: `${AppColors.text}99`, // 60% opacity

        // Animation
        tabBarHideOnKeyboard: true,
        tabBarVisibilityAnimationConfig: {
          show: {
            animation: "timing",
            config: {
              duration: 200,
            },
          },
          hide: {
            animation: "timing",
            config: {
              duration: 150,
            },
          },
        },

        // Tab bar icon
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case "Home":
              iconName = "house.fill";
              break;
            case "Sales":
              iconName = "dollarsign.circle.fill";
              break;
            case "Stock":
              iconName = "archivebox.fill";
              break;
            default:
              iconName = "questionmark.circle";
          }

          return (
            <IconSymbol
              name={iconName}
              size={24}
              color={color}
              style={{
                transform: [{ scale: focused ? 1.05 : 1 }],
                opacity: focused ? 1 : 0.6,
              }}
            />
          );
        },

        // Accessibility
        tabBarAccessibilityLabel: route.name,
        tabBarTestID: `${route.name.toLowerCase()}-tab`,
      })}
      screenListeners={{
        tabPress: (e) => {
          // Minimal haptic feedback on tab press
          if (Platform.OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{
          tabBarLabel: "Sales",
        }}
      />
      <Tab.Screen
        name="Stock"
        component={StockScreen}
        options={{
          tabBarLabel: "Stock",
        }}
      />
    </Tab.Navigator>
  );
}
