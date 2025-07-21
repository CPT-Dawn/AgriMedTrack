import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Theme } from "../constants/Theme";
import { Sale, StockActivity } from "../types/stock";

interface ActivitySummaryProps {
  productId: string;
  productActivities: StockActivity[];
  sales: Sale[];
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  productId,
  productActivities,
  sales,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Get recent activities for this product (up to 3)
  const recentActivities = useMemo(() => {
    const activities: {
      type: "stock" | "sale";
      data: StockActivity | Sale;
      timestamp: Date;
    }[] = [];

    // Add stock activities
    productActivities.forEach((activity) => {
      activities.push({
        type: "stock",
        data: activity,
        timestamp: activity.timestamp,
      });
    });

    // Add sale activities
    sales
      .filter((sale) =>
        sale.items.some(
          (item) =>
            item.productId === productId ||
            item.productName === productActivities[0]?.productName
        )
      )
      .forEach((sale) => {
        const saleDate =
          sale.createdAt instanceof Date
            ? sale.createdAt
            : new Date(sale.createdAt || new Date());
        activities.push({
          type: "sale",
          data: sale,
          timestamp: saleDate,
        });
      });

    // Sort by timestamp (most recent first) and take top 3
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 3);
  }, [productId, productActivities, sales]);

  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [recentActivities]);

  if (recentActivities.length === 0) {
    return (
      <Animated.View
        style={[
          styles.container,
          styles.emptyContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <MaterialIcons
          name="info-outline"
          size={20}
          color={Theme.colors.textMuted}
          style={styles.emptyIcon}
        />
        <Text style={styles.noActivityText}>No recent activity</Text>
      </Animated.View>
    );
  }

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

  const getActivityColor = (type: string) => {
    return type === "stock" ? Theme.colors.primary : Theme.colors.success;
  };

  const getActivityIcon = (type: string) => {
    return type === "stock" ? "add" : "receipt";
  };

  const renderStockActivity = (activity: StockActivity, index: number) => {
    return (
      <View key={`stock-${activity.id}-${index}`} style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <MaterialIcons
            name={getActivityIcon("stock")}
            size={20}
            color={getActivityColor("stock")}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>
            {activity.updatedByName || activity.updatedBy || "Unknown User"}
          </Text>
          <Text style={styles.activityDescription}>
            Added {activity.quantity} {activity.sizeName} from{" "}
            {activity.supplierName}
          </Text>
          <Text style={styles.activityTime}>
            {getTimeAgo(activity.timestamp)}
          </Text>
        </View>
        <View style={styles.activityAmount}>
          <Text style={styles.quantityText}>+{activity.quantity}</Text>
        </View>
      </View>
    );
  };

  const renderSaleActivity = (sale: Sale, index: number) => {
    const saleItem = sale.items.find((item) => item.productId === productId);
    if (!saleItem) return null;

    return (
      <View key={`sale-${sale.id}-${index}`} style={styles.activityItem}>
        <View style={styles.activityIcon}>
          <MaterialIcons
            name={getActivityIcon("sale")}
            size={20}
            color={getActivityColor("sale")}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>
            {sale.buyer || "Anonymous Customer"}
          </Text>
          <Text style={styles.activityDescription}>
            Sold {saleItem.quantity} {saleItem.packaging} at ₹
            {saleItem.unitPrice}
          </Text>
          <Text style={styles.activityTime}>
            {getTimeAgo(
              sale.createdAt instanceof Date
                ? sale.createdAt
                : new Date(sale.createdAt || new Date())
            )}
          </Text>
        </View>
        <View style={styles.activityAmount}>
          <Text style={styles.quantityText}>-{saleItem.quantity}</Text>
        </View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        <Text style={styles.activityCount}>
          {recentActivities.length}{" "}
          {recentActivities.length === 1 ? "activity" : "activities"}
        </Text>
      </View>

      <View style={styles.activitiesList}>
        {recentActivities.map((activity, index) => (
          <View key={`${activity.type}-${index}`}>
            {activity.type === "stock"
              ? renderStockActivity(activity.data as StockActivity, index)
              : renderSaleActivity(activity.data as Sale, index)}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    marginTop: Theme.spacing.md,
    marginHorizontal: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: Theme.spacing.sm,
  },
  noActivityText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  activityCount: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  activitiesList: {
    gap: Theme.spacing.sm,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  activityContent: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  activityTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  activityAmount: {
    alignItems: "flex-end",
  },
  quantityText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary,
  },
});
