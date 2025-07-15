import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
import { AppColors } from "../constants/Colors";
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

  // Configure layout animation
  const configureLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Animate chevron rotation
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (Platform.OS === "ios") {
      configureLayoutAnimation();
    }
  }, [isExpanded]);

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
      default:
        return "history";
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.header, isExpanded ? styles.headerExpanded : null]}
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          isExpanded ? "Collapse activity log" : "Expand activity log"
        }
      >
        <View style={styles.headerContent}>
          <MaterialIcons
            name="history"
            size={18}
            color={isExpanded ? AppColors.primary : "#666"}
            style={styles.headerIcon}
          />
          <Text
            style={[styles.title, isExpanded ? styles.titleExpanded : null]}
          >
            Latest Updates{" "}
            {activities.length > 0 ? `(${Math.min(activities.length, 3)})` : ""}
          </Text>
        </View>
        <View style={styles.toggleButtonContainer}>
          <Animated.View
            style={[styles.toggleButton, { transform: [{ rotate }] }]}
          >
            <MaterialIcons
              name="keyboard-arrow-down"
              size={20}
              color={isExpanded ? AppColors.primary : "#666"}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {activities.length > 0 ? (
            activities.slice(0, 3).map((activity, index) => (
              <View key={activity.id || index} style={styles.activityItem}>
                <View style={styles.avatar}>
                  <MaterialIcons
                    name={getActivityIcon(activity.action)}
                    size={16}
                    color={AppColors.primary}
                  />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.actionText}>
                    <Text style={styles.actionType}>{activity.action}</Text>{" "}
                    {activity.quantity} {activity.sizeName}
                  </Text>
                  <Text style={styles.timestamp}>
                    {formatDate(activity.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No recent activity for this product
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    minHeight: 48,
    borderRadius: 8,
  },
  headerExpanded: {
    backgroundColor: "rgba(2, 136, 209, 0.05)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  titleExpanded: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  toggleButtonContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    padding: 4,
  },
  content: {
    backgroundColor: "rgba(2, 136, 209, 0.03)",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: AppColors.primary,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    color: AppColors.text,
  },
  actionType: {
    color: AppColors.primary,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  timestamp: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: "#757575",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
});
