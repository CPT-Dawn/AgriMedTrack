import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppColors } from "../constants/Colors";
import { useStock } from "../hooks/useStock";

export default function LogScreen() {
  const { activities } = useStock();
  const router = useRouter();

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      router.back();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  const formatLogDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderActivityItem = (activity: (typeof activities)[0]) => (
    <View key={activity.id} style={styles.activityLogItem}>
      <View style={styles.activityHeader}>
        {/* User avatar */}
        <View style={styles.userAvatar}>
          {activity.updatedByAvatar ? (
            <Image
              source={{ uri: activity.updatedByAvatar }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.userInitial}>
              {(activity.updatedByName || "User").charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* User name and action */}
        <View style={styles.userActionContainer}>
          <Text style={styles.userName}>
            {activity.updatedByName || "User"}
          </Text>
          <Text style={styles.actionText}>
            {activity.action.toLowerCase()} stock
          </Text>
        </View>

        {/* Date */}
        <Text style={styles.activityLogDate}>
          {formatLogDate(activity.timestamp)}
        </Text>
      </View>

      {/* Table header */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeader, styles.companyHeader]}>Supplier</Text>
        <Text style={[styles.tableHeader, styles.equalHeader]}>Pack</Text>
        <Text style={[styles.tableHeader, styles.equalHeader]}>Sell</Text>
        <Text style={[styles.tableHeader, styles.equalHeader]}>Qty</Text>
      </View>

      {/* Table row */}
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.companyCell]}>
          {activity.supplierName}
        </Text>
        <Text style={[styles.tableCell, styles.equalCell]}>
          {activity.sizeName}
        </Text>
        <Text style={[styles.tableCell, styles.equalCell]}>-</Text>
        <Text style={[styles.tableCell, styles.equalCell]}>
          {activity.quantity}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Stock Activity Log</Text>
      <ScrollView style={styles.logScroll}>
        {activities.length === 0 ? (
          <Text style={styles.emptyActivityText}>No recent activity</Text>
        ) : (
          activities.map(renderActivityItem)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 18,
    marginLeft: 18,
  },
  logScroll: {
    flex: 1,
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
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userInitial: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  userActionContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  actionText: {
    fontSize: 12,
    color: "#666",
  },

  activityLogDate: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
  },
  // Table styles matching StockCard
  tableHeaderRow: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    columnGap: 8,
  },
  tableHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 2,
  },
  companyHeader: {
    flex: 2.2,
  },
  equalHeader: {
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
    columnGap: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: "#333",
    paddingHorizontal: 2,
  },
  companyCell: {
    flex: 2.2,
  },
  equalCell: {
    flex: 1,
  },
  emptyActivityText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginHorizontal: 20,
    marginVertical: 20,
  },
});
