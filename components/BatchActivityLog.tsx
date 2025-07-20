import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  isExpanded?: boolean;
  onToggle?: () => void;
  onItemPress?: (productId: string) => void;
  onEditBatch?: (batch: StockBatch) => void;
  onDeleteBatch?: (batchId: string) => void;
  loading?: boolean;
  onLoadMore?: () => void;
  hideCount?: boolean;
  hideHeader?: boolean;
}

export const BatchActivityLog: React.FC<BatchActivityLogProps> = ({
  batches,
  isExpanded = true,
  onToggle = () => {},
  onItemPress,
  onEditBatch,
  onDeleteBatch,
  loading = false,
  onLoadMore,
  hideCount = false,
  hideHeader = false,
}) => {
  const loadingRotateAnim = useRef(new Animated.Value(0)).current;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [cardScale] = useState<{ [id: string]: Animated.Value }>({});
  const [cardOpacity] = useState<{ [id: string]: Animated.Value }>({});

  // Configure layout animation - commented out as it's not currently used
  /*
  const configureLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  };
  */

  // Format date for display with relative time
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Animate loading spinner
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(loadingRotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      loadingRotateAnim.setValue(0);
    }
  }, [loading, loadingRotateAnim]);

  const loadingRotate = loadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Animate batch cards entrance when batches change
  useEffect(() => {
    if (batches.length > 0) {
      batches.forEach((batch, index) => {
        // Make sure the card has opacity and scale values
        if (cardOpacity[batch.id] && cardScale[batch.id]) {
          Animated.sequence([
            Animated.delay(index * 100),
            Animated.parallel([
              Animated.timing(cardOpacity[batch.id], {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(cardScale[batch.id], {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
                bounciness: 10,
              }),
            ]),
          ]).start();
        }
      });
    }
  }, [batches, cardOpacity, cardScale]);

  // --- Card animation helpers ---
  const getCardScale = useCallback(
    (id: string) => {
      if (!cardScale[id]) {
        cardScale[id] = new Animated.Value(1);
      }
      return cardScale[id];
    },
    [cardScale]
  );

  const getCardOpacity = useCallback(
    (id: string) => {
      if (!cardOpacity[id]) {
        cardOpacity[id] = new Animated.Value(0);
      }
      return cardOpacity[id];
    },
    [cardOpacity]
  );

  const animateCardPressIn = (id: string) => {
    Animated.spring(getCardScale(id), {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const animateCardPressOut = (id: string) => {
    Animated.spring(getCardScale(id), {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  // For animating the card entrance - not directly used as we've inlined the animation
  // Keeping this for reference in case we need to reuse it
  /*
  const animateCardEntrance = useCallback(
    (id: string, delay: number = 0) => {
      if (!cardOpacity[id] || !cardScale[id]) {
        return; // Guard clause to prevent errors
      }

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(getCardOpacity(id), {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(getCardScale(id), {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
          }),
        ]),
      ]).start();
    },
    [cardOpacity, cardScale, getCardOpacity, getCardScale]
  );
  */

  // Render a batch item with enhanced design
  const renderBatchItem = ({
    item: batch,
    index,
  }: {
    item: StockBatch;
    index: number;
  }) => {
    const expanded = expandedBatchId === batch.id;
    const scale = getCardScale(batch.id);
    const opacity = getCardOpacity(batch.id);

    return (
      <Animated.View
        style={{
          transform: [{ scale }],
          opacity,
          marginBottom: Theme.spacing.lg,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setExpandedBatchId(expanded ? null : batch.id);
          }}
          onPressIn={() => animateCardPressIn(batch.id)}
          onPressOut={() => animateCardPressOut(batch.id)}
          accessibilityLabel={expanded ? "Collapse batch" : "Expand batch"}
        >
          <View style={styles.batchCard}>
            {/* Simplified header */}
            <View style={styles.batchHeader}>
              <View style={styles.batchHeaderContent}>
                {/* Simple user avatar */}
                <View style={styles.userAvatar}>
                  {batch.addedByAvatar ? (
                    <Image
                      source={{ uri: batch.addedByAvatar }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.userInitial}>
                      {(batch.addedByName || "User").charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>

                <View style={styles.batchHeaderText}>
                  <Text style={styles.batchTitle}>
                    {batch.addedByName || "User"}
                  </Text>
                  <View style={styles.batchSubtitleRow}>
                    <Text style={styles.batchSubtitle}>
                      Added {batch.items.length} item
                      {batch.items.length !== 1 ? "s" : ""}
                    </Text>
                    <Text style={styles.batchDate}>
                      {formatDate(batch.addedAt)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Table layout that matches StockCard style exactly */}
            <View style={styles.entriesTable}>
              {/* Table header */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeader, styles.companyHeader]}>
                  Supplier
                </Text>
                <Text style={[styles.tableHeader, styles.equalHeader]}>
                  Pack
                </Text>
                <Text style={[styles.tableHeader, styles.equalHeader]}>
                  Sell
                </Text>
                <Text style={[styles.tableHeader, styles.equalHeader]}>
                  Qty
                </Text>
              </View>

              {/* Table rows */}
              {batch.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id || itemIndex}
                  style={[
                    styles.tableRow,
                    itemIndex % 2 === 1 && styles.tableRowAlternate,
                  ]}
                  onPress={() => onItemPress && onItemPress(item.stockEntryId)}
                  activeOpacity={onItemPress ? 0.7 : 1}
                >
                  <Text
                    style={[styles.tableCell, styles.companyCell]}
                    numberOfLines={1}
                  >
                    {item.supplierName}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.equalCell]}
                    numberOfLines={1}
                  >
                    {item.sizeName}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.equalCell]}
                    numberOfLines={1}
                  >
                    -
                  </Text>
                  <Text style={[styles.tableCell, styles.equalCell]}>
                    {item.quantity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Simplified batch total */}
            <View style={styles.batchTotal}>
              <Text style={styles.batchTotalText}>
                {batch.items.length} items total
              </Text>

              {/* Simplified bill button */}
              {batch.billUrl && (
                <TouchableOpacity
                  style={styles.billButton}
                  onPress={() =>
                    batch.billUrl && setImagePreview(batch.billUrl)
                  }
                  accessibilityLabel="View bill image"
                >
                  <MaterialIcons
                    name="receipt"
                    size={16}
                    color={Theme.colors.primary}
                  />
                  <Text style={styles.billText}>View Bill</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Simplified actions */}
            {expanded && (
              <View style={styles.expandedActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEditBatch && onEditBatch(batch)}
                  accessibilityLabel="Edit batch"
                >
                  <MaterialIcons
                    name="edit"
                    size={16}
                    color={Theme.colors.primary}
                  />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => onDeleteBatch && onDeleteBatch(batch.id)}
                  accessibilityLabel="Delete batch"
                >
                  <MaterialIcons
                    name="delete"
                    size={16}
                    color={Theme.colors.error}
                  />
                  <Text
                    style={[styles.actionButtonText, styles.deleteButtonText]}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
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
                <Animated.View
                  style={[
                    styles.loadingSpinner,
                    { transform: [{ rotate: loadingRotate }] },
                  ]}
                >
                  <MaterialIcons
                    name="refresh"
                    size={20}
                    color={Theme.colors.primary}
                  />
                </Animated.View>
                <Text style={styles.loadingText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="history"
            size={32}
            color={Theme.colors.textMuted}
          />
          <Text style={styles.emptyText}>No activity recorded</Text>
          <Text style={styles.emptySubtext}>
            Stock activities will appear here
          </Text>
        </View>
      )}

      {/* Simple Image Preview Modal */}
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
            <MaterialIcons name="close" size={24} color={Theme.colors.white} />
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
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
  },
  header: {
    borderRadius: Theme.borderRadius.xl,
    overflow: "hidden",
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  headerExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  headerContent: {
    padding: Theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.textMuted,
  },
  titleExpanded: {
    color: Theme.colors.text,
  },
  countBadge: {
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  toggleButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  batchList: {
    paddingVertical: Theme.spacing.md,
  },
  batchCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    overflow: "hidden",
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
  },
  batchHeader: {
    padding: Theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
    backgroundColor: Theme.colors.surface,
  },
  batchHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInitial: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary,
  },
  batchHeaderText: {
    flex: 1,
  },
  batchTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  batchSubtitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  batchSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
  },
  batchDate: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  entriesTable: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    columnGap: Theme.spacing.sm,
  },
  tableHeader: {
    flex: 1,
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
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
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
    alignItems: "center",
    columnGap: Theme.spacing.sm,
  },
  tableRowAlternate: {
    backgroundColor: Theme.colors.secondary + "05",
  },
  tableCell: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text,
    paddingHorizontal: 2,
  },
  companyCell: {
    flex: 2.2,
  },
  equalCell: {
    flex: 1,
  },
  batchTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
  },
  batchTotalText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.textMuted,
  },
  billButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
  },
  billText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary,
  },
  expandedActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
  },
  actionButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.primary,
  },
  deleteButton: {
    borderColor: Theme.colors.error + "30",
  },
  deleteButtonText: {
    color: Theme.colors.error,
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  loadingSpinner: {
    transform: [{ rotate: "0deg" }],
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Theme.spacing["2xl"],
    gap: Theme.spacing.md,
  },
  emptyText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "80%",
    borderRadius: Theme.borderRadius.md,
  },
});
