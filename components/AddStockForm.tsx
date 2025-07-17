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
      style={{ flex: 1, backgroundColor: Theme.colors.background }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: Theme.spacing.lg,
          paddingTop: Theme.spacing.md,
          paddingBottom: Theme.spacing["6xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Header */}
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Add New Stock</Text>
          <Text style={styles.formSubtitle}>
            Enter details for new stock items
          </Text>
        </View>

        {/* Date & Time Section */}
        <View style={styles.dateTimeSection}>
          <Text style={styles.sectionLabel}>Stock Entry Date & Time</Text>
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
                  {stockDate ? stockDate.toLocaleDateString() : "Select Date"}
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
        {/* Product Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Product Information</Text>
          <Text style={styles.sectionSubtitle}>
            Add details for each product item
          </Text>
        </View>

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
          <Text style={styles.sectionSubtitle}>
            Upload an image of the purchase bill (optional)
          </Text>

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
      </ScrollView>
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
    paddingVertical: 12,
    ...Theme.shadows.sm,
  },
  datePickerButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Theme.shadows.sm,
  },
  datePickerText: {
    fontSize: 16,
    color: Theme.colors.text,
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
  batchItemsList: {
    maxHeight: 300,
  },
  batchItemCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 12,
    marginBottom: 8,
    ...Theme.shadows.sm,
  },
  itemCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius["2xl"],
    padding: 16,
    marginBottom: 16,
    ...Theme.shadows.sm,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  itemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemNumberText: {
    color: Theme.colors.white,
    fontSize: 14,
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
    fontSize: 12,
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
  },
  itemSection: {
    marginBottom: 20,
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
  dropdownContainer: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
    overflow: "hidden",
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
});
