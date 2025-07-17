import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "../constants/Colors";
import { Theme } from "../constants/Theme";
import { useUser } from "../hooks/useUser";
import { BatchEntryFormData, StockEntryFormData } from "../types/stock";
import { CreatableDropdown } from "./CreatableDropdown";

// Local color reference for backward compatibility
const colors = {
  primary: Theme.colors.primary,
  secondary: Theme.colors.secondary,
  accent: Theme.colors.accent,
  white: Theme.colors.white,
  text: Theme.colors.text,
  bg: Theme.colors.background,
  gray: {
    50: Theme.colors.surfacePressed,
    100: Theme.colors.surfacePressed,
    200: Theme.colors.border,
    300: Theme.colors.border,
    400: Theme.colors.textMuted,
    500: Theme.colors.textMuted,
    600: Theme.colors.textMuted,
    700: Theme.colors.text,
    900: Theme.colors.text,
  },
};

interface AddStockFormProps {
  onSubmit: (
    formData: StockEntryFormData | BatchEntryFormData
  ) => Promise<void>;
  products: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  sizes: { id: string; label: string; unit: string }[];
  getOrCreateProduct: (name: string) => Promise<{ id: string; name: string }>;
  getOrCreateSupplier: (name: string) => Promise<{ id: string; name: string }>;
  getOrCreateSize: (
    label: string
  ) => Promise<{ id: string; label: string; unit: string }>;
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
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [form, setForm] = useState<StockEntryFormData>({
    productId: "",
    productName: "",
    supplierId: "",
    supplierName: "",
    sizeId: "",
    sizeLabel: "",
    sizeValue: "",
    unit: "",
    quantity: "",
    sellPrice: "",
  });
  const [items, setItems] = useState<StockEntryFormData[]>(
    initialData?.items || [
      {
        productId: "",
        productName: "",
        supplierId: "",
        supplierName: "",
        sizeId: "",
        sizeLabel: "",
        sizeValue: "",
        unit: "",
        quantity: "",
        sellPrice: "",
      },
    ]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [billImage, setBillImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Date/Time state
  const [stockDate, setStockDate] = useState(new Date());
  const [stockTime, setStockTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Extract unique size values and units from sizes
  const [sizeValues, setSizeValues] = useState<{ id: string; label: string }[]>(
    []
  );
  const [unitValues, setUnitValues] = useState<{ id: string; label: string }[]>(
    []
  );

  // Extract size values and units from the packaging sizes on component mount
  useEffect(() => {
    // Extract unique size values and units
    const extractedSizeValues = new Set<string>();
    const extractedUnits = new Set<string>();

    sizes.forEach((size) => {
      // Try to split the label into value and unit
      const match = size.label.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
      if (match) {
        extractedSizeValues.add(match[1]);
        extractedUnits.add(match[2]);
      } else if (!isNaN(parseFloat(size.label))) {
        // If it's just a number
        extractedSizeValues.add(size.label);
      } else {
        // If it's just a unit
        extractedUnits.add(size.label);
      }

      // Also add the unit from the size object if it exists
      if (size.unit) {
        extractedUnits.add(size.unit);
      }
    });

    // Convert to array of objects for the dropdown
    const sizeValueArray = Array.from(extractedSizeValues)
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .map((value) => ({ id: value, label: value }));

    const unitArray = Array.from(extractedUnits)
      .sort()
      .map((unit) => ({ id: unit, label: unit }));

    setSizeValues(sizeValueArray);
    setUnitValues(unitArray);
  }, [sizes]);

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
    if (!form.sizeValue.trim() || isNaN(parseFloat(form.sizeValue)))
      newErrors.sizeValue = "Valid size value is required";
    if (!form.unit.trim()) newErrors.unit = "Unit is required";
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
      sizeValue: "",
      unit: "",
      quantity: "",
      sellPrice: "",
    });
    setErrors({});
  };

  const addAnotherProduct = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        supplierId: "",
        supplierName: "",
        sizeId: "",
        sizeLabel: "",
        sizeValue: "",
        unit: "",
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

  // Handle size value selection
  const handleSizeValueSelect = (
    index: number,
    option: { id: string; label: string }
  ) => {
    updateProduct(index, { sizeValue: option.label });
    updateCombinedSizeLabel(index, option.label, items[index].unit);
  };

  // Handle unit selection
  const handleUnitSelect = (
    index: number,
    option: { id: string; label: string }
  ) => {
    updateProduct(index, { unit: option.label });
    updateCombinedSizeLabel(index, items[index].sizeValue, option.label);
  };

  // Update the combined size label
  const updateCombinedSizeLabel = (
    index: number,
    sizeValue: string,
    unit: string
  ) => {
    if (sizeValue && unit) {
      const combinedLabel = `${sizeValue} ${unit}`;
      updateProduct(index, {
        sizeLabel: combinedLabel,
        // We'll find or create the size ID when submitting
        sizeId: "",
      });
    }
  };

  // Add a new function to create a size with separate value and unit
  const getOrCreateSizeWithValueAndUnit = async (
    index: number,
    sizeValue: string,
    unit: string
  ): Promise<void> => {
    try {
      // Create the combined label
      const combinedLabel = `${sizeValue} ${unit}`;

      // Check if this size already exists
      const existingSize = sizes.find(
        (s) => s.label.toLowerCase() === combinedLabel.toLowerCase()
      );

      if (existingSize) {
        // Use existing size
        updateProduct(index, {
          sizeId: existingSize.id,
          sizeLabel: existingSize.label,
          sizeValue,
          unit,
        });
        return;
      }

      // Create a new size with the separate value and unit
      const newSize = await getOrCreateSize(combinedLabel);

      // Update the product with the new size
      updateProduct(index, {
        sizeId: newSize.id,
        sizeLabel: newSize.label,
        sizeValue,
        unit,
      });
    } catch (error) {
      console.error("Error creating size:", error);
      Alert.alert("Error", "Failed to create new size");
    }
  };

  // Update the handleSubmit function to ensure size and unit are properly combined
  const handleSubmit = async () => {
    // Validate all items
    let valid = true;
    let invalidItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Ensure sizeLabel is set for each item
      if (item.sizeValue && item.unit && !item.sizeLabel) {
        item.sizeLabel = `${item.sizeValue} ${item.unit}`;
      }

      if (
        !item.productName.trim() ||
        !item.supplierName.trim() ||
        !item.sizeValue.trim() ||
        !item.unit.trim() ||
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

      // Process each item to ensure size IDs are set
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.sizeValue && item.unit && !item.sizeId) {
          await getOrCreateSizeWithValueAndUnit(i, item.sizeValue, item.unit);
        }
      }

      const batchData: BatchEntryFormData = {
        addedBy: currentUser?.id || "unknown-user",
        billImage: billImage || undefined,
        items,
      };

      await onSubmit(batchData);
      setItems([
        {
          productId: "",
          productName: "",
          supplierId: "",
          supplierName: "",
          sizeId: "",
          sizeLabel: "",
          sizeValue: "",
          unit: "",
          quantity: "",
          sellPrice: "",
        },
      ]);
      setBillImage(null);
      Alert.alert("Success", "Stock entry added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to add stock entry");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmBatchSubmit = async () => {
    // Validate all items
    let valid = true;
    let invalidItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Ensure sizeLabel is set for each item
      if (item.sizeValue && item.unit && !item.sizeLabel) {
        item.sizeLabel = `${item.sizeValue} ${item.unit}`;
      }

      if (
        !item.productName.trim() ||
        !item.supplierName.trim() ||
        !item.sizeValue.trim() ||
        !item.unit.trim() ||
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

      // Process each item to ensure size IDs are set
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.sizeValue && item.unit && !item.sizeId) {
          await getOrCreateSizeWithValueAndUnit(i, item.sizeValue, item.unit);
        }
      }

      const batchData: BatchEntryFormData = {
        addedBy: currentUser?.id || "unknown-user",
        billImage: billImage || undefined,
        items,
      };
      await onSubmit(batchData);

      // Reset form and batch items
      resetForm();
      setItems([
        {
          productId: "",
          productName: "",
          supplierId: "",
          supplierName: "",
          sizeId: "",
          sizeLabel: "",
          sizeValue: "",
          unit: "",
          quantity: "",
          sellPrice: "",
        },
      ]);
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
    form.productName.trim() &&
    form.supplierName.trim() &&
    form.sizeValue.trim() &&
    form.unit.trim() &&
    form.quantity.trim() &&
    !isNaN(parseInt(form.quantity));

  const renderItemCard = (item: StockEntryFormData, index: number) => (
    <View key={`item-${index}`} style={styles.itemCard}>
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
        {items.length > 1 && (
          <TouchableOpacity
            onPress={() => removeProduct(index)}
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
        {/* Product Name - Full Width */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Product Name <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.dropdownContainer}>
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
                } catch (error) {
                  Alert.alert("Error", "Failed to create new product");
                  throw error;
                }
              }}
            />
          </View>
        </View>

        {/* Supplier - Full Width */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Supplier <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.dropdownContainer}>
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
                } catch (error) {
                  Alert.alert("Error", "Failed to create new supplier");
                  throw error;
                }
              }}
            />
          </View>
        </View>

        {/* Replace the Size Value and Unit fields with CreatableDropdown */}
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>
              Size <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <CreatableDropdown
              options={sizeValues}
              value={item.sizeValue}
              placeholder="Select or create size"
              onSelect={(option) => handleSizeValueSelect(index, option)}
              onCreate={async (newValue) => {
                if (isNaN(parseFloat(newValue))) {
                  Alert.alert("Invalid Size", "Size value must be a number");
                  throw new Error("Invalid size value");
                }
                updateProduct(index, { sizeValue: newValue });
                updateCombinedSizeLabel(index, newValue, item.unit);
                return { id: newValue, label: newValue };
              }}
              createLabel="Create size"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.inputLabel}>
              Unit <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <CreatableDropdown
              options={unitValues}
              value={item.unit}
              placeholder="Select or create unit"
              onSelect={(option) => handleUnitSelect(index, option)}
              onCreate={async (newUnit) => {
                updateProduct(index, { unit: newUnit });
                updateCombinedSizeLabel(index, item.sizeValue, newUnit);
                return { id: newUnit, label: newUnit };
              }}
              createLabel="Create unit"
            />
          </View>
        </View>

        {/* Packaging Size - Full width but hidden, used for compatibility */}
        <View style={[styles.inputGroup, { display: "none" }]}>
          <Text style={styles.inputLabel}>
            Packaging Size <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.dropdownContainer}>
            <CreatableDropdown
              options={sizes.map((s) => ({ id: s.id, label: s.label }))}
              value={item.sizeId}
              placeholder="Select size"
              onSelect={(option) =>
                updateProduct(index, {
                  sizeId: option.id,
                  sizeLabel: option.label,
                })
              }
              onCreate={async (newLabel: string) => {
                try {
                  const newSize = await getOrCreateSize(newLabel);
                  updateProduct(index, {
                    sizeId: newSize.id,
                    sizeLabel: newSize.label,
                  });
                  return { id: newSize.id, label: newSize.label };
                } catch (error) {
                  Alert.alert("Error", "Failed to create new size");
                  throw error;
                }
              }}
            />
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
              color={colors.gray[400]}
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
              placeholderTextColor={colors.gray[400]}
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
              color={colors.gray[400]}
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
              placeholderTextColor={colors.gray[400]}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 0,
          paddingBottom: 150,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Date & Time Section */}
        <View style={{ flexDirection: "row", gap: 14, marginBottom: 18 }}>
          {/* Date Field */}
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontWeight: "600", marginBottom: 4, color: colors.text }}
            >
              Date
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Theme.colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Theme.colors.border,
                paddingHorizontal: 12,
                paddingVertical: 10,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => setShowDatePicker(true)}
              accessibilityLabel="Select date"
              activeOpacity={0.85}
            >
              <MaterialIcons
                name="event"
                size={20}
                color={Theme.colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: Theme.colors.text, fontSize: 16, flex: 1 }}>
                {stockDate ? stockDate.toLocaleDateString() : "Select"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Time Field */}
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontWeight: "600", marginBottom: 4, color: colors.text }}
            >
              Time
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Theme.colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Theme.colors.border,
                paddingHorizontal: 12,
                paddingVertical: 10,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => setShowTimePicker(true)}
              accessibilityLabel="Select time"
              activeOpacity={0.85}
            >
              <MaterialIcons
                name="schedule"
                size={20}
                color={Theme.colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: Theme.colors.text, fontSize: 16, flex: 1 }}>
                {stockTime
                  ? stockTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Select"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
        {/* Product Section (FlatList) */}
        <FlatList
          data={items}
          keyExtractor={(_, idx) => `item-${idx}`}
          renderItem={({ item, index }) => renderItemCard(item, index)}
          contentContainerStyle={{ paddingBottom: 0 }}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.addProductButton}
          onPress={addAnotherProduct}
          accessibilityLabel="Add another product"
        >
          <Text style={styles.addProductText}>+ Add Another Product</Text>
        </TouchableOpacity>
        {/* Bill Image Upload */}
        <View style={[styles.inputGroup, { marginTop: 20 }]}>
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
                  <MaterialIcons name="delete" size={16} color={colors.white} />
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

        {/* Confirm & Save Button */}
        <View style={{}}>
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
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Confirm & Save</Text>
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
    backgroundColor: colors.bg,
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
    fontSize: 12,
    fontWeight: "700",
    color: colors.gray[600],
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
    padding: 18,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.gray[200],
    // Add subtle gradient-like effect with border
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    borderLeftWidth: 1,
    borderLeftColor: colors.gray[100],
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  itemNumberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  itemHeaderText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
    fontWeight: "500",
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
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  inputWithIcon: {
    flex: 1,
    paddingLeft: 8,
  },
  inputIcon: {
    marginRight: 10,
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
    backgroundColor: "#43a047",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#2e7d32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
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
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  batchListCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addProductButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  addProductText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonsRow: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 30,
    marginBottom: 40,
  },
});
