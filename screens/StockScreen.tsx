import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
    buyPrice: "",
    sellPrice: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const searchInputRef = useRef<TextInput>(null);
  const fabScale = useRef(new Animated.Value(1)).current;

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

  // Utility: format quantity with best unit (g/kg, ml/L, etc.)
  const formatQuantityWithUnit = (quantity: number, unit: string) => {
    if (unit === "g" && quantity >= 1000)
      return `${(quantity / 1000).toFixed(2)} kg`;
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

  const handleAddStock = async () => {
    const errors: Record<string, string> = {};
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

      // Create a copy of the form data to submit
      const formDataToSubmit = {
        ...addForm,
      };

      // The service will handle the type conversion from string to number
      await addStockEntry(formDataToSubmit);

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
        buyPrice: "",
        sellPrice: "",
      });
      setAddErrors({});
      Alert.alert("Success", "Stock entry added successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to add stock entry");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLogExpansion = (productId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleFabPress = () => {
    // Animate the FAB scale down
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowAdd((prev) => !prev);
  };

  const renderStockItem = ({ item }: { item: (typeof stockItems)[0] }) => {
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

    // Get product-specific activities
    const productActivities = activities
      .filter((activity) => activity.productName === item.product.name)
      .slice(0, 3); // Only show the latest 3

    const isLogExpanded = expandedLogs[item.id] || false;

    return (
      <View style={styles.stockCard}>
        {/* Card Header */}
        <View style={styles.cardHeaderRow}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.totalQtyText}>
            {formatTotalQuantity(totalQuantity, unit)}
          </Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeader}>Company</Text>
          <Text style={styles.tableHeader}>Size</Text>
          <Text style={styles.tableHeader}>Buy ₹</Text>
          <Text style={styles.tableHeader}>Sell ₹</Text>
          <Text style={styles.tableHeader}>Qty</Text>
        </View>

        {/* Table Rows */}
        {rows.map((row, idx) => (
          <View
            key={idx}
            style={[
              styles.tableRow,
              idx % 2 === 1 ? styles.tableRowAlternate : null,
            ]}
          >
            <Text style={styles.tableCell}>{row.company}</Text>
            <Text style={styles.tableCell}>{row.packaging}</Text>
            <Text style={styles.tableCell}>{row.buyPrice}</Text>
            <Text style={styles.tableCell}>{row.sellPrice}</Text>
            <Text style={styles.tableCell}>{row.quantity}</Text>
          </View>
        ))}

        {/* Activity Log Panel */}
        <TouchableOpacity
          style={styles.logPanelHeader}
          onPress={() => toggleLogExpansion(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.logPanelTitle}>Latest Updates</Text>
          <MaterialIcons
            name={isLogExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color={AppColors.text}
          />
        </TouchableOpacity>

        {isLogExpanded && (
          <View style={styles.logPanelContent}>
            {productActivities.length > 0 ? (
              productActivities.map((activity, idx) => (
                <View key={idx} style={styles.logEntry}>
                  <View style={styles.logAvatar}>
                    <MaterialIcons
                      name={
                        activity.action === "added"
                          ? "add-circle"
                          : "remove-circle"
                      }
                      size={16}
                      color={AppColors.primary}
                    />
                  </View>
                  <View style={styles.logInfo}>
                    <Text style={styles.logAction}>{activity.action}</Text>
                    <Text style={styles.logQuantity}>{activity.quantity}</Text>
                  </View>
                  <Text style={styles.logTimestamp}>
                    {formatDate(activity.timestamp)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noLogsText}>No recent activity</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderAddForm = () => (
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
            <Text style={styles.inputError}>{addErrors.supplierName}</Text>
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
              value={addForm.buyPrice}
              onChangeText={(text) =>
                setAddForm((prev) => ({ ...prev, buyPrice: text }))
              }
              keyboardType="numeric"
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
              value={addForm.sellPrice}
              onChangeText={(text) =>
                setAddForm((prev) => ({ ...prev, sellPrice: text }))
              }
              keyboardType="numeric"
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
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  // Filtered stock items based on search
  const filteredStockItems = stockItems.filter((item) =>
    item.product.name.toLowerCase().includes(search.toLowerCase())
  );

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
            color={AppColors.text}
            style={{ marginRight: 6 }}
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchBar}
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => {
              // Voice search would be implemented here
              Alert.alert("Voice Search", "Voice search feature coming soon!");
            }}
          >
            <MaterialIcons
              name="mic"
              size={20}
              color={AppColors.primary}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Content */}
      {showAdd ? (
        renderAddForm()
      ) : (
        <FlatList
          data={filteredStockItems}
          renderItem={renderStockItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MaterialIcons name="archive" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>No stock items found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try a different search or tap the + button to add stock
              </Text>
            </View>
          )}
        />
      )}

      {/* Floating Add Button */}
      <Animated.View
        style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={showAdd ? "close" : "add"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </Animated.View>
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
    paddingBottom: 16,
    backgroundColor: "#F5F5F5",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#263238",
    marginBottom: 12,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#263238",
    padding: 0,
  },
  listContainer: {
    paddingTop: 24,
    paddingBottom: 100,
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
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#263238",
  },
  totalQtyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0288D1",
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tableHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#F9A825",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tableRowAlternate: {
    backgroundColor: "rgba(255, 112, 67, 0.05)",
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: "#263238",
  },
  logPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 4,
  },
  logPanelTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#263238",
  },
  logPanelContent: {
    paddingTop: 8,
  },
  logEntry: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  logAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  logAction: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0288D1",
    marginRight: 6,
    textTransform: "capitalize",
  },
  logQuantity: {
    fontSize: 13,
    color: "#263238",
  },
  logTimestamp: {
    fontSize: 12,
    color: "#757575",
  },
  noLogsText: {
    fontSize: 13,
    color: "#757575",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "android" ? 20 : 30,
    zIndex: 100,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF7043",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  addCardOuter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
  },
  addCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    shadowColor: "#000000",
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
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#263238",
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#263238",
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
    color: AppColors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
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
});
