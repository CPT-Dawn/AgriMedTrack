import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppColors } from "../constants/Colors";
import { StockActivity, StockItem } from "../types/stock";
import { ActivityLog } from "./ActivityLog";

interface StockCardProps {
  item: StockItem;
  stockEntries: any[];
  productActivities: StockActivity[];
  isLogExpanded: boolean;
  onToggleLog: (productId: string) => void;
}

export const StockCard: React.FC<StockCardProps> = memo(
  ({ item, stockEntries, productActivities, isLogExpanded, onToggleLog }) => {
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

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.headerRow}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.totalQty}>
            {formatTotalQuantity(totalQuantity, unit)}
          </Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeader}>Company</Text>
          <Text style={styles.tableHeader}>Size</Text>
          <Text style={styles.tableHeader}>Buy ₹</Text>
          <Text style={styles.tableHeader}>Sell ₹</Text>
          <Text style={styles.tableHeader}>Qty</Text>
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
            <Text style={styles.tableCell}>{row.company}</Text>
            <Text style={styles.tableCell}>{row.packaging}</Text>
            <Text style={styles.tableCell}>{row.buyPrice}</Text>
            <Text style={styles.tableCell}>{row.sellPrice}</Text>
            <Text style={styles.tableCell}>{row.quantity}</Text>
          </View>
        ))}

        {/* Activity Log Section */}
        <View style={styles.logSection}>
          <View style={styles.logSeparator}>
            <View style={styles.logSeparatorLine} />
            <Text style={styles.logSeparatorText}>Activity Log</Text>
            <View style={styles.logSeparatorLine} />
          </View>

          <ActivityLog
            activities={productActivities}
            isExpanded={isLogExpanded}
            onToggle={() => onToggleLog(item.id)}
            productId={item.id}
          />

          {!isLogExpanded && productActivities.length > 0 && (
            <Text style={styles.logHint}>Tap to view recent activities</Text>
          )}
        </View>
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
  },
  totalQty: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0288D1",
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tableHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#F9A825",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tableRowAlternate: {
    backgroundColor: "rgba(255, 112, 67, 0.05)",
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: "#263238",
  },
  logSection: {
    marginTop: 16,
  },
  logSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  logSeparatorText: {
    marginHorizontal: 8,
    fontSize: 12,
    fontWeight: "500",
    color: "#757575",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  logHint: {
    fontSize: 12,
    color: AppColors.primary,
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
});
