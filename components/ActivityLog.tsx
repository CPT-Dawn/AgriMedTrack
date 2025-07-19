import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Theme } from "../constants/Theme";
import { StockActivity } from "../types/stock";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ActivityLogProps {
  activities: StockActivity[];
  isExpanded: boolean;
  onToggle: () => void;
  productId: string;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  activities,
  isExpanded,
  onToggle,
  productId,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Configure layout animation
  const configureLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  };

  // Format date for display with relative time
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Animate header elements
  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isExpanded ? 0 : 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    if (Platform.OS === "ios") {
      configureLayoutAnimation();
    }
  }, [isExpanded, rotateAnim, fadeAnim, slideAnim]);

  // Handle toggle with animation
  const handleToggle = () => {
    if (Platform.OS === "android") {
      configureLayoutAnimation();
    }
    onToggle();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Get activity icon based on action
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "added":
        return "add-circle";
      case "updated":
        return "edit";
      case "removed":
        return "remove-circle";
      case "sold":
        return "shopping-cart";
      default:
        return "history";
    }
  };

  // Get activity color based on action
  const getActivityColor = (action: string) => {
    switch (action) {
      case "added":
        return Theme.colors.success;
      case "updated":
        return Theme.colors.primary;
      case "removed":
        return Theme.colors.error;
      case "sold":
        return Theme.colors.secondary;
      default:
        return Theme.colors.primary;
    }
  };

  // Get activity title based on action
  const getActivityTitle = (action: string) => {
    switch (action) {
      case "added":
        return "Stock Added";
      case "updated":
        return "Stock Updated";
      case "removed":
        return "Stock Removed";
      case "sold":
        return "Stock Sold";
      default:
        return "Activity";
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.header, isExpanded ? styles.headerExpanded : null]}
        onPress={handleToggle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={
          isExpanded ? "Collapse activity log" : "Expand activity log"
        }
      >
        <LinearGradient
          colors={
            isExpanded
              ? [Theme.colors.primary + "15", Theme.colors.primary + "05"]
              : [Theme.colors.surface, Theme.colors.surface]
          }
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <MaterialIcons
                name="history"
                size={20}
                color={
                  isExpanded ? Theme.colors.primary : Theme.colors.textMuted
                }
              />
            </View>
            <Text
              style={[styles.title, isExpanded ? styles.titleExpanded : null]}
            >
              Activity Log{" "}
              {activities.length > 0 ? (
                <Text style={styles.countBadge}>({activities.length})</Text>
              ) : null}
            </Text>
          </View>
          <View style={styles.toggleButtonContainer}>
            <Animated.View
              style={[styles.toggleButton, { transform: [{ rotate }] }]}
            >
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color={
                  isExpanded ? Theme.colors.primary : Theme.colors.textMuted
                }
              />
            </Animated.View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <Animated.View
                key={activity.id || index}
                style={[
                  styles.activityCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    getActivityColor(activity.action) + "10",
                    getActivityColor(activity.action) + "05",
                  ]}
                  style={styles.activityHeader}
                >
                  <View style={styles.activityHeaderContent}>
                    <View
                      style={[
                        styles.activityIconContainer,
                        {
                          backgroundColor:
                            getActivityColor(activity.action) + "15",
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={getActivityIcon(activity.action)}
                        size={18}
                        color={getActivityColor(activity.action)}
                      />
                    </View>
                    <View style={styles.activityHeaderText}>
                      <Text
                        style={[
                          styles.activityTitle,
                          { color: getActivityColor(activity.action) },
                        ]}
                      >
                        {getActivityTitle(activity.action)}
                      </Text>
                      <Text style={styles.activitySubtitle}>
                        {activity.quantity} {activity.sizeName}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dateContainer}>
                    <MaterialIcons
                      name="schedule"
                      size={14}
                      color={Theme.colors.textMuted}
                    />
                    <Text style={styles.activityDate}>
                      {formatDate(activity.timestamp)}
                    </Text>
                  </View>
                </LinearGradient>

                <View style={styles.activityDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <MaterialIcons
                        name="inventory"
                        size={14}
                        color={Theme.colors.textMuted}
                      />
                      <Text style={styles.detailText}>
                        {activity.productName}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons
                        name="business"
                        size={14}
                        color={Theme.colors.textMuted}
                      />
                      <Text style={styles.detailText}>
                        {activity.supplierName}
                      </Text>
                    </View>
                  </View>

                  {activity.updatedByName && (
                    <View style={styles.userRow}>
                      <MaterialIcons
                        name="person"
                        size={12}
                        color={Theme.colors.secondary}
                      />
                      <Text style={styles.userText}>
                        by {activity.updatedByName}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="inbox"
                size={48}
                color={Theme.colors.textMuted}
              />
              <Text style={styles.emptyText}>No activity recorded yet</Text>
              <Text style={styles.emptySubtext}>
                Product activities will appear here
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    overflow: "hidden",
    marginHorizontal: Theme.spacing.sm,
    marginVertical: Theme.spacing.sm,
    ...Theme.shadows.md,
  },
  header: {
    borderRadius: Theme.borderRadius.xl,
    overflow: "hidden",
  },
  headerExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerGradient: {
    padding: Theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.textMuted,
  },
  titleExpanded: {
    color: Theme.colors.text,
  },
  countBadge: {
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  toggleButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Theme.shadows.sm,
  },
  toggleButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  activityCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    overflow: "hidden",
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  activityHeader: {
    padding: Theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activityHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  activityHeaderText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
  },
  activityDate: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  activityDetails: {
    padding: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    gap: Theme.spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
    flex: 1,
  },
  detailText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
  },
  userText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.secondary,
    fontStyle: "italic",
    fontWeight: Theme.typography.fontWeight.medium,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Theme.spacing["4xl"],
    gap: Theme.spacing.md,
  },
  emptyText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
});
