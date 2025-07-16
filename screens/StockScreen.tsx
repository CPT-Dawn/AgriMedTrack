import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
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
import { AppColors } from "../constants/Colors";
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
  const router = useRouter();
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
      const isHighlighted = highlightedProductId === item.product.id;

      return (
        <StockCard
          item={item}
          stockEntries={stockEntries}
          productActivities={productActivities}
          isLogExpanded={isLogExpanded}
          onToggleLog={toggleLogExpansion}
          onHighlightProduct={handleHighlightProduct}
        />
      );
    },
    [
      activities,
      expandedLogs,
      stockEntries,
      toggleLogExpansion,
      highlightedProductId,
    ]
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
        <ActivityIndicator size="large" color={AppColors.primary} />
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
                <MaterialIcons name="archive" size={48} color="#CCC" />
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={AppColors.background}
      />

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
                color={AppColors.text}
              />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        </View>

        {/* Search Bar - Only show in stock view */}
        {currentView === "stock" && (
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
                Alert.alert(
                  "Voice Search",
                  "Voice search feature coming soon!"
                );
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
                  ? AppColors.secondary
                  : AppColors.primary,
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
                currentView === "add" ? AppColors.secondary : AppColors.accent,
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
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#263238",
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
  leftBubbleContainer: {
    position: "absolute",
    left: 20,
    bottom: Platform.OS === "android" ? 80 : 100,
    zIndex: 100,
  },
  rightBubbleContainer: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "android" ? 80 : 100,
    zIndex: 100,
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    padding: 16,
  },
});
