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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get the latest activity for this product
  const latestActivity = useMemo(() => {
    // Get latest stock activity
    const latestStockActivity = productActivities
      .filter((activity) => activity.productName === productId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    // Get latest sale activity for this product
    const latestSale = sales
      .filter((sale) => sale.items.some((item) => item.productId === productId))
      .sort((a, b) => {
        const aDate =
          a.createdAt instanceof Date
            ? a.createdAt
            : new Date(a.createdAt || new Date());
        const bDate =
          b.createdAt instanceof Date
            ? b.createdAt
            : new Date(b.createdAt || new Date());
        return bDate.getTime() - aDate.getTime();
      })[0];

    // Compare dates and return the most recent
    if (!latestStockActivity && !latestSale) {
      return null;
    }

    if (!latestStockActivity) {
      return { type: "sale", data: latestSale };
    }

    if (!latestSale) {
      return { type: "stock", data: latestStockActivity };
    }

    const saleDate =
      latestSale.createdAt instanceof Date
        ? latestSale.createdAt
        : new Date(latestSale.createdAt || new Date());
    if (latestStockActivity.timestamp > saleDate) {
      return { type: "stock", data: latestStockActivity };
    } else {
      return { type: "sale", data: latestSale };
    }
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

    // Start pulse animation for new activities
    if (latestActivity) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [latestActivity]);

  if (!latestActivity) {
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
    return type === "stock" ? "Stock Added" : "Sold";
  };

  const renderStockActivity = (activity: StockActivity) => {
    return (
      <View style={styles.activityContainer}>
        <View style={styles.activityHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getActivityColor("stock") + "15" },
            ]}
          >
            <MaterialIcons
              name={getActivityIcon("stock")}
              size={18}
              color={getActivityColor("stock")}
            />
          </View>
          <View style={styles.headerContent}>
            <Text
              style={[
                styles.activityType,
                { color: getActivityColor("stock") },
              ]}
            >
              {getActivityTitle("stock")}
            </Text>
            <Text style={styles.activityTime}>
              {formatDate(activity.timestamp)}
            </Text>
          </View>
        </View>

        <View style={styles.activityDetails}>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityBadge}>{activity.quantity} units</Text>
            <Text style={styles.productName}>{activity.productName}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="business"
                size={12}
                color={Theme.colors.textMuted}
              />
              <Text style={styles.metaText}>{activity.supplierName}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="inventory"
                size={12}
                color={Theme.colors.textMuted}
              />
              <Text style={styles.metaText}>{activity.sizeName}</Text>
            </View>
          </View>

          {activity.updatedByName && (
            <View style={styles.userRow}>
              <MaterialIcons
                name="person"
                size={12}
                color={Theme.colors.secondary}
              />
              <Text style={styles.activityUser}>
                by {activity.updatedByName}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSaleActivity = (sale: Sale) => {
    const saleItem = sale.items.find((item) => item.productId === productId);
    if (!saleItem) return null;

    return (
      <View style={styles.activityContainer}>
        <View style={styles.activityHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getActivityColor("sale") + "15" },
            ]}
          >
            <MaterialIcons
              name={getActivityIcon("sale")}
              size={18}
              color={getActivityColor("sale")}
            />
          </View>
          <View style={styles.headerContent}>
            <Text
              style={[styles.activityType, { color: getActivityColor("sale") }]}
            >
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
        </View>

        <View style={styles.activityDetails}>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityBadge}>{saleItem.quantity} units</Text>
            <Text style={styles.productName}>{saleItem.productName}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="inventory"
                size={12}
                color={Theme.colors.textMuted}
              />
              <Text style={styles.metaText}>{saleItem.packaging}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons
                name="attach-money"
                size={12}
                color={Theme.colors.textMuted}
              />
              <Text style={styles.metaText}>₹{saleItem.unitPrice} each</Text>
            </View>
          </View>

          <View style={styles.userRow}>
            <MaterialIcons
              name="person"
              size={12}
              color={Theme.colors.secondary}
            />
            <Text style={styles.activityUser}>
              to {sale.buyer || "Unknown Buyer"}
            </Text>
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
          transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
        },
      ]}
    >
      {latestActivity.type === "stock"
        ? renderStockActivity(latestActivity.data as StockActivity)
        : renderSaleActivity(latestActivity.data as Sale)}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    marginTop: Theme.spacing.md,
    marginHorizontal: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  activityContainer: {
    gap: Theme.spacing.md,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    gap: 2,
  },
  activityType: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  activityTime: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  activityDetails: {
    gap: Theme.spacing.sm,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  quantityBadge: {
    backgroundColor: Theme.colors.primary + "15",
    color: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  productName: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    gap: Theme.spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
  },
  metaText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
  },
  activityUser: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.secondary,
    fontStyle: "italic",
    fontWeight: Theme.typography.fontWeight.medium,
  },
});
