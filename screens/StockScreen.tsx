import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { AddStockForm } from "../components/AddStockForm";
import { BatchActivityLog } from "../components/BatchActivityLog";
import { StockCard } from "../components/StockCard";
import { Theme } from "../constants/Theme";
import { useStock } from "../hooks/useStock";
import {
  BatchEntryFormData,
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
    getOrCreateProduct,
    getOrCreateSupplier,
    getOrCreateSize,
    clearError,
    stockEntries,
    batchLogs,
  } = useStock();

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
  const [showBuyValues, setShowBuyValues] = useState(true);

  // Current view state
  const [currentView, setCurrentView] = useState<"stock" | "logs" | "add">(
    "stock"
  );

  // Use the new batch logs directly instead of deriving them from activities
  const paginatedBatchLogs = useMemo(() => {
    return batchLogs.slice(0, logPage * LOGS_PER_PAGE);
  }, [batchLogs, logPage]);

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
      await addStockEntry(formData);
      setCurrentView("stock"); // Return to stock view after adding
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
          showBuyValues={showBuyValues}
          qtyRightAlign // new prop for right-aligning QTY
        />
      );
    },
    [activities, expandedLogs, stockEntries, toggleLogExpansion, showBuyValues]
  );

  // Render all activity logs
  const renderAllLogs = () => {
    return (
      <View style={styles.allLogsContainer}>
        <BatchActivityLog
          batches={paginatedBatchLogs}
          isExpanded={true}
          onToggle={() => setIsLogsExpanded(!isLogsExpanded)}
          onItemPress={handleHighlightProduct}
          loading={loadingMoreLogs}
          onLoadMore={handleLoadMoreLogs}
          hideCount={true}
          hideHeader={true}
        />
      </View>
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
            {currentView === "stock" && (
              <TouchableOpacity
                onPress={() => setShowBuyValues(!showBuyValues)}
                style={styles.eyeToggle}
                accessibilityLabel={
                  showBuyValues ? "Hide buy values" : "Show buy values"
                }
              >
                <MaterialIcons
                  name={showBuyValues ? "visibility" : "visibility-off"}
                  size={24}
                  color={Theme.colors.primary}
                />
              </TouchableOpacity>
            )}
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
      <Animated.View
        style={[
          styles.leftBubbleContainer,
          { transform: [{ scale: leftBubbleScale }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bubble,
            {
              backgroundColor:
                currentView === "logs"
                  ? Theme.colors.secondary
                  : Theme.colors.primary,
            },
          ]}
          onPress={handleLogBubblePress}
          activeOpacity={0.8}
          accessibilityLabel={
            currentView === "logs"
              ? "Close activity logs"
              : "View activity logs"
          }
        >
          <MaterialIcons
            name={currentView === "logs" ? "close" : "history"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Right Bubble - Add Stock */}
      <Animated.View
        style={[
          styles.rightBubbleContainer,
          { transform: [{ scale: rightBubbleScale }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bubble,
            {
              backgroundColor:
                currentView === "add"
                  ? Theme.colors.secondary
                  : Theme.colors.accent,
            },
          ]}
          onPress={handleAddBubblePress}
          activeOpacity={0.8}
          accessibilityLabel={
            currentView === "add" ? "Close add stock form" : "Add new stock"
          }
        >
          <MaterialIcons
            name={currentView === "add" ? "close" : "add"}
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
    marginLeft: Theme.spacing.md,
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
  leftBubbleContainer: {
    position: "absolute",
    left: Theme.spacing.xl,
    bottom: Platform.OS === "android" ? 80 : 100,
    zIndex: 100,
  },
  rightBubbleContainer: {
    position: "absolute",
    right: Theme.spacing.xl,
    bottom: Platform.OS === "android" ? 80 : 100,
    zIndex: 100,
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Theme.shadows.lg,
  },
  allLogsContainer: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
  },
});
