import { Theme } from "@/constants/Theme";
import { useUser } from "@/hooks/useUser";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SummaryCard {
  id: string;
  title: string;
  value: string;
  icon: string;
  color?: string;
  trend?: string;
}

interface ActivityItem {
  id: string;
  user: { name: string; avatar: string };
  action: string;
  details: string;
  timestamp: string;
  type: "stock" | "sale" | "payment";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, logout } = useUser();
  const router = useRouter();
  const [greeting, setGreeting] = useState("");

  // Animated values
  const dropdownOpacity = React.useMemo(() => new Animated.Value(0), []);
  const dropdownScale = React.useMemo(() => new Animated.Value(0.8), []);

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

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "stock":
        return "add-circle";
      case "sale":
        return "shopping-cart";
      case "payment":
        return "payment";
      default:
        return "info";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "stock":
        return Theme.colors.primary;
      case "sale":
        return Theme.colors.secondary;
      case "payment":
        return Theme.colors.accent;
      default:
        return Theme.colors.textMuted;
    }
  };

  // Render summary card
  const renderSummaryCard = ({ item }: { item: SummaryCard }) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryCardHeader}>
        <MaterialIcons
          name={item.icon as any}
          size={24}
          color={item.color || Theme.colors.primary}
        />
        {item.trend && (
          <View
            style={[styles.trendBadge, { backgroundColor: item.color + "15" }]}
          >
            <Text style={[styles.trendText, { color: item.color }]}>
              {item.trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.summaryValue}>{item.value}</Text>
      <Text style={styles.summaryTitle}>{item.title}</Text>
    </View>
  );

  // Render activity item
  const renderActivityItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityAvatar}>
        <Text style={styles.activityAvatarText}>{item.user.avatar}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={styles.activityUserName}>{item.user.name}</Text>{" "}
          {item.action}{" "}
          <Text style={styles.activityDetails}>{item.details}</Text>
        </Text>
        <Text style={styles.activityTime}>{item.timestamp}</Text>
      </View>
      <View
        style={[
          styles.activityIcon,
          { backgroundColor: getActivityColor(item.type) + "15" },
        ]}
      >
        <MaterialIcons
          name={getActivityIcon(item.type) as any}
          size={20}
          color={getActivityColor(item.type)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} />

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
            {/* Summary cards will be rendered here using Firebase data */}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activitiesList}>
            {/* Recent activities will be rendered here using Firebase data */}
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
