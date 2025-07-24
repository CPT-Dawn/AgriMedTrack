import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../theme";
import { InventoryItem } from "./ProductCard";

interface InventoryStatsProps {
  items: InventoryItem[];
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ items }) => {
  const calculateStats = () => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce(
      (sum, item) => sum + item.buyPrice * item.quantity,
      0
    );
    const lowStockItems = items.filter((item) => item.quantity < 10).length;
    const expiringSoonItems = items.filter((item) => {
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (item.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;

    return {
      totalItems,
      totalQuantity,
      totalValue,
      lowStockItems,
      expiringSoonItems,
    };
  };

  const stats = calculateStats();

  const StatCard = ({
    title,
    value,
    subtitle,
    color = colors.primary,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textSecondary,
          marginBottom: 4,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: fonts.headline,
          fontSize: 20,
          color: colors.textPrimary,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 11,
            color: colors.textSecondary,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      {/* First row */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: 8,
        }}
      >
        <StatCard
          title="Total Products"
          value={stats.totalItems}
          subtitle="Unique items"
          color={colors.primary}
        />
        <StatCard
          title="Total Stock"
          value={stats.totalQuantity}
          subtitle="Units available"
          color={colors.secondary}
        />
      </View>

      {/* Second row */}
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <StatCard
          title="Stock Value"
          value={`₹${stats.totalValue.toLocaleString()}`}
          subtitle="Total investment"
          color={colors.success}
        />
        <View style={{ flex: 1, marginHorizontal: 4 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.headline,
                    fontSize: 16,
                    color: colors.error,
                  }}
                >
                  {stats.lowStockItems}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 10,
                    color: colors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  Low Stock
                </Text>
              </View>
              <View
                style={{
                  width: 1,
                  backgroundColor: colors.background,
                  marginHorizontal: 8,
                }}
              />
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.headline,
                    fontSize: 16,
                    color: colors.warning,
                  }}
                >
                  {stats.expiringSoonItems}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 10,
                    color: colors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  Expiring Soon
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default InventoryStats;
