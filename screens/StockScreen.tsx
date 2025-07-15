import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CreatableDropdown } from "../components/CreatableDropdown";
import { AppColors } from "../constants/Colors";
import { useStock } from "../hooks/useStock";

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
    stockEntries,
  } = useStock();

  const [search, setSearch] = useState("");
  const router = useRouter();
  const [showLog, setShowLog] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    productId: "",
    productName: "",
    supplierId: "",
    supplierName: "",
    sizeId: "",
    sizeLabel: "",
    quantity: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Remove: streakDays, showConfetti, confettiAnim, streakAnim, triggerConfetti, useEffect for confetti/streak, streak badge, confetti animation, and related styles

  // Remove: modalVisible, submitting, form, resetForm, handleImagePicker, handleSubmit, all code for FAB, Modal, and form fields
  // Remove related imports: ImagePicker, Modal, Pressable, Image, TextInput (if only used for add form), etc. Only keep TextInput for search bar.

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Find the most common unit for this product (by total quantity)
  const getMainUnit = (item: (typeof stockItems)[0]) => {
    const unitCount: Record<string, number> = {};
    item.suppliers.forEach((supplierGroup) => {
      supplierGroup.sizes.forEach((sizeGroup) => {
        const unit = sizeGroup.size.unit;
        unitCount[unit] = (unitCount[unit] || 0) + sizeGroup.quantity;
      });
    });
    // Return the unit with the highest total quantity
    return (
      Object.entries(unitCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "unit"
    );
  };

  // Calculate total quantity in main unit
  const getTotalQuantityByUnit = (
    item: (typeof stockItems)[0],
    unit: string
  ) => {
    let total = 0;
    item.suppliers.forEach((supplierGroup) => {
      supplierGroup.sizes.forEach((sizeGroup) => {
        if (sizeGroup.size.unit === unit) {
          total += sizeGroup.quantity;
        }
      });
    });
    return total;
  };

  // Utility: format quantity with best unit (g/kg, ml/L, etc.)
  const formatQuantityWithUnit = (quantity: number, unit: string) => {
    if (unit === "g" && quantity >= 1000)
      return `${(quantity / 1000).toFixed(2)} Kg`;
    if (unit === "ml" && quantity >= 1000)
      return `${(quantity / 1000).toFixed(2)} L`;
    if (unit === "mg" && quantity >= 1000)
      return `${(quantity / 1000).toFixed(2)} g`;
    if (
      unit === "tablet" ||
      unit === "vial" ||
      unit === "bottle" ||
      unit === "unit"
    )
      return `${quantity} ${unit}${quantity > 1 ? "s" : ""}`;
    return `${quantity} ${unit}`;
  };

  // Utility: format date for log
  const formatLogDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddStock = async () => {
    const errors = {};
    if (!addForm.productName.trim())
      errors.productName = "Product name is required";
    if (!addForm.supplierName.trim())
      errors.supplierName = "Supplier name is required";
    if (!addForm.sizeLabel.trim())
      errors.sizeLabel = "Packaging size is required";
    if (!addForm.quantity.trim() || isNaN(parseInt(addForm.quantity)))
      errors.quantity = "Valid quantity is required";
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      setSubmitting(true);
      clearError();
      await addStockEntry(addForm);
      setShowAdd(false);
      setAddForm({
        productId: "",
        productName: "",
        supplierId: "",
        supplierName: "",
        sizeId: "",
        sizeLabel: "",
        quantity: "",
        notes: "",
      });
      setAddErrors({});
      Alert.alert("Success", "Stock entry added successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to add stock entry");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStockItem = (item: (typeof stockItems)[0]) => {
    // Gather all supplier/packaging/price/quantity rows for this product
    const rows: any[] = [];
    let totalQuantity = 0;
    let unit = "";
    item.suppliers.forEach((supplierGroup) => {
      supplierGroup.sizes.forEach((sizeGroup) => {
        // Find the matching stock entry for buy/sell price
        const stockEntry = stockEntries.find(
          (e) =>
            e.productId === item.product.id &&
            e.supplierId === supplierGroup.supplier.id &&
            e.sizeId === sizeGroup.size.id
        );
        rows.push({
          company: supplierGroup.supplier.name,
          packaging: sizeGroup.size.label,
          buyPrice: stockEntry?.buyPrice ?? "",
          sellPrice: stockEntry?.sellPrice ?? "",
          quantity: sizeGroup.quantity,
        });
        totalQuantity += sizeGroup.quantity;
        if (!unit) unit = sizeGroup.size.unit;
      });
    });
    function formatTotalQuantity(quantity: number, unit: string) {
      if (unit === "ml" && quantity >= 1000)
        return `${(quantity / 1000).toFixed(2)} L`;
      if (unit === "g" && quantity >= 1000)
        return `${(quantity / 1000).toFixed(2)} kg`;
      if (unit === "mg" && quantity >= 1000)
        return `${(quantity / 1000).toFixed(2)} g`;
      if (unit === "kg" || unit === "L" || unit === "gm")
        return `${quantity} ${unit}`;
      return `${quantity} ${unit}`;
    }
    return (
      <View key={item.id} style={styles.stockCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.totalQtyText}>
            {formatTotalQuantity(totalQuantity, unit)}
          </Text>
        </View>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeader}>Company</Text>
          <Text style={styles.tableHeader}>Packaging Size</Text>
          <Text style={styles.tableHeader}>Buy Price (₹)</Text>
          <Text style={styles.tableHeader}>Sell Price (₹)</Text>
          <Text style={styles.tableHeader}>Quantity</Text>
        </View>
        {rows.map((row, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.company}</Text>
            <Text style={styles.tableCell}>{row.packaging}</Text>
            <Text style={styles.tableCell}>{row.buyPrice}</Text>
            <Text style={styles.tableCell}>{row.sellPrice}</Text>
            <Text style={styles.tableCell}>{row.quantity}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderActivityItem = (activity: (typeof activities)[0]) => (
    <View key={activity.id} style={styles.activityLogItem}>
      <View style={styles.activityLogRow}>
        <Text style={styles.activityLogAction}>
          {activity.action.toUpperCase()}
        </Text>
        <Text style={styles.activityLogProduct}>{activity.productName}</Text>
        <Text style={styles.activityLogSupplier}>{activity.supplierName}</Text>
        <Text style={styles.activityLogPackaging}>{activity.sizeName}</Text>
        <Text style={styles.activityLogQty}>{activity.quantity}</Text>
      </View>
      <Text style={styles.activityLogDate}>
        {formatLogDate(activity.timestamp)}
      </Text>
    </View>
  );

  // Filtered stock items based on search
  const filteredStockItems = stockItems.filter((item) =>
    item.product.name.toLowerCase().includes(search.toLowerCase())
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
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color={AppColors.primary}
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Search medicine..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Confetti Animation */}
      {/* Remove: showConfetti, confettiAnim, useEffect for confetti/streak, streak badge, confetti animation */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Toggle between Stock List, Log, and Add Stock */}
        {showAdd ? (
          <View style={styles.addCardOuter}>
            <View style={styles.addCard}>
              <Text style={styles.addTitle}>Add Stock</Text>
              {/* Product */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Product</Text>
                <CreatableDropdown
                  options={products.map((p) => ({ id: p.id, label: p.name }))}
                  value={addForm.productId}
                  placeholder="Select or create product"
                  onSelect={(option) =>
                    setAddForm((prev) => ({
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
                {addErrors.productName && (
                  <Text style={styles.inputError}>{addErrors.productName}</Text>
                )}
              </View>
              {/* Supplier */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Supplier</Text>
                <CreatableDropdown
                  options={suppliers.map((s) => ({ id: s.id, label: s.name }))}
                  value={addForm.supplierId}
                  placeholder="Select or create supplier"
                  onSelect={(option) =>
                    setAddForm((prev) => ({
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
                {addErrors.supplierName && (
                  <Text style={styles.inputError}>
                    {addErrors.supplierName}
                  </Text>
                )}
              </View>
              {/* Packaging Size */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Packaging Size</Text>
                <CreatableDropdown
                  options={sizes.map((s) => ({ id: s.id, label: s.label }))}
                  value={addForm.sizeId}
                  placeholder="Select or create size"
                  onSelect={(option) =>
                    setAddForm((prev) => ({
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
                  style={styles.inputWithIcon}
                />
                {addErrors.sizeLabel && (
                  <Text style={styles.inputError}>{addErrors.sizeLabel}</Text>
                )}
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
                    value={addForm.quantity}
                    onChangeText={(text) =>
                      setAddForm((prev) => ({ ...prev, quantity: text }))
                    }
                    keyboardType="numeric"
                  />
                </View>
                {addErrors.quantity && (
                  <Text style={styles.inputError}>{addErrors.quantity}</Text>
                )}
              </View>
              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Additional notes..."
                  value={addForm.notes}
                  onChangeText={(text) =>
                    setAddForm((prev) => ({ ...prev, notes: text }))
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>
              {/* Submit Button */}
              <View style={styles.addActions}>
                <MaterialIcons.Button
                  name="check"
                  backgroundColor={AppColors.primary}
                  color="#fff"
                  size={24}
                  borderRadius={8}
                  onPress={handleAddStock}
                  disabled={submitting}
                  style={styles.addButton}
                >
                  {submitting ? (
                    <Text style={{ color: "#fff" }}>Saving...</Text>
                  ) : (
                    <Text style={{ color: "#fff" }}>Save Stock</Text>
                  )}
                </MaterialIcons.Button>
                <MaterialIcons.Button
                  name="close"
                  backgroundColor="#fff"
                  color={AppColors.primary}
                  size={24}
                  borderRadius={8}
                  onPress={() => setShowAdd(false)}
                  style={styles.cancelButton}
                >
                  <Text style={{ color: AppColors.primary }}>Cancel</Text>
                </MaterialIcons.Button>
              </View>
            </View>
          </View>
        ) : showLog ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Activity Log</Text>
            {activities.length === 0 ? (
              <Text style={styles.emptyActivityText}>No recent activity</Text>
            ) : (
              activities.map(renderActivityItem)
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Stock</Text>
            {filteredStockItems.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="archive" size={48} color="#CCC" />
                <Text style={styles.emptyStateText}>No stock items found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try a different search or tap the + button to add stock
                </Text>
              </View>
            ) : (
              filteredStockItems.map(renderStockItem)
            )}
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
      {/* Floating Log Button */}
      <View style={styles.fabLogContainer}>
        <MaterialIcons.Button
          name={showLog ? "close" : "history"}
          backgroundColor={AppColors.primary}
          color="#fff"
          size={28}
          borderRadius={28}
          iconStyle={{ marginRight: 0 }}
          onPress={() => {
            setShowLog((prev) => !prev);
            setShowAdd(false);
          }}
          style={styles.fabLog}
          accessibilityLabel={
            showLog ? "Back to Stock" : "View Stock Activity Log"
          }
        />
      </View>
      {/* Floating Add Button */}
      <View style={styles.fabAddContainer}>
        <MaterialIcons.Button
          name={showAdd ? "close" : "add"}
          backgroundColor={AppColors.primary}
          color="#fff"
          size={28}
          borderRadius={28}
          iconStyle={{ marginRight: 0 }}
          onPress={() => {
            setShowAdd((prev) => !prev);
            setShowLog(false);
          }}
          style={styles.fabAdd}
          accessibilityLabel={showAdd ? "Back to Stock" : "Add Stock"}
        />
      </View>
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
    marginBottom: 14,
    borderRadius: 18,
    padding: 18,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: "#F0F0F0",
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
  quantityRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 4,
  },
  quantityValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: AppColors.primary,
  },
  quantityUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    marginLeft: 4,
    marginBottom: 2,
  },
  // Remove: streakBadge, streakText, confetti styles
  supplierList: {
    marginTop: 2,
    marginBottom: 4,
  },
  supplierRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  supplierNameList: {
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
    marginRight: 10,
    minWidth: 80,
  },
  packagingLabel: {
    fontSize: 13,
    color: "#888",
    marginRight: 10,
    minWidth: 70,
  },
  packagingQty: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: "600",
  },
  totalAmountContainer: {
    position: "absolute",
    bottom: 12,
    right: 18,
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: AppColors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  totalAmountText: {
    fontSize: 15,
    fontWeight: "bold",
    color: AppColors.primary,
    letterSpacing: 0.2,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
    backgroundColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  activityLogItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  activityLogRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  activityLogAction: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1976D2",
    marginRight: 8,
    minWidth: 60,
  },
  activityLogProduct: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    marginRight: 8,
    minWidth: 80,
  },
  activityLogSupplier: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
    minWidth: 70,
  },
  activityLogPackaging: {
    fontSize: 12,
    color: "#888",
    marginRight: 8,
    minWidth: 60,
  },
  activityLogQty: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "right",
  },
  activityLogDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
    textAlign: "right",
  },
  fabLogContainer: {
    position: "absolute",
    left: 20,
    bottom: Platform.OS === "android" ? 80 : 70,
    zIndex: 100,
  },
  fabLog: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabAddContainer: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "android" ? 80 : 70,
    zIndex: 100,
  },
  fabAdd: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
    marginBottom: 8,
    justifyContent: "center",
  },
  addButton: {
    minWidth: 120,
    justifyContent: "center",
  },
  cancelButton: {
    minWidth: 80,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
  },
  addCardOuter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 0,
  },
  addCard: {
    width: "98%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  addTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: AppColors.primary,
    marginBottom: 18,
    textAlign: "center",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 0,
  },
  inputError: {
    color: AppColors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableHeader: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 13,
    color: AppColors.primary,
    textAlign: "left",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    textAlign: "left",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalQtyText: {
    fontSize: 15,
    fontWeight: "bold",
    color: AppColors.primary,
  },
});
