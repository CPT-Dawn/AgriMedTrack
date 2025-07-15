import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
import { AddStockModal } from "../components/AddStockModal";
import { StockCard } from "../components/StockCard";
import { AppColors } from "../constants/Colors";
import { useStock } from "../hooks/useStock";
import { StockEntryFormData, StockItem } from "../types/stock";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const searchInputRef = useRef<TextInput>(null);
  const fabScale = useRef(new Animated.Value(1)).current;

  // Handle FAB press with animation
  const handleFabPress = () => {
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

    setShowAddModal(true);
  };

  // Toggle log expansion for a specific product
  const toggleLogExpansion = useCallback((productId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  }, []);

  // Handle stock entry submission
  const handleAddStock = async (formData: StockEntryFormData) => {
    try {
      clearError();
      await addStockEntry(formData);
      Alert.alert("Success", "Stock entry added successfully");
    } catch (err) {
      Alert.alert("Error", "Failed to add stock entry");
      throw err;
    }
  };

  // Render individual stock item
  const renderStockItem = useCallback(
    ({ item }: { item: StockItem }) => {
      // Get product-specific activities
      const productActivities = activities
        .filter((activity) => activity.productName === item.product.name)
        .slice(0, 3); // Only show the latest 3

      const isLogExpanded = expandedLogs[item.id] || false;

      return (
        <StockCard
          item={item}
          stockEntries={stockEntries}
          productActivities={productActivities}
          isLogExpanded={isLogExpanded}
          onToggleLog={toggleLogExpansion}
        />
      );
    },
    [activities, expandedLogs, stockEntries, toggleLogExpansion]
  );

  // Render all activity logs
  const renderAllLogs = () => {
    return (
      <View style={styles.allLogsContainer}>
        <View style={styles.allLogsHeader}>
          <Text style={styles.allLogsTitle}>Activity Logs</Text>
          <TouchableOpacity
            onPress={() => setShowAllLogs(false)}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color={AppColors.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <View style={styles.logAvatar}>
                <MaterialIcons
                  name={
                    item.action === "added"
                      ? "add-circle"
                      : item.action === "updated"
                      ? "edit"
                      : "remove-circle"
                  }
                  size={18}
                  color={AppColors.primary}
                />
              </View>
              <View style={styles.logContent}>
                <Text style={styles.logText}>
                  <Text style={styles.logAction}>{item.action}</Text>{" "}
                  {item.quantity} {item.sizeName} of{" "}
                  <Text style={styles.logProduct}>{item.productName}</Text> from{" "}
                  <Text style={styles.logSupplier}>{item.supplierName}</Text>
                </Text>
                <Text style={styles.logTime}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.logsList}
        />
      </View>
    );
  };

  // Loading state
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
            accessibilityLabel="Search products"
          />
          <TouchableOpacity
            onPress={() => {
              // Voice search would be implemented here
              Alert.alert("Voice Search", "Voice search feature coming soon!");
            }}
            accessibilityLabel="Voice search"
          >
            <MaterialIcons
              name="mic"
              size={20}
              color={AppColors.primary}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAddModal(true)}
            accessibilityLabel="Add new stock"
          >
            <MaterialIcons
              name="add-circle"
              size={18}
              color={AppColors.primary}
            />
            <Text style={styles.actionButtonText}>Add Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAllLogs(true)}
            accessibilityLabel="View all activity logs"
          >
            <MaterialIcons name="history" size={18} color={AppColors.primary} />
            <Text style={styles.actionButtonText}>View Logs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Content: Stock List or All Logs */}
      {showAllLogs ? (
        renderAllLogs()
      ) : (
        <FlatList
          data={filteredStockItems}
          renderItem={renderStockItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS === "android"}
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

      {/* Floating Add Button - Always visible */}
      <Animated.View
        style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFabPress}
          activeOpacity={0.8}
          accessibilityLabel="Add stock"
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Stock Modal */}
      <AddStockModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStock}
        products={products}
        suppliers={suppliers}
        sizes={sizes}
        getOrCreateProduct={getOrCreateProduct}
        getOrCreateSupplier={getOrCreateSupplier}
        getOrCreateSize={getOrCreateSize}
      />
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
    minHeight: 44,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#263238",
    padding: 0,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.primary,
    marginLeft: 6,
  },
  listContainer: {
    paddingTop: 12,
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
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "android" ? 20 : 30,
    zIndex: 100,
  },
  fab: {
    width: 56, // Increased size for better visibility
    height: 56, // Increased size for better visibility
    borderRadius: 28,
    backgroundColor: "#FF7043",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  allLogsContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  allLogsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  allLogsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  closeButton: {
    padding: 8,
  },
  logsList: {
    padding: 16,
  },
  logItem: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primary,
  },
  logAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logText: {
    fontSize: 14,
    color: AppColors.text,
    lineHeight: 20,
  },
  logAction: {
    fontWeight: "600",
    color: AppColors.primary,
    textTransform: "capitalize",
  },
  logProduct: {
    fontWeight: "500",
    color: AppColors.text,
  },
  logSupplier: {
    fontStyle: "italic",
    color: "#666",
  },
  logTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
