import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AddStockForm } from "../components/AddStockForm";
import { BatchActivityLog } from "../components/BatchActivityLog";
import { StockCard } from "../components/StockCard";
import { Theme } from "../constants/Theme";
import { useStock } from "../hooks/useStock";
import { useUser } from "../hooks/useUser";
import {
  BatchEntryFormData,
  StockBatch,
  StockEntryFormData,
  StockItem,
} from "../types/stock";

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
    deleteStockBatch,
    getOrCreateProduct,
    getOrCreateSupplier,
    getOrCreateSize,
    clearError,
    stockEntries,
    batchLogs,
  } = useStock();
  const { currentUser } = useUser();

  const [search, setSearch] = useState("");
  // const router = useRouter();
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const searchInputRef = useRef<TextInput>(null);
  const leftBubbleScale = useRef(new Animated.Value(1)).current;
  const rightBubbleScale = useRef(new Animated.Value(1)).current;
  const [highlightedProductId, setHighlightedProductId] = useState<
    string | null
  >(null);
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);
  const [loadingMoreLogs, setLoadingMoreLogs] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const LOGS_PER_PAGE = 5;
  // Buy values display removed

  // Current view state
  const [currentView, setCurrentView] = useState<"stock" | "logs" | "add">(
    "stock"
  );
  const [editBatch, setEditBatch] = useState<StockBatch | null>(null);

  // Use the new batch logs directly instead of deriving them from activities
  const paginatedBatchLogs = useMemo(() => {
    return batchLogs.slice(0, logPage * LOGS_PER_PAGE);
  }, [batchLogs, logPage]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (currentView === "logs" || currentView === "add") {
        handleBackToStock();
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [currentView]);

  // Handle left bubble press (Activity Log)
  const handleLogBubblePress = () => {
    Animated.sequence([
      Animated.timing(leftBubbleScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(leftBubbleScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Toggle between logs view and stock view
    setCurrentView(currentView === "logs" ? "stock" : "logs");
  };

  // Handle right bubble press (Add Stock)
  const handleAddBubblePress = () => {
    Animated.sequence([
      Animated.timing(rightBubbleScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rightBubbleScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Toggle between add view and stock view
    setCurrentView(currentView === "add" ? "stock" : "add");
  };

  // Handle back to stock view
  const handleBackToStock = () => {
    setCurrentView("stock");
    // Reset any highlighted product
    setHighlightedProductId(null);
  };

  // Toggle log expansion for a specific product
  const toggleLogExpansion = useCallback((productId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  }, []);

  // Handle stock entry submission
  const handleAddStock = async (
    formData: StockEntryFormData | BatchEntryFormData
  ) => {
    try {
      clearError();
      await addStockEntry(formData, currentUser?.id || "unknown-user");
      setCurrentView("stock"); // Return to stock view after adding
      setEditBatch(null); // Clear edit state
      return Promise.resolve();
    } catch (err) {
      Alert.alert("Error", "Failed to add stock entry");
      return Promise.reject(err);
    }
  };

  // Handle highlighting a product when clicked in the log
  const handleHighlightProduct = (productId: string) => {
    setHighlightedProductId(productId);
    setCurrentView("stock"); // Switch to stock view to show the highlighted product
  };

  // Handle edit batch
  const handleEditBatch = (batch: StockBatch) => {
    setEditBatch(batch);
    setCurrentView("add");
  };

  // Handle delete batch
  const handleDeleteBatch = (batchId: string) => {
    Alert.alert("Delete Batch", "Are you sure you want to delete this batch?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteStockBatch(batchId);
          } catch (err) {
            Alert.alert("Error", "Failed to delete batch");
          }
        },
      },
    ]);
  };

  // Load more logs
  const handleLoadMoreLogs = () => {
    if (paginatedBatchLogs.length < batchLogs.length) {
      setLoadingMoreLogs(true);
      // Simulate loading delay
      setTimeout(() => {
        setLogPage((prev) => prev + 1);
        setLoadingMoreLogs(false);
      }, 500);
    }
  };

  // Render individual stock item
  const renderStockItem = useCallback(
    ({ item }: { item: StockItem }) => {
      // Get product-specific activities
      const productActivities = activities.filter(
        (activity) => activity.productName === item.product.name
      );

      const isLogExpanded = expandedLogs[item.id] || false;

      // Pass a prop to StockCard to indicate right-aligned QTY
      return (
        <StockCard
          item={item}
          stockEntries={stockEntries}
          productActivities={productActivities}
          isLogExpanded={isLogExpanded}
          onToggleLog={toggleLogExpansion}
          onHighlightProduct={handleHighlightProduct}
          qtyRightAlign // new prop for right-aligning QTY
        />
      );
    },
    [activities, expandedLogs, stockEntries, toggleLogExpansion]
  );

  // Render all activity logs
  const renderAllLogs = () => {
    return (
      <BatchActivityLog
        batches={paginatedBatchLogs}
        isExpanded={true}
        onToggle={() => setIsLogsExpanded(!isLogsExpanded)}
        onItemPress={handleHighlightProduct}
        onEditBatch={handleEditBatch}
        onDeleteBatch={handleDeleteBatch}
        loading={loadingMoreLogs}
        onLoadMore={handleLoadMoreLogs}
        hideCount={true}
        hideHeader={true}
      />
    );
  };

  // Render add stock form
  const renderAddStockForm = () => {
    return (
      <AddStockForm
        onSubmit={handleAddStock}
        products={products}
        suppliers={suppliers}
        sizes={sizes}
        getOrCreateProduct={getOrCreateProduct}
        getOrCreateSupplier={getOrCreateSupplier}
        getOrCreateSize={getOrCreateSize}
        initialData={
          editBatch
            ? {
                addedBy: editBatch.addedBy,
                items: editBatch.items.map((item) => ({
                  productId: item.stockEntryId,
                  productName: item.productName,
                  supplierId: "",
                  supplierName: item.supplierName,
                  sizeId: "",
                  sizeLabel: item.sizeName,
                  sizeValue: "",
                  unit: "",
                  quantity: item.quantity.toString(),
                  sellPrice: "",
                })),
              }
            : undefined
        }
      />
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  // Filtered stock items based on search
  const filteredStockItems = stockItems.filter((item) =>
    item.product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get the header title based on current view
  const getHeaderTitle = () => {
    switch (currentView) {
      case "logs":
        return "Stock Log";
      case "add":
        return "Add Stock";
      default:
        return "Stock Inventory";
    }
  };

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case "logs":
        return renderAllLogs();
      case "add":
        return renderAddStockForm();
      default:
        return (
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
                <MaterialIcons
                  name="archive"
                  size={48}
                  color={Theme.colors.textMuted}
                />
                <Text style={styles.emptyStateText}>No stock items found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try a different search or tap the + button to add stock
                </Text>
              </View>
            )}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          {currentView !== "stock" && (
            <TouchableOpacity
              onPress={handleBackToStock}
              style={styles.backButton}
              accessibilityLabel="Back to stock inventory"
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={Theme.colors.text}
              />
            </TouchableOpacity>
          )}
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
            <View style={styles.headerBoxButtonsContainer}>
              {/* Buy price toggle removed */}
              <TouchableOpacity
                style={[
                  styles.headerBoxButton,
                  styles.logButton,
                  currentView === "logs" && styles.headerBoxButtonActive,
                ]}
                onPress={handleLogBubblePress}
                accessibilityLabel={
                  currentView === "logs"
                    ? "Close activity logs"
                    : "View activity logs"
                }
              >
                <MaterialIcons
                  name={currentView === "logs" ? "close" : "history"}
                  size={Theme.typography.fontSize.xl}
                  color={"#fff"}
                  style={{ fontWeight: "bold" }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.headerBoxButton,
                  styles.addButton,
                  currentView === "add" && styles.headerBoxButtonActive,
                ]}
                onPress={handleAddBubblePress}
                accessibilityLabel={
                  currentView === "add"
                    ? "Close add stock form"
                    : "Add new stock"
                }
              >
                <MaterialIcons
                  name={currentView === "add" ? "close" : "add"}
                  size={Theme.typography.fontSize.xl + 4}
                  color={"#fff"}
                  style={{ fontWeight: "bold" }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Bar - Only show in stock view */}
        {currentView === "stock" && (
          <View style={styles.searchBarContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={Theme.colors.text}
              style={{ marginRight: 6 }}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchBar}
              placeholder="Search products..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={Theme.colors.textMuted}
              autoCapitalize="none"
              accessibilityLabel="Search products"
            />
            {/* Mic icon removed */}
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Content based on current view */}
      {renderContent()}

      {/* Floating Bubbles */}
      {/* Left Bubble - Activity Log */}
      {/* Removed floating bubbles */}
      {/* Right Bubble - Add Stock */}
      {/* Removed floating bubbles */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background,
  },
  loadingText: {
    marginTop: Theme.spacing.lg,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0 + 20,
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
    zIndex: 10,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  backButton: {
    padding: 4,
    marginRight: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyeToggle: {
    padding: Theme.spacing.sm,
    marginLeft: 0,
    marginRight: 0,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    minHeight: 44,
    ...Theme.shadows.sm,
  },
  searchBar: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    padding: 0,
  },
  listContainer: {
    paddingTop: Theme.spacing.md,
    paddingBottom: 100,
  },
  errorContainer: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.md,
    backgroundColor: "#FFF3F3",
    borderRadius: Theme.borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.error,
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: Theme.typography.fontSize.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Theme.spacing["4xl"],
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.textMuted,
    marginTop: Theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  // New styles for header box buttons
  headerBoxButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBoxButton: {
    borderRadius: Theme.borderRadius.md,
    width: 36,
    height: 36,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    // 3D effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBoxButtonActive: {
    borderColor: Theme.colors.error,
    backgroundColor: Theme.colors.error,
  },
  addButton: {
    backgroundColor: "#43A047",
    borderColor: "#388E3C",
  },
  logButton: {
    backgroundColor: Theme.colors.secondary,
    borderColor: Theme.colors.secondary,
  },
  leftBubbleContainer: {
    // Removed
  },
  rightBubbleContainer: {
    // Removed
  },
  bubble: {
    // Removed
  },
  allLogsContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: 0,
  },
});
