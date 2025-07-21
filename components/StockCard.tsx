import React, { memo, useEffect, useRef } from "react";
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
import { Sale, StockActivity, StockItem } from "../types/stock";
import { ActivitySummary } from "./ActivitySummary";

interface StockCardProps {
  item: StockItem;
  stockEntries: any[];
  productActivities: StockActivity[];
  sales: Sale[];
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
  sales,
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
  }, [isLogExpanded, expandAnim]);

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

  // Chevron rotation (commented out as not currently used)
  // const chevronRotate = expandAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: ["0deg", "180deg"],
  // });

  // Expandable section style
  const expandedStyle = {
    maxHeight: expandAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 500], // Use maxHeight instead of fixed height
    }),
    opacity: expandAnim,
    overflow: "hidden" as const,
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
  }, [wiggle, wiggleAnim]);

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
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.product.name}</Text>
          </View>
          <View style={styles.quantityContainer}>
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
          <Text
            style={[
              styles.tableHeader,
              styles.equalHeader,
              styles.centerHeader,
            ]}
          >
            Pack
          </Text>
          <Text
            style={[
              styles.tableHeader,
              styles.equalHeader,
              styles.centerHeader,
            ]}
          >
            Sell
          </Text>
          <Text
            style={[
              styles.tableHeader,
              styles.equalHeader,
              styles.qtyHeaderRight,
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
            <Text
              style={[styles.tableCell, styles.equalCell, styles.centerCell]}
            >
              {row.packaging}
            </Text>
            <Text
              style={[styles.tableCell, styles.equalCell, styles.centerCell]}
            >
              {row.sellPrice}
            </Text>
            <Text
              style={[styles.tableCell, styles.equalCell, styles.qtyCellRight]}
            >
              {row.quantity}
            </Text>
          </View>
        ))}

        {/* Expandable Activity Log Section */}
        <Animated.View
          style={[
            expandedStyle,
            {
              borderBottomLeftRadius: Theme.borderRadius["2xl"],
              borderBottomRightRadius: Theme.borderRadius["2xl"],
            },
          ]}
        >
          {isLogExpanded && (
            <ActivitySummary
              productId={item.product.id}
              productActivities={productActivities}
              sales={sales}
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
  productInfo: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  productName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  activityIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
    marginTop: Theme.spacing.xs,
  },
  activityIndicatorText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.medium,
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
  centerHeader: {
    textAlign: "center",
  },
  centerCell: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
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
