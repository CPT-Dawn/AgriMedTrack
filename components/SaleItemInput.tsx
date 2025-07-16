import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "../constants/Colors";
import { CreatableDropdown } from "./CreatableDropdown";

// Theme colors matching the design system
const colors = {
  primary: "#0288D1",
  secondary: "#F9A825",
  accent: "#FF7043",
  bg: "#F5F5F5",
  text: "#263238",
  white: "#FFFFFF",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};

interface StockItem {
  id: string;
  name: string;
  size: string;
  price: number;
}

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sizeLabel: string;
  quantity: string;
  unitPrice: string;
  totalPrice: number;
}

interface SaleItemInputProps {
  item: SaleItem;
  index: number;
  stockItems: StockItem[];
  onUpdate: (updates: Partial<SaleItem>) => void;
  onRemove: () => void;
  errors: {
    product?: string;
    quantity?: string;
    price?: string;
  };
}

export const SaleItemInput: React.FC<SaleItemInputProps> = ({
  item,
  index,
  stockItems,
  onUpdate,
  onRemove,
  errors,
}) => {
  // Calculate total price when quantity or unit price changes
  const calculateTotal = (quantity: string, unitPrice: string) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  };

  // Handle product selection
  const handleProductSelect = (option: { id: string; label: string }) => {
    const selectedStockItem = stockItems.find(stock => stock.id === option.id);
    if (selectedStockItem) {
      onUpdate({
        productId: option.id,
        productName: option.label,
        sizeLabel: selectedStockItem.size,
        unitPrice: selectedStockItem.price.toString(),
        totalPrice: calculateTotal(item.quantity, selectedStockItem.price.toString()),
      });
    }
  };

  // Handle quantity change
  const handleQuantityChange = (quantity: string) => {
    const totalPrice = calculateTotal(quantity, item.unitPrice);
    onUpdate({
      quantity,
      totalPrice,
    });
  };

  // Handle unit price change
  const handleUnitPriceChange = (unitPrice: string) => {
    const totalPrice = calculateTotal(item.quantity, unitPrice);
    onUpdate({
      unitPrice,
      totalPrice,
    });
  };

  return (
    <View style={styles.itemCard}>
      {/* Header */}
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderLeft}>
          <View style={styles.itemNumberBadge}>
            <Text style={styles.itemNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.itemHeaderText}>
            <Text style={styles.itemTitle}>Product Item</Text>
            <Text style={styles.itemSubtitle}>
              {item.productName ? item.productName : "Select a product"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="delete-outline"
            size={20}
            color={colors.accent}
          />
        </TouchableOpacity>
      </View>

      {/* Product Selection */}
      <View style={styles.itemSection}>
        <Text style={styles.sectionLabel}>
          Product Information <Text style={styles.requiredAsterisk}>*</Text>
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Product Name</Text>
          <View style={styles.dropdownContainer}>
            <CreatableDropdown
              options={stockItems.map((stock) => ({ id: stock.id, label: stock.name }))}
              value={item.productId}
              placeholder="Select product"
              onSelect={handleProductSelect}
              onCreate={async (newLabel: string) => {
                // For now, just return a mock option
                const mockId = `new-${Date.now()}`;
                return { id: mockId, label: newLabel };
              }}
            />
          </View>
          {errors.product && (
            <View style={styles.errorContainer}>
              <MaterialIcons
                name="error-outline"
                size={16}
                color={AppColors.error}
              />
              <Text style={styles.errorText}>{errors.product}</Text>
            </View>
          )}
        </View>

        {item.sizeLabel && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Packaging Size</Text>
            <View style={styles.sizeDisplay}>
              <Text style={styles.sizeText}>{item.sizeLabel}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Quantity and Pricing */}
      <View style={styles.itemSection}>
        <Text style={styles.sectionLabel}>Quantity & Pricing</Text>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>
              Quantity <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="inventory"
                size={20}
                color={colors.gray[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.textInput,
                  styles.inputWithIcon,
                  errors.quantity && styles.inputError,
                ]}
                value={item.quantity}
                onChangeText={handleQuantityChange}
                placeholder="Enter quantity"
                keyboardType="numeric"
                placeholderTextColor={colors.gray[400]}
              />
            </View>
            {errors.quantity && (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={16}
                  color={AppColors.error}
                />
                <Text style={styles.errorText}>{errors.quantity}</Text>
              </View>
            )}
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>
              Unit Price (₹) <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="attach-money"
                size={20}
                color={colors.gray[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.textInput,
                  styles.inputWithIcon,
                  errors.price && styles.inputError,
                ]}
                value={item.unitPrice}
                onChangeText={handleUnitPriceChange}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={colors.gray[400]}
              />
            </View>
            {errors.price && (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={16}
                  color={AppColors.error}
                />
                <Text style={styles.errorText}>{errors.price}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Total Price Display */}
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceLabel}>Total Price:</Text>
          <Text style={styles.totalPriceAmount}>₹{item.totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* Item Summary */}
      {item.productName && item.quantity && (
        <View style={styles.itemSummary}>
          <MaterialIcons name="check-circle" size={16} color={colors.primary} />
          <Text style={styles.itemSummaryText}>
            {item.productName} • {item.quantity} units • ₹{item.totalPrice.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemNumberBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemNumberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  itemHeaderText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  itemSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: 12,
  },
  requiredAsterisk: {
    color: AppColors.error,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 8,
  },
  dropdownContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sizeDisplay: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sizeText: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWithIcon: {
    flex: 1,
    paddingLeft: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: AppColors.error,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    color: AppColors.error,
    fontSize: 12,
  },
  totalPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[700],
  },
  totalPriceAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  itemSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  itemSummaryText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 8,
  },
}); 