import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts } from "../theme";
import { useInventoryLogs, InventoryLog } from "../hooks/useInventoryLogs";
import { useToast } from "../hooks/useToast";
import SearchBar from "../components/SearchBar";
import LogCard from "../components/LogCard";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";

export default function ViewLogsScreen() {
  const navigation = useNavigation();
  const { inventoryLogs, loading, error, filterLogs } = useInventoryLogs();
  const { showError } = useToast();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Filter logs based on search text
  const filteredLogs = useMemo(() => {
    return filterLogs(inventoryLogs, searchText);
  }, [inventoryLogs, searchText, filterLogs]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // The useInventoryLogs hook handles real-time updates
    // So we just need to simulate a refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchText("");
  };

  // Handle log press
  const handleLogPress = (log: InventoryLog) => {
    // Log press is handled by the LogCard component's expand/collapse
    console.log("Log pressed:", log.logId);
  };

  // Handle back navigation
  const handleGoBack = () => {
    navigation.goBack();
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
            Error Loading Logs
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
        <LoadingScreen message="Loading inventory logs..." />
      </SafeAreaView>
    );
  }

  // Render header
  const renderHeader = () => (
    <View style={{ backgroundColor: colors.background }}>
      {/* Header with back button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
        }}
      >
        <TouchableOpacity
          onPress={handleGoBack}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 8,
            marginRight: 12,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 18,
              color: colors.primary,
            }}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 24,
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            Inventory Logs
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            Stock addition history and audit trail
          </Text>
        </View>
      </View>

      {/* Summary Stats */}
      {inventoryLogs.length > 0 && !searchText && (
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
            Summary
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 20,
                  color: colors.primary,
                  fontWeight: "600",
                }}
              >
                {inventoryLogs.length}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Total Entries
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 20,
                  color: colors.success,
                  fontWeight: "600",
                }}
              >
                {inventoryLogs.reduce((sum, log) => sum + log.totalItems, 0)}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Total Units Added
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 20,
                  color: colors.accent,
                  fontWeight: "600",
                }}
              >
                ₹
                {inventoryLogs
                  .reduce((sum, log) => sum + log.totalValue, 0)
                  .toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Total Investment
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
          placeholder="Search logs by user, product, supplier, or batch..."
        />
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (searchText && filteredLogs.length === 0) {
      return (
        <EmptyState
          icon="search"
          title="No logs found"
          message={`No inventory logs match "${searchText}". Try adjusting your search terms.`}
        />
      );
    }

    if (inventoryLogs.length === 0) {
      return (
        <EmptyState
          icon="inventory"
          title="No inventory logs"
          message="No stock addition entries found. Logs will appear here when stock is added to the inventory."
        />
      );
    }

    return null;
  };

  // Render item
  const renderItem = ({ item }: { item: InventoryLog }) => (
    <LogCard log={item} onPress={() => handleLogPress(item)} />
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
        data={filteredLogs}
        keyExtractor={(item) => item.logId}
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
