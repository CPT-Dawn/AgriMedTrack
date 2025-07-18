import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
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
    packaging: string;
    quantity: string;
    unitPrice: string;
    totalPrice: number;
    supplierId?: string;
    supplierName?: string;
  };
  index: number;
  stockItems: {
    id: string;
    name: string;
    packaging: string;
    price: number;
    inStock: boolean;
    suppliers?: { id: string; name: string }[];
    availableQuantity?: number;
    packagingOptions?: { packaging: string; price: number; quantity: number }[];
  }[];
  onUpdate: (updates: Partial<SaleItemInputProps["item"]>) => void;
  onRemove: () => void;
  errors: {
    product?: string;
    quantity?: string;
    price?: string;
    supplier?: string;
  };
  initiallyExpanded?: boolean;
}

const SaleItemInput: React.FC<SaleItemInputProps> = ({
  item,
  index,
  stockItems,
  onUpdate,
  onRemove,
  errors,
  initiallyExpanded = false,
}) => {
  const [noStockMessage, setNoStockMessage] = useState("");
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [availableSizes, setAvailableSizes] = useState<
    { id: string; label: string }[]
  >([]);
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);
  const [exceedsStock, setExceedsStock] = useState<boolean>(false);

  useEffect(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(200, "easeInEaseOut", "opacity")
    );
  }, [expanded]);

  // Set expanded state based on initiallyExpanded prop
  useEffect(() => {
    setExpanded(initiallyExpanded);
  }, [initiallyExpanded]);

  // Filter stock items to only show those in stock
  const inStockItems = stockItems.filter((item) => item.inStock);

  // Ensure dropdowns are pre-filled when editing
  useEffect(() => {
    if (item.productId) {
      const selectedStockItem = stockItems.find(
        (stock) => stock.id === item.productId
      );
      if (selectedStockItem) {
        // Set suppliers for this product
        setSuppliers(selectedStockItem.suppliers || []);
        // Set available packaging options
        const packagingOptions = selectedStockItem.packagingOptions || [];
        setAvailableSizes(
          packagingOptions.map((p) => ({ id: p.packaging, label: p.packaging }))
        );
        // Set available quantity
        setAvailableQuantity(selectedStockItem.availableQuantity || 0);
      }
    }
  }, [item.productId, item.supplierId, item.packaging, stockItems]);

  // Product select
  const handleProductSelect = (option: { id: string; label: string }) => {
    const selectedStockItem = stockItems.find(
      (stock) => stock.id === option.id
    );
    if (selectedStockItem) {
      // Extract suppliers for this product
      const productSuppliers = selectedStockItem.suppliers || [];
      setSuppliers(productSuppliers);

      // Set available packaging options
      const packagingOptions = selectedStockItem.packagingOptions || [];
      setAvailableSizes(
        packagingOptions.map((p) => ({ id: p.packaging, label: p.packaging }))
      );

      // Set available quantity
      const quantity = selectedStockItem.availableQuantity || 0;
      setAvailableQuantity(quantity);

      // Set default packaging and price
      const defaultPackaging = packagingOptions[0];
      const defaultPackagingLabel = defaultPackaging
        ? defaultPackaging.packaging
        : "";
      const defaultPrice = defaultPackaging ? defaultPackaging.price : 0;

      onUpdate({
        productId: option.id,
        productName: option.label,
        packaging: defaultPackagingLabel,
        unitPrice: defaultPrice.toString(),
        totalPrice: calcTotal(item.quantity, defaultPrice.toString()),
      });
      setNoStockMessage("");

      // Check if current quantity exceeds stock
      checkQuantityExceedsStock(item.quantity, quantity);
    }
  };

  // Supplier select
  const handleSupplierSelect = (option: { id: string; label: string }) => {
    onUpdate({
      supplierId: option.id,
      supplierName: option.label,
    });
  };

  // Size select
  const handleSizeSelect = (option: { id: string; label: string }) => {
    const selectedStockItem = stockItems.find(
      (stock) => stock.id === item.productId
    );

    if (selectedStockItem && selectedStockItem.packagingOptions) {
      // Find the selected packaging option to get its price
      const selectedPackaging = selectedStockItem.packagingOptions.find(
        (p) => p.packaging === option.label
      );

      const newPrice = selectedPackaging ? selectedPackaging.price : 0;

      onUpdate({
        packaging: option.label,
        unitPrice: newPrice.toString(),
        totalPrice: calcTotal(item.quantity, newPrice.toString()),
      });
    } else {
      onUpdate({
        packaging: option.label,
      });
    }
  };

  // Handle product creation attempt - check if it's in stock
  const handleProductCreate = async (name: string) => {
    // Check if product exists but is out of stock
    const outOfStockProduct = stockItems.find(
      (stock) =>
        stock.name.toLowerCase() === name.toLowerCase() && !stock.inStock
    );

    if (outOfStockProduct) {
      setNoStockMessage(`"${name}" is currently out of stock`);
      throw new Error("Product is out of stock");
    }

    // If it's a completely new product, allow creation but warn
    setNoStockMessage(
      `New product "${name}" added but may not be in inventory`
    );
    return { id: `new-${Date.now()}`, label: name };
  };

  const calcTotal = (quantity: string, unitPrice: string) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  };

  // Check if quantity exceeds available stock
  const checkQuantityExceedsStock = (
    quantity: string,
    availableQty: number
  ) => {
    const qty = parseFloat(quantity) || 0;
    const exceeds = qty > availableQty;
    setExceedsStock(exceeds);
    return exceeds;
  };

  // Quantity
  const handleQuantityChange = (quantity: string) => {
    // Check if quantity exceeds available stock
    checkQuantityExceedsStock(quantity, availableQuantity);

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

  // Toggle expanded state
  const toggleExpanded = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(200, "easeInEaseOut", "opacity")
    );
    setExpanded(!expanded);
  };

  // Get selected stock item
  const selectedStockItem = item.productId
    ? stockItems.find((stock) => stock.id === item.productId)
    : null;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{index + 1}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title} accessibilityRole="header">
              {item.productName || "Select Product"}
            </Text>
            {item.productName && (
              <Text style={styles.subtitle}>
                {item.packaging ? `${item.packaging} • ` : ""}
                Qty: {item.quantity || "0"} • ₹{item.totalPrice.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeBtn}
            accessibilityLabel={`Remove product ${index + 1}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="delete" size={22} color={colors.error} />
          </TouchableOpacity>
          <MaterialIcons
            name={expanded ? "expand-less" : "expand-more"}
            size={24}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          {/* Product Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product</Text>
            <CreatableDropdown
              options={inStockItems.map((s) => ({ id: s.id, label: s.name }))}
              value={item.productId}
              placeholder="Select product"
              onSelect={handleProductSelect}
              onCreate={handleProductCreate}
              aria-label={`Product dropdown for item ${index + 1}`}
            />
            {errors.product && (
              <Text style={styles.errorText}>{errors.product}</Text>
            )}
            {noStockMessage && (
              <View style={styles.noStockContainer}>
                <MaterialIcons name="info" size={16} color={colors.warning} />
                <Text style={styles.noStockText}>{noStockMessage}</Text>
              </View>
            )}
            {selectedStockItem && (
              <View style={styles.stockInfoContainer}>
                <MaterialIcons
                  name="inventory"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.stockInfoText}>
                  Available: {selectedStockItem.availableQuantity || 0} units
                </Text>
              </View>
            )}
          </View>

          {/* Supplier Dropdown - Show only if product is selected */}
          {item.productId && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Supplier</Text>
              <CreatableDropdown
                options={suppliers.map((s) => ({ id: s.id, label: s.name }))}
                value={item.supplierId}
                placeholder="Select supplier"
                onSelect={handleSupplierSelect}
                onCreate={async (label) => ({ id: `new-${Date.now()}`, label })}
                aria-label={`Supplier dropdown for item ${index + 1}`}
              />
              {errors.supplier && (
                <Text style={styles.errorText}>{errors.supplier}</Text>
              )}
            </View>
          )}

          {/* Size Dropdown/Display */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Packaging Size</Text>
            {availableSizes.length > 0 ? (
              <CreatableDropdown
                options={availableSizes}
                value={item.packaging}
                placeholder="Select packaging"
                onSelect={handleSizeSelect}
                onCreate={async (label) => ({ id: label, label })}
                aria-label={`Packaging size dropdown for item ${index + 1}`}
              />
            ) : (
              <View style={styles.sizeDisplay}>
                <Text style={[styles.sizeText, { color: colors.textMuted }]}>
                  No packaging options available for this product
                </Text>
              </View>
            )}
          </View>

          {/* Quantity and Price */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Qty</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.quantity && styles.inputError,
                  exceedsStock && styles.inputExceedsStock,
                ]}
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
              {exceedsStock && (
                <Text style={styles.stockWarningText}>
                  Exceeds available stock
                </Text>
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
              {errors.price && (
                <Text style={styles.errorText}>{errors.price}</Text>
              )}
            </View>
          </View>

          {/* Line Total */}
          <View style={styles.lineTotalRow}>
            <Text style={styles.lineTotalLabel}>Line Total</Text>
            <Text style={styles.lineTotalValue}>
              ₹{item.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
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
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
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
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    marginRight: 4,
  },
  expandedContent: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  row: {
    flexDirection: "row",
    gap: 8,
  },
  sizeDisplay: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  sizeText: {
    fontSize: 16,
    color: colors.text,
  },
  lineTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lineTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  lineTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  noStockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: colors.surfacePressed,
    padding: 8,
    borderRadius: Theme.borderRadius.md,
  },
  noStockText: {
    color: colors.warning,
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  stockInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: colors.surfacePressed,
    padding: 8,
    borderRadius: Theme.borderRadius.md,
  },
  stockInfoText: {
    color: colors.primary,
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  inputExceedsStock: {
    borderColor: colors.warning,
    backgroundColor: colors.warning + "10", // 10% opacity
  },
  stockWarningText: {
    color: colors.warning,
    fontSize: 12,
    marginTop: 2,
  },
});

export default SaleItemInput;
