import React, { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
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
  showBuyValues?: boolean;
}

const StockCardComponent: React.FC<StockCardProps> = ({
  item,
  stockEntries,
  productActivities,
  isLogExpanded,
  onToggleLog,
  onHighlightProduct,
  qtyRightAlign = false,
  showBuyValues = true,
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
          e.sizeId === sizeGroup.size.id
      );

      rows.push({
        company: supplierGroup.supplier.name,
        packaging: sizeGroup.size.label,
        buyPrice: stockEntry?.buyPrice ?? "",
        sellPrice: stockEntry?.sellPrice ?? "",
        quantity: sizeGroup.quantity,
      });

      totalQuantity += sizeGroup.quantity;
      if (!unit) unit = sizeGroup.size.unit;
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

  return (
    <View style={styles.card}>
      {/* Card Header */}
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

      {/* Table Header */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeader, styles.companyHeader]}>Company</Text>
        <Text style={[styles.tableHeader, styles.equalHeader]}>Size</Text>
        <Text style={[styles.tableHeader, styles.equalHeader]}>Buy ₹</Text>
        <Text style={[styles.tableHeader, styles.equalHeader]}>Sell ₹</Text>
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

      {/* Table Rows */}
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
            {showBuyValues ? row.buyPrice : row.buyPrice ? "***" : ""}
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

      {/* Activity Log Section */}
      <BatchActivityLog
        batches={activityBatches}
        isExpanded={isLogExpanded}
        onToggle={() => onToggleLog(item.id)}
        onItemPress={onHighlightProduct}
      />
    </View>
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
