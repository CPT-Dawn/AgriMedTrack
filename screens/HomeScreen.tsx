import { Theme } from "@/constants/Theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Profile {
  id: string;
  name: string;
  avatar: string;
}

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
  user: Profile;
  action: string;
  details: string;
  timestamp: string;
  type: "stock" | "sale" | "payment";
}

// Mock data
const PROFILES: Profile[] = [
  { id: "1", name: "Gopal", avatar: "👨‍💼" },
  { id: "2", name: "Anil", avatar: "👨‍🌾" },
  { id: "3", name: "Papa", avatar: "👩‍💼" },
];

const SUMMARY_DATA: SummaryCard[] = [
  {
    id: "1",
    title: "Total Items in Stock",
    value: "1,247",
    icon: "inventory",
    color: Theme.colors.primary,
  },
  {
    id: "2",
    title: "Months's Sales",
    value: "₹15,420",
    icon: "trending-up",
    color: Theme.colors.secondary,
    trend: "+12%",
  },
  {
    id: "3",
    title: "Pending Payments",
    value: "₹8,750",
    icon: "payment",
    color: Theme.colors.accent,
  },
  {
    id: "4",
    title: "Low Stock Alerts",
    value: "5",
    icon: "warning",
    color: "#EF4444",
  },
];

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    user: PROFILES[1],
    action: "added",
    details: "3× Urea 50kg",
    timestamp: "10:42 AM",
    type: "stock",
  },
  {
    id: "2",
    user: PROFILES[2],
    action: "sold",
    details: "2× Glyphosate",
    timestamp: "12:13 PM",
    type: "sale",
  },
  {
    id: "3",
    user: PROFILES[0],
    action: "received payment",
    details: "₹2,400 from Gopal",
    timestamp: "09:15 AM",
    type: "payment",
  },
  {
    id: "4",
    user: PROFILES[1],
    action: "added",
    details: "5× NPK Fertilizer",
    timestamp: "Yesterday",
    type: "stock",
  },
  {
    id: "5",
    user: PROFILES[2],
    action: "sold",
    details: "1× Pesticide",
    timestamp: "Yesterday",
    type: "sale",
  },
];

export default function HomeScreen() {
  const [currentProfile, setCurrentProfile] = useState<Profile>(PROFILES[0]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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

      setGreeting(`${timeGreeting}, ${currentProfile.name} 👋`);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentProfile]);

  // Animate profile dropdown
  useEffect(() => {
    if (showProfileDropdown) {
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownScale, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showProfileDropdown, dropdownOpacity, dropdownScale]);

  const handleProfileSelect = (profile: Profile) => {
    setCurrentProfile(profile);
    setShowProfileDropdown(false);
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
        <View
          style={[styles.summaryIcon, { backgroundColor: item.color + "20" }]}
        >
          <MaterialIcons name={item.icon as any} size={24} color={item.color} />
        </View>
        {item.trend && (
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>{item.trend}</Text>
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
        <Text style={styles.avatarText}>{item.user.avatar}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={styles.activityUser}>{item.user.name}</Text>{" "}
          {item.action}{" "}
          <Text style={styles.activityDetails}>{item.details}</Text>
        </Text>
        <Text style={styles.activityTime}>{item.timestamp}</Text>
      </View>
      <View
        style={[
          styles.activityIcon,
          { backgroundColor: getActivityColor(item.type) + "20" },
        ]}
      >
        <MaterialIcons
          name={getActivityIcon(item.type) as any}
          size={16}
          color={getActivityColor(item.type)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} />

      {/* Header with Profile */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subtitle}>Welcome to AgriMedTrack</Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowProfileDropdown(!showProfileDropdown)}
            activeOpacity={0.8}
          >
            <Text style={styles.profileAvatar}>{currentProfile.avatar}</Text>
            <MaterialIcons
              name={
                showProfileDropdown
                  ? "keyboard-arrow-up"
                  : "keyboard-arrow-down"
              }
              size={20}
              color={Theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Profile Dropdown */}
        {showProfileDropdown && (
          <Animated.View
            style={[
              styles.profileDropdown,
              {
                opacity: dropdownOpacity,
                transform: [{ scale: dropdownScale }],
              },
            ]}
          >
            {PROFILES.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileOption,
                  currentProfile.id === profile.id &&
                    styles.profileOptionActive,
                ]}
                onPress={() => handleProfileSelect(profile)}
              >
                <Text style={styles.profileOptionAvatar}>{profile.avatar}</Text>
                <View style={styles.profileOptionInfo}>
                  <Text style={styles.profileOptionName}>{profile.name}</Text>
                </View>
                {currentProfile.id === profile.id && (
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={Theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard Overview</Text>
          <View style={styles.summaryGrid}>
            {SUMMARY_DATA.map((item) => (
              <View key={item.id} style={styles.summaryCardWrapper}>
                {renderSummaryCard({ item })}
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <MaterialIcons
                  name="add-shopping-cart"
                  size={24}
                  color={Theme.colors.white}
                />
              </View>
              <Text style={styles.quickActionText}>New Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <MaterialIcons
                  name="add-box"
                  size={24}
                  color={Theme.colors.white}
                />
              </View>
              <Text style={styles.quickActionText}>Add Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <MaterialIcons
                  name="history"
                  size={24}
                  color={Theme.colors.white}
                />
              </View>
              <Text style={styles.quickActionText}>View Logs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color={Theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {RECENT_ACTIVITIES.map((item) => (
              <View key={item.id}>{renderActivityItem({ item })}</View>
            ))}
          </View>
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
    backgroundColor: Theme.colors.surface,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0 + 20,
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surfacePressed,
    borderRadius: Theme.borderRadius["2xl"],
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  profileAvatar: {
    fontSize: Theme.typography.fontSize["2xl"],
  },
  profileDropdown: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.sm,
    ...Theme.shadows.lg,
  },
  profileOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.spacing.sm,
    gap: Theme.spacing.md,
  },
  profileOptionActive: {
    backgroundColor: Theme.colors.primary + "10",
  },
  profileOptionAvatar: {
    fontSize: Theme.typography.fontSize.xl,
  },
  profileOptionInfo: {
    flex: 1,
  },
  profileOptionName: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  profileOptionRole: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: Theme.spacing.xl,
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
    ...Theme.shadows.sm,
  },
  summaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  trendBadge: {
    backgroundColor: Theme.colors.secondary + "20",
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
  },
  trendText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.secondary,
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
  quickActions: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: Theme.spacing.lg,
    alignItems: "center",
    gap: Theme.spacing.sm,
    ...Theme.shadows.sm,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.white + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.white,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.primary,
  },
  activityList: {
    gap: Theme.spacing.md,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surfacePressed,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
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
  activityUser: {
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
});
