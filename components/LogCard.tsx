import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors, fonts } from "../theme";
import { InventoryLog } from "../hooks/useInventoryLogs";

interface LogCardProps {
  log: InventoryLog;
  onPress?: () => void;
}

const LogCard: React.FC<LogCardProps> = ({ log, onPress }) => {
  const [expanded, setExpanded] = useState(false);

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

  const handleToggleExpand = () => {
    setExpanded(!expanded);
    onPress?.();
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
        borderLeftColor: colors.primary,
      }}
      onPress={handleToggleExpand}
      activeOpacity={0.7}
    >
      {/* Header Section */}
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
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
              Stock Addition #{log.logId.slice(-6).toUpperCase()}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              Added by {log.addedByName}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            {formatDate(log.addedAt)}
          </Text>
        </View>

        {/* Summary Stats */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 12,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontFamily: fonts.headline,
                fontSize: 18,
                color: colors.primary,
                fontWeight: "600",
              }}
            >
              {log.items.length}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              Product{log.items.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontFamily: fonts.headline,
                fontSize: 18,
                color: colors.success,
                fontWeight: "600",
              }}
            >
              {log.totalItems}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              Total Units
            </Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontFamily: fonts.headline,
                fontSize: 18,
                color: colors.accent,
                fontWeight: "600",
              }}
            >
              {formatCurrency(log.totalValue)}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              Total Value
            </Text>
          </View>
        </View>
      </View>

      {/* Expand/Collapse Indicator */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
        }}
      >
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.primary,
            marginRight: 8,
          }}
        >
          {expanded ? "Hide Details" : "View Details"}
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            color: colors.primary,
            transform: [{ rotate: expanded ? "180deg" : "0deg" }],
          }}
        >
          ▼
        </Text>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: "#E5E5E5",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 14,
              color: colors.textPrimary,
              marginBottom: 12,
            }}
          >
            Items Added:
          </Text>

          {log.items.map((item, index) => (
            <View
              key={`${item.productId}-${item.batchNumber}-${index}`}
              style={{
                backgroundColor: colors.background,
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                borderLeftWidth: 3,
                borderLeftColor: colors.secondary,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: fonts.headline,
                      fontSize: 15,
                      color: colors.textPrimary,
                      marginBottom: 2,
                    }}
                  >
                    {item.productName}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginBottom: 2,
                    }}
                  >
                    {item.supplierName} • {item.packagingSize}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    Batch: {item.batchNumber}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontFamily: fonts.headline,
                      fontSize: 16,
                      color: colors.success,
                      fontWeight: "600",
                    }}
                  >
                    +{item.quantityAdded}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 11,
                      color: colors.textSecondary,
                    }}
                  >
                    units
                  </Text>
                </View>
              </View>

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
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    Buy: {formatCurrency(item.buyPrice)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    Sell: {formatCurrency(item.sellPrice)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 12,
                    color: colors.accent,
                    fontWeight: "600",
                  }}
                >
                  Value: {formatCurrency(item.quantityAdded * item.buyPrice)}
                </Text>
              </View>

              {/* Dates */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 11,
                    color: colors.textSecondary,
                  }}
                >
                  MFG: {item.mfgDate.toLocaleDateString("en-IN")}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 11,
                    color: colors.warning,
                  }}
                >
                  EXP: {item.expiryDate.toLocaleDateString("en-IN")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default LogCard;
