import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
  const [billImage, setBillImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

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

  const handleImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload a bill image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = asset.uri.split("/").pop() || "bill_image.jpg";

      setBillImage({
        uri: asset.uri,
        name: fileName,
        type: "image/jpeg",
      });
    }
  };

  const removeBillImage = () => {
    setBillImage(null);
  };

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
        billImage: billImage || undefined,
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
        setBillImage(null);
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
          <View style={styles.inputWrapper}>
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
          <View style={styles.inputWrapper}>
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
          paddingHorizontal: Theme.spacing.lg,
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
            {/* Bill Image Upload */}
            <View style={styles.billSection}>
              <Text style={styles.sectionLabel}>Bill Image</Text>

              {billImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: billImage.uri }}
                    style={styles.imagePreview}
                  />
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={handleImagePicker}
                    >
                      <MaterialIcons
                        name="edit"
                        size={16}
                        color={Theme.colors.white}
                      />
                      <Text style={styles.imageActionText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.imageActionButton, styles.deleteButton]}
                      onPress={removeBillImage}
                    >
                      <MaterialIcons
                        name="delete"
                        size={16}
                        color={Theme.colors.white}
                      />
                      <Text style={styles.imageActionText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imageUploadButton}
                  onPress={handleImagePicker}
                >
                  <MaterialIcons
                    name="add-a-photo"
                    size={24}
                    color={Theme.colors.primary}
                  />
                  <Text style={styles.imageUploadText}>Upload Bill Photo</Text>
                </TouchableOpacity>
              )}
            </View>

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
    fontSize: 12,
    fontWeight: "700",
    color: Theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
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
    paddingHorizontal: 14,
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
    paddingLeft: 14,
    ...Theme.shadows.md,
  },
  dropdownWrapper: {
    flex: 1,
    borderLeftWidth: 0,
  },
  inputWithIcon: {
    flex: 1,
    paddingLeft: 8,
    paddingVertical: 12,
    borderWidth: 0,
  },
  inputIcon: {
    marginRight: 6,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  imageUploadButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderStyle: "dashed",
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    ...Theme.shadows.sm,
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 16,
    color: Theme.colors.primary,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    overflow: "hidden",
    ...Theme.shadows.sm,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  imageActions: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  imageActionButton: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  imageActionText: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  addProductButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderStyle: "dashed",
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  addProductText: {
    fontSize: 16,
    color: Theme.colors.primary,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    gap: 8,
    ...Theme.shadows.md,
  },
  primaryButtonDisabled: {
    backgroundColor: Theme.colors.textMuted,
  },
  primaryButtonText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
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
    ...Theme.shadows.sm,
  },
  dateTimeIcon: {
    marginRight: Theme.spacing.sm,
  },
  dateTimeText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.fontSize.base,
    flex: 1,
  },
  billSection: {
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
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
    fontSize: 16,
    fontWeight: "600",
  },
  itemHeaderText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.colors.text,
  },
  itemSubtitle: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: "500",
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
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.textSecondary,
    marginBottom: 12,
  },
  requiredAsterisk: {
    color: Theme.colors.error,
  },
});
