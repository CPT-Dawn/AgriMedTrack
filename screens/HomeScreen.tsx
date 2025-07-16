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

// Theme colors matching the design system
const colors = {
  primary: "#0288D1",
  secondary: "#F9A825",
  accent: "#FF7043",
  bg: "#F5F5F5",
  text: "#263238",
  white: "#FFFFFF",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};

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
    color: colors.primary,
  },
  {
    id: "2",
    title: "Months's Sales",
    value: "₹15,420",
    icon: "trending-up",
    color: colors.secondary,
    trend: "+12%",
  },
  {
    id: "3",
    title: "Pending Payments",
    value: "₹8,750",
    icon: "payment",
    color: colors.accent,
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
        return colors.primary;
      case "sale":
        return colors.secondary;
      case "payment":
        return colors.accent;
      default:
        return colors.gray[500];
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

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
              color={colors.gray[600]}
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
                    color={colors.primary}
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
                  color={colors.white}
                />
              </View>
              <Text style={styles.quickActionText}>New Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <MaterialIcons name="add-box" size={24} color={colors.white} />
              </View>
              <Text style={styles.quickActionText}>Add Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}>
              <View style={styles.quickActionIcon}>
                <MaterialIcons name="history" size={24} color={colors.white} />
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
                color={colors.primary}
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
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0 + 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
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
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  profileAvatar: {
    fontSize: 24,
  },
  profileDropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 12,
    padding: 8,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 12,
  },
  profileOptionActive: {
    backgroundColor: colors.primary + "10",
  },
  profileOptionAvatar: {
    fontSize: 20,
  },
  profileOptionInfo: {
    flex: 1,
  },
  profileOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  profileOptionRole: {
    fontSize: 12,
    color: colors.gray[600],
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCardWrapper: {
    width: "48%",
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  trendBadge: {
    backgroundColor: colors.secondary + "20",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.secondary,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  activityUser: {
    fontWeight: "600",
  },
  activityDetails: {
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 12,
    color: colors.gray[500],
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
