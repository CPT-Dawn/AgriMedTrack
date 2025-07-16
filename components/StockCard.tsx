import React, { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppColors } from "../constants/Colors";
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
}

export const StockCard: React.FC<StockCardProps> = memo(
  ({
    item,
    stockEntries,
    productActivities,
    isLogExpanded,
    onToggleLog,
    onHighlightProduct,
    qtyRightAlign = false,
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
      if (totalQuantity <= 5) return AppColors.error;
      if (totalQuantity <= 15) return AppColors.warning;
      return AppColors.success;
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
          <Text style={[styles.tableHeader, styles.companyHeader]}>
            Company
          </Text>
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
              {row.buyPrice}
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
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#263238",
    flex: 1,
    marginRight: 8,
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
    fontSize: 18,
    fontWeight: "700",
    color: "#0288D1",
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    columnGap: 10,
  },
  tableHeader: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#F9A825",
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
    columnGap: 10,
  },
  tableRowAlternate: {
    backgroundColor: "rgba(255, 112, 67, 0.05)",
  },
  tableCell: {
    flex: 1,
    fontSize: 15,
    color: "#263238",
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
