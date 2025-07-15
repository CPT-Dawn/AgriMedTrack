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
}

export const BatchActivityLog: React.FC<BatchActivityLogProps> = ({
  batches,
  isExpanded,
  onToggle,
  onItemPress,
  loading = false,
  onLoadMore,
  hideCount = false, // Add this new prop to control whether to show the count
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
            <MaterialIcons
              name="inventory"
              size={18}
              color={AppColors.primary}
              style={styles.batchIcon}
            />
            <View style={styles.batchHeaderText}>
              <Text style={styles.batchTitle}>Stock Added</Text>
              <Text style={styles.batchSubtitle}>
                Added by {batch.addedByName || "User"} -{" "}
                {formatDate(batch.addedAt)}
              </Text>
            </View>
          </View>

          {batch.billUrl && (
            <TouchableOpacity
              style={styles.billPreview}
              onPress={() => setImagePreview(batch.billUrl)}
              accessibilityLabel="View bill image"
            >
              {batch.billThumbnail ? (
                <Image
                  source={{ uri: batch.billThumbnail }}
                  style={styles.billThumbnail}
                />
              ) : (
                <MaterialIcons
                  name="receipt"
                  size={24}
                  color={AppColors.primary}
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.batchItems}>
          {batch.items.map((item, index) => (
            <TouchableOpacity
              key={item.id || index}
              style={[
                styles.batchItem,
                index < batch.items.length - 1 && styles.batchItemDivider,
              ]}
              onPress={() => onItemPress && onItemPress(item.stockEntryId)}
              activeOpacity={onItemPress ? 0.7 : 1}
            >
              <View style={styles.batchItemContent}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.itemDetails}>
                  {item.supplierName} • {item.sizeName} • {item.quantity} units
                </Text>
              </View>
              {onItemPress && (
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color="#999"
                  style={styles.itemArrow}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
    backgroundColor: "rgba(2, 136, 209, 0.03)",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16, // 2xl radius
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  batchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "rgba(2, 136, 209, 0.08)",
  },
  batchHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  batchIcon: {
    marginRight: 8,
  },
  batchHeaderText: {
    flex: 1,
  },
  batchTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
  },
  batchSubtitle: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  billPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  billThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  batchItems: {
    padding: 8,
  },
  batchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 44, // Minimum 44x44 touch target
  },
  batchItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  batchItemContent: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
  },
  itemDetails: {
    fontSize: 13,
    color: "#757575",
    marginTop: 2,
  },
  itemArrow: {
    marginLeft: 8,
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
