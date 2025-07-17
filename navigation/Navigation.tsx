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
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.15)",
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderLeftColor: "rgba(255, 255, 255, 0.1)",
          borderRightColor: "rgba(255, 255, 255, 0.1)",
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 12,
          paddingHorizontal: 16,
          elevation: 20,
          shadowColor: AppColors.shadow,
          shadowOffset: {
            width: 0,
            height: -12,
          },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          position: "absolute",
          // Add 3D effect with multiple shadows and curved corners
          ...Platform.select({
            ios: {
              shadowColor: AppColors.shadow,
              shadowOffset: { width: 0, height: -12 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              // Add inner shadow for curved corners
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
            },
            android: {
              elevation: 20,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
            },
          }),
        },

        // Tab bar item styling
        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: 6,
          paddingVertical: 6,
          paddingHorizontal: 8,
          // Add 3D effect to individual tabs with curved corners
          ...Platform.select({
            ios: {
              shadowColor: AppColors.shadow,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
            android: {
              elevation: 6,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }),
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
                transform: [{ scale: focused ? 1.1 : 1 }],
                opacity: focused ? 1 : 0.7,
                // Add enhanced 3D effect to icons with curved appearance
                ...Platform.select({
                  ios: {
                    shadowColor: focused ? AppColors.primary : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: focused ? 0.4 : 0,
                    shadowRadius: 4,
                    // Add subtle glow effect for focused state
                    textShadowColor: focused
                      ? AppColors.primary
                      : "transparent",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: focused ? 3 : 0,
                  },
                  android: {
                    elevation: focused ? 4 : 0,
                  },
                }),
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
