import { Theme } from "@/constants/Theme";
import { useUser } from "@/hooks/useUser";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const {
    products,
    stockEntries,
    activities,
    loading: stockLoading,
  } = useStock();
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);

  // Fetch sales data
  const fetchSales = async () => {
    try {
      setSalesLoading(true);
      const salesData = await getSales();
      setSales(salesData);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setSalesLoading(false);
    }
  };

  // Initial fetch and refresh handler
  useEffect(() => {
    fetchSales();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSales();
    setRefreshing(false);
  };

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

      setGreeting(`${timeGreeting}, ${currentUser?.name || "User"}`);
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
            await AsyncStorage.multiRemove([
              "selectedUser",
              "hasCompletedOnboarding",
            ]);
            await logout();
            router.replace("/");
            setTimeout(() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }, 300);
          } catch (error) {
            console.error("Error during logout:", error);
            router.replace("/");
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getSaleSummary = (sale: Sale) => {
    const itemCount = sale.items?.length || 0;
    const totalAmount = sale.totalAmount || 0;

    if (itemCount === 0) return `Sale of ${formatCurrency(totalAmount)}`;
    if (itemCount === 1)
      return `${sale.items[0].productName} - ${formatCurrency(totalAmount)}`;
    return `${itemCount} items - ${formatCurrency(totalAmount)}`;
  };

  const getStockActivitySummary = (activity: any) => {
    const quantity = activity.quantity || 0;
    const productName = activity.productName || "Unknown Product";
    const sizeName = activity.sizeName || "";

    return `${quantity} ${sizeName} of ${productName}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Theme.colors.background}
      />

      {/* Clean Header */}
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
              <Text style={styles.subtitle}>Welcome to AgriMedTrack</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name="pending"
                  size={20}
                  color={Theme.colors.error}
                />
                <Text style={styles.cardLabel}>Pending</Text>
              </View>
              <Text style={styles.cardValue}>
                {isLoading ? "..." : formatCurrency(pendingAmount)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name="trending-up"
                  size={20}
                  color={Theme.colors.success}
                />
                <Text style={styles.cardLabel}>This Month</Text>
              </View>
              <Text style={styles.cardValue}>
                {isLoading ? "..." : formatCurrency(totalSalesAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Sales */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sales</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading recent sales...</Text>
              </View>
            ) : recentSales.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="receipt"
                  size={32}
                  color={Theme.colors.textMuted}
                />
                <Text style={styles.emptyStateText}>No recent sales</Text>
              </View>
            ) : (
              recentSales.map((sale) => (
                <View key={sale.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <MaterialIcons
                      name="receipt"
                      size={20}
                      color={Theme.colors.success}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {sale.buyer || "Anonymous Customer"}
                    </Text>
                    <Text style={styles.activityDescription}>
                      {getSaleSummary(sale)}
                    </Text>
                    <Text style={styles.activityTime}>
                      {sale.saleDate ? getTimeAgo(new Date(sale.saleDate)) : ""}
                    </Text>
                  </View>
                  <View style={styles.activityAmount}>
                    <Text style={styles.amountText}>
                      {formatCurrency(sale.totalAmount || 0)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            sale.paymentStatus === "Paid"
                              ? Theme.colors.success
                              : Theme.colors.warning,
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {sale.paymentStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Recent Stock Entries */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Stock Entries</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading stock entries...</Text>
              </View>
            ) : recentStockAdds.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="inventory"
                  size={32}
                  color={Theme.colors.textMuted}
                />
                <Text style={styles.emptyStateText}>
                  No recent stock entries
                </Text>
              </View>
            ) : (
              recentStockAdds.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <MaterialIcons
                      name="add"
                      size={20}
                      color={Theme.colors.primary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {activity.updatedByName ||
                        activity.updatedBy ||
                        "Unknown User"}
                    </Text>
                    <Text style={styles.activityDescription}>
                      {getStockActivitySummary(activity)}
                    </Text>
                    <Text style={styles.activityTime}>
                      {activity.timestamp
                        ? getTimeAgo(new Date(activity.timestamp))
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.activityAmount}>
                    <Text style={styles.quantityText}>
                      {activity.quantity || 0}
                    </Text>
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
            <MaterialIcons name="logout" size={20} color={Theme.colors.error} />
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
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...Theme.shadows.sm,
  },
  userAvatarText: {
    fontSize: 20,
    color: "white",
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "600",
    color: Theme.colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontWeight: "400",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.text,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: Theme.colors.primary,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    ...Theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Theme.colors.textMuted,
    marginLeft: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Theme.colors.text,
  },
  activitiesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    ...Theme.shadows.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.text,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  activityAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.text,
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
    color: "white",
    textTransform: "uppercase",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontWeight: "500",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: "500",
    color: Theme.colors.textMuted,
    marginTop: 8,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.sm,
  },
  logoutText: {
    color: Theme.colors.error,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
