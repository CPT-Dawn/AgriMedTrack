import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Theme } from "../constants/Theme";
import { useUser } from "../hooks/useUser";
import { BatchEntryFormData, StockEntryFormData } from "../types/stock";
import { CreatableDropdown } from "./CreatableDropdown";

interface AddStockFormProps {
  onSubmit: (
    formData: StockEntryFormData | BatchEntryFormData
  ) => Promise<void>;
  products: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  sizes: { id: string; label: string }[];
  getOrCreateProduct: (name: string) => Promise<{ id: string; name: string }>;
  getOrCreateSupplier: (name: string) => Promise<{ id: string; name: string }>;
  getOrCreateSize: (label: string) => Promise<{ id: string; label: string }>;
  initialData?: BatchEntryFormData;
}

export const AddStockForm: React.FC<AddStockFormProps> = ({
  onSubmit,
  products,
  suppliers,
  sizes,
  getOrCreateProduct,
  getOrCreateSupplier,
  getOrCreateSize,
  initialData,
}) => {
  const { currentUser } = useUser();
  const [items, setItems] = useState<StockEntryFormData[]>(
    initialData?.items || [
      {
        productId: "",
        productName: "",
        supplierId: "",
        supplierName: "",
        packagingId: "",
        packaging: "",
        quantity: "",
        sellPrice: "",
      },
    ]
  );
  const [submitting, setSubmitting] = useState(false);

  // Date/Time state
  const [stockDate, setStockDate] = useState(new Date());
  const [stockTime, setStockTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Handle initialData changes for editing
  useEffect(() => {
    if (initialData?.items) {
      setItems(initialData.items);
    }
  }, [initialData]);

  const addAnotherProduct = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        supplierId: "",
        supplierName: "",
        packagingId: "",
        packaging: "",
        quantity: "",
        sellPrice: "",
      },
    ]);
  };

  const removeProduct = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateProduct = (
    index: number,
    updates: Partial<StockEntryFormData>
  ) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleSubmit = async () => {
    // Validate all items
    let valid = true;
    let invalidItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (
        !item.productName.trim() ||
        !item.supplierName.trim() ||
        !item.packaging.trim() ||
        !item.quantity.trim() ||
        isNaN(parseInt(item.quantity))
      ) {
        valid = false;
        invalidItems.push(i + 1);
      }
    }

    if (!valid) {
      Alert.alert(
        "Error",
        `Please fill all required fields for product item(s): ${invalidItems.join(
          ", "
        )}`
      );
      return;
    }

    try {
      setSubmitting(true);

      // Process each item to ensure packaging IDs are set
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.packaging && !item.packagingId) {
          try {
            const newSize = await getOrCreateSize(item.packaging);
            updateProduct(i, {
              packagingId: newSize.id,
              packaging: newSize.label,
            });
          } catch (error) {
            console.error("Error creating packaging:", error);
          }
        }
      }

      const batchData: BatchEntryFormData = {
        addedBy: currentUser?.id || "unknown-user",
        items,
      };

      await onSubmit(batchData);

      // Only reset form if not in edit mode (no initialData)
      if (!initialData) {
        setItems([
          {
            productId: "",
            productName: "",
            supplierId: "",
            supplierName: "",
            packagingId: "",
            packaging: "",
            quantity: "",
            sellPrice: "",
          },
        ]);
        // Success modal is now handled by parent (StockScreen)
      } else {
        // Success modal is now handled by parent (StockScreen)
      }
    } catch {
      Alert.alert("Error", "Failed to add stock entry");
    } finally {
      setSubmitting(false);
    }
  };

  const renderItemCard = (item: StockEntryFormData, index: number) => (
    <View key={`item-${index}`} style={styles.itemCard}>
      {items.length > 1 && (
        <TouchableOpacity
          onPress={() => removeProduct(index)}
          style={styles.deleteButtonPosition}
          activeOpacity={0.7}
        >
          <View style={styles.deleteIconWrapper}>
            <MaterialIcons
              name="delete-outline"
              size={20}
              color={Theme.colors.white}
            />
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderLeft}>
          <View style={styles.itemNumberBadge}>
            <Text style={styles.itemNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.itemHeaderText}>
            <Text style={styles.itemTitle}>Product Item</Text>
            <Text style={styles.itemSubtitle}>
              {item.productName ? item.productName : "Add product details"}
            </Text>
          </View>
        </View>
      </View>

      {/* Product Information Section */}
      <View style={styles.itemSection}>
        {/* Product Name - Full Width */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Product Name <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="inventory-2"
              size={20}
              color={Theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <View style={styles.dropdownWrapper}>
              <CreatableDropdown
                options={products.map((p) => ({ id: p.id, label: p.name }))}
                value={item.productId}
                placeholder="Select or create product"
                onSelect={(option) =>
                  updateProduct(index, {
                    productId: option.id,
                    productName: option.label,
                  })
                }
                onCreate={async (newLabel: string) => {
                  try {
                    const newProduct = await getOrCreateProduct(newLabel);
                    updateProduct(index, {
                      productId: newProduct.id,
                      productName: newProduct.name,
                    });
                    return { id: newProduct.id, label: newProduct.name };
                  } catch {
                    Alert.alert("Error", "Failed to create new product");
                    throw new Error("Failed to create new product");
                  }
                }}
              />
            </View>
          </View>
        </View>

        {/* Supplier - Full Width */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Supplier <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="store"
              size={20}
              color={Theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <View style={styles.dropdownWrapper}>
              <CreatableDropdown
                options={suppliers.map((s) => ({ id: s.id, label: s.name }))}
                value={item.supplierId}
                placeholder="Select supplier"
                onSelect={(option) =>
                  updateProduct(index, {
                    supplierId: option.id,
                    supplierName: option.label,
                  })
                }
                onCreate={async (newLabel: string) => {
                  try {
                    const newSupplier = await getOrCreateSupplier(newLabel);
                    updateProduct(index, {
                      supplierId: newSupplier.id,
                      supplierName: newSupplier.name,
                    });
                    return { id: newSupplier.id, label: newSupplier.name };
                  } catch {
                    Alert.alert("Error", "Failed to create new supplier");
                    throw new Error("Failed to create new supplier");
                  }
                }}
              />
            </View>
          </View>
        </View>

        {/* Packaging - Full Width */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Packaging <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="category"
              size={20}
              color={Theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <View style={styles.dropdownWrapper}>
              <CreatableDropdown
                options={sizes.map((s) => ({ id: s.id, label: s.label }))}
                value={item.packagingId}
                placeholder="Select or create packaging"
                onSelect={(option) =>
                  updateProduct(index, {
                    packagingId: option.id,
                    packaging: option.label,
                  })
                }
                onCreate={async (newLabel: string) => {
                  try {
                    const newSize = await getOrCreateSize(newLabel);
                    updateProduct(index, {
                      packagingId: newSize.id,
                      packaging: newSize.label,
                    });
                    return { id: newSize.id, label: newSize.label };
                  } catch {
                    Alert.alert("Error", "Failed to create new packaging");
                    throw new Error("Failed to create new packaging");
                  }
                }}
                createLabel="Create packaging"
              />
            </View>
          </View>
        </View>

        {/* Quantity - Full width */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Quantity <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="inventory"
              size={20}
              color={Theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.textInput, styles.inputWithIcon]}
              value={item.quantity}
              onChangeText={(value) =>
                updateProduct(index, { quantity: value })
              }
              placeholder="Enter quantity"
              keyboardType="numeric"
              placeholderTextColor={Theme.colors.textMuted}
            />
          </View>
        </View>

        {/* Sell Price - Full width */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sell Price (₹)</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="sell"
              size={20}
              color={Theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.textInput, styles.inputWithIcon]}
              value={item.sellPrice}
              onChangeText={(value) =>
                updateProduct(index, { sellPrice: value })
              }
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={Theme.colors.textMuted}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: Theme.colors.background }}
    >
      <FlatList
        data={items}
        keyExtractor={(_, idx) => `item-${idx}`}
        renderItem={({ item, index }) => renderItemCard(item, index)}
        contentContainerStyle={{
          paddingHorizontal: Theme.spacing.xl,
          paddingTop: Theme.spacing.md,
          paddingBottom: Theme.spacing["6xl"],
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* Date & Time Section */}
            <View style={styles.dateTimeSection}>
              <View style={styles.dateTimeRow}>
                {/* Date Field */}
                <View style={styles.dateTimeField}>
                  <Text style={styles.inputLabel}>DATE</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowDatePicker(true)}
                    accessibilityLabel="Select date"
                    activeOpacity={0.85}
                  >
                    <MaterialIcons
                      name="event"
                      size={20}
                      color={Theme.colors.primary}
                      style={styles.dateTimeIcon}
                    />
                    <Text style={styles.dateTimeText}>
                      {stockDate
                        ? stockDate.toLocaleDateString()
                        : "Select Date"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Time Field */}
                <View style={styles.dateTimeField}>
                  <Text style={styles.inputLabel}>TIME</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowTimePicker(true)}
                    accessibilityLabel="Select time"
                    activeOpacity={0.85}
                  >
                    <MaterialIcons
                      name="schedule"
                      size={20}
                      color={Theme.colors.primary}
                      style={styles.dateTimeIcon}
                    />
                    <Text style={styles.dateTimeText}>
                      {stockTime
                        ? stockTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Select Time"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
        ListFooterComponent={() => (
          <>
            <TouchableOpacity
              style={styles.addProductButton}
              onPress={addAnotherProduct}
              accessibilityLabel="Add another product"
            >
              <MaterialIcons
                name="add-circle"
                size={20}
                color={Theme.colors.primary}
              />
              <Text style={styles.addProductText}>Add Another Product</Text>
            </TouchableOpacity>

            {/* Confirm & Save Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  submitting && styles.primaryButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={submitting}
                accessibilityLabel="Confirm and save stock"
              >
                {submitting ? (
                  <ActivityIndicator color={Theme.colors.white} size="small" />
                ) : (
                  <>
                    <MaterialIcons
                      name="save"
                      size={20}
                      color={Theme.colors.white}
                    />
                    <Text style={styles.primaryButtonText}>Confirm & Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      />

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={stockDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setStockDate(selectedDate);
          }}
        />
      )}
      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={stockTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) setStockTime(selectedTime);
          }}
          is24Hour={true}
        />
      )}
    </KeyboardAvoidingView>
  );
};

// Update the styles to match the app's design system
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
  },
  batchToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: Theme.borderRadius["2xl"],
    marginBottom: 16,
    ...Theme.shadows.sm,
  },
  batchToggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    ...Theme.shadows.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: Theme.colors.error,
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: 12,
    marginTop: 4,
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
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    paddingLeft: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  dropdownWrapper: {
    flex: 1,
    borderLeftWidth: 0,
  },
  inputWithIcon: {
    flex: 1,
    paddingLeft: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 0,
  },
  inputIcon: {
    marginRight: Theme.spacing.xs,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  addProductButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderStyle: "dashed",
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  addProductText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    gap: Theme.spacing.sm,
    ...Theme.shadows.md,
  },
  primaryButtonDisabled: {
    backgroundColor: Theme.colors.textMuted,
  },
  primaryButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  formHeader: {
    marginBottom: Theme.spacing["2xl"],
  },
  formTitle: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  formSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textSecondary,
  },
  dateTimeSection: {
    marginBottom: Theme.spacing.xl,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  dateTimeField: {
    flex: 1,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    minHeight: 44,
    ...Theme.shadows.sm,
  },
  dateTimeIcon: {
    marginRight: Theme.spacing.sm,
  },
  dateTimeText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.fontSize.base,
    flex: 1,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  sectionSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  deleteButton: {
    backgroundColor: Theme.colors.error,
  },
  buttonContainer: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.md,
  },
  itemCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius["2xl"],
    padding: 16,
    marginBottom: 16,
    ...Theme.shadows.lg,
    position: "relative",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  itemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    ...Theme.shadows.sm,
  },
  itemNumberText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  itemHeaderText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  itemSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  removeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Theme.borderRadius.full,
  },
  deleteButtonPosition: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
  },
  deleteIconWrapper: {
    backgroundColor: Theme.colors.error,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    ...Theme.shadows.md,
  },
  itemSection: {
    marginBottom: 8,
  },
  dropdownContainer: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
    overflow: "hidden",
  },
  sectionLabel: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  requiredAsterisk: {
    color: Theme.colors.error,
  },
});
