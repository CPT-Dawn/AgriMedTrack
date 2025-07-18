import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  FlatList,
  LayoutAnimation,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SaleItemInput from "../components/SaleItemInput";
import { AppColors } from "../constants/Colors";
import { Theme } from "../constants/Theme";
import { useStock } from "../hooks/useStock";
import { useUser } from "../hooks/useUser";
import {
  addSale,
  deleteSale,
  getSales,
  updateSale,
} from "../services/stockService";
import { Sale, SaleItem } from "../types/stock";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HORIZONTAL = Math.max(
  Theme.spacing.lg,
  Math.round(SCREEN_WIDTH * 0.045)
);

// Local color reference for backward compatibility
const colors = {
  primary: Theme.colors.primary,
  secondary: Theme.colors.secondary,
  accent: Theme.colors.accent,
  bg: Theme.colors.background,
  text: Theme.colors.text,
  white: Theme.colors.white,
  gray: {
    50: Theme.colors.surfacePressed,
    100: Theme.colors.surfacePressed,
    200: Theme.colors.border,
    300: Theme.colors.border,
    400: Theme.colors.textMuted,
    500: Theme.colors.textMuted,
    600: Theme.colors.textMuted,
    700: Theme.colors.text,
    800: Theme.colors.text,
    900: Theme.colors.text,
  },
};

// Use the SaleItem interface from types/stock.ts instead of redefining it here
// interface SaleItem {
//   id: string;
//   productId: string;
//   productName: string;
//   sizeLabel: string;
//   quantity: string;
//   unitPrice: string;
//   totalPrice: number;
// }

// Use the Sale interface and rename it to SaleEntry for consistency
type SaleEntry = Sale;

// Add this component inside SalesScreen.tsx
// Remove SaleCardWithWiggle component

// Update currentView type
type ViewType = "sales" | "add";

export default function SalesScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser } = useUser();
  const { stockItems, stockEntries, refreshData: refreshStock } = useStock();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [buyer, setBuyer] = useState(currentUser?.name || "");
  const [saleDate, setSaleDate] = useState<Date | null>(new Date());
  const [saleTime, setSaleTime] = useState<Date | null>(new Date());
  const [paymentStatus, setPaymentStatus] = useState<
    "Paid" | "Unpaid" | "Partial"
  >("Paid");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("sales");
  const [saleEntries, setSaleEntries] = useState<SaleEntry[]>([]);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [editSale, setEditSale] = useState<SaleEntry | null>(null);
  const [cardScale] = useState<{ [id: string]: Animated.Value }>({});
  const [loadingSales, setLoadingSales] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Update buyer when currentUser changes
  useEffect(() => {
    if (currentUser?.name) {
      setBuyer(currentUser.name);
    }
  }, [currentUser]);

  // Refresh stock data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refresh stock data to ensure we have the latest quantities
      refreshStock();
    }, [refreshStock])
  );

  // Enable LayoutAnimation on Android
  React.useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Load sales data from Firebase
  useEffect(() => {
    loadSalesData();
  }, []);

  // Handle back to sales view
  const handleBackToSales = React.useCallback(() => {
    setCurrentView("sales");
    // Reset form when going back
    setSaleItems([]);
    setBuyer(currentUser?.name || "");
    setPaymentStatus("Paid");
    setNotes("");
    setErrors({});
    setEditSale(null); // Clear edit state
  }, [currentUser?.name]);

  // Load sales data from Firebase
  const loadSalesData = async () => {
    try {
      setLoadingSales(true);
      const salesData = await getSales();
      // Convert Date objects to strings for saleDate
      const formattedSalesData = salesData.map((sale: any) => ({
        ...sale,
        saleDate:
          typeof sale.saleDate === "object"
            ? sale.saleDate.toISOString()
            : sale.saleDate,
      }));
      setSaleEntries(formattedSalesData);
    } catch (error) {
      console.error("Error loading sales:", error);
      Alert.alert("Error", "Failed to load sales data");
    } finally {
      setLoadingSales(false);
    }
  };

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (currentView === "add") {
        handleBackToSales();
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [currentView, handleBackToSales]);

  // Ensure we have at least one item when entering add view
  useEffect(() => {
    if (currentView === "add" && saleItems.length === 0) {
      // Add first item automatically
      setSaleItems([
        {
          id: Date.now().toString(),
          productId: "",
          productName: "",
          packaging: "",
          quantity: "",
          unitPrice: "",
          totalPrice: 0,
        },
      ]);
    }
  }, [currentView, saleItems.length]);

  const bubbleScale = useRef(new Animated.Value(1)).current;

  // Handle bubble press (Add Sale)
  const handleBubblePress = () => {
    Animated.sequence([
      Animated.timing(bubbleScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Toggle between add view and sales view
    if (currentView === "add") {
      // Going back to sales view - reset form
      setCurrentView("sales");
      setSaleItems([]);
      setBuyer("");
      setPaymentStatus("Paid");
      setNotes("");
      setErrors({});
    } else {
      // Going to add view - clear any existing edit state
      setCurrentView("add");
      setEditSale(null); // Clear edit state for new sale
    }
  };

  // --- Edit logic ---
  const handleEdit = (sale: SaleEntry) => {
    setEditSale(sale);
    setBuyer(sale.buyer || "");
    // Handle both string and Date types for saleDate
    setSaleDate(
      typeof sale.saleDate === "string"
        ? new Date(sale.saleDate)
        : (sale.saleDate as Date)
    );
    setPaymentStatus(sale.paymentStatus);
    setNotes(sale.notes || "");
    // Ensure we have proper string values for quantity and unitPrice
    setSaleItems(
      sale.items.map((item) => ({
        ...item,
        quantity: String(item.quantity || "0"),
        unitPrice: String(item.unitPrice || "0"),
      }))
    );
    setCurrentView("add");
    setExpandedSaleId(null);
  };

  // --- Card animation helpers ---
  const getCardScale = (id: string) => {
    if (!cardScale[id]) {
      cardScale[id] = new Animated.Value(1);
    }
    return cardScale[id];
  };
  const animateCardPressIn = (id: string) => {
    Animated.spring(getCardScale(id), {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };
  const animateCardPressOut = (id: string) => {
    Animated.spring(getCardScale(id), {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  // Handle delete sale
  const handleDelete = (sale: SaleEntry) => {
    Alert.alert(
      "Delete Sale",
      "Are you sure you want to delete this sale? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoadingSales(true);
              await deleteSale(sale.id || "");
              // Refresh sales data after deletion
              await loadSalesData();
              Alert.alert("Success", "Sale deleted successfully");
            } catch (error) {
              console.error("Error deleting sale:", error);
              Alert.alert("Error", "Failed to delete sale");
            } finally {
              setLoadingSales(false);
            }
          },
        },
      ]
    );
  };

  // Render sale card
  const renderSaleCard = ({ item }: { item: SaleEntry }) => {
    const saleDate = new Date(item.saleDate);
    const isToday = saleDate.toDateString() === new Date().toDateString();
    const expanded = expandedSaleId === item.id;
    const scale = getCardScale(item.id || "");
    return (
      <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setExpandedSaleId(expanded ? null : item.id || null);
          }}
          onPressIn={() => animateCardPressIn(item.id || "")}
          onPressOut={() => animateCardPressOut(item.id || "")}
          accessibilityLabel={expanded ? "Collapse bill" : "Expand bill"}
        >
          <View style={styles.saleCard}>
            <View style={styles.saleCardHeader}>
              <View style={styles.saleCardHeaderLeft}>
                <MaterialIcons
                  name="receipt"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.saleCardHeaderText}>
                  <Text style={styles.saleCardTitle}>
                    {item.buyer || "Anonymous Buyer"}
                  </Text>
                  <Text style={styles.saleCardSubtitle}>
                    {isToday ? "Today" : saleDate.toLocaleDateString()} •{" "}
                    {saleDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.paymentStatusBadge,
                  item.paymentStatus === "Paid" && styles.paymentStatusPaid,
                  item.paymentStatus === "Partial" &&
                    styles.paymentStatusPartial,
                  item.paymentStatus === "Unpaid" && styles.paymentStatusUnpaid,
                ]}
              >
                <Text style={styles.paymentStatusBadgeText}>
                  {item.paymentStatus}
                </Text>
              </View>
            </View>
            <View style={styles.saleCardContent}>
              <View style={styles.saleItemsList}>
                {item.items.map((saleItem: SaleItem, index: number) => (
                  <View key={index} style={styles.saleItemRow}>
                    <View style={styles.saleItemInfo}>
                      <Text style={styles.saleItemName}>
                        {saleItem.productName}
                      </Text>
                      <Text style={styles.saleItemDetails}>
                        {saleItem.packaging + " • Qty: " + saleItem.quantity}
                      </Text>
                    </View>
                    <View style={styles.saleItemPrice}>
                      <Text style={styles.saleItemUnitPrice}>
                        ₹{saleItem.unitPrice}
                      </Text>
                      <Text style={styles.saleItemTotal}>
                        ₹{saleItem.totalPrice}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              {item.notes && (
                <View style={styles.saleNotes}>
                  <MaterialIcons
                    name="note"
                    size={16}
                    color={colors.gray[500]}
                  />
                  <Text style={styles.saleNotesText}>{item.notes}</Text>
                </View>
              )}
              <View style={styles.saleCardFooter}>
                <View style={styles.saleCardFooterLeft}>
                  <Text style={styles.saleCardFooterText}>
                    By:{" "}
                    {item.addedByName ||
                      (currentUser?.id === item.addedBy
                        ? currentUser.name
                        : item.addedBy) ||
                      "Unknown User"}
                  </Text>
                </View>
                <View style={styles.saleCardFooterRight}>
                  <Text style={styles.saleCardTotalLabel}>Total:</Text>
                  <Text style={styles.saleCardTotalAmount}>
                    ₹{item.totalAmount}
                  </Text>
                </View>
              </View>
              {/* Expanded actions */}
              {expanded && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    gap: 12,
                    marginTop: 18,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: Theme.colors.primary,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 22,
                    }}
                    onPress={() => handleEdit(item)}
                    accessibilityLabel="Edit bill"
                  >
                    <Text
                      style={{
                        color: Theme.colors.white,
                        fontWeight: "600",
                        fontSize: 15,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: AppColors.error,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 22,
                    }}
                    onPress={() => handleDelete(item)}
                    accessibilityLabel="Delete bill"
                  >
                    <Text
                      style={{
                        color: Theme.colors.white,
                        fontWeight: "600",
                        fontSize: 15,
                      }}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Filtered sale entries based on search
  const filteredSaleEntries = saleEntries.filter(
    (entry) =>
      entry.buyer.toLowerCase().includes(search.toLowerCase()) ||
      entry.addedBy.toLowerCase().includes(search.toLowerCase())
  );

  // Remove the edit modal logic
  // Instead, when a card is tapped in edit mode, set currentView to 'edit' and set editingCard to the selected item
  // Render the edit form in place of the add form, using the same UI as add, but pre-filled with editingCard data
  // Add a delete button at the bottom of the edit form
  // Remove all references to renderAddSaleForm if it is not defined

  // Add a new view: 'edit'
  // In the main renderContent function:
  const renderContent = () => {
    switch (currentView) {
      case "add":
        return renderAddSale();
      default:
        return (
          <FlatList
            data={filteredSaleEntries}
            renderItem={renderSaleCard}
            keyExtractor={(item) => item.id || Date.now().toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={Platform.OS === "android"}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="receipt"
                  size={48}
                  color={colors.gray[300]}
                />
                <Text style={styles.emptyStateText}>No sales found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try a different search or tap the + button to add a sale
                </Text>
              </View>
            )}
          />
        );
    }
  };

  // Implement renderSaleForm for both add and edit
  // Old SaleForm component removed - now using renderAddSale() with proper Firebase integration

  // --- Add Sale Page ---
  const renderAddSale = () => {
    // --- Calculations ---
    const grandTotal = saleItems.reduce(
      (sum, item) =>
        sum + (Number(item.unitPrice) * Number(item.quantity) || 0),
      0
    );

    // Handle date change
    const handleDateChange = (event: any, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === "ios");
      if (selectedDate) {
        setSaleDate(selectedDate);
      }
    };

    // Handle time change
    const handleTimeChange = (event: any, selectedTime?: Date) => {
      setShowTimePicker(Platform.OS === "ios");
      if (selectedTime) {
        setSaleTime(selectedTime);
      }
    };

    // Convert stock items to format needed by SaleItemInput
    const availableStockItems = stockItems.map((item) => {
      // Get all available packaging options for this product
      const packagingOptions: {
        packaging: string;
        price: number;
        quantity: number;
      }[] = [];

      item.suppliers.forEach((supplierGroup) => {
        supplierGroup.sizes.forEach((sizeGroup) => {
          // Find the matching stock entry for sell price
          const stockEntry = stockEntries.find(
            (e: any) =>
              e.productId === item.product.id &&
              e.supplierId === supplierGroup.supplier.id &&
              e.packagingId === sizeGroup.size.id
          );

          packagingOptions.push({
            packaging: sizeGroup.size.label,
            price: stockEntry?.sellPrice || 0,
            quantity: sizeGroup.quantity,
          });
        });
      });

      // Get the first packaging option as default
      const firstPackaging = packagingOptions[0];

      return {
        id: item.id,
        name: item.product.name,
        packaging: firstPackaging ? firstPackaging.packaging : "",
        price: firstPackaging ? firstPackaging.price : 0,
        inStock: item.totalQuantity > 0,
        availableQuantity: item.totalQuantity,
        packagingOptions: packagingOptions, // Add all packaging options
        suppliers: item.suppliers.map((s) => ({
          id: s.supplier.id,
          name: s.supplier.name,
        })),
      };
    });

    // --- Validation ---
    const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!saleDate) newErrors.date = "Date is required";
      if (saleItems.length === 0)
        newErrors.items = "At least one product is required";

      // Check each sale item
      saleItems.forEach((item, idx) => {
        // Basic validation
        if (!item.productName)
          newErrors[`item${idx}Product`] = "Product is required";
        if (!item.packaging)
          newErrors[`item${idx}Packaging`] = "Packaging is required";
        if (
          !item.quantity ||
          isNaN(Number(item.quantity)) ||
          Number(item.quantity) <= 0
        )
          newErrors[`item${idx}Quantity`] = "Valid quantity required";
        if (
          !item.unitPrice ||
          isNaN(Number(item.unitPrice)) ||
          Number(item.unitPrice) < 0
        )
          newErrors[`item${idx}Price`] = "Valid price required";

        // Stock validation - check if quantity exceeds available stock
        if (item.productId) {
          const stockItem = availableStockItems.find(
            (stock) => stock.id === item.productId
          );
          if (
            stockItem &&
            parseFloat(item.quantity) > stockItem.availableQuantity
          ) {
            newErrors[
              `item${idx}Quantity`
            ] = `Exceeds available stock (${stockItem.availableQuantity})`;
          }
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // --- Handlers ---
    const handleAddItem = () => {
      const newItem: SaleItem = {
        id: Date.now().toString(),
        productId: "",
        productName: "",
        packaging: "",
        quantity: "",
        unitPrice: "",
        totalPrice: 0,
      };
      setSaleItems([...saleItems, newItem]);
    };

    const handleRemoveItem = (id: string) => {
      setSaleItems(saleItems.filter((item) => item.id !== id));
    };

    const handleUpdateItem = (id: string, updates: Partial<SaleItem>) => {
      setSaleItems(
        saleItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      );
    };

    const handleSave = async () => {
      if (!validate()) return;
      setShowConfirm(true);
    };

    const handleConfirmSave = async () => {
      try {
        setSubmitting(true);

        // Combine date and time into a single ISO string
        let combinedDateTime = new Date();
        if (saleDate && saleTime) {
          combinedDateTime = new Date(saleDate);
          combinedDateTime.setHours(saleTime.getHours());
          combinedDateTime.setMinutes(saleTime.getMinutes());
          combinedDateTime.setSeconds(0);
          combinedDateTime.setMilliseconds(0);
        }

        // Prepare items with calculated total
        const itemsWithTotal = saleItems.map((item) => ({
          ...item,
          totalPrice: Number(item.unitPrice) * Number(item.quantity),
        }));

        // Prepare sale data
        const saleData: Sale = {
          buyer,
          addedBy: currentUser?.id || "unknown-user",
          paymentStatus,
          saleDate: combinedDateTime,
          notes,
          items: itemsWithTotal,
          totalAmount: itemsWithTotal.reduce(
            (sum, item) => sum + item.totalPrice,
            0
          ),
        };

        // Save to Firebase
        if (editSale && editSale.id) {
          // Update existing sale
          await updateSale(
            editSale.id,
            saleData,
            currentUser?.id || "unknown-user",
            currentUser?.name || "Unknown User"
          );
        } else {
          // Add new sale
          await addSale(
            saleData,
            currentUser?.id || "unknown-user",
            currentUser?.name || "Unknown User"
          );
        }

        // Reset form and refresh data
        setBuyer(currentUser?.name || "");
        setSaleDate(new Date());
        setPaymentStatus("Paid");
        setNotes("");
        setSaleItems([]);
        setShowConfirm(false);
        setSubmitting(false);
        setCurrentView("sales");
        setEditSale(null);

        // Refresh sales data
        loadSalesData();

        // Refresh stock data to reflect updated quantities
        // This will trigger a re-render of the stock items with updated quantities
        refreshStock();

        Alert.alert(
          "Success",
          `Sale ${editSale ? "updated" : "recorded"} successfully`
        );
      } catch (error) {
        console.error("Error saving sale:", error);
        Alert.alert(
          "Error",
          `Failed to ${editSale ? "update" : "record"} sale`
        );
      } finally {
        setSubmitting(false);
        setShowConfirm(false);
      }
    };

    // --- UI ---
    return (
      <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
        {/* Sticky Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop:
                Platform.OS === "ios" ? 16 : (StatusBar.currentHeight || 0) + 4,
              paddingBottom: Theme.spacing.sm,
            },
          ]}
        >
          <View style={styles.headerTitleContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={handleBackToSales}
                accessibilityLabel="Back to sales"
                style={styles.backButton}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={24}
                  color={Theme.colors.text}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.headerTitle,
                  { fontSize: Theme.typography.fontSize.lg },
                ]}
              >
                {editSale ? "Edit Sale" : "New Sale"}
              </Text>
            </View>
            {/* Green + box removed when in new sale page */}
          </View>
        </View>

        {/* Form Content */}
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
          enableOnAndroid
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
        >
          {/* Buyer Field */}
          <View style={{ marginBottom: 14 }}>
            <Text
              style={{
                fontWeight: "600",
                marginBottom: 4,
                color: Theme.colors.text,
              }}
            >
              Buyer
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Theme.colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Theme.colors.border,
                paddingHorizontal: 12,
                paddingVertical: 10,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <MaterialIcons
                name="person"
                size={20}
                color={Theme.colors.primary}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: Theme.colors.text,
                  padding: 0,
                  backgroundColor: "transparent",
                }}
                value={buyer}
                onChangeText={setBuyer}
                placeholder="Enter buyer name"
                placeholderTextColor={Theme.colors.textMuted}
              />
            </View>
          </View>

          {/* Date and Time Fields (side by side) */}
          <View style={{ flexDirection: "row", gap: 14, marginBottom: 16 }}>
            {/* Date Field */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: "600",
                  marginBottom: 4,
                  color: Theme.colors.text,
                }}
              >
                Date
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: Theme.colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: errors.date
                    ? AppColors.error
                    : Theme.colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  setShowDatePicker(true);
                }}
                accessibilityLabel="Select date"
              >
                <MaterialIcons
                  name="event"
                  size={20}
                  color={Theme.colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: Theme.colors.text, fontSize: 16, flex: 1 }}
                >
                  {saleDate ? saleDate.toLocaleDateString() : "Select Date"}
                </Text>
              </TouchableOpacity>
              {errors.date && (
                <Text
                  style={{ color: AppColors.error, fontSize: 12, marginTop: 2 }}
                >
                  {errors.date}
                </Text>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={saleDate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Time Field */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: "600",
                  marginBottom: 4,
                  color: Theme.colors.text,
                }}
              >
                Time
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: Theme.colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: errors.time
                    ? AppColors.error
                    : Theme.colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  setShowTimePicker(true);
                }}
                accessibilityLabel="Select time"
              >
                <MaterialIcons
                  name="schedule"
                  size={20}
                  color={Theme.colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: Theme.colors.text, fontSize: 16, flex: 1 }}
                >
                  {saleTime
                    ? saleTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Select Time"}
                </Text>
              </TouchableOpacity>
              {errors.time && (
                <Text
                  style={{ color: AppColors.error, fontSize: 12, marginTop: 2 }}
                >
                  {errors.time}
                </Text>
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={saleTime || new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleTimeChange}
                />
              )}
            </View>
          </View>

          {/* Payment Status */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontWeight: "600",
                marginBottom: 4,
                color: Theme.colors.text,
              }}
            >
              Payment Status
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {["Paid", "Unpaid", "Partial"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={{
                    backgroundColor:
                      paymentStatus === status
                        ? Theme.colors.primary
                        : Theme.colors.surface,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor:
                      paymentStatus === status
                        ? Theme.colors.primary
                        : Theme.colors.border,
                    ...Theme.shadows.sm,
                  }}
                  onPress={() => setPaymentStatus(status as any)}
                >
                  <Text
                    style={{
                      color:
                        paymentStatus === status
                          ? Theme.colors.white
                          : Theme.colors.text,
                      fontWeight: "600",
                    }}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes Field - Only show for Partial payment */}
          {paymentStatus === "Partial" && (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontWeight: "600",
                  marginBottom: 4,
                  color: Theme.colors.text,
                }}
              >
                Notes (Required for partial payment)
              </Text>
              <TextInput
                style={{
                  backgroundColor: Theme.colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: Theme.colors.border,
                  padding: 12,
                  fontSize: 16,
                  color: Theme.colors.text,
                  minHeight: 80,
                  textAlignVertical: "top",
                  ...Theme.shadows.sm,
                }}
                placeholder="Add payment details"
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholderTextColor={Theme.colors.textMuted}
              />
            </View>
          )}

          {/* Sale Items */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontWeight: "600",
                marginBottom: 8,
                color: Theme.colors.text,
              }}
            >
              Sale Items
            </Text>
            {saleItems.length === 0 ? (
              <View
                style={{
                  backgroundColor: Theme.colors.surfaceSecondary,
                  borderRadius: 16,
                  padding: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: Theme.colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  No items added yet
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: Theme.colors.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}
                  onPress={handleAddItem}
                >
                  <Text style={{ color: Theme.colors.white }}>
                    Add First Item
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList
                  data={saleItems}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => (
                    <SaleItemInput
                      item={item}
                      index={index}
                      stockItems={availableStockItems}
                      onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                      onRemove={() => handleRemoveItem(item.id)}
                      errors={{
                        product: errors[`item${index}Product`],
                        quantity: errors[`item${index}Quantity`],
                        price: errors[`item${index}Price`],
                        supplier: errors[`item${index}Supplier`],
                      }}
                      initiallyExpanded={
                        editSale
                          ? true
                          : index === 0 || index === saleItems.length - 1
                      } // All items expanded when editing, otherwise first and last items
                    />
                  )}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: Theme.colors.surface,
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: Theme.colors.primary,
                    borderRadius: 16,
                    paddingVertical: 12,
                    marginTop: 8,
                    marginBottom: 16,
                  }}
                  onPress={handleAddItem}
                  accessibilityLabel="Add another item"
                >
                  <MaterialIcons
                    name="add-circle-outline"
                    size={20}
                    color={Theme.colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: Theme.colors.primary,
                      fontWeight: "600",
                    }}
                  >
                    Add Another Item
                  </Text>
                </TouchableOpacity>

                {/* Total Bill Section - Added before Add Another Item button */}
                <View style={styles.totalBillContainer}>
                  <View style={styles.totalBillRow}>
                    <Text style={styles.grandTotalLabel}>TOTAL</Text>
                    <Text style={styles.grandTotalValue}>
                      ₹{grandTotal.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Save Button - Moved inside the container */}
                <TouchableOpacity
                  style={styles.inlineSaveButton}
                  onPress={handleSave}
                  disabled={submitting}
                  accessibilityLabel="Save sale"
                >
                  {submitting ? (
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editSale ? "Update Sale" : "Save Sale"}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAwareScrollView>

        {/* Confirmation Modal */}
        {showConfirm && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: 16,
            }}
          >
            <View
              style={{
                backgroundColor: Theme.colors.surface,
                borderRadius: 16,
                padding: 16,
                width: "90%",
                maxWidth: 400,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {editSale ? "Confirm Edit" : "Confirm Sale"}
              </Text>
              <Text style={{ marginBottom: 16, textAlign: "center" }}>
                Are you sure you want to {editSale ? "update" : "record"} this
                sale?
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: Theme.colors.surfacePressed,
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                  onPress={() => setShowConfirm(false)}
                  disabled={submitting}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: Theme.colors.primary,
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                  onPress={handleConfirmSave}
                  disabled={submitting}
                >
                  <Text style={{ color: Theme.colors.white }}>
                    {submitting
                      ? "Saving..."
                      : editSale
                      ? "Update Sale"
                      : "Confirm"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  // --- Main Render ---
  return (
    <View style={styles.container}>
      {currentView === "add" ? (
        renderAddSale()
      ) : (
        <View style={styles.container}>
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                paddingTop:
                  Platform.OS === "ios"
                    ? Math.max(insets.top, 16)
                    : (StatusBar.currentHeight || 0) + 4,
              },
            ]}
          >
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Sales</Text>
              <TouchableOpacity
                style={styles.addButtonHeader}
                onPress={handleBubblePress}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="add"
                  size={24}
                  color={Theme.colors.white}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <MaterialIcons
                name="search"
                size={20}
                color={Theme.colors.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search sales..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={Theme.colors.textMuted}
                accessibilityLabel="Search sales"
              />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {loadingSales ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading sales...</Text>
              </View>
            ) : (
              renderContent()
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0 + 20,
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
    zIndex: 10,
  },
  headerTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: HEADER_HORIZONTAL,
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
    marginRight: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userText: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  datePickerButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePickerText: {
    fontSize: 16,
    color: colors.text,
  },
  paymentStatusContainer: {
    flexDirection: "row",
    gap: 8,
  },
  paymentStatusButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  paymentStatusActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
  },
  paymentStatusTextActive: {
    color: colors.white,
  },
  addProductButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addProductText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  formStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  formStatusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  formStatusText: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: "500",
  },
  formStatusTextActive: {
    color: colors.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[500],
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: "center",
    marginTop: 4,
  },

  totalSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    color: AppColors.error,
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  saveButtonText: {
    color: Theme.colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  summarySection: {
    marginBottom: 20,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  summaryItem: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  summaryItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  summaryItemText: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 2,
  },
  summaryItemTotal: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.gray[700],
    fontSize: 16,
    fontWeight: "600",
  },
  // Sale card styles
  saleCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius["2xl"],
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing["2xl"],
    padding: Theme.spacing.lg,
    ...Theme.shadows.lg,
  },
  saleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  saleCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  saleCardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  saleCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  saleCardSubtitle: {
    fontSize: 12,
    color: colors.gray[600],
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
  },
  paymentStatusPaid: {
    backgroundColor: AppColors.success + "20",
  },
  paymentStatusPartial: {
    backgroundColor: colors.secondary + "20",
  },
  paymentStatusUnpaid: {
    backgroundColor: AppColors.error + "20",
  },
  paymentStatusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gray[700],
  },
  saleCardContent: {
    padding: 16,
  },
  saleItemsList: {
    marginBottom: 12,
  },
  saleItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  saleItemInfo: {
    flex: 1,
  },
  saleItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 2,
  },
  saleItemDetails: {
    fontSize: 12,
    color: colors.gray[600],
  },
  saleItemPrice: {
    alignItems: "flex-end",
  },
  saleItemUnitPrice: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 2,
  },
  saleItemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  saleNotes: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  saleNotesText: {
    fontSize: 12,
    color: colors.gray[600],
    flex: 1,
  },
  saleCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  saleCardFooterLeft: {
    flex: 1,
  },
  saleCardFooterText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  saleCardFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saleCardTotalLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  saleCardTotalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  // Bubble styles
  bubbleContainer: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "android" ? 80 : 100,
    zIndex: 100,
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    // Enhanced 3D shadow
    shadowColor: "#2e7d32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  // Search bar styles
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    minHeight: 44,
    ...Theme.shadows.sm,
  },
  searchBarContainerActive: {
    borderColor: Theme.colors.primary,
    ...Theme.shadows.md,
  },
  searchBar: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    padding: 0,
  },
  searchBarActive: {
    color: Theme.colors.primary,
  },
  clearButton: {
    marginLeft: Theme.spacing.xs,
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: "transparent",
  },
  listContainer: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  plusBox: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2e7d32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  editBox: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2e7d32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    minHeight: 44,
    ...Theme.shadows.sm,
  },
  searchIcon: {
    marginRight: Theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Theme.colors.textMuted,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  addButton: {
    position: "absolute",
    right: Theme.spacing.lg,
    bottom: Theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2e7d32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  // Add new style for the header button
  addButtonHeader: {
    backgroundColor: "#4CAF50",
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    ...Theme.shadows.md,
  },
  // Add fixed save button styles
  saveButtonContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20, // Position above tab bar
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    zIndex: 100,
  },

  // New styles for total bill section
  totalBillContainer: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius["2xl"],
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    ...Theme.shadows.md,
  },
  totalBillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalBillLabel: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
    fontWeight: "500",
  },
  totalBillValue: {
    fontSize: 15,
    color: Theme.colors.text,
    fontWeight: "600",
  },
  totalBillInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 100,
    textAlign: "right",
    fontSize: 15,
    color: Theme.colors.text,
  },
  totalBillDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: Theme.colors.text,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.colors.primary,
  },
  inlineSaveButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
