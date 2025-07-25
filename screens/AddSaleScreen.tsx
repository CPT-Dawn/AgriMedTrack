import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts } from "../theme";
import { useToast } from "../hooks/useToast";
import { useUI } from "../hooks/useUI";
import { useAuth } from "../hooks/useAuth";
import { useAvailableInventory } from "../hooks/useSales";
import { SaleFormItem } from "../types/sales";
import SaleItemForm from "../components/SaleItemForm";
import LoadingScreen from "../components/LoadingScreen";

const AddSaleScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const { showConfirmDialog } = useUI();
  const {
    availableItems,
    loading: inventoryLoading,
    error: inventoryError,
    getProductOptions,
    getSupplierOptions,
    getPackagingOptions,
    getBatchOptions,
    getInventoryItem,
    refreshInventory,
  } = useAvailableInventory();

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "Paid" | "Unpaid" | "Partial"
  >("Paid");
  const [amountPaid, setAmountPaid] = useState(0);

  // Sale items
  const [saleItems, setSaleItems] = useState<SaleFormItem[]>([
    {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      supplierId: "",
      supplierName: "",
      packagingSize: "",
      batchNumber: "",
      inventoryItemId: "",
      quantitySold: 0,
      sellPricePerUnit: 0,
      buyPricePerUnit: 0,
      availableStock: 0,
      itemTotal: 0,
      itemProfit: 0,
    },
  ]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalAmount = saleItems.reduce(
      (sum, item) => sum + item.itemTotal,
      0
    );
    const totalProfit = saleItems.reduce(
      (sum, item) => sum + item.itemProfit,
      0
    );
    const amountPending = totalAmount - amountPaid;

    return {
      totalAmount,
      totalProfit,
      amountPending,
    };
  }, [saleItems, amountPaid]);

  // Generate bill number on mount
  useEffect(() => {
    const generateBillNumber = () => {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
      const timeStr = now.getTime().toString().slice(-4);
      return `PKK${dateStr}${timeStr}`;
    };

    setBillNumber(generateBillNumber());
  }, []);

  // Auto-set amount paid when total changes and payment is Paid
  useEffect(() => {
    if (paymentStatus === "Paid") {
      setAmountPaid(totals.totalAmount);
    } else if (paymentStatus === "Unpaid") {
      setAmountPaid(0);
    }
  }, [totals.totalAmount, paymentStatus]);

  const handleGoBack = () => {
    if (saleItems.some((item) => item.quantitySold > 0)) {
      showConfirmDialog({
        title: "Discard Changes",
        message: "You have unsaved changes. Are you sure you want to go back?",
        type: "warning",
        confirmText: "Discard",
        onConfirm: () => navigation.goBack(),
      });
    } else {
      navigation.goBack();
    }
  };

  const addSaleItem = () => {
    const newItem: SaleFormItem = {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      supplierId: "",
      supplierName: "",
      packagingSize: "",
      batchNumber: "",
      inventoryItemId: "",
      quantitySold: 0,
      sellPricePerUnit: 0,
      buyPricePerUnit: 0,
      availableStock: 0,
      itemTotal: 0,
      itemProfit: 0,
    };

    setSaleItems((prev) => [...prev, newItem]);
  };

  const removeSaleItem = (itemId: string) => {
    if (saleItems.length === 1) {
      showWarning("At least one item is required");
      return;
    }
    setSaleItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateSaleItem = (itemId: string, updates: Partial<SaleFormItem>) => {
    setSaleItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      showError("Please enter customer name");
      return false;
    }

    if (!customerPhone.trim()) {
      showError("Please enter customer phone number");
      return false;
    }

    if (customerPhone.length < 10) {
      showError("Please enter a valid phone number");
      return false;
    }

    for (let i = 0; i < saleItems.length; i++) {
      const item = saleItems[i];

      if (!item.productId) {
        showError(`Item ${i + 1}: Please select a product`);
        return false;
      }

      if (!item.supplierId) {
        showError(`Item ${i + 1}: Please select a supplier`);
        return false;
      }

      if (!item.packagingSize) {
        showError(`Item ${i + 1}: Please select packaging size`);
        return false;
      }

      if (!item.batchNumber) {
        showError(`Item ${i + 1}: Please select batch number`);
        return false;
      }

      if (!item.quantitySold || item.quantitySold <= 0) {
        showError(`Item ${i + 1}: Please enter valid quantity`);
        return false;
      }

      if (!item.sellPricePerUnit || item.sellPricePerUnit <= 0) {
        showError(`Item ${i + 1}: Please enter valid sell price`);
        return false;
      }

      if (item.quantitySold > item.availableStock) {
        showError(
          `Item ${i + 1}: Quantity exceeds available stock (${item.availableStock})`
        );
        return false;
      }
    }

    if (totals.totalAmount <= 0) {
      showError("Total amount must be greater than zero");
      return false;
    }

    if (amountPaid < 0) {
      showError("Amount paid cannot be negative");
      return false;
    }

    if (amountPaid > totals.totalAmount) {
      showError("Amount paid cannot be greater than total amount");
      return false;
    }

    return true;
  };

  const submitSale = async () => {
    if (!validateForm()) {
      return;
    }

    showConfirmDialog({
      title: "Submit Sale",
      message: `Create sale for ${customerName} with total amount ₹${totals.totalAmount.toLocaleString("en-IN")}?`,
      onConfirm: async () => {
        await processSale();
      },
    });
  };

  const processSale = async () => {
    if (!user) {
      showError("User not authenticated");
      return;
    }

    try {
      setSubmitting(true);

      // This is a placeholder for the Cloud Function call
      // In production, this should call a Cloud Function for atomic processing
      showError(
        "Sale processing will be implemented with Cloud Functions for data integrity"
      );

      // Placeholder success flow:
      // showSuccess("Sale created successfully!");
      // navigation.goBack();
    } catch (error) {
      console.error("Error processing sale:", error);
      showError("Failed to process sale. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
    keyboardType:
      | "default"
      | "numeric"
      | "phone-pad"
      | "decimal-pad" = "default"
  ) => {
    const displayValue =
      typeof value === "number"
        ? value === 0
          ? ""
          : value.toString()
        : value.toString();

    return (
      <View style={{ marginBottom: 16 }}>
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
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.textSecondary + "30",
            borderRadius: 8,
            padding: 12,
            fontFamily: fonts.body,
            fontSize: 16,
            color: colors.textPrimary,
            minHeight: 48,
          }}
          value={displayValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
        />
      </View>
    );
  };

  if (inventoryLoading) {
    return <LoadingScreen message="Loading available inventory..." />;
  }

  if (inventoryError) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 18,
              color: colors.error,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Error Loading Inventory
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {inventoryError}
          </Text>
          <TouchableOpacity
            onPress={refreshInventory}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.surface,
                fontWeight: "600",
              }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (availableItems.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 18,
              color: colors.warning,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            No Stock Available
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            There are no products available in stock to sell. Please add
            inventory first.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.surface,
                fontWeight: "600",
              }}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E5E5",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={handleGoBack}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 8,
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 18,
                  color: colors.primary,
                }}
              >
                ← Back
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 24,
                  color: colors.textPrimary,
                }}
              >
                New Sale
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
              >
                Bill #{billNumber}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Customer Information */}
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
            <Text
              style={{
                fontFamily: fonts.headline,
                fontSize: 16,
                color: colors.textPrimary,
                marginBottom: 16,
              }}
            >
              Customer Information
            </Text>

            {renderInput(
              "Customer Name",
              customerName,
              setCustomerName,
              "Enter customer name"
            )}

            {renderInput(
              "Phone Number",
              customerPhone,
              setCustomerPhone,
              "Enter phone number",
              "phone-pad"
            )}
          </View>

          {/* Sale Items */}
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 16,
              color: colors.textPrimary,
              marginBottom: 16,
            }}
          >
            Items to Sell
          </Text>

          {saleItems.map((item, index) => (
            <SaleItemForm
              key={item.id}
              item={item}
              index={index}
              availableItems={availableItems}
              getProductOptions={getProductOptions}
              getSupplierOptions={getSupplierOptions}
              getPackagingOptions={getPackagingOptions}
              getBatchOptions={getBatchOptions}
              getInventoryItem={getInventoryItem}
              onUpdate={(updates) => updateSaleItem(item.id, updates)}
              onRemove={() => removeSaleItem(item.id)}
              showRemove={saleItems.length > 1}
            />
          ))}

          {/* Add Another Item Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.primary,
              borderStyle: "dashed",
              alignItems: "center",
              marginBottom: 16,
            }}
            onPress={addSaleItem}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                color: colors.primary,
                fontWeight: "600",
              }}
            >
              + Add Another Item
            </Text>
          </TouchableOpacity>

          {/* Payment Information */}
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
            <Text
              style={{
                fontFamily: fonts.headline,
                fontSize: 16,
                color: colors.textPrimary,
                marginBottom: 16,
              }}
            >
              Payment Information
            </Text>

            {/* Payment Status Buttons */}
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.textPrimary,
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              Payment Status
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {["Paid", "Partial", "Unpaid"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={{
                    flex: 1,
                    backgroundColor:
                      paymentStatus === status
                        ? colors.primary
                        : colors.background,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.primary,
                    alignItems: "center",
                  }}
                  onPress={() => setPaymentStatus(status as any)}
                >
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 14,
                      color:
                        paymentStatus === status
                          ? colors.surface
                          : colors.primary,
                      fontWeight: "600",
                    }}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount Paid */}
            {renderInput(
              "Amount Paid",
              amountPaid,
              (text) => setAmountPaid(parseFloat(text) || 0),
              "0.00",
              "decimal-pad"
            )}
          </View>

          {/* Bill Summary */}
          {totals.totalAmount > 0 && (
            <View
              style={{
                backgroundColor: colors.primary + "10",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 16,
                  color: colors.textPrimary,
                  marginBottom: 12,
                }}
              >
                Bill Summary
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: colors.textSecondary,
                  }}
                >
                  Total Amount:
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.headline,
                    fontSize: 18,
                    color: colors.primary,
                    fontWeight: "600",
                  }}
                >
                  {formatCurrency(totals.totalAmount)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: colors.textSecondary,
                  }}
                >
                  Amount Paid:
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 16,
                    color: colors.success,
                    fontWeight: "600",
                  }}
                >
                  {formatCurrency(amountPaid)}
                </Text>
              </View>

              {totals.amountPending > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    Amount Pending:
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 16,
                      color: colors.error,
                      fontWeight: "600",
                    }}
                  >
                    {formatCurrency(totals.amountPending)}
                  </Text>
                </View>
              )}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: colors.primary + "30",
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: colors.textSecondary,
                  }}
                >
                  Total Profit:
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 16,
                    color: colors.success,
                    fontWeight: "600",
                  }}
                >
                  {formatCurrency(totals.totalProfit)}
                </Text>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={{
              backgroundColor: submitting
                ? colors.textSecondary
                : colors.primary,
              padding: 18,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 40,
            }}
            onPress={submitSale}
            disabled={submitting || totals.totalAmount <= 0}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                color: colors.surface,
                fontWeight: "600",
              }}
            >
              {submitting
                ? "Processing Sale..."
                : `Create Sale - ${formatCurrency(totals.totalAmount)}`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AddSaleScreen;
