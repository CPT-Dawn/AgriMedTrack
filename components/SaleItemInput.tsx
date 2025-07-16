import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Theme } from "../constants/Theme";
import { CreatableDropdown } from "./CreatableDropdown";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const colors = Theme.colors;

export interface SaleItemInputProps {
  item: {
    id: string;
    productId: string;
    productName: string;
    sizeLabel: string;
    quantity: string;
    unitPrice: string;
    totalPrice: number;
  };
  index: number;
  stockItems: { id: string; name: string; size: string; price: number }[];
  onUpdate: (updates: Partial<SaleItemInputProps["item"]>) => void;
  onRemove: () => void;
  errors: {
    product?: string;
    quantity?: string;
    price?: string;
  };
}

const SaleItemInput: React.FC<SaleItemInputProps> = ({
  item,
  index,
  stockItems,
  onUpdate,
  onRemove,
  errors,
}) => {
  useEffect(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(200, "easeInEaseOut", "opacity")
    );
  }, []);

  // Product select
  const handleProductSelect = (option: { id: string; label: string }) => {
    const selectedStockItem = stockItems.find(
      (stock) => stock.id === option.id
    );
    if (selectedStockItem) {
      onUpdate({
        productId: option.id,
        productName: option.label,
        sizeLabel: selectedStockItem.size,
        unitPrice: selectedStockItem.price.toString(),
        totalPrice: calcTotal(
          item.quantity,
          selectedStockItem.price.toString()
        ),
      });
    }
  };
  const calcTotal = (quantity: string, unitPrice: string) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  };
  // Quantity
  const handleQuantityChange = (quantity: string) => {
    onUpdate({
      quantity,
      totalPrice: calcTotal(quantity, item.unitPrice),
    });
  };
  // Price
  const handleUnitPriceChange = (unitPrice: string) => {
    onUpdate({
      unitPrice,
      totalPrice: calcTotal(item.quantity, unitPrice),
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{index + 1}</Text>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Product
          </Text>
        </View>
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeBtn}
          accessibilityLabel={`Remove product ${index + 1}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="delete" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>
      {/* Product Dropdown */}
      <View style={styles.inputGroup}>
        <CreatableDropdown
          options={stockItems.map((s) => ({ id: s.id, label: s.name }))}
          value={item.productId}
          placeholder="Select product"
          onSelect={handleProductSelect}
          onCreate={async (label) => ({ id: `new-${Date.now()}`, label })}
          aria-label={`Product dropdown for item ${index + 1}`}
        />
        {errors.product && (
          <Text style={styles.errorText}>{errors.product}</Text>
        )}
      </View>
      {/* Size Dropdown/Display */}
      {item.sizeLabel ? (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Packaging Size</Text>
          <View style={styles.sizeDisplay}>
            <Text style={styles.sizeText}>{item.sizeLabel}</Text>
          </View>
        </View>
      ) : null}
      {/* Quantity and Price */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Qty</Text>
          <TextInput
            style={[styles.input, errors.quantity && styles.inputError]}
            value={item.quantity}
            onChangeText={handleQuantityChange}
            keyboardType="numeric"
            placeholder="0"
            accessibilityLabel={`Quantity for item ${index + 1}`}
            returnKeyType="next"
          />
          {errors.quantity && (
            <Text style={styles.errorText}>{errors.quantity}</Text>
          )}
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Unit Price</Text>
          <TextInput
            style={[styles.input, errors.price && styles.inputError]}
            value={item.unitPrice}
            onChangeText={handleUnitPriceChange}
            keyboardType="numeric"
            placeholder="0.00"
            accessibilityLabel={`Unit price for item ${index + 1}`}
            returnKeyType="done"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
        </View>
      </View>
      {/* Line Total */}
      <View style={styles.lineTotalRow}>
        <Text style={styles.lineTotalLabel}>Line Total</Text>
        <Text style={styles.lineTotalValue}>₹{item.totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: Theme.borderRadius["2xl"],
    padding: 16,
    marginBottom: 12,
    ...Theme.shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  badgeText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  removeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 44,
    marginBottom: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 2,
  },
  sizeDisplay: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sizeText: {
    fontSize: 14,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  lineTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  lineTotalLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  lineTotalValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default SaleItemInput;
