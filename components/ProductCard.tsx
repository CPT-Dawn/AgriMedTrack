import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors, fonts } from "../theme";

export interface InventoryItem {
  inventoryItemId: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  packagingSize: string;
  packagingSizeValue: number;
  packagingUnit: string;
  batchNumber: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  mfgDate: Date;
  expiryDate: Date;
  lastUpdated: Date;
}

interface ProductCardProps {
  item: InventoryItem;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onPress }) => {
  // Color-coded stock level indicator
  const getStockColor = (quantity: number) => {
    if (quantity < 10) return colors.error; // Red for low stock
    if (quantity < 50) return colors.warning; // Orange for medium stock
    return colors.success; // Green for good stock
  };

  const getStockLabel = (quantity: number) => {
    if (quantity < 10) return "Low Stock";
    if (quantity < 50) return "Medium Stock";
    return "In Stock";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const isExpiringSoon = () => {
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (item.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30;
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: getStockColor(item.quantity),
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with product name and stock status */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 16,
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            {item.productName}
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            {item.supplierName}
          </Text>
        </View>

        {/* Stock status chip */}
        <View
          style={{
            backgroundColor: getStockColor(item.quantity),
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.surface,
              fontWeight: "600",
            }}
          >
            {getStockLabel(item.quantity)}
          </Text>
        </View>
      </View>

      {/* Product details grid */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
              marginBottom: 2,
            }}
          >
            Batch No.
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textPrimary,
              fontWeight: "600",
            }}
          >
            {item.batchNumber}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
              marginBottom: 2,
            }}
          >
            Packaging
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textPrimary,
              fontWeight: "600",
            }}
          >
            {item.packagingSize}
          </Text>
        </View>

        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
              marginBottom: 2,
            }}
          >
            Quantity
          </Text>
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 16,
              color: getStockColor(item.quantity),
              fontWeight: "700",
            }}
          >
            {item.quantity}
          </Text>
        </View>
      </View>

      {/* Pricing and dates */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.background,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            Buy: ₹{item.buyPrice} | Sell: ₹{item.sellPrice}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 11,
              color: isExpiringSoon() ? colors.warning : colors.textSecondary,
            }}
          >
            Exp: {formatDate(item.expiryDate)}
          </Text>
          {isExpiringSoon() && (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 10,
                color: colors.warning,
                fontWeight: "600",
              }}
            >
              Expiring Soon!
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
