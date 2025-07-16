import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "../constants/Colors";
import { BatchEntryFormData, StockEntryFormData } from "../types/stock";
import { CreatableDropdown } from "./CreatableDropdown";

// Theme colors matching the design system
const colors = {
  primary: "#0288D1",
  secondary: "#F9A825",
  accent: "#FF7043",
  bg: "#F5F5F5",
  text: "#263238",
  white: "#FFFFFF",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};

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
}

export const AddStockForm: React.FC<AddStockFormProps> = ({
  onSubmit,
  products,
  suppliers,
  sizes,
  getOrCreateProduct,
  getOrCreateSupplier,
  getOrCreateSize,
}) => {
  const [batchMode, setBatchMode] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [form, setForm] = useState<StockEntryFormData>({
    productId: "",
    productName: "",
    supplierId: "",
    supplierName: "",
    sizeId: "",
    sizeLabel: "",
    quantity: "",
    notes: "",
    buyPrice: "",
    sellPrice: "",
  });
  const [batchItems, setBatchItems] = useState<StockEntryFormData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [billImage, setBillImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.productName.trim())
      newErrors.productName = "Product name is required";
    if (!form.supplierName.trim())
      newErrors.supplierName = "Supplier name is required";
    if (!form.sizeLabel.trim())
      newErrors.sizeLabel = "Packaging size is required";
    if (!form.quantity.trim() || isNaN(parseInt(form.quantity))) {
      newErrors.quantity = "Valid quantity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      productId: "",
      productName: "",
      supplierId: "",
      supplierName: "",
      sizeId: "",
      sizeLabel: "",
      quantity: "",
      notes: "",
      buyPrice: "",
      sellPrice: "",
    });
    setErrors({});
  };

  const addItemToBatch = () => {
    if (!validateForm()) return;

    // Add current form to batch items
    setBatchItems([...batchItems, { ...form }]);

    // Reset form for next item
    resetForm();
  };

  const removeItemFromBatch = (index: number) => {
    const newBatchItems = [...batchItems];
    newBatchItems.splice(index, 1);
    setBatchItems(newBatchItems);
  };

  const handleSubmit = async () => {
    if (batchMode) {
      if (batchItems.length === 0) {
        if (!validateForm()) return;
        // If no batch items yet but form is valid, add current form to batch
        addItemToBatch();
        return;
      }

      // Show summary modal for batch mode
      setShowSummary(true);
      return;
    } else {
      // Single item mode
      if (!validateForm()) return;

      try {
        setSubmitting(true);
        await onSubmit(form);

        // Reset form
        resetForm();
        setBillImage(null);
        Alert.alert("Success", "Stock entry added successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to add stock entry");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const confirmBatchSubmit = async () => {
    try {
      setSubmitting(true);
      const batchData: BatchEntryFormData = {
        addedBy: "current-user",
        billImage: billImage || undefined,
        items: batchItems,
      };
      await onSubmit(batchData);

      // Reset form and batch items
      resetForm();
      setBatchItems([]);
      setBillImage(null);
      setShowSummary(false);
      Alert.alert("Success", "Stock batch added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to add stock batch");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    form.productName &&
    form.supplierName &&
    form.sizeLabel &&
    form.quantity &&
    !isNaN(parseInt(form.quantity));

  const renderBatchItem = ({
    item,
    index,
  }: {
    item: StockEntryFormData;
    index: number;
  }) => (
    <View style={styles.batchItemCard}>
      <View style={styles.batchItemHeader}>
        <Text style={styles.batchItemTitle}>Item {index + 1}</Text>
        <TouchableOpacity
          style={styles.removeItemButton}
          onPress={() => removeItemFromBatch(index)}
        >
          <MaterialIcons name="delete" size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.batchItemContent}>
        <Text style={styles.batchItemProduct}>{item.productName}</Text>
        <Text style={styles.batchItemDetails}>
          {item.supplierName} • {item.sizeLabel} • Qty: {item.quantity}
        </Text>
        {(item.buyPrice || item.sellPrice) && (
          <Text style={styles.batchItemPrices}>
            {item.buyPrice ? `Buy: ₹${item.buyPrice}` : ""}
            {item.buyPrice && item.sellPrice ? " • " : ""}
            {item.sellPrice ? `Sell: ₹${item.sellPrice}` : ""}
          </Text>
        )}
      </View>
    </View>
  );

  const renderSummaryModal = () => (
    <Modal
      visible={showSummary}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSummary(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Stock Entry</Text>
            <TouchableOpacity onPress={() => setShowSummary(false)}>
              <MaterialIcons name="close" size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>Batch Information</Text>
              <Text style={styles.summaryText}>
                Date: {invoiceDate.toLocaleDateString()}
              </Text>
              {notes && <Text style={styles.summaryText}>Notes: {notes}</Text>}
            </View>

            {billImage && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Bill Image</Text>
                <Image
                  source={{ uri: billImage.uri }}
                  style={styles.summaryImage}
                />
              </View>
            )}

            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>
                Items ({batchItems.length})
              </Text>
              {batchItems.map((item, index) => (
                <View key={index} style={styles.summaryItem}>
                  <Text style={styles.summaryItemTitle}>
                    {index + 1}. {item.productName}
                  </Text>
                  <Text style={styles.summaryItemText}>
                    {item.supplierName} • {item.sizeLabel} • Qty:{" "}
                    {item.quantity}
                  </Text>
                  {item.buyPrice && (
                    <Text style={styles.summaryItemText}>
                      Buy: ₹{item.buyPrice} • Sell: ₹
                      {item.sellPrice || "Not set"}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowSummary(false)}
            >
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={confirmBatchSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Confirm & Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderItemCard = (item: StockEntryFormData, index: number) => (
    <View key={`item-${index}`} style={styles.itemCard}>
      {/* Enhanced Header with Status Indicator */}
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderLeft}>
          <View style={styles.itemNumberBadge}>
            <Text style={styles.itemNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.itemHeaderText}>
            <Text style={styles.itemTitle}>Product Item</Text>
            <Text style={styles.itemSubtitle}>
              {form.productName ? form.productName : "Add product details"}
            </Text>
          </View>
        </View>
        {batchMode && batchItems.length > 0 && (
          <TouchableOpacity
            onPress={() => removeItemFromBatch(index)}
            style={styles.removeButton}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="delete-outline"
              size={20}
              color={colors.accent}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Product Information Section */}
      <View style={styles.itemSection}>
        <Text style={styles.sectionLabel}>Product Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Product Name <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.dropdownContainer}>
            <CreatableDropdown
              options={products.map((p) => ({ id: p.id, label: p.name }))}
              value={form.productId}
              placeholder="Select or create product"
              onSelect={(option) =>
                setForm((prev) => ({
                  ...prev,
                  productId: option.id,
                  productName: option.label,
                }))
              }
              onCreate={async (newLabel: string) => {
                try {
                  const newProduct = await getOrCreateProduct(newLabel);
                  setForm((prev) => ({
                    ...prev,
                    productId: newProduct.id,
                    productName: newProduct.name,
                  }));
                  return { id: newProduct.id, label: newProduct.name };
                } catch (error) {
                  Alert.alert("Error", "Failed to create new product");
                  throw error;
                }
              }}
            />
          </View>
          {errors.productName && (
            <View style={styles.errorContainer}>
              <MaterialIcons
                name="error-outline"
                size={16}
                color={AppColors.error}
              />
              <Text style={styles.errorText}>{errors.productName}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>
              Supplier <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.dropdownContainer}>
              <CreatableDropdown
                options={suppliers.map((s) => ({ id: s.id, label: s.name }))}
                value={form.supplierId}
                placeholder="Select supplier"
                onSelect={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    supplierId: option.id,
                    supplierName: option.label,
                  }))
                }
                onCreate={async (newLabel: string) => {
                  try {
                    const newSupplier = await getOrCreateSupplier(newLabel);
                    setForm((prev) => ({
                      ...prev,
                      supplierId: newSupplier.id,
                      supplierName: newSupplier.name,
                    }));
                    return { id: newSupplier.id, label: newSupplier.name };
                  } catch (error) {
                    Alert.alert("Error", "Failed to create new supplier");
                    throw error;
                  }
                }}
              />
            </View>
            {errors.supplierName && (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={16}
                  color={AppColors.error}
                />
                <Text style={styles.errorText}>{errors.supplierName}</Text>
              </View>
            )}
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>
              Packaging Size <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.dropdownContainer}>
              <CreatableDropdown
                options={sizes.map((s) => ({ id: s.id, label: s.label }))}
                value={form.sizeId}
                placeholder="Select size"
                onSelect={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    sizeId: option.id,
                    sizeLabel: option.label,
                  }))
                }
                onCreate={async (newLabel: string) => {
                  try {
                    const newSize = await getOrCreateSize(newLabel);
                    setForm((prev) => ({
                      ...prev,
                      sizeId: newSize.id,
                      sizeLabel: newSize.label,
                    }));
                    return { id: newSize.id, label: newSize.label };
                  } catch (error) {
                    Alert.alert("Error", "Failed to create new size");
                    throw error;
                  }
                }}
              />
            </View>
            {errors.sizeLabel && (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={16}
                  color={AppColors.error}
                />
                <Text style={styles.errorText}>{errors.sizeLabel}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Quantity and Pricing Section */}
      <View style={styles.itemSection}>
        <Text style={styles.sectionLabel}>Quantity & Pricing</Text>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>
              Quantity <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="inventory"
                size={20}
                color={colors.gray[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.textInput,
                  styles.inputWithIcon,
                  errors.quantity && styles.inputError,
                ]}
                value={form.quantity}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, quantity: value }))
                }
                placeholder="Enter quantity"
                keyboardType="numeric"
                placeholderTextColor={colors.gray[400]}
              />
            </View>
            {errors.quantity && (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={16}
                  color={AppColors.error}
                />
                <Text style={styles.errorText}>{errors.quantity}</Text>
              </View>
            )}
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>Buy Price (₹)</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="attach-money"
                size={20}
                color={colors.gray[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, styles.inputWithIcon]}
                value={form.buyPrice}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, buyPrice: value }))
                }
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={colors.gray[400]}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>Sell Price (₹)</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="sell"
                size={20}
                color={colors.gray[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, styles.inputWithIcon]}
                value={form.sellPrice}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, sellPrice: value }))
                }
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={colors.gray[400]}
              />
            </View>
          </View>

          {/* Price Difference Indicator */}
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>Profit Margin</Text>
            <View style={styles.profitIndicator}>
              {form.buyPrice &&
              form.sellPrice &&
              !isNaN(Number(form.buyPrice)) &&
              !isNaN(Number(form.sellPrice)) ? (
                <Text
                  style={[
                    styles.profitText,
                    Number(form.sellPrice) > Number(form.buyPrice)
                      ? styles.profitPositive
                      : styles.profitNegative,
                  ]}
                >
                  {Number(form.sellPrice) > Number(form.buyPrice) ? "+" : ""}₹
                  {(Number(form.sellPrice) - Number(form.buyPrice)).toFixed(2)}
                </Text>
              ) : (
                <Text style={styles.profitText}>-</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Item Summary */}
      {form.productName && form.quantity && (
        <View style={styles.itemSummary}>
          <MaterialIcons name="check-circle" size={16} color={colors.primary} />
          <Text style={styles.itemSummaryText}>
            {form.productName} • {form.quantity} units
            {form.buyPrice && ` • Buy: ₹${form.buyPrice}`}
            {form.sellPrice && ` • Sell: ₹${form.sellPrice}`}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Batch Mode Toggle */}
        <View style={styles.batchToggleContainer}>
          <Text style={styles.batchToggleLabel}>Batch Mode</Text>
          <Switch
            value={batchMode}
            onValueChange={setBatchMode}
            trackColor={{
              false: colors.gray[300],
              true: `${colors.primary}80`,
            }}
            thumbColor={batchMode ? colors.primary : colors.white}
          />
        </View>

        {/* Batch Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batch Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Invoice Date & Time</Text>
            <TouchableOpacity style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>
                {invoiceDate.toLocaleString()}
              </Text>
              <MaterialIcons name="event" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this purchase..."
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bill Photo</Text>
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
                    <MaterialIcons name="edit" size={16} color={colors.white} />
                    <Text style={styles.imageActionText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={removeBillImage}
                  >
                    <MaterialIcons
                      name="delete"
                      size={16}
                      color={colors.white}
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
                  color={colors.primary}
                />
                <Text style={styles.imageUploadText}>Upload Bill Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Batch Items List */}
        {batchMode && batchItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Items in Batch ({batchItems.length})
            </Text>
            <FlatList
              data={batchItems}
              renderItem={renderBatchItem}
              keyExtractor={(_, index) => `batch-item-${index}`}
              style={styles.batchItemsList}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Product Entry Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Items</Text>
          {renderItemCard(form, batchItems.length)}

          {batchMode && (
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={addItemToBatch}
              disabled={!isFormValid}
            >
              <MaterialIcons name="add" size={20} color={colors.primary} />
              <Text style={styles.addItemText}>Add Another Item</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <MaterialIcons
                name={batchMode ? "inventory" : "add-circle"}
                size={20}
                color={colors.white}
              />
              <Text style={styles.saveButtonText}>
                {batchMode
                  ? `Save Stock Entry${
                      batchItems.length > 0 ? ` (${batchItems.length})` : ""
                    }`
                  : "Save Stock Entry"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary Modal */}
      {renderSummaryModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  batchToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  batchToggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: AppColors.error,
  },
  errorText: {
    color: AppColors.error,
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  datePickerButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePickerText: {
    fontSize: 16,
    color: colors.text,
  },
  imageUploadButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
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
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  imageActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  batchItemsList: {
    maxHeight: 300,
  },
  batchItemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  batchItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  batchItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  removeItemButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  batchItemContent: {
    flex: 1,
  },
  batchItemProduct: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  batchItemDetails: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 2,
  },
  batchItemPrices: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: "500",
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemNumberBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemNumberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  itemHeaderText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  itemSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: 12,
  },
  requiredAsterisk: {
    color: AppColors.error,
  },
  dropdownContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputWithIcon: {
    flex: 1,
    paddingLeft: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  itemSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  itemSummaryText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 8,
  },
  profitIndicator: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  profitText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[700],
  },
  profitPositive: {
    color: AppColors.success,
  },
  profitNegative: {
    color: AppColors.error,
  },
  addItemButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addItemText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  summarySection: {
    marginBottom: 20,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  summaryImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
  },
  summaryItem: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  summaryItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  summaryItemText: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 2,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.gray[700],
    fontSize: 16,
    fontWeight: "600",
  },
});
