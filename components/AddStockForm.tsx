import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "../constants/Colors";
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
  const [billImage, setBillImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

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

    if (!result.canceled) {
      const asset = result.assets[0];
      const fileName = asset.uri.split("/").pop() || "bill_image.jpg";

      setBillImage({
        uri: asset.uri,
        name: fileName,
        type: "image/jpeg",
      });

      setForm((prev) => ({
        ...prev,
        billImage: {
          uri: asset.uri,
          name: fileName,
          type: "image/jpeg",
        },
      }));
    }
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

      try {
        setSubmitting(true);
        const batchData: BatchEntryFormData = {
          addedBy: "current-user", // In a real app, get this from auth context
          billImage: billImage || undefined,
          items: batchItems,
        };
        await onSubmit(batchData);

        // Reset form and batch items
        resetForm();
        setBatchItems([]);
        setBillImage(null);
        Alert.alert("Success", "Stock batch added successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to add stock batch");
      } finally {
        setSubmitting(false);
      }
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
    <View style={styles.batchItem}>
      <View style={styles.batchItemContent}>
        <Text style={styles.batchItemTitle}>{item.productName}</Text>
        <Text style={styles.batchItemDetails}>
          {item.supplierName} • {item.sizeLabel} • {item.quantity} units
        </Text>
        {(item.buyPrice || item.sellPrice) && (
          <Text style={styles.batchItemPrices}>
            {item.buyPrice ? `Buy: ₹${item.buyPrice}` : ""}
            {item.buyPrice && item.sellPrice ? " • " : ""}
            {item.sellPrice ? `Sell: ₹${item.sellPrice}` : ""}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.batchItemRemove}
        onPress={() => removeItemFromBatch(index)}
      >
        <MaterialIcons name="close" size={20} color={AppColors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.content}>
        {/* Batch Mode Toggle */}
        <View style={styles.batchToggleContainer}>
          <Text style={styles.batchToggleLabel}>Batch Mode</Text>
          <Switch
            value={batchMode}
            onValueChange={setBatchMode}
            trackColor={{ false: "#E0E0E0", true: `${AppColors.primary}80` }}
            thumbColor={batchMode ? AppColors.primary : "#FFF"}
          />
        </View>

        {/* Batch Items List */}
        {batchMode && batchItems.length > 0 && (
          <View style={styles.batchItemsContainer}>
            <Text style={styles.batchItemsTitle}>
              Items in this batch ({batchItems.length})
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

        {/* Product */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Product</Text>
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
            error={errors.productName}
          />
        </View>

        {/* Supplier */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Supplier</Text>
          <CreatableDropdown
            options={suppliers.map((s) => ({ id: s.id, label: s.name }))}
            value={form.supplierId}
            placeholder="Select or create supplier"
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
            error={errors.supplierName}
          />
        </View>

        {/* Packaging Size */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Packaging Size</Text>
          <CreatableDropdown
            options={sizes.map((s) => ({ id: s.id, label: s.label }))}
            value={form.sizeId}
            placeholder="Select or create size (e.g. 100ml, 500g)"
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
            error={errors.sizeLabel}
          />
        </View>

        {/* Quantity */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Quantity</Text>
          <View
            style={[
              styles.textInputContainer,
              errors.quantity ? styles.inputError : null,
            ]}
          >
            <MaterialIcons name="tag" size={20} color="#999" />
            <CreatableDropdown
              options={[
                { id: "1", label: "1" },
                { id: "5", label: "5" },
                { id: "10", label: "10" },
                { id: "25", label: "25" },
                { id: "50", label: "50" },
                { id: "100", label: "100" },
              ]}
              value={form.quantity}
              placeholder="Enter quantity"
              onSelect={(option) =>
                setForm((prev) => ({
                  ...prev,
                  quantity: option.label,
                }))
              }
              onCreate={async (newValue: string) => {
                if (!isNaN(parseInt(newValue))) {
                  setForm((prev) => ({
                    ...prev,
                    quantity: newValue,
                  }));
                  return { id: newValue, label: newValue };
                }
                throw new Error("Invalid quantity");
              }}
              allowCustomText={true}
              keyboardType="numeric"
              error={errors.quantity}
            />
          </View>
          {errors.quantity && (
            <Text style={styles.errorText}>{errors.quantity}</Text>
          )}
        </View>

        {/* Price Information */}
        <View style={styles.rowContainer}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.formLabel}>Buy Price (Optional)</Text>
            <View style={styles.textInputContainer}>
              <MaterialIcons name="attach-money" size={20} color="#999" />
              <CreatableDropdown
                options={[]}
                value={form.buyPrice}
                placeholder="Buy price"
                onSelect={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    buyPrice: option.label,
                  }))
                }
                onCreate={async (newValue: string) => {
                  if (!isNaN(parseFloat(newValue))) {
                    setForm((prev) => ({
                      ...prev,
                      buyPrice: newValue,
                    }));
                    return { id: newValue, label: newValue };
                  }
                  throw new Error("Invalid price");
                }}
                allowCustomText={true}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.formLabel}>Sell Price (Optional)</Text>
            <View style={styles.textInputContainer}>
              <MaterialIcons name="attach-money" size={20} color="#999" />
              <CreatableDropdown
                options={[]}
                value={form.sellPrice}
                placeholder="Sell price"
                onSelect={(option) =>
                  setForm((prev) => ({
                    ...prev,
                    sellPrice: option.label,
                  }))
                }
                onCreate={async (newValue: string) => {
                  if (!isNaN(parseFloat(newValue))) {
                    setForm((prev) => ({
                      ...prev,
                      sellPrice: newValue,
                    }));
                    return { id: newValue, label: newValue };
                  }
                  throw new Error("Invalid price");
                }}
                allowCustomText={true}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Notes (Optional)</Text>
          <View style={styles.textInputContainer}>
            <MaterialIcons name="note" size={20} color="#999" />
            <CreatableDropdown
              options={[]}
              value={form.notes}
              placeholder="Add notes about this stock entry"
              onSelect={(option) =>
                setForm((prev) => ({
                  ...prev,
                  notes: option.label,
                }))
              }
              onCreate={async (newValue: string) => {
                setForm((prev) => ({
                  ...prev,
                  notes: newValue,
                }));
                return { id: newValue, label: newValue };
              }}
              allowCustomText={true}
              multiline={true}
            />
          </View>
        </View>

        {/* Bill Image */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Bill Image (Optional)</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handleImagePicker}
          >
            <MaterialIcons name="add-photo-alternate" size={24} color="#999" />
            <Text style={styles.imagePickerText}>
              {billImage ? "Change Image" : "Add Image"}
            </Text>
          </TouchableOpacity>

          {billImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: billImage.uri }}
                style={styles.imagePreview}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setBillImage(null)}
              >
                <MaterialIcons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Buttons */}
        <View style={styles.submitContainer}>
          {batchMode && (
            <TouchableOpacity
              style={[
                styles.addToBatchButton,
                !isFormValid ? styles.buttonDisabled : null,
              ]}
              onPress={addItemToBatch}
              disabled={!isFormValid || submitting}
            >
              <MaterialIcons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Add to Batch</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              batchMode && styles.submitButtonWithMargin,
              (!isFormValid && !batchMode) ||
              (batchMode && batchItems.length === 0 && !isFormValid)
                ? styles.buttonDisabled
                : null,
            ]}
            onPress={handleSubmit}
            disabled={
              (!isFormValid && !batchMode) ||
              (batchMode && batchItems.length === 0 && !isFormValid) ||
              submitting
            }
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <MaterialIcons
                  name={batchMode ? "inventory" : "add-circle"}
                  size={20}
                  color="#FFF"
                />
                <Text style={styles.buttonText}>
                  {batchMode
                    ? `Submit Batch${
                        batchItems.length > 0 ? ` (${batchItems.length})` : ""
                      }`
                    : "Add Stock Entry"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  batchToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  batchToggleLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.text,
  },
  batchItemsContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primary,
  },
  batchItemsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
    marginBottom: 8,
  },
  batchItemsList: {
    maxHeight: 200,
  },
  batchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  batchItemContent: {
    flex: 1,
  },
  batchItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
  },
  batchItemDetails: {
    fontSize: 13,
    color: "#757575",
  },
  batchItemPrices: {
    fontSize: 12,
    color: AppColors.secondary,
    marginTop: 2,
  },
  batchItemRemove: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF3F3",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#263238",
    marginBottom: 6,
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputError: {
    borderColor: AppColors.error,
  },
  errorText: {
    color: AppColors.error,
    fontSize: 12,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    paddingVertical: 16,
  },
  imagePickerText: {
    marginLeft: 8,
    color: "#757575",
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  submitContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonWithMargin: {
    marginTop: 12,
  },
  addToBatchButton: {
    backgroundColor: AppColors.secondary,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
