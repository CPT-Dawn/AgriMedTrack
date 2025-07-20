import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  LayoutAnimation,
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

  // Format date for display with time within 24 hours, date for older entries
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      // Show time for entries within 24 hours
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      // Show date for entries older than 24 hours
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
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

  // Render a batch item with minimalist design matching StockCard
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

    // Calculate total quantity for this batch
    const totalQuantity = batch.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return (
      <Animated.View
        style={{
          transform: [{ scale }],
          opacity,
          marginBottom: Theme.spacing["2xl"],
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
          <View
            style={[
              styles.batchCard,
              {
                backgroundColor: expanded
                  ? Theme.colors.surfacePressed
                  : Theme.colors.surface,
                shadowOpacity: expanded ? 0.18 : 0.08,
                elevation: expanded ? 6 : 2,
              },
            ]}
          >
            {/* Card header matching StockCard style */}
            <View style={styles.headerRow}>
              <View style={styles.batchInfo}>
                <Text style={styles.batchTitle}>
                  {batch.addedByName || "User"}
                </Text>
                <View style={styles.batchIndicator}>
                  <MaterialIcons
                    name="history"
                    size={12}
                    color={
                      expanded ? Theme.colors.success : Theme.colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.batchIndicatorText,
                      {
                        color: expanded
                          ? Theme.colors.success
                          : Theme.colors.primary,
                      },
                    ]}
                  >
                    {expanded ? "Batch details" : formatDate(batch.addedAt)}
                  </Text>
                </View>
              </View>
              <View style={styles.quantityContainer}>
                <Text style={styles.totalQty}>{totalQuantity} items</Text>
              </View>
            </View>

            {/* Table header matching StockCard */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeader, styles.companyHeader]}>
                Supplier
              </Text>
              <Text style={[styles.tableHeader, styles.equalHeader]}>Pack</Text>
              <Text style={[styles.tableHeader, styles.equalHeader]}>Sell</Text>
              <Text style={[styles.tableHeader, styles.equalHeader]}>Qty</Text>
            </View>

            {/* Table rows matching StockCard */}
            {batch.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={item.id || itemIndex}
                style={[
                  styles.tableRow,
                  itemIndex % 2 === 1 ? styles.tableRowAlternate : null,
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

            {/* Expandable actions section */}
            {expanded && (
              <View style={styles.expandedActions}>
                <View style={styles.actionRow}>
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

                <Text style={styles.batchDate}>
                  Added {formatDate(batch.addedAt)}
                </Text>
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
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius["2xl"],
    padding: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.md,
  },
  batchInfo: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  batchTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  batchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
    marginTop: Theme.spacing.xs,
  },
  batchIndicatorText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  batchHealthIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
    backgroundColor: Theme.colors.primary,
  },
  totalQty: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary,
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

  expandedActions: {
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
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

  batchDate: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    fontWeight: Theme.typography.fontWeight.medium,
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

});
