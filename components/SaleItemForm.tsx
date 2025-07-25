import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { colors, fonts } from "../theme";
import { SaleFormItem, InventoryItemForSale } from "../types/sales";
import { useToast } from "../hooks/useToast";

interface SaleItemFormProps {
  item: SaleFormItem;
  index: number;
  availableItems: InventoryItemForSale[];
  getProductOptions: () => { label: string; value: string }[];
  getSupplierOptions: (productId: string) => { label: string; value: string }[];
  getPackagingOptions: (
    productId: string,
    supplierId: string
  ) => { label: string; value: string }[];
  getBatchOptions: (
    productId: string,
    supplierId: string,
    packagingSize: string
  ) => {
    label: string;
    value: string;
    inventoryItem: InventoryItemForSale;
  }[];
  getInventoryItem: (
    productId: string,
    supplierId: string,
    packagingSize: string,
    batchNumber: string
  ) => InventoryItemForSale | undefined;
  onUpdate: (updates: Partial<SaleFormItem>) => void;
  onRemove: () => void;
  showRemove: boolean;
}

const SaleItemForm: React.FC<SaleItemFormProps> = ({
  item,
  index,
  availableItems,
  getProductOptions,
  getSupplierOptions,
  getPackagingOptions,
  getBatchOptions,
  getInventoryItem,
  onUpdate,
  onRemove,
  showRemove,
}) => {
  const { showError } = useToast();
  const [isFocus, setIsFocus] = useState({
    product: false,
    supplier: false,
    packaging: false,
    batch: false,
  });

  // Calculate item total and profit when quantities or prices change
  useEffect(() => {
    const itemTotal = item.quantitySold * item.sellPricePerUnit;
    const itemProfit =
      (item.sellPricePerUnit - item.buyPricePerUnit) * item.quantitySold;

    if (itemTotal !== item.itemTotal || itemProfit !== item.itemProfit) {
      onUpdate({ itemTotal, itemProfit });
    }
  }, [item.quantitySold, item.sellPricePerUnit, item.buyPricePerUnit]);

  const handleProductChange = (productId: string) => {
    const productName =
      getProductOptions().find((p) => p.value === productId)?.label || "";

    // Reset dependent fields
    onUpdate({
      productId,
      productName,
      supplierId: "",
      supplierName: "",
      packagingSize: "",
      batchNumber: "",
      inventoryItemId: "",
      availableStock: 0,
      sellPricePerUnit: 0,
      buyPricePerUnit: 0,
      quantitySold: 0,
    });
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplierName =
      getSupplierOptions(item.productId).find((s) => s.value === supplierId)
        ?.label || "";

    // Reset dependent fields
    onUpdate({
      supplierId,
      supplierName,
      packagingSize: "",
      batchNumber: "",
      inventoryItemId: "",
      availableStock: 0,
      sellPricePerUnit: 0,
      buyPricePerUnit: 0,
      quantitySold: 0,
    });
  };

  const handlePackagingChange = (packagingSize: string) => {
    // Reset dependent fields
    onUpdate({
      packagingSize,
      batchNumber: "",
      inventoryItemId: "",
      availableStock: 0,
      sellPricePerUnit: 0,
      buyPricePerUnit: 0,
      quantitySold: 0,
    });
  };

  const handleBatchChange = (batchNumber: string) => {
    const batchOption = getBatchOptions(
      item.productId,
      item.supplierId,
      item.packagingSize
    ).find((b) => b.value === batchNumber);

    if (batchOption) {
      const inventoryItem = batchOption.inventoryItem;
      onUpdate({
        batchNumber,
        inventoryItemId: inventoryItem.inventoryItemId,
        availableStock: inventoryItem.quantity,
        sellPricePerUnit: inventoryItem.sellPrice,
        buyPricePerUnit: inventoryItem.buyPrice,
        quantitySold: 0, // Reset quantity
      });
    }
  };

  const handleQuantityChange = (text: string) => {
    const quantity = parseInt(text) || 0;

    if (quantity > item.availableStock) {
      showError(`Only ${item.availableStock} units available in stock`);
      return;
    }

    onUpdate({ quantitySold: quantity });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderInput = (
    label: string,
    value: string | number,
    onChangeText: (text: string) => void,
    placeholder?: string,
    keyboardType: "default" | "numeric" | "decimal-pad" = "default",
    editable = true
  ) => {
    const displayValue =
      typeof value === "number"
        ? value === 0
          ? ""
          : value.toString()
        : value.toString();

    return (
      <View style={{ flex: 1, marginBottom: 16 }}>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textPrimary,
            marginBottom: 8,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
        <TextInput
          style={{
            backgroundColor: editable ? colors.surface : colors.background,
            borderWidth: 1,
            borderColor: colors.textSecondary + "30",
            borderRadius: 8,
            padding: 12,
            fontFamily: fonts.body,
            fontSize: 16,
            color: editable ? colors.textPrimary : colors.textSecondary,
            minHeight: 48,
          }}
          value={displayValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          editable={editable}
        />
      </View>
    );
  };

  const renderDropdown = (
    label: string,
    value: string,
    data: { label: string; value: string }[],
    onChange: (value: string) => void,
    placeholder: string,
    focusKey: keyof typeof isFocus,
    disabled = false
  ) => (
    <View style={{ flex: 1, marginBottom: 16 }}>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: colors.textPrimary,
          marginBottom: 8,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      <Dropdown
        style={{
          backgroundColor: disabled ? colors.background : colors.surface,
          borderWidth: 1,
          borderColor: isFocus[focusKey]
            ? colors.primary
            : colors.textSecondary + "30",
          borderRadius: 8,
          padding: 12,
          minHeight: 48,
        }}
        placeholderStyle={{
          fontSize: 16,
          color: colors.textSecondary,
          fontFamily: fonts.body,
        }}
        selectedTextStyle={{
          fontSize: 16,
          color: colors.textPrimary,
          fontFamily: fonts.body,
        }}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onFocus={() => setIsFocus((prev) => ({ ...prev, [focusKey]: true }))}
        onBlur={() => setIsFocus((prev) => ({ ...prev, [focusKey]: false }))}
        onChange={(item) => onChange(item.value)}
        disable={disabled}
      />
    </View>
  );

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.headline,
            fontSize: 16,
            color: colors.textPrimary,
          }}
        >
          Item #{index + 1}
        </Text>

        {showRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={{
              backgroundColor: colors.error + "20",
              padding: 8,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: colors.error,
                fontWeight: "600",
              }}
            >
              Remove
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Product Selection */}
      {renderDropdown(
        "Product",
        item.productId,
        getProductOptions(),
        handleProductChange,
        "Select product",
        "product"
      )}

      {/* Supplier Selection */}
      {renderDropdown(
        "Supplier",
        item.supplierId,
        getSupplierOptions(item.productId),
        handleSupplierChange,
        "Select supplier",
        "supplier",
        !item.productId
      )}

      {/* Packaging Selection */}
      {renderDropdown(
        "Packaging Size",
        item.packagingSize,
        getPackagingOptions(item.productId, item.supplierId),
        handlePackagingChange,
        "Select packaging",
        "packaging",
        !item.supplierId
      )}

      {/* Batch Selection */}
      {renderDropdown(
        "Batch Number",
        item.batchNumber,
        getBatchOptions(
          item.productId,
          item.supplierId,
          item.packagingSize
        ).map((b) => ({
          label: b.label,
          value: b.value,
        })),
        handleBatchChange,
        "Select batch",
        "batch",
        !item.packagingSize
      )}

      {/* Stock Information */}
      {item.availableStock > 0 && (
        <View
          style={{
            backgroundColor: colors.background,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.success,
              fontWeight: "600",
            }}
          >
            ✅ Stock available: {item.availableStock} units
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
              marginTop: 4,
            }}
          >
            Sell Price: {formatCurrency(item.sellPricePerUnit)} per unit
          </Text>
        </View>
      )}

      {/* Quantity and Price Row */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        {renderInput(
          "Quantity",
          item.quantitySold,
          handleQuantityChange,
          "0",
          "numeric",
          item.availableStock > 0
        )}

        {renderInput(
          "Price per Unit",
          item.sellPricePerUnit,
          (text) => onUpdate({ sellPricePerUnit: parseFloat(text) || 0 }),
          "0.00",
          "decimal-pad",
          item.availableStock > 0
        )}
      </View>

      {/* Item Total */}
      {item.quantitySold > 0 && (
        <View
          style={{
            backgroundColor: colors.primary + "10",
            padding: 12,
            borderRadius: 8,
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.textPrimary,
              }}
            >
              Item Total:
            </Text>
            <Text
              style={{
                fontFamily: fonts.headline,
                fontSize: 16,
                color: colors.primary,
                fontWeight: "600",
              }}
            >
              {formatCurrency(item.itemTotal)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              Profit:
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.success,
                fontWeight: "600",
              }}
            >
              {formatCurrency(item.itemProfit)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SaleItemForm;
