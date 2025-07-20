import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Theme } from "../constants/Theme";
import { useUser } from "../hooks/useUser";
import { BatchEntryFormData, StockEntryFormData } from "../types/stock";

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
  const [items, setItems] = useState<StockEntryFormData[]>([
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
  const [submitting, setSubmitting] = useState(false);
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
        Alert.alert("Success", "Stock entry added successfully");
      } else {
        Alert.alert("Success", "Stock entry updated successfully");
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
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="inventory-2"
              size={20}
              color={Theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Enter product name"
              value={item.productName}
              onChangeText={(text) =>
                updateProduct(index, { productName: text })
              }
              placeholderTextColor={Theme.colors.textMuted}
              autoCapitalize="words"
              accessibilityLabel="Product name"
            />
          </View>
        </View>

        {/* Supplier Name - Full Width */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Supplier <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="business"
              size={20}
              color={Theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Enter supplier name"
              value={item.supplierName}
              onChangeText={(text) =>
                updateProduct(index, { supplierName: text })
              }
              placeholderTextColor={Theme.colors.textMuted}
              autoCapitalize="words"
              accessibilityLabel="Supplier name"
            />
          </View>
        </View>

        {/* Packaging Size - Full Width */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Packaging Size <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="straighten"
              size={20}
              color={Theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 10 ml bottle, 500 mg tablet"
              value={item.packaging}
              onChangeText={(text) => updateProduct(index, { packaging: text })}
              placeholderTextColor={Theme.colors.textMuted}
              autoCapitalize="words"
              accessibilityLabel="Packaging size"
            />
          </View>
        </View>

        {/* Quantity and Sell Price Row */}
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>
              Quantity <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="shopping-cart"
                size={20}
                color={Theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="0"
                value={item.quantity}
                onChangeText={(text) =>
                  updateProduct(index, { quantity: text })
                }
                placeholderTextColor={Theme.colors.textMuted}
                keyboardType="numeric"
                accessibilityLabel="Quantity"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>Sell Price (Optional)</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="attach-money"
                size={20}
                color={Theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                value={item.sellPrice}
                onChangeText={(text) =>
                  updateProduct(index, { sellPrice: text })
                }
                placeholderTextColor={Theme.colors.textMuted}
                keyboardType="numeric"
                accessibilityLabel="Sell price"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Header */}
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>
            {initialData ? "Edit Stock Entry" : "Add New Stock"}
          </Text>
          <Text style={styles.formSubtitle}>
            {initialData
              ? "Update the stock entry details below"
              : "Enter the details for your new stock entry"}
          </Text>
        </View>

        {/* Product Items */}
        {items.map((item, index) => renderItemCard(item, index))}

        {/* Add Another Product Button */}
        <TouchableOpacity
          style={styles.addProductButton}
          onPress={addAnotherProduct}
          accessibilityLabel="Add another product"
        >
          <MaterialIcons
            name="add-circle-outline"
            size={24}
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
      </ScrollView>

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
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 2,
    ...Theme.shadows.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 2,
    ...Theme.shadows.sm,
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
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  itemSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  itemSection: {
    marginBottom: Theme.spacing.md,
  },
  requiredAsterisk: {
    color: Theme.colors.error,
  },
  deleteButtonPosition: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  deleteIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.error,
    justifyContent: "center",
    alignItems: "center",
    ...Theme.shadows.sm,
  },
});
