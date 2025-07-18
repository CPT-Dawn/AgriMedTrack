import { initializeDefaultUsers } from "@/services/userService";
import { User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function FirstTimeLoginScreen() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [buttonScale] = useState(new Animated.Value(1));
  const router = useRouter();

  // Load users from Firebase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // Initialize default users if they don't exist
        const fetchedUsers = await initializeDefaultUsers();

        // Log the fetched users for debugging
        console.log("Fetched users:", JSON.stringify(fetchedUsers));

        setUsers(fetchedUsers);
        setError(null);
      } catch (err) {
        console.error("Error loading users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  React.useEffect(() => {
    // Staggered animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleUserSelect = (user: User) => {
    console.log("User selected:", JSON.stringify(user));
    setSelectedUser(user);

    // Enhanced selection animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Button animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!selectedUser) return;

    try {
      console.log("Selected user:", selectedUser);

      // Save selected user to AsyncStorage
      await AsyncStorage.setItem("selectedUser", JSON.stringify(selectedUser));
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving user selection:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.backgroundGradient}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🌾</Text>
          </View>
          <Text style={styles.title}>Welcome to AgriMedTrack</Text>
          <Text style={styles.subtitle}>
            Choose your profile to get started
          </Text>
        </View>

        {/* User Selection */}
        <View style={styles.userSelection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setLoading(true);
                  initializeDefaultUsers()
                    .then((fetchedUsers) => {
                      setUsers(fetchedUsers);
                      setError(null);
                    })
                    .catch((err) => {
                      setError("Failed to load users. Please try again.");
                    })
                    .finally(() => setLoading(false));
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            users.map((user, index) => (
              <Animated.View
                key={user.id}
                style={[
                  styles.userCardWrapper,
                  {
                    transform: [
                      { scale: selectedUser?.id === user.id ? scaleAnim : 1 },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.userCard,
                    selectedUser?.id === user.id && styles.userCardSelected,
                  ]}
                  onPress={() => handleUserSelect(user)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatar}>{user.avatar}</Text>
                      {selectedUser?.id === user.id && (
                        <View style={styles.selectionIndicator}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedUser && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!selectedUser}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  selectedUser ? ["#4CAF50", "#45a049"] : ["#E0E0E0", "#E0E0E0"]
                }
                style={styles.buttonGradient}
              >
                <Text style={styles.continueButtonText}>
                  {selectedUser
                    ? `Continue as ${selectedUser.name}`
                    : "Select a profile"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: 200,
    left: -75,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: SCREEN_HEIGHT * 0.3,
    right: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: 400,
  },
  userSelection: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  userCardWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  userCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  userCardSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    elevation: 12,
    transform: [{ scale: 1.05 }],
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  avatar: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 600,
    color: "#2D3748",
    marginBottom: 0,
  },
  selectionIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  continueButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonContainer: {
    marginTop: 40,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
