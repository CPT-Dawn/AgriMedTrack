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
    const activities: Array<{
      type: "stock" | "sale";
      data: StockActivity | Sale;
      timestamp: Date;
    }> = [];

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
      .filter((sale) => sale.items.some((item) => item.productId === productId))
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

  const getActivityColor = (type: string) => {
    return type === "stock" ? Theme.colors.success : Theme.colors.primary;
  };

  const getActivityIcon = (type: string) => {
    return type === "stock" ? "add-circle" : "shopping-cart";
  };

  const getActivityTitle = (type: string) => {
    return type === "stock" ? "Added" : "Sold";
  };

  const renderStockActivity = (activity: StockActivity, index: number) => {
    return (
      <View 
        key={`stock-${activity.id}-${index}`} 
        style={[
          styles.activityItem,
          index % 2 === 1 && styles.activityItemAlternate
        ]}
      >
        <View style={styles.activityHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getActivityColor("stock") + "10" },
            ]}
          >
            <MaterialIcons
              name={getActivityIcon("stock")}
              size={16}
              color={getActivityColor("stock")}
            />
          </View>
          <View style={styles.headerContent}>
            <Text style={[styles.activityType, { color: getActivityColor("stock") }]}>
              {getActivityTitle("stock")}
            </Text>
            <Text style={styles.activityTime}>
              {formatDate(activity.timestamp)}
            </Text>
          </View>
          <View style={styles.quantityBadge}>
            <Text
              style={[
                styles.quantityText,
                { color: getActivityColor("stock") },
              ]}
            >
              +{activity.quantity}
            </Text>
          </View>
        </View>

        <View style={styles.activityDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons
              name="business"
              size={12}
              color={Theme.colors.textMuted}
            />
            <Text style={styles.detailText}>{activity.supplierName}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons
              name="inventory"
              size={12}
              color={Theme.colors.textMuted}
            />
            <Text style={styles.detailText}>{activity.sizeName}</Text>
          </View>
          {activity.updatedByName && (
            <View style={styles.detailRow}>
              <MaterialIcons
                name="person"
                size={12}
                color={Theme.colors.textMuted}
              />
              <Text style={styles.detailText}>{activity.updatedByName}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSaleActivity = (sale: Sale, index: number) => {
    const saleItem = sale.items.find((item) => item.productId === productId);
    if (!saleItem) return null;

    return (
      <View 
        key={`sale-${sale.id}-${index}`} 
        style={[
          styles.activityItem,
          index % 2 === 1 && styles.activityItemAlternate
        ]}
      >
        <View style={styles.activityHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getActivityColor("sale") + "10" },
            ]}
          >
            <MaterialIcons
              name={getActivityIcon("sale")}
              size={16}
              color={getActivityColor("sale")}
            />
          </View>
          <View style={styles.headerContent}>
            <Text style={[styles.activityType, { color: getActivityColor("sale") }]}>
              {getActivityTitle("sale")}
            </Text>
            <Text style={styles.activityTime}>
              {formatDate(
                sale.createdAt instanceof Date
                  ? sale.createdAt
                  : new Date(sale.createdAt || new Date())
              )}
            </Text>
          </View>
          <View style={styles.quantityBadge}>
            <Text
              style={[styles.quantityText, { color: getActivityColor("sale") }]}
            >
              -{saleItem.quantity}
            </Text>
          </View>
        </View>

        <View style={styles.activityDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons
              name="inventory"
              size={12}
              color={Theme.colors.textMuted}
            />
            <Text style={styles.detailText}>{saleItem.packaging}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons
              name="attach-money"
              size={12}
              color={Theme.colors.textMuted}
            />
            <Text style={styles.detailText}>₹{saleItem.unitPrice}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons
              name="person"
              size={12}
              color={Theme.colors.textMuted}
            />
            <Text style={styles.detailText}>{sale.buyer || "Unknown"}</Text>
          </View>
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
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.activityCount}>
          {recentActivities.length} {recentActivities.length === 1 ? 'activity' : 'activities'}
        </Text>
      </View>

      <View style={styles.activitiesList}>
        {recentActivities.map((activity, index) => (
          <View key={`${activity.type}-${index}`}>
            {activity.type === "stock"
              ? renderStockActivity(activity.data as StockActivity, index)
              : renderSaleActivity(activity.data as Sale, index)}
            {index < recentActivities.length - 1 && (
              <View style={styles.separator} />
            )}
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
    gap: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.divider,
  },
  activityItemAlternate: {
    backgroundColor: Theme.colors.secondary + "05",
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    gap: 2,
  },
  activityType: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  activityTime: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  quantityBadge: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  activityDetails: {
    marginLeft: 36, // Align with header content
    gap: Theme.spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
  },
  detailText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.divider,
    marginVertical: Theme.spacing.sm,
  },
});
