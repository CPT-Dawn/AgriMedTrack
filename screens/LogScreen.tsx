import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
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
  emptyActivityText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginHorizontal: 20,
    marginVertical: 20,
  },
});
