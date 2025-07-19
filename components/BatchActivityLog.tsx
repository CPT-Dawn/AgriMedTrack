import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
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
  onEditBatch?: (batch: StockBatch) => void;
  onDeleteBatch?: (batchId: string) => void;
  loading?: boolean;
  onLoadMore?: () => void;
  hideCount?: boolean;
  hideHeader?: boolean;
}

export const BatchActivityLog: React.FC<BatchActivityLogProps> = ({
  batches,
  isExpanded,
  onToggle,
  onItemPress,
  onEditBatch,
  onDeleteBatch,
  loading = false,
  onLoadMore,
  hideCount = false,
  hideHeader = false,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const loadingRotateAnim = useRef(new Animated.Value(0)).current;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [cardScale] = useState<{ [id: string]: Animated.Value }>({});
  const [cardOpacity] = useState<{ [id: string]: Animated.Value }>({});

  // Configure layout animation
  const configureLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  };

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

  // Animate header elements
  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isExpanded ? 0 : 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    if (Platform.OS === "ios") {
      configureLayoutAnimation();
    }
  }, [isExpanded, rotateAnim, fadeAnim, slideAnim]);

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

  // Animate batch cards entrance when batches change
  useEffect(() => {
    if (batches.length > 0) {
      batches.forEach((batch, index) => {
        animateCardEntrance(batch.id, index * 100);
      });
    }
  }, [batches]);

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

  const loadingRotate = loadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // --- Card animation helpers ---
  const getCardScale = (id: string) => {
    if (!cardScale[id]) {
      cardScale[id] = new Animated.Value(1);
    }
    return cardScale[id];
  };

  const getCardOpacity = (id: string) => {
    if (!cardOpacity[id]) {
      cardOpacity[id] = new Animated.Value(0);
    }
    return cardOpacity[id];
  };

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

  // Animate card entrance
  const animateCardEntrance = (id: string, delay: number = 0) => {
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
  };

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
            {/* Enhanced header with gradient background */}
            <LinearGradient
              colors={[
                Theme.colors.primary + "10",
                Theme.colors.primary + "05",
              ]}
              style={styles.batchHeader}
            >
              <View style={styles.batchHeaderContent}>
                {/* Enhanced user avatar */}
                <View style={styles.userAvatarContainer}>
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
                  <View style={styles.onlineIndicator} />
                </View>

                <View style={styles.batchHeaderText}>
                  <Text style={styles.batchTitle}>
                    {batch.addedByName || "User"}
                  </Text>
                  <Text style={styles.batchSubtitle}>
                    Added {batch.items.length} item
                    {batch.items.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              {/* Enhanced date display */}
              <View style={styles.dateContainer}>
                <MaterialIcons
                  name="schedule"
                  size={14}
                  color={Theme.colors.textMuted}
                />
                <Text style={styles.batchDate}>
                  {formatDate(batch.addedAt)}
                </Text>
              </View>
            </LinearGradient>

            {/* Enhanced table layout */}
            <View style={styles.entriesTable}>
              {/* Enhanced table header */}
              <View style={styles.tableHeader}>
                <View style={styles.tableHeaderCell}>
                  <MaterialIcons
                    name="inventory"
                    size={14}
                    color={Theme.colors.primary}
                  />
                  <Text style={styles.tableHeaderText}>Product</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <MaterialIcons
                    name="business"
                    size={14}
                    color={Theme.colors.primary}
                  />
                  <Text style={styles.tableHeaderText}>Supplier</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <MaterialIcons
                    name="straighten"
                    size={14}
                    color={Theme.colors.primary}
                  />
                  <Text style={styles.tableHeaderText}>Size</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <MaterialIcons
                    name="shopping-cart"
                    size={14}
                    color={Theme.colors.primary}
                  />
                  <Text style={styles.tableHeaderText}>Qty</Text>
                </View>
              </View>

              {/* Enhanced table rows */}
              {batch.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id || itemIndex}
                  style={[
                    styles.tableRow,
                    itemIndex < batch.items.length - 1 &&
                      styles.tableRowDivider,
                  ]}
                  onPress={() => onItemPress && onItemPress(item.stockEntryId)}
                  activeOpacity={onItemPress ? 0.7 : 1}
                >
                  <View style={styles.tableCell}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.productName}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.supplierName} numberOfLines={1}>
                      {item.supplierName}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.sizeName} numberOfLines={1}>
                      {item.sizeName}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Enhanced items count */}
            <View style={styles.batchTotal}>
              <View style={styles.totalBadge}>
                <MaterialIcons
                  name="list"
                  size={16}
                  color={Theme.colors.primary}
                />
                <Text style={styles.batchTotalValue}>
                  {batch.items.length} items
                </Text>
              </View>
            </View>

            {/* Enhanced bill image thumbnail */}
            {batch.billUrl && (
              <TouchableOpacity
                style={styles.billPreviewFooter}
                onPress={() => batch.billUrl && setImagePreview(batch.billUrl)}
                accessibilityLabel="View bill image"
              >
                <LinearGradient
                  colors={[
                    Theme.colors.primary + "15",
                    Theme.colors.primary + "05",
                  ]}
                  style={styles.billButton}
                >
                  <MaterialIcons
                    name="receipt"
                    size={16}
                    color={Theme.colors.primary}
                  />
                  <Text style={styles.billText}>View Bill</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Enhanced expanded actions */}
            {expanded && (
              <Animated.View
                style={[
                  styles.expandedActions,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => onEditBatch && onEditBatch(batch)}
                  accessibilityLabel="Edit batch"
                >
                  <LinearGradient
                    colors={[Theme.colors.primary, Theme.colors.primaryHover]}
                    style={styles.buttonGradient}
                  >
                    <MaterialIcons
                      name="edit"
                      size={16}
                      color={Theme.colors.white}
                    />
                    <Text style={styles.buttonText}>Edit</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteBatch && onDeleteBatch(batch.id)}
                  accessibilityLabel="Delete batch"
                >
                  <LinearGradient
                    colors={[Theme.colors.error, "#B91C1C"]}
                    style={styles.buttonGradient}
                  >
                    <MaterialIcons
                      name="delete"
                      size={16}
                      color={Theme.colors.white}
                    />
                    <Text style={styles.buttonText}>Delete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <TouchableOpacity
          style={[styles.header, isExpanded ? styles.headerExpanded : null]}
          onPress={handleToggle}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            isExpanded ? "Collapse activity log" : "Expand activity log"
          }
        >
          <LinearGradient
            colors={
              isExpanded
                ? [Theme.colors.primary + "15", Theme.colors.primary + "05"]
                : [Theme.colors.surface, Theme.colors.surface]
            }
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <MaterialIcons
                  name="history"
                  size={20}
                  color={
                    isExpanded ? Theme.colors.primary : Theme.colors.textMuted
                  }
                />
              </View>
              <Text
                style={[styles.title, isExpanded ? styles.titleExpanded : null]}
              >
                Activity Log{" "}
                {!hideCount && batches.length > 0 ? (
                  <Text style={styles.countBadge}>({batches.length})</Text>
                ) : null}
              </Text>
            </View>
            <View style={styles.toggleButtonContainer}>
              <Animated.View
                style={[styles.toggleButton, { transform: [{ rotate }] }]}
              >
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={24}
                  color={
                    isExpanded ? Theme.colors.primary : Theme.colors.textMuted
                  }
                />
              </Animated.View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {isExpanded && (
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
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
                name="inbox"
                size={48}
                color={Theme.colors.textMuted}
              />
              <Text style={styles.emptyText}>No activity recorded yet</Text>
              <Text style={styles.emptySubtext}>
                Stock activities will appear here
              </Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Enhanced Image Preview Modal */}
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
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    overflow: "hidden",
    marginHorizontal: Theme.spacing.sm,
    marginVertical: Theme.spacing.sm,
    ...Theme.shadows.md,
  },
  header: {
    borderRadius: Theme.borderRadius.xl,
    overflow: "hidden",
  },
  headerExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerGradient: {
    padding: Theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Theme.shadows.sm,
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
    paddingTop: Theme.spacing.md,
  },
  batchCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    overflow: "hidden",
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  batchHeader: {
    padding: Theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  batchHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatarContainer: {
    position: "relative",
    marginRight: Theme.spacing.md,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Theme.colors.surface,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userInitial: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.success,
    borderWidth: 2,
    borderColor: Theme.colors.surface,
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
  batchSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
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
  tableHeader: {
    flexDirection: "row",
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    marginBottom: Theme.spacing.sm,
  },
  tableHeaderCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
  },
  tableHeaderText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
  },
  tableRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xs,
  },
  productName: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  supplierName: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
  },
  sizeName: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
  },
  quantityBadge: {
    backgroundColor: Theme.colors.primary + "15",
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    alignSelf: "flex-start",
  },
  quantityText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary,
  },
  batchTotal: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  totalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: Theme.colors.secondary + "15",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
  },
  batchTotalValue: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.secondary,
  },
  billPreviewFooter: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  billButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
  },
  billText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.primary,
  },
  expandedActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  editButton: {
    borderRadius: Theme.borderRadius.lg,
    overflow: "hidden",
    ...Theme.shadows.sm,
  },
  deleteButton: {
    borderRadius: Theme.borderRadius.lg,
    overflow: "hidden",
    ...Theme.shadows.sm,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  buttonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.white,
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.xl,
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
    paddingVertical: Theme.spacing["4xl"],
    gap: Theme.spacing.md,
  },
  emptyText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
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
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "80%",
    borderRadius: Theme.borderRadius.lg,
  },
});
