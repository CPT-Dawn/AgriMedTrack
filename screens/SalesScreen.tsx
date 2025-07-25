import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts } from "../theme";
import { useSales } from "../hooks/useSales";
import { useToast } from "../hooks/useToast";
import { useUI } from "../hooks/useUI";
import { Sale } from "../types/sales";
import SearchBar from "../components/SearchBar";
import Chip from "../components/Chip";
import SaleCard from "../components/SaleCard";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";

export default function SalesScreen() {
  const navigation = useNavigation();
  const { sales, loading, error, filterSales } = useSales();
  const { showError, showSuccess } = useToast();
  const { showConfirmDialog } = useUI();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Filter sales based on search text
  const filteredSales = useMemo(() => {
    return filterSales(sales, searchText);
  }, [sales, searchText, filterSales]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalSales: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      totalProfit: sales.reduce((sum, sale) => sum + sale.totalProfit, 0),
      pendingAmount: sales.reduce((sum, sale) => sum + sale.amountPending, 0),
      paidSales: sales.filter((sale) => sale.paymentStatus === "Paid").length,
      unpaidSales: sales.filter((sale) => sale.paymentStatus === "Unpaid")
        .length,
      partialSales: sales.filter((sale) => sale.paymentStatus === "Partial")
        .length,
    };
  }, [sales]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchText("");
  };

  // Handle navigation actions
  const handleAddSale = () => {
    // @ts-ignore - Navigate to AddSale screen
    navigation.navigate("AddSale");
  };

  const handleViewReports = () => {
    showError("Reports feature coming soon!");
  };

  // Handle sale actions
  const handleSalePress = (sale: Sale) => {
    Alert.alert(
      `Bill #${sale.billNumber}`,
      `Customer: ${sale.customerName}\nAmount: ₹${sale.totalAmount.toLocaleString("en-IN")}\nStatus: ${sale.paymentStatus}\nDate: ${sale.saleDate.toLocaleDateString("en-IN")}`,
      [{ text: "OK" }]
    );
  };

  const handleEditSale = (sale: Sale) => {
    showError("Edit sale feature coming soon!");
  };

  const handleDeleteSale = (sale: Sale) => {
    showConfirmDialog({
      title: "Delete Sale",
      message: `Are you sure you want to delete bill #${sale.billNumber}? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: () => {
        // TODO: Implement delete functionality
        showError(
          "Delete functionality will be implemented with Cloud Functions"
        );
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Show error state
  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
          translucent={false}
        />
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
            Error Loading Sales
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
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
          translucent={false}
        />
        <LoadingScreen message="Loading sales data..." />
      </SafeAreaView>
    );
  }

  // Render header
  const renderHeader = () => (
    <View style={{ backgroundColor: colors.background }}>
      {/* Header with navigation chips */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 24,
              color: colors.primary,
            }}
          >
            Sales
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Chip label="Add Sale" onPress={handleAddSale} variant="primary" />
            <Chip
              label="Reports"
              onPress={handleViewReports}
              variant="secondary"
            />
          </View>
        </View>

        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textSecondary,
          }}
        >
          Track and manage your sales transactions
        </Text>
      </View>

      {/* Statistics Summary */}
      {sales.length > 0 && !searchText && (
        <View
          style={{
            backgroundColor: colors.surface,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 12,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 16,
              color: colors.textPrimary,
              marginBottom: 12,
            }}
          >
            Sales Summary
          </Text>

          {/* Top Row - Financial Stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 16,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E5E5",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 18,
                  color: colors.primary,
                  fontWeight: "600",
                }}
              >
                {formatCurrency(stats.totalSales)}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Total Sales
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 18,
                  color: colors.success,
                  fontWeight: "600",
                }}
              >
                {formatCurrency(stats.totalProfit)}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Total Profit
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 18,
                  color: colors.error,
                  fontWeight: "600",
                }}
              >
                {formatCurrency(stats.pendingAmount)}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Pending Amount
              </Text>
            </View>
          </View>

          {/* Bottom Row - Payment Status Count */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 16,
                  color: colors.success,
                  fontWeight: "600",
                }}
              >
                {stats.paidSales}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Paid
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 16,
                  color: colors.warning,
                  fontWeight: "600",
                }}
              >
                {stats.partialSales}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Partial
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 16,
                  color: colors.error,
                  fontWeight: "600",
                }}
              >
                {stats.unpaidSales}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Unpaid
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          onClear={handleSearchClear}
          placeholder="Search by customer, bill number, or status..."
        />
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (searchText && filteredSales.length === 0) {
      return (
        <EmptyState
          icon="search"
          title="No sales found"
          message={`No sales match "${searchText}". Try adjusting your search terms.`}
        />
      );
    }

    if (sales.length === 0) {
      return (
        <EmptyState
          icon="inventory"
          title="No sales recorded"
          message="Start by creating your first sale. Use the Add Sale button above to get started."
        />
      );
    }

    return null;
  };

  // Render item
  const renderItem = ({ item }: { item: Sale }) => (
    <SaleCard
      sale={item}
      onPress={() => handleSalePress(item)}
      onEdit={() => handleEditSale(item)}
      onDelete={() => handleDeleteSale(item)}
    />
  );

  // List footer component
  const renderFooter = () => <View style={{ height: 100 }} />;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item.saleId}
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
      />
    </SafeAreaView>
  );
}
