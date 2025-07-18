import { Theme } from "@/constants/Theme";
import { useUser } from "@/hooks/useUser";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStock } from "../hooks/useStock";
import { getSales } from "../services/stockService";
import { Sale } from "../types/stock";

export default function HomeScreen() {
  const { currentUser, logout } = useUser();
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const {
    products,
    stockEntries,
    activities,
    loading: stockLoading,
  } = useStock();
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);

  // Fetch sales on mount
  useEffect(() => {
    setSalesLoading(true);
    getSales()
      .then((data) => setSales(data))
      .finally(() => setSalesLoading(false));
  }, []);

  // Update greeting based on time
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeGreeting = "";

      if (hour < 12) {
        timeGreeting = "Good Morning";
      } else if (hour < 17) {
        timeGreeting = "Good Afternoon";
      } else {
        timeGreeting = "Good Evening";
      }

      setGreeting(`${timeGreeting}, ${currentUser?.name || "User"} 👋`);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentUser]);

  // --- Summary Calculations ---
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total sales this month
  const salesThisMonth = sales.filter(
    (s) => s.saleDate && new Date(s.saleDate) >= monthStart
  );
  const totalSalesAmount = salesThisMonth.reduce(
    (sum, s) => sum + (s.totalAmount || 0),
    0
  );

  // Pending payment (unpaid or partial sales)
  const pendingSales = sales.filter(
    (s) => s.paymentStatus === "Unpaid" || s.paymentStatus === "Partial"
  );
  const pendingAmount = pendingSales.reduce(
    (sum, s) => sum + (s.totalAmount || 0),
    0
  );

  // Recent sales (last 5)
  const recentSales = sales.slice(0, 5);
  // Recent stock activities (last 5 'added')
  const recentStockAdds = activities
    .filter((a) => a.action === "added")
    .sort((a, b) => {
      const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
      const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
      return tB - tA;
    })
    .slice(0, 5);

  // --- Loading State ---
  const isLoading = stockLoading || salesLoading;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // First, clear AsyncStorage directly to ensure it's done
            await AsyncStorage.multiRemove([
              "selectedUser",
              "hasCompletedOnboarding",
            ]);

            console.log("AsyncStorage cleared");

            // Then call the logout function which will update state
            await logout();

            // Force navigation to root
            console.log("Navigating to root");
            router.replace("/");

            // Force app reload as a fallback
            setTimeout(() => {
              if (typeof window !== "undefined") {
                console.log("Reloading app");
                window.location.reload();
              }
            }, 300);
          } catch (error) {
            console.error("Error during logout:", error);

            // Even if there's an error, try to navigate back to login
            router.replace("/");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header with current user */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {currentUser?.avatar || "👤"}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.subtitle}>.</Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCardWrapper}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Pending Payment</Text>
                <Text style={styles.summaryValue}>
                  {isLoading ? "..." : `₹${pendingAmount.toLocaleString()}`}
                </Text>
              </View>
            </View>
            <View style={styles.summaryCardWrapper}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Month&apos;s Sale</Text>
                <Text style={styles.summaryValue}>
                  {isLoading ? "..." : `₹${totalSalesAmount.toLocaleString()}`}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Recent Sales</Text>
          <View style={styles.activitiesList}>
            {isLoading ? (
              <Text>Loading...</Text>
            ) : recentSales.length === 0 ? (
              <Text>No recent sales</Text>
            ) : (
              recentSales.map((sale) => (
                <View key={sale.id} style={styles.activityItemWrapper}>
                  <View style={styles.activityItem}>
                    <View style={styles.activityAvatar}>
                      <MaterialIcons name="receipt" size={24} color="#4CAF50" />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityUserName}>
                          {sale.buyer}
                        </Text>{" "}
                        bought for{" "}
                        <Text style={styles.activityDetails}>
                          ₹{sale.totalAmount}
                        </Text>
                      </Text>
                      <Text style={styles.activityTime}>
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleString()
                          : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Recent Stock Entries</Text>
          <View style={styles.activitiesList}>
            {isLoading ? (
              <Text>Loading...</Text>
            ) : recentStockAdds.length === 0 ? (
              <Text>No recent stock entries</Text>
            ) : (
              recentStockAdds.map((activity) => (
                <View key={activity.id} style={styles.activityItemWrapper}>
                  <View style={styles.activityItem}>
                    <View style={styles.activityAvatar}>
                      <MaterialIcons name="add" size={24} color="#2196F3" />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityUserName}>
                          {activity.updatedByName || activity.updatedBy}
                        </Text>{" "}
                        added{" "}
                        <Text style={styles.activityDetails}>
                          {activity.quantity} {activity.sizeName}
                        </Text>{" "}
                        of{" "}
                        <Text style={styles.activityDetails}>
                          {activity.productName}
                        </Text>
                      </Text>
                      <Text style={styles.activityTime}>
                        {activity.timestamp
                          ? new Date(activity.timestamp).toLocaleString()
                          : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  userAvatarText: {
    fontSize: Theme.typography.fontSize["2xl"],
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  summarySection: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing["2xl"],
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
  },
  summaryCardWrapper: {
    width: "48%",
  },
  summaryCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius["2xl"],
    padding: Theme.spacing.lg,
    ...Theme.shadows.md,
  },
  summaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  trendBadge: {
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
  },
  trendText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  summaryValue: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  activitiesSection: {
    paddingHorizontal: Theme.spacing.xl,
    marginBottom: Theme.spacing["2xl"],
  },
  activitiesList: {
    gap: Theme.spacing.md,
  },
  activityItemWrapper: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfacePressed,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  activityAvatarText: {
    fontSize: Theme.typography.fontSize.base,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text,
    lineHeight: 20,
  },
  activityUserName: {
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  activityDetails: {
    fontWeight: Theme.typography.fontWeight.medium,
  },
  activityTime: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutContainer: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    marginLeft: Theme.spacing.sm,
  },
});
