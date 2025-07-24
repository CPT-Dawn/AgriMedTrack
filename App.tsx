import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import {
  useFonts as useMontserrat,
  Montserrat_700Bold,
  Montserrat_900Black,
} from "@expo-google-fonts/montserrat";
import { useFonts as useLato, Lato_400Regular } from "@expo-google-fonts/lato";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, Alert, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import DashboardScreen from "./screens/DashboardScreen";
import InventoryScreen from "./screens/InventoryScreen";
import SalesScreen from "./screens/SalesScreen";
import LoginScreen from "./screens/LoginScreen";
import AddInventoryScreen from "./screens/AddInventoryScreen";
import ViewLogsScreen from "./screens/ViewLogsScreen";
import LoadingScreen from "./components/LoadingScreen";
import { colors } from "./theme";
import { auth } from "./services/firebase";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";
import { UIProvider } from "./hooks/useUI";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [montserratLoaded] = useMontserrat({
    Montserrat_700Bold,
    Montserrat_900Black,
  });
  const [latoLoaded] = useLato({
    Lato_400Regular,
  });
  const fontsLoaded = montserratLoaded && latoLoaded;
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    } else {
      SplashScreen.preventAutoHideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || authLoading) {
    return <LoadingScreen message="Initializing Patel Krishi Kendra..." />;
  }

  // Firebase config check
  if (auth.app.options.apiKey === "YOUR_API_KEY") {
    Alert.alert(
      "Firebase Not Configured",
      "Please update services/firebase.ts with your Firebase project config."
    );
  }

  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config}>
        <ToastProvider>
          <UIProvider>
            <NavigationContainer>
              <Stack.Navigator
                id={undefined}
                screenOptions={{ headerShown: false }}
              >
                {user ? (
                  <>
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                    <Stack.Screen
                      name="AddInventory"
                      component={AddInventoryScreen}
                    />
                    <Stack.Screen name="ViewLogs" component={ViewLogsScreen} />
                  </>
                ) : (
                  <Stack.Screen name="Login">
                    {() => <LoginScreen onLoginSuccess={() => {}} />}
                  </Stack.Screen>
                )}
                {/* Future: Add modal screens here */}
              </Stack.Navigator>
            </NavigationContainer>
          </UIProvider>
        </ToastProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = "home";
          if (route.name === "Dashboard") iconName = "grid-outline";
          else if (route.name === "Inventory") iconName = "cube-outline";
          else if (route.name === "Sales") iconName = "cash-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontFamily: "Lato_400Regular" },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Sales" component={SalesScreen} />
    </Tab.Navigator>
  );
}
