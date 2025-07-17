import { getUser } from "@/services/userService";
import { User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export function useUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const [loading, setLoading] = useState(false); // Start with false

  const loadUserData = useCallback(async () => {
    setLoading(true); // Only set loading when actually loading
    try {
      const [userData, onboardingData] = await Promise.all([
        AsyncStorage.getItem("selectedUser"),
        AsyncStorage.getItem("hasCompletedOnboarding"),
      ]);

      if (userData) {
        const parsedUser = JSON.parse(userData);

        // Try to get the latest user data from Firebase
        try {
          const firebaseUser = await getUser(parsedUser.id);
          if (firebaseUser) {
            setCurrentUser(firebaseUser);
          } else {
            // If the user doesn't exist in Firebase, use the stored data
            setCurrentUser(parsedUser);
          }
        } catch (firebaseError) {
          console.error("Error fetching user from Firebase:", firebaseError);
          // Fallback to stored user data
          setCurrentUser(parsedUser);
        }
      } else {
        setCurrentUser(null);
      }

      setHasCompletedOnboarding(onboardingData === "true");
    } catch (error) {
      console.error("Error loading user data:", error);
      // Set default values on error
      setCurrentUser(null);
      setHasCompletedOnboarding(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const logout = async () => {
    try {
      // Clear AsyncStorage first
      await AsyncStorage.multiRemove([
        "selectedUser",
        "hasCompletedOnboarding",
      ]);

      // Immediately update state to trigger re-render
      setCurrentUser(null);
      setHasCompletedOnboarding(false);
      setLoading(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return {
    currentUser,
    hasCompletedOnboarding,
    loading,
    logout,
    loadUserData,
  };
}
