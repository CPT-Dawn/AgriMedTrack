import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { colors, fonts } from "../theme";
import { useInventory } from "../hooks/useInventory";
import { useToast } from "../hooks/useToast";
import ProductCard, { InventoryItem } from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Chip from "../components/Chip";
import FloatingActionButton from "../components/FloatingActionButton";
import InventoryStats from "../components/InventoryStats";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import { seedInventoryData, seedMasterData } from "../utils/seedData";

export default function InventoryScreen() {
  const { inventoryItems, loading, error, filterItems } = useInventory();
  const { showError, showInfo, showSuccess } = useToast();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Filter items based on search text
  const filteredItems = useMemo(() => {
    return filterItems(inventoryItems, searchText);
  }, [inventoryItems, searchText, filterItems]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // The useInventory hook handles real-time updates
    // So we just need to simulate a refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Handle product card press
  const handleProductPress = (item: InventoryItem) => {
    Alert.alert(
      item.productName,
      `Supplier: ${item.supplierName}\nBatch: ${item.batchNumber}\nQuantity: ${item.quantity}\nBuy Price: ₹${item.buyPrice}\nSell Price: ₹${item.sellPrice}`,
      [{ text: "OK" }]
    );
  };

  // Handle navigation actions
  const handleAddStock = () => {
    showInfo(
      "Add Stock",
      "Navigation to Add Inventory screen will be implemented"
    );
  };

  const handleViewLogs = () => {
    showInfo(
      "View Logs",
      "Navigation to Inventory Log screen will be implemented"
    );
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchText("");
  };

  // Handle seed data (temporary for testing)
  const handleSeedData = async () => {
    if (seeding) return;

    setSeeding(true);
    try {
      const masterResult = await seedMasterData();
      if (masterResult.success) {
        const inventoryResult = await seedInventoryData();
        if (inventoryResult.success) {
          showSuccess(
            "Sample Data Added",
            "Inventory has been populated with sample products!"
          );
        } else {
          showError("Error", inventoryResult.message);
        }
      } else {
        showError("Error", masterResult.message);
      }
    } catch (error) {
      showError("Error", "Failed to add sample data");
    } finally {
      setSeeding(false);
    }
  };

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 18,
              color: colors.error,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Error Loading Inventory
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  if (loading) {
    return <LoadingScreen message="Loading inventory..." />;
  }

  // Render header with navigation chips
  const renderHeader = () => (
    <View style={{ backgroundColor: colors.surface, paddingBottom: 8 }}>
      {/* Header title and navigation chips */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.headline,
            fontSize: 24,
            color: colors.primary,
          }}
        >
          Inventory
        </Text>

        <View style={{ flexDirection: "row" }}>
          <Chip label="Add Stock" onPress={handleAddStock} variant="primary" />
          <Chip
            label="View Logs"
            onPress={handleViewLogs}
            variant="secondary"
          />
        </View>
      </View>

      {/* Temporary seed data button - remove in production */}
      {inventoryItems.length === 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: "center",
            }}
            onPress={handleSeedData}
            disabled={seeding}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.surface,
                fontWeight: "600",
              }}
            >
              {seeding
                ? "Adding Sample Data..."
                : "Add Sample Data for Testing"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search bar */}
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        onClear={handleSearchClear}
        placeholder="Search products, suppliers, or batch numbers..."
      />

      {/* Statistics only show when there are items and no search */}
      {inventoryItems.length > 0 && !searchText && (
        <InventoryStats items={inventoryItems} />
      )}
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (searchText && filteredItems.length === 0) {
      return (
        <EmptyState
          icon="search"
          title="No products found"
          message={`No inventory items match "${searchText}". Try adjusting your search terms.`}
        />
      );
    }

    if (inventoryItems.length === 0) {
      return (
        <EmptyState
          icon="inventory"
          title="No inventory items"
          message="Start by adding your first product to the inventory. Use the Add Stock button above or add sample data for testing."
        />
      );
    }

    return null;
  };

  // Render item
  const renderItem = ({
    item,
    index,
  }: {
    item: InventoryItem;
    index: number;
  }) => <ProductCard item={item} onPress={() => handleProductPress(item)} />;

  // List footer component
  const renderFooter = () => <View style={{ height: 100 }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.inventoryItemId}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 200, // Estimated item height
          offset: 200 * index,
          index,
        })}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={handleAddStock} label="Add Stock" />
    </SafeAreaView>
  );
}
