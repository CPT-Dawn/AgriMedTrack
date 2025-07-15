import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CreatableDropdown } from "../components/CreatableDropdown";
import { IconSymbol } from "../components/ui/IconSymbol";
import { AppColors } from "../constants/Colors";
import { useStock } from "../hooks/useStock";
import { StockEntryFormData } from "../types/stock";

export default function StockScreen() {
  const {
    stockItems,
    activities,
    products,
    suppliers,
    sizes,
    loading,
    error,
    addStockEntry,
    getOrCreateProduct,
    getOrCreateSupplier,
    getOrCreateSize,
    clearError,
  } = useStock();

  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<StockEntryFormData>({
    productId: "",
    productName: "",
    supplierId: "",
    supplierName: "",
    sizeId: "",
    sizeLabel: "",
    quantity: "",
  });

  const resetForm = () => {
    setForm({
      productId: "",
      productName: "",
      supplierId: "",
      supplierName: "",
      sizeId: "",
      sizeLabel: "",
      quantity: "",
    });
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Camera roll permission is required to upload bill images."
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
        setForm((prev) => ({
          ...prev,
          billImage: {
            uri: asset.uri,
            name: asset.fileName || `bill_${Date.now()}.jpg`,
            type: "image/jpeg",
          },
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      clearError();

      // Validation
      if (!form.productName.trim()) {
        Alert.alert("Validation Error", "Product name is required");
        return;
      }
      if (!form.supplierName.trim()) {
        Alert.alert("Validation Error", "Supplier name is required");
        return;
      }
      if (!form.sizeLabel.trim()) {
        Alert.alert("Validation Error", "Packaging size is required");
        return;
      }
      if (!form.quantity.trim() || isNaN(parseInt(form.quantity))) {
        Alert.alert("Validation Error", "Valid quantity is required");
        return;
      }

      await addStockEntry(form);
      setModalVisible(false);
      resetForm();
      Alert.alert("Success", "Stock entry added successfully");
    } catch (err) {
      console.error("Error adding stock entry:", err);
      Alert.alert("Error", "Failed to add stock entry");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStockItem = (item: (typeof stockItems)[0]) => (
    <View key={item.id} style={styles.stockCard}>
      <View style={styles.stockCardHeader}>
        <IconSymbol
          name="pills.fill"
          size={24}
          color={AppColors.primary}
          style={styles.stockIcon}
        />
        <View style={styles.stockHeaderText}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.totalQuantity}>
            Total: {item.totalQuantity} units
          </Text>
        </View>
      </View>

      {item.suppliers.map((supplierGroup, supplierIndex) => (
        <View key={supplierIndex} style={styles.supplierSection}>
          <Text style={styles.supplierName}>{supplierGroup.supplier.name}</Text>
          <View style={styles.sizesContainer}>
            {supplierGroup.sizes.map((sizeGroup, sizeIndex) => (
              <View key={sizeIndex} style={styles.sizeChip}>
                <Text style={styles.sizeLabel}>{sizeGroup.size.label}</Text>
                <Text style={styles.sizeQuantity}>
                  {sizeGroup.quantity} units
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderActivityItem = (activity: (typeof activities)[0]) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <IconSymbol
          name={activity.action === "added" ? "plus" : "pencil"}
          size={12}
          color={AppColors.white}
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={styles.activityAction}>{activity.action}</Text>{" "}
          {activity.quantity} units of{" "}
          <Text style={styles.activityProduct}>{activity.productName}</Text> (
          {activity.sizeName}) from{" "}
          <Text style={styles.activitySupplier}>{activity.supplierName}</Text>
        </Text>
        <Text style={styles.activityTime}>
          {formatDate(activity.timestamp)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={AppColors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stock Inventory</Text>
        <Text style={styles.headerSubtitle}>
          {stockItems.length} products •{" "}
          {stockItems.reduce((sum, item) => sum + item.totalQuantity, 0)} total
          units
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stock Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Stock</Text>
          {stockItems.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="archivebox" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>No stock items yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the + button to add your first stock entry
              </Text>
            </View>
          ) : (
            stockItems.map(renderStockItem)
          )}
        </View>

        {/* Activity Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activities.length === 0 ? (
            <Text style={styles.emptyActivityText}>No recent activity</Text>
          ) : (
            activities.map(renderActivityItem)
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <IconSymbol name="plus" size={24} color={AppColors.white} />
      </Pressable>

      {/* Add Stock Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Stock</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={20} color={AppColors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Product */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Medical Formula / Product</Text>
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
                />
              </View>

              {/* Supplier */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Supplier / Vendor</Text>
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
                />
              </View>

              {/* Packaging Size */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Packaging Size</Text>
                <CreatableDropdown
                  options={sizes.map((s) => ({ id: s.id, label: s.label }))}
                  value={form.sizeId}
                  placeholder="Select or create size"
                  onSelect={(option) =>
                    setForm((prev) => ({
                      ...prev,
                      sizeId: option.id,
                      sizeLabel: option.label,
                    }))
                  }
                  onCreate={async (label) => {
                    const size = await getOrCreateSize(label);
                    return { id: size.id, label: size.label };
                  }}
                  createLabel="Create size"
                />
              </View>

              {/* Quantity */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, quantity: text }))
                  }
                  keyboardType="numeric"
                />
              </View>

              {/* Bill Photo */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Bill Photo (Optional)</Text>
                <Pressable
                  style={styles.imageButton}
                  onPress={handleImagePicker}
                >
                  {form.billImage ? (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: form.billImage.uri }}
                        style={styles.billImage}
                      />
                      <Text style={styles.imageText}>Bill attached</Text>
                    </View>
                  ) : (
                    <View style={styles.imageContainer}>
                      <IconSymbol
                        name="camera"
                        size={24}
                        color={AppColors.primary}
                      />
                      <Text style={styles.imageText}>
                        Tap to add bill photo
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Additional notes..."
                  value={form.notes || ""}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, notes: text }))
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={AppColors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Stock</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: AppColors.text,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0 + 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: AppColors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: "#FFF3F3",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.error,
  },
  errorText: {
    color: AppColors.error,
    fontSize: 14,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#999",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },
  stockCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stockCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stockIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  stockHeaderText: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 2,
  },
  totalQuantity: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: "500",
  },
  supplierSection: {
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  sizesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeChip: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  sizeLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: AppColors.primary,
  },
  sizeQuantity: {
    fontSize: 11,
    color: "#666",
  },
  emptyActivityText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginHorizontal: 20,
    marginVertical: 20,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  activityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: AppColors.text,
    lineHeight: 20,
  },
  activityAction: {
    fontWeight: "600",
    textTransform: "capitalize",
  },
  activityProduct: {
    fontWeight: "500",
    color: AppColors.primary,
  },
  activitySupplier: {
    fontWeight: "500",
    color: AppColors.secondary,
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: AppColors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginTop: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: AppColors.text,
    backgroundColor: AppColors.white,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  imageButton: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
  },
  billImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageText: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppColors.border,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    backgroundColor: AppColors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.white,
  },
});
