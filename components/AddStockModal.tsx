import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "../constants/Colors";
import { StockEntryFormData } from "../types/stock";
import { CreatableDropdown } from "./CreatableDropdown";

interface AddStockModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: StockEntryFormData) => Promise<void>;
  products: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  sizes: { id: string; label: string }[];
  getOrCreateProduct: (name: string) => Promise<{ id: string; name: string }>;
  getOrCreateSupplier: (name: string) => Promise<{ id: string; name: string }>;
  getOrCreateSize: (label: string) => Promise<{ id: string; label: string }>;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  visible,
  onClose,
  onSubmit,
  products,
  suppliers,
  sizes,
  getOrCreateProduct,
  getOrCreateSupplier,
  getOrCreateSize,
}) => {
  const [form, setForm] = useState<StockEntryFormData>({
    productId: "",
    productName: "",
    supplierId: "",
    supplierName: "",
    packagingId: "",
    packaging: "",
    quantity: "",
    notes: "",
    buyPrice: "",
    sellPrice: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [billImage, setBillImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset form when modal is closed
  useEffect(() => {
    if (!visible) {
      setForm({
        productId: "",
        productName: "",
        supplierId: "",
        supplierName: "",
        packagingId: "",
        packaging: "",
        quantity: "",
        notes: "",
        buyPrice: "",
        sellPrice: "",
      });
      setErrors({});
      setBillImage(null);
    }
  }, [visible]);

  // Animate modal opening and closing
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

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
    if (!form.packaging.trim())
      newErrors.packaging = "Packaging size is required";
    if (!form.quantity.trim() || isNaN(parseInt(form.quantity))) {
      newErrors.quantity = "Valid quantity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch {
      Alert.alert("Error", "Failed to add stock entry");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    form.productName &&
    form.supplierName &&
    form.packaging &&
    form.quantity &&
    !isNaN(parseInt(form.quantity));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Stock</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close add stock form"
              >
                <MaterialIcons name="close" size={24} color={AppColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
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
                  onCreate={async (name) => {
                    const product = await getOrCreateProduct(name);
                    return { id: product.id, label: product.name };
                  }}
                  createLabel="Create product"
                  style={styles.inputWithIcon}
                />
                {errors.productName && (
                  <Text style={styles.inputError}>{errors.productName}</Text>
                )}
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
                  onCreate={async (name) => {
                    const supplier = await getOrCreateSupplier(name);
                    return { id: supplier.id, label: supplier.name };
                  }}
                  createLabel="Create supplier"
                  style={styles.inputWithIcon}
                />
                {errors.supplierName && (
                  <Text style={styles.inputError}>{errors.supplierName}</Text>
                )}
              </View>

              {/* Packaging Size */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Packaging Size</Text>
                <CreatableDropdown
                  options={sizes.map((s) => ({ id: s.id, label: s.label }))}
                  value={form.packagingId}
                  placeholder="Select or create size"
                  onSelect={(option) =>
                    setForm((prev) => ({
                      ...prev,
                      packagingId: option.id,
                      packaging: option.label,
                    }))
                  }
                  onCreate={async (label) => {
                    const size = await getOrCreateSize(label);
                    return { id: size.id, label: size.label };
                  }}
                  createLabel="Create size"
                  style={styles.inputWithIcon}
                />
                {errors.packaging && (
                  <Text style={styles.inputError}>{errors.packaging}</Text>
                )}
              </View>

              {/* Buy Price */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Buy Price (₹)</Text>
                <View style={styles.inputWithIcon}>
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color={AppColors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter buy price"
                    value={form.buyPrice}
                    onChangeText={(text) =>
                      setForm((prev) => ({ ...prev, buyPrice: text }))
                    }
                    keyboardType="numeric"
                    accessibilityLabel="Buy price in rupees"
                  />
                </View>
              </View>

              {/* Sell Price */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sell Price (₹)</Text>
                <View style={styles.inputWithIcon}>
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color={AppColors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter sell price"
                    value={form.sellPrice}
                    onChangeText={(text) =>
                      setForm((prev) => ({ ...prev, sellPrice: text }))
                    }
                    keyboardType="numeric"
                    accessibilityLabel="Sell price in rupees"
                  />
                </View>
              </View>

              {/* Quantity */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Quantity</Text>
                <View style={styles.inputWithIcon}>
                  <MaterialIcons
                    name="inventory"
                    size={20}
                    color={AppColors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter quantity"
                    value={form.quantity}
                    onChangeText={(text) =>
                      setForm((prev) => ({ ...prev, quantity: text }))
                    }
                    keyboardType="numeric"
                    accessibilityLabel="Quantity"
                  />
                </View>
                {errors.quantity && (
                  <Text style={styles.inputError}>{errors.quantity}</Text>
                )}
              </View>

              {/* Bill Photo */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Bill Photo (Optional)</Text>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleImagePicker}
                  accessibilityLabel="Upload bill image"
                >
                  {billImage ? (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: billImage.uri }}
                        style={styles.billImage}
                      />
                      <Text style={styles.imageText}>Change Image</Text>
                    </View>
                  ) : (
                    <View style={styles.imageContainer}>
                      <MaterialIcons
                        name="camera-alt"
                        size={36}
                        color={AppColors.primary}
                      />
                      <Text style={styles.imageText}>
                        Tap to upload bill image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Additional notes..."
                  value={form.notes}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, notes: text }))
                  }
                  multiline
                  numberOfLines={3}
                  accessibilityLabel="Notes"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !isFormValid && styles.saveButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!isFormValid || submitting}
                accessibilityLabel="Save stock entry"
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  keyboardAvoid: {
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: AppColors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  modalContent: {
    padding: 20,
    maxHeight: "70%",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0E0E0",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
    paddingVertical: 12,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputError: {
    color: AppColors.error || "#F44336",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  imageButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    minHeight: 120,
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
  },
  billImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageText: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: "500",
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  saveButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
