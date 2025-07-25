import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors, fonts } from "../theme";
import { Sale } from "../types/sales";

interface SaleCardProps {
  sale: Sale;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SaleCard: React.FC<SaleCardProps> = ({
  sale,
  onPress,
  onEdit,
  onDelete,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return colors.success;
      case "Unpaid":
        return colors.error;
      case "Partial":
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getPaymentStatusBg = (status: string) => {
    switch (status) {
      case "Paid":
        return colors.success + "20";
      case "Unpaid":
        return colors.error + "20";
      case "Partial":
        return colors.warning + "20";
      default:
        return colors.textSecondary + "20";
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: getPaymentStatusColor(sale.paymentStatus),
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header Section */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 16,
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            Bill #{sale.billNumber}
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            {sale.customerName}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
              marginBottom: 4,
            }}
          >
            {formatDate(sale.saleDate)}
          </Text>
          <View
            style={{
              backgroundColor: getPaymentStatusBg(sale.paymentStatus),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                color: getPaymentStatusColor(sale.paymentStatus),
                fontWeight: "600",
              }}
            >
              {sale.paymentStatus}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount Section */}
      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            Total Amount
          </Text>
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 18,
              color: colors.primary,
              fontWeight: "600",
            }}
          >
            {formatCurrency(sale.totalAmount)}
          </Text>
        </View>

        {sale.paymentStatus !== "Paid" && (
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
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              Pending
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.error,
                fontWeight: "600",
              }}
            >
              {formatCurrency(sale.amountPending)}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: "#E5E5E5",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            Profit
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.success,
              fontWeight: "600",
            }}
          >
            {formatCurrency(sale.totalProfit)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
        }}
      >
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          Sold by {sale.soldByName}
        </Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {onEdit && (
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary + "20",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: colors.primary,
                  fontWeight: "600",
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={{
                backgroundColor: colors.error + "20",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: colors.error,
                  fontWeight: "600",
                }}
              >
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SaleCard;
