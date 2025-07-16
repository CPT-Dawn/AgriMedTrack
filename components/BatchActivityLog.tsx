import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { AppColors } from "../constants/Colors";
import { Theme } from "../constants/Theme";
import { StockBatch } from "../types/stock";

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BatchActivityLogProps {
  batches: StockBatch[];
  isExpanded: boolean;
  onToggle: () => void;
  onItemPress?: (productId: string) => void;
  loading?: boolean;
  onLoadMore?: () => void;
  hideCount?: boolean; // Add this new prop to control whether to show the count
  hideHeader?: boolean; // Add this new prop to control whether to show the header
}

export const BatchActivityLog: React.FC<BatchActivityLogProps> = ({
  batches,
  isExpanded,
  onToggle,
  onItemPress,
  loading = false,
  onLoadMore,
  hideCount = false, // Add this new prop to control whether to show the count
  hideHeader = false, // Add this new prop to control whether to show the header
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Configure layout animation
  const configureLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Animate chevron rotation
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (Platform.OS === "ios") {
      configureLayoutAnimation();
    }
  }, [isExpanded]);

  // Handle toggle with animation
  const handleToggle = () => {
    if (Platform.OS === "android") {
      configureLayoutAnimation();
    }
    onToggle();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Render a batch item
  const renderBatchItem = ({ item: batch }: { item: StockBatch }) => {
    return (
      <View style={styles.batchCard}>
        <View style={styles.batchHeader}>
          <View style={styles.batchHeaderContent}>
            {/* User avatar instead of inventory icon */}
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>
                {(batch.addedByName || "User").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.batchHeaderText}>
              <Text style={styles.batchTitle}>
                {batch.addedByName || "User"}
              </Text>
            </View>
          </View>

          {/* Date and time in top right */}
          <Text style={styles.batchDate}>{formatDate(batch.addedAt)}</Text>
        </View>

        {/* Table-like layout for entries */}
        <View style={styles.entriesTable}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.productCell]}>
              Product
            </Text>
            <Text style={[styles.tableHeaderCell, styles.supplierCell]}>
              Supplier
            </Text>
            <Text style={[styles.tableHeaderCell, styles.sizeCell]}>Size</Text>
            <Text style={[styles.tableHeaderCell, styles.priceCell]}>
              Price
            </Text>
            <Text style={[styles.tableHeaderCell, styles.qtyCell]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.totalCell]}>
              Total
            </Text>
          </View>

          {/* Table rows */}
          {batch.items.map((item, index) => (
            <TouchableOpacity
              key={item.id || index}
              style={[
                styles.tableRow,
                index < batch.items.length - 1 && styles.tableRowDivider,
              ]}
              onPress={() => onItemPress && onItemPress(item.stockEntryId)}
              activeOpacity={onItemPress ? 0.7 : 1}
            >
              <Text
                style={[styles.tableCell, styles.productCell]}
                numberOfLines={1}
              >
                {item.productName}
              </Text>
              <Text
                style={[styles.tableCell, styles.supplierCell]}
                numberOfLines={1}
              >
                {item.supplierName}
              </Text>
              <Text
                style={[styles.tableCell, styles.sizeCell]}
                numberOfLines={1}
              >
                {item.sizeName}
              </Text>
              <Text style={[styles.tableCell, styles.priceCell]}>
                ₹{item.buyPrice || 0}
              </Text>
              <Text style={[styles.tableCell, styles.qtyCell]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.totalCell]}>
                ₹{(item.buyPrice || 0) * item.quantity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Batch total */}
        <View style={styles.batchTotal}>
          <Text style={styles.batchTotalLabel}>Batch Total:</Text>
          <Text style={styles.batchTotalValue}>
            ₹
            {batch.items.reduce(
              (total, item) => total + (item.buyPrice || 0) * item.quantity,
              0
            )}
          </Text>
        </View>

        {/* Bill image thumbnail if available */}
        {batch.billUrl && (
          <TouchableOpacity
            style={styles.billPreviewFooter}
            onPress={() => batch.billUrl && setImagePreview(batch.billUrl)}
            accessibilityLabel="View bill image"
          >
            <MaterialIcons name="receipt" size={16} color={AppColors.primary} />
            <Text style={styles.billText}>View Bill</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <TouchableOpacity
          style={[styles.header, isExpanded ? styles.headerExpanded : null]}
          onPress={handleToggle}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            isExpanded ? "Collapse activity log" : "Expand activity log"
          }
        >
          <View style={styles.headerContent}>
            <MaterialIcons
              name="history"
              size={18}
              color={isExpanded ? AppColors.primary : "#666"}
              style={styles.headerIcon}
            />
            <Text
              style={[styles.title, isExpanded ? styles.titleExpanded : null]}
            >
              Activity Log{" "}
              {!hideCount && batches.length > 0 ? `(${batches.length})` : ""}
            </Text>
          </View>
          <View style={styles.toggleButtonContainer}>
            <Animated.View
              style={[styles.toggleButton, { transform: [{ rotate }] }]}
            >
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color={isExpanded ? AppColors.primary : "#666"}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      )}

      {isExpanded && (
        <View style={styles.content}>
          {batches.length > 0 ? (
            <FlatList
              data={batches}
              renderItem={renderBatchItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.batchList}
              showsVerticalScrollIndicator={false}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                loading ? (
                  <View style={styles.loadingFooter}>
                    <Text style={styles.loadingText}>Loading more...</Text>
                  </View>
                ) : null
              }
            />
          ) : (
            <Text style={styles.emptyText}>
              No activity recorded for this product
            </Text>
          )}
        </View>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={!!imagePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImagePreview(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setImagePreview(null)}
          >
            <MaterialIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          {imagePreview && (
            <Image
              source={{ uri: imagePreview }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    minHeight: 48,
    borderRadius: 8,
  },
  headerExpanded: {
    backgroundColor: "rgba(2, 136, 209, 0.05)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  titleExpanded: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  toggleButtonContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    padding: 4,
  },
  content: {
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  batchList: {
    paddingBottom: 8,
  },
  batchCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius["2xl"],
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing["2xl"],
    ...Theme.shadows.sm,
    overflow: "hidden",
  },
  batchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  batchHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  userInitial: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  batchHeaderText: {
    justifyContent: "center",
  },
  batchTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  batchDate: {
    fontSize: 12,
    color: "#777",
  },
  entriesTable: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  tableRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  tableCell: {
    fontSize: 13,
    color: "#333",
  },
  productCell: {
    flex: 2,
    paddingRight: 4,
  },
  supplierCell: {
    flex: 1.8,
    paddingRight: 4,
  },
  sizeCell: {
    flex: 1.2,
    paddingRight: 4,
  },
  priceCell: {
    flex: 0.8,
    textAlign: "right",
    paddingRight: 4,
  },
  qtyCell: {
    flex: 0.6,
    textAlign: "right",
    paddingRight: 4,
  },
  totalCell: {
    flex: 1,
    textAlign: "right",
    fontWeight: "600",
    color: AppColors.primary,
  },
  batchTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: "rgba(2, 136, 209, 0.05)",
  },
  batchTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginRight: 8,
  },
  batchTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.primary,
  },
  billPreviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#F9F9F9",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  billText: {
    fontSize: 12,
    color: AppColors.primary,
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 13,
    color: "#757575",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
  loadingFooter: {
    padding: 16,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 13,
    color: "#757575",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "80%",
  },
});
