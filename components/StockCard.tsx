import React, { memo, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Theme } from "../constants/Theme";
import { StockActivity, StockBatch, StockItem } from "../types/stock";
import { BatchActivityLog } from "./BatchActivityLog";

interface StockCardProps {
  item: StockItem;
  stockEntries: any[];
  productActivities: StockActivity[];
  isLogExpanded: boolean;
  onToggleLog: (productId: string) => void;
  onHighlightProduct?: (productId: string) => void;
  qtyRightAlign?: boolean;
  wiggle?: boolean; // new prop
}

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const StockCardComponent: React.FC<StockCardProps> = ({
  item,
  stockEntries,
  productActivities,
  isLogExpanded,
  onToggleLog,
  onHighlightProduct,
  qtyRightAlign = false,
  wiggle = false,
}) => {
  // Gather all supplier/packaging/price/quantity rows for this product
  const rows: any[] = [];
  let totalQuantity = 0;
  let unit = "";

  item.suppliers.forEach((supplierGroup) => {
    supplierGroup.sizes.forEach((sizeGroup) => {
      // Find the matching stock entry for buy/sell price
      const stockEntry = stockEntries.find(
        (e) =>
          e.productId === item.product.id &&
          e.supplierId === supplierGroup.supplier.id &&
          e.packagingId === sizeGroup.size.id
      );

      rows.push({
        company: supplierGroup.supplier.name,
        packaging: sizeGroup.size.label,
        sellPrice: stockEntry?.sellPrice ?? "",
        quantity: sizeGroup.quantity,
      });

      totalQuantity += sizeGroup.quantity;
      // Extract unit from packaging label if not already set
      if (!unit) {
        const match = sizeGroup.size.label.match(/^[\d.]+\s*([a-zA-Z]+)$/);
        if (match) {
          unit = match[1];
        }
      }
    });
  });

  function formatTotalQuantity(quantity: number, unit: string) {
    if (unit === "ml" && quantity >= 1000)
      return `${(quantity / 1000).toFixed(2)} L`;
    if (unit === "g" && quantity >= 1000)
      return `${(quantity / 1000).toFixed(2)} kg`;
    if (unit === "mg" && quantity >= 1000)
      return `${(quantity / 1000).toFixed(2)} g`;
    if (unit === "kg" || unit === "L" || unit === "gm")
      return `${quantity} ${unit}`;
    return `${quantity} ${unit}`;
  }

  // Determine stock health status
  const getStockHealthColor = () => {
    if (totalQuantity <= 5) return Theme.colors.error;
    if (totalQuantity <= 15) return Theme.colors.warning;
    return Theme.colors.success;
  };

  // Group activities by batch
  const activityBatches = useMemo(() => {
    // First, group activities by batchId
    const batchMap = new Map<string, StockActivity[]>();

    // Handle activities without batchId (legacy data)
    const unbatchedActivities: StockActivity[] = [];

    productActivities.forEach((activity) => {
      if (activity.batchId) {
        if (!batchMap.has(activity.batchId)) {
          batchMap.set(activity.batchId, []);
        }
        batchMap.get(activity.batchId)?.push(activity);
      } else {
        unbatchedActivities.push(activity);
      }
    });

    // Convert to StockBatch objects
    const batches: StockBatch[] = [];

    // Add batched activities
    batchMap.forEach((activities, batchId) => {
      if (activities.length > 0) {
        batches.push({
          id: batchId,
          addedBy: activities[0].updatedBy,
          addedByName: activities[0].updatedByName,
          addedAt: activities[0].timestamp,
          items: activities,
        });
      }
    });

    // Add individual unbatched activities as single-item batches
    unbatchedActivities.forEach((activity) => {
      batches.push({
        id: activity.id,
        addedBy: activity.updatedBy,
        addedByName: activity.updatedByName,
        addedAt: activity.timestamp,
        items: [activity],
      });
    });

    // Sort batches by date (newest first)
    return batches.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  }, [productActivities]);

  // Wiggle animation
  const wiggleAnim = useRef(new Animated.Value(0)).current;

  // Animated expansion
  const expandAnim = useRef(new Animated.Value(isLogExpanded ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isLogExpanded ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isLogExpanded]);

  // Card press feedback
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // Chevron rotation
  const chevronRotate = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Expandable section style
  const expandedStyle = {
    height: expandAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 180], // 180px max height for log
    }),
    opacity: expandAnim,
  };

  // Wiggle animation
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isLogExpanded]);

  useEffect(() => {
    if (wiggle) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wiggleAnim, {
            toValue: 1,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: -1,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      wiggleAnim.stopAnimation();
      wiggleAnim.setValue(0);
    }
  }, [wiggle]);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onToggleLog(item.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: "100%" }}
      accessibilityRole="button"
      accessibilityLabel={`Expand activity log for ${item.product.name}`}
    >
      <Animated.View
        style={[
          styles.card,
          wiggle && { transform: [{ translateX: wiggleAnim }] },
          {
            transform: [
              ...(wiggle ? [{ translateX: wiggleAnim }] : []),
              { scale: scaleAnim },
            ],
            backgroundColor: isLogExpanded
              ? Theme.colors.surfacePressed
              : Theme.colors.surface,
            shadowOpacity: isLogExpanded ? 0.18 : 0.08,
            elevation: isLogExpanded ? 6 : 2,
          },
        ]}
      >
        {/* Card header and content */}
        <View style={styles.headerRow}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <View style={styles.quantityContainer}>
            <View
              style={[
                styles.stockHealthIndicator,
                { backgroundColor: getStockHealthColor() },
              ]}
            />
            <Text style={styles.totalQty}>
              {formatTotalQuantity(totalQuantity, unit)}
            </Text>
          </View>
        </View>

        {/* Table header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeader, styles.companyHeader]}>
            Supplier
          </Text>
          <Text style={[styles.tableHeader, styles.equalHeader]}>Pack</Text>
          <Text style={[styles.tableHeader, styles.equalHeader]}>Sell</Text>
          <Text
            style={[
              styles.tableHeader,
              styles.equalHeader,
              qtyRightAlign && styles.qtyHeaderRight,
            ]}
          >
            Qty
          </Text>
        </View>

        {/* Table rows */}
        {rows.map((row, idx) => (
          <View
            key={idx}
            style={[
              styles.tableRow,
              idx % 2 === 1 ? styles.tableRowAlternate : null,
            ]}
          >
            <Text style={[styles.tableCell, styles.companyCell]}>
              {row.company}
            </Text>
            <Text style={[styles.tableCell, styles.equalCell]}>
              {row.packaging}
            </Text>
            <Text style={[styles.tableCell, styles.equalCell]}>
              {row.sellPrice}
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.equalCell,
                qtyRightAlign && styles.qtyCellRight,
              ]}
            >
              {row.quantity}
            </Text>
          </View>
        ))}

        {/* Expandable Activity Log Section */}
        <Animated.View
          style={[
            { overflow: "hidden" },
            expandedStyle,
            {
              borderBottomLeftRadius: Theme.borderRadius["2xl"],
              borderBottomRightRadius: Theme.borderRadius["2xl"],
            },
          ]}
        >
          {isLogExpanded && (
            <BatchActivityLog
              batches={activityBatches}
              isExpanded={true}
              onToggle={() => onToggleLog(item.id)}
              onItemPress={onHighlightProduct}
              hideHeader={true}
            />
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const StockCard = memo(StockCardComponent);
StockCard.displayName = "StockCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing["2xl"],
    borderRadius: Theme.borderRadius["2xl"],
    padding: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.md,
  },
  productName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockHealthIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  totalQty: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    columnGap: Theme.spacing.sm,
  },
  tableHeader: {
    flex: 1,
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 2,
  },
  companyHeader: {
    flex: 2.2,
  },
  equalHeader: {
    flex: 1,
  },
  qtyHeaderRight: {
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
    alignItems: "center",
    columnGap: Theme.spacing.sm,
  },
  tableRowAlternate: {
    backgroundColor: Theme.colors.secondary + "05",
  },
  tableCell: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text,
    paddingHorizontal: 2,
  },
  companyCell: {
    flex: 2.2,
  },
  equalCell: {
    flex: 1,
  },
  qtyCellRight: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
});
