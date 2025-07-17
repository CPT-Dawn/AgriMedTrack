import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  FlatList,
  LayoutAnimation,
  Platform,
  ScrollView,
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
import { addSale, getSales } from "../services/stockService";
import { Sale, SaleItem } from "../types/stock";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HORIZONTAL = Math.max(
  Theme.spacing.lg,
  Math.round(SCREEN_WIDTH * 0.045)
);
const SEARCHBAR_VERTICAL = Math.max(
  Theme.spacing.xs,
  Math.round(SCREEN_HEIGHT * 0.012)
);
const SEARCHBAR_MIN_HEIGHT = Math.max(40, Math.round(SCREEN_HEIGHT * 0.055));

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
  const { stockItems, loading: stockLoading } = useStock();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [buyer, setBuyer] = useState("");
  const [saleDate, setSaleDate] = useState<Date | null>(new Date());
  const [saleTime, setSaleTime] = useState<Date | null>(new Date());
  const [paymentStatus, setPaymentStatus] = useState<
    "Paid" | "Unpaid" | "Partial"
  >("Paid");
  const [notes, setNotes] = useState("");
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
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
  }, [currentView]);

  // Ensure we have at least one item when entering add view
  useEffect(() => {
    if (currentView === "add" && saleItems.length === 0) {
      // Add first item automatically
      setSaleItems([
        {
          id: Date.now().toString(),
          productId: "",
          productName: "",
          sizeLabel: "",
          quantity: "",
          unitPrice: "",
          totalPrice: 0,
        },
      ]);
    }
  }, [currentView, saleItems.length]);

  const scrollViewRef = useRef<ScrollView>(null);
  const bubbleScale = useRef(new Animated.Value(1)).current;
  const plusScale = useRef(new Animated.Value(1)).current;

  // Calculate total amount
  const totalAmount = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);

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
      // Going to add view
      setCurrentView("add");
    }
  };

  // Handle back to sales view
  const handleBackToSales = () => {
    setCurrentView("sales");
    // Reset form when going back
    setSaleItems([]);
    setBuyer("");
    setPaymentStatus("Paid");
    setNotes("");
    setErrors({});
  };

  // Add new sale item
  const addSaleItem = () => {
    const newItem: SaleItem = {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      sizeLabel: "",
      quantity: "",
      unitPrice: "",
      totalPrice: 0,
    };
    setSaleItems([...saleItems, newItem]);
  };

  // Remove sale item
  const removeSaleItem = (id: string) => {
    setSaleItems(saleItems.filter((item) => item.id !== id));
  };

  // Update sale item
  const updateSaleItem = (id: string, updates: Partial<SaleItem>) => {
    setSaleItems(
      saleItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!buyer.trim()) {
      newErrors.buyer = "Buyer name is required";
    }

    if (saleItems.length === 0) {
      newErrors.items = "At least one product is required";
    }

    saleItems.forEach((item, index) => {
      if (!item.productName) {
        newErrors[`item${index}Product`] = "Product is required";
      }
      if (
        !item.quantity ||
        isNaN(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        newErrors[`item${index}Quantity`] =
          "Valid quantity (greater than 0) is required";
      }
      if (
        !item.unitPrice ||
        isNaN(Number(item.unitPrice)) ||
        Number(item.unitPrice) < 0
      ) {
        newErrors[`item${index}Price`] =
          "Valid price (0 or greater) is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Scroll to top to show errors
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setShowConfirm(true);
  };

  // Confirm and save sale
  const confirmSale = async () => {
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

      // Prepare sale data
      const saleData = {
        buyer,
        addedBy: currentUser?.id || "unknown-user",
        paymentStatus,
        saleDate: combinedDateTime.toISOString(),
        notes,
        items: saleItems.map((item) => ({
          ...item,
          totalPrice: Number(item.quantity) * Number(item.unitPrice),
        })),
        totalAmount: saleItems.reduce(
          (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
          0
        ),
        discount: discount ? parseFloat(discount) : 0,
        tax: tax ? parseFloat(tax) : 0,
      };

      // Save to Firebase
      await addSale(saleData, currentUser?.id || "unknown-user");

      // Reset form and go back to sales view
      setSaleItems([]);
      setBuyer("");
      setPaymentStatus("Paid");
      setNotes("");
      setShowConfirm(false);
      setCurrentView("sales");

      // Refresh sales data
      loadSalesData();

      Alert.alert("Success", "Sale recorded successfully");
    } catch (error) {
      console.error("Error recording sale:", error);
      Alert.alert("Error", "Failed to record sale");
    } finally {
      setSubmitting(false);
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
    // Set discount and tax fields
    setDiscount(sale.discount ? String(sale.discount) : "");
    setTax(sale.tax ? String(sale.tax) : "");
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
                        {saleItem.sizeLabel + " • Qty: " + saleItem.quantity}
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
                    By: {item.addedBy}
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
                    onPress={() => {}}
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

  // Get the header title based on current view
  const getHeaderTitle = () => {
    switch (currentView) {
      case "add":
        return "Add Sale";
      default:
        return "Sales";
    }
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
        return (
          <SaleForm
            onSave={(data) => {
              // Add logic
              const newEntry: SaleEntry = {
                id: Date.now().toString(),
                buyer: data.buyer,
                addedBy: "Gopal - Sales Manager",
                paymentStatus: data.paymentStatus,
                saleDate: new Date().toISOString(), // always a string
                notes: data.notes || "",
                items: data.items,
                totalAmount: data.totalAmount,
              };
              setSaleEntries([...saleEntries, newEntry]);
              setCurrentView("sales");
              setBuyer("");
              setPaymentStatus("Paid");
              setNotes("");
              setSaleItems([]);
              setErrors({});
            }}
            onCancel={() => setCurrentView("sales")}
          />
        );
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
  function SaleForm({
    initialItems = [],
    initialBuyer = "",
    initialPaymentStatus = "Paid",
    initialNotes = "",
    onSave,
    onCancel,
  }: {
    initialItems?: SaleItem[];
    initialBuyer?: string;
    initialPaymentStatus?: "Paid" | "Unpaid" | "Partial";
    initialNotes?: string;
    onSave: (data: any) => void;
    onCancel: () => void;
  }) {
    const [formSaleItems, setFormSaleItems] =
      useState<SaleItem[]>(initialItems);
    const [formBuyer, setFormBuyer] = useState(initialBuyer);
    const [formPaymentStatus, setFormPaymentStatus] = useState<
      "Paid" | "Unpaid" | "Partial"
    >(initialPaymentStatus);
    const [formNotes, setFormNotes] = useState(initialNotes);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Validation
    const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!formBuyer.trim()) newErrors.buyer = "Buyer is required";
      if (formSaleItems.length === 0)
        newErrors.items = "At least one product is required";
      formSaleItems.forEach((item, idx) => {
        if (!item.productName)
          newErrors[`item${idx}Product`] = "Product is required";
        if (!item.sizeLabel) newErrors[`item${idx}Size`] = "Size is required";
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
      });
      setFormErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Add new sale item
    const handleAddItem = () => {
      setFormSaleItems([
        ...formSaleItems,
        {
          id: Date.now().toString(),
          productId: "",
          productName: "",
          sizeLabel: "",
          quantity: "",
          unitPrice: "",
          totalPrice: 0,
        },
      ]);
    };

    // Remove sale item
    const handleRemoveItem = (id: string) => {
      setFormSaleItems(formSaleItems.filter((item) => item.id !== id));
    };

    // Update sale item
    const handleUpdateItem = (id: string, updates: Partial<SaleItem>) => {
      setFormSaleItems(
        formSaleItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      );
    };

    // Calculate total
    const totalAmount = formSaleItems.reduce(
      (sum, item) =>
        sum + (Number(item.unitPrice) * Number(item.quantity) || 0),
      0
    );

    // Handle save
    const handleSave = async () => {
      if (!validate()) return;
      setFormSubmitting(true);
      // Calculate totalPrice for each item
      const itemsWithTotal = formSaleItems.map((item) => ({
        ...item,
        totalPrice: Number(item.unitPrice) * Number(item.quantity),
      }));
      await new Promise((resolve) => setTimeout(resolve, 400));
      onSave({
        buyer: formBuyer,
        paymentStatus: formPaymentStatus,
        notes: formNotes,
        items: itemsWithTotal,
        totalAmount: itemsWithTotal.reduce((sum, i) => sum + i.totalPrice, 0),
      });
      setFormSubmitting(false);
    };

    // Handle delete with confirmation
    // Remove all delete logic from SaleForm (no delete button, no onDelete prop)

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          Sale Details
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: formErrors.buyer ? "#e53935" : "#ccc",
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
          }}
          placeholder="Buyer Name"
          value={formBuyer}
          onChangeText={setFormBuyer}
          accessibilityLabel="Buyer Name"
        />
        {formErrors.buyer && (
          <Text style={{ color: "#e53935", marginBottom: 8 }}>
            {formErrors.buyer}
          </Text>
        )}
        <Text style={{ fontWeight: "bold", marginTop: 8 }}>Payment Status</Text>
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          {["Paid", "Unpaid", "Partial"].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFormPaymentStatus(status as any)}
              style={{
                backgroundColor:
                  formPaymentStatus === status ? "#43a047" : "#eee",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 16,
                marginRight: 8,
              }}
              accessibilityLabel={`Set payment status to ${status}`}
            >
              <Text
                style={{
                  color: formPaymentStatus === status ? "#fff" : "#222",
                }}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
          }}
          placeholder="Notes (optional)"
          value={formNotes}
          onChangeText={setFormNotes}
          accessibilityLabel="Sale Notes"
        />
        <Text style={{ fontWeight: "bold", marginTop: 8, marginBottom: 4 }}>
          Sale Items
        </Text>
        {formErrors.items && (
          <Text style={{ color: "#e53935", marginBottom: 8 }}>
            {formErrors.items}
          </Text>
        )}
        {formSaleItems.map((item, idx) => (
          <View
            key={item.id}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
              Product #{idx + 1}
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: formErrors[`item${idx}Product`]
                  ? "#e53935"
                  : "#ccc",
                borderRadius: 6,
                padding: 8,
                marginBottom: 4,
              }}
              placeholder="Product Name"
              value={item.productName}
              onChangeText={(text) =>
                handleUpdateItem(item.id, { productName: text })
              }
              accessibilityLabel={`Product Name for item ${idx + 1}`}
            />
            {formErrors[`item${idx}Product`] && (
              <Text style={{ color: "#e53935" }}>
                {formErrors[`item${idx}Product`]}
              </Text>
            )}
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: formErrors[`item${idx}Size`] ? "#e53935" : "#ccc",
                borderRadius: 6,
                padding: 8,
                marginBottom: 4,
              }}
              placeholder="Size/Packaging"
              value={item.sizeLabel}
              onChangeText={(text) =>
                handleUpdateItem(item.id, { sizeLabel: text })
              }
              accessibilityLabel={`Size for item ${idx + 1}`}
            />
            {formErrors[`item${idx}Size`] && (
              <Text style={{ color: "#e53935" }}>
                {formErrors[`item${idx}Size`]}
              </Text>
            )}
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: formErrors[`item${idx}Quantity`]
                  ? "#e53935"
                  : "#ccc",
                borderRadius: 6,
                padding: 8,
                marginBottom: 4,
              }}
              placeholder="Quantity"
              value={item.quantity}
              onChangeText={(text) =>
                handleUpdateItem(item.id, { quantity: text })
              }
              keyboardType="numeric"
              accessibilityLabel={`Quantity for item ${idx + 1}`}
            />
            {formErrors[`item${idx}Quantity`] && (
              <Text style={{ color: "#e53935" }}>
                {formErrors[`item${idx}Quantity`]}
              </Text>
            )}
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: formErrors[`item${idx}Price`] ? "#e53935" : "#ccc",
                borderRadius: 6,
                padding: 8,
                marginBottom: 4,
              }}
              placeholder="Unit Price"
              value={item.unitPrice}
              onChangeText={(text) =>
                handleUpdateItem(item.id, { unitPrice: text })
              }
              keyboardType="numeric"
              accessibilityLabel={`Unit Price for item ${idx + 1}`}
            />
            {formErrors[`item${idx}Price`] && (
              <Text style={{ color: "#e53935" }}>
                {formErrors[`item${idx}Price`]}
              </Text>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                Total: ₹{Number(item.unitPrice) * Number(item.quantity) || 0}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                style={{
                  backgroundColor: "#e53935",
                  padding: 6,
                  borderRadius: 6,
                }}
                accessibilityLabel={`Remove item ${idx + 1}`}
              >
                <MaterialIcons name="delete" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity
          onPress={handleAddItem}
          style={{
            backgroundColor: "#43a047",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            alignItems: "center",
          }}
          accessibilityLabel="Add new sale item"
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>+ Add Item</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          Total Amount: ₹
          {formSaleItems.reduce(
            (sum, i) => sum + (Number(i.unitPrice) * Number(i.quantity) || 0),
            0
          )}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: "#43a047",
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            alignItems: "center",
            opacity: formSubmitting ? 0.7 : 1,
          }}
          disabled={formSubmitting}
          accessibilityLabel="Save sale"
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
            {formSubmitting ? "Saving..." : "Save Sale"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          style={{
            backgroundColor: "#ccc",
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            alignItems: "center",
          }}
          accessibilityLabel="Cancel"
        >
          <Text style={{ color: "#222", fontWeight: "bold", fontSize: 16 }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // In renderSaleCard, when a card is pressed in editMode, set currentView to 'edit' and setEditingCard(item)
  // (Stray onPress handler removed)

  const handlePlusPressIn = () => {
    Animated.spring(plusScale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };
  const handlePlusPressOut = () => {
    Animated.spring(plusScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

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
      // Find the first size for this product (simplified approach)
      const firstSupplier = item.suppliers[0];
      const firstSize = firstSupplier?.sizes[0];

      return {
        id: item.id,
        name: item.product.name,
        size: firstSize ? firstSize.size.label : "",
        price: 0, // Default price - will be set by user
        inStock: item.totalQuantity > 0, // Only show items with stock
        availableQuantity: item.totalQuantity, // Add available quantity
        suppliers: item.suppliers.map((s) => ({
          id: s.supplier.id,
          name: s.supplier.name,
        })),
      };
    });

    // --- Validation ---
    const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!buyer.trim()) newErrors.buyer = "Buyer is required";
      if (!saleDate) newErrors.date = "Date is required";
      if (saleItems.length === 0)
        newErrors.items = "At least one product is required";

      // Check each sale item
      saleItems.forEach((item, idx) => {
        // Basic validation
        if (!item.productName)
          newErrors[`item${idx}Product`] = "Product is required";
        if (!item.sizeLabel) newErrors[`item${idx}Size`] = "Size is required";
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
      setSaleItems([
        ...saleItems,
        {
          id: Date.now().toString(),
          productId: "",
          productName: "",
          sizeLabel: "",
          quantity: "",
          unitPrice: "",
          totalPrice: 0,
        },
      ]);
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
          discount: discount ? parseFloat(discount) : 0,
          tax: tax ? parseFloat(tax) : 0,
        };

        // Save to Firebase
        if (editSale) {
          // Update existing sale (not implemented in this example)
          // await updateSale(editSale.id, saleData);
          Alert.alert(
            "Not Implemented",
            "Updating sales is not implemented yet"
          );
        } else {
          // Add new sale
          await addSale(saleData, currentUser?.id || "unknown-user");
        }

        // Reset form and refresh data
        setBuyer("");
        setSaleDate(new Date());
        setPaymentStatus("Paid");
        setNotes("");
        setNotesExpanded(false);
        setSaleItems([]);
        setDiscount("");
        setTax("");
        setShowConfirm(false);
        setSubmitting(false);
        setCurrentView("sales");
        setEditSale(null);

        // Refresh sales data
        loadSalesData();

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
                New Sale
              </Text>
            </View>
            {/* Green + box removed when in new sale page */}
          </View>
        </View>

        {/* Form Content */}
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 120 }} // Added extra padding at bottom
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
                borderColor: errors.buyer
                  ? AppColors.error
                  : Theme.colors.border,
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
                placeholder="Buyer Name"
                value={buyer}
                onChangeText={setBuyer}
                accessibilityLabel="Buyer Name"
                returnKeyType="next"
                placeholderTextColor={Theme.colors.textMuted}
              />
            </View>
            {errors.buyer && (
              <Text
                style={{ color: AppColors.error, fontSize: 12, marginTop: 2 }}
              >
                {errors.buyer}
              </Text>
            )}
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
                {saleItems.map((item, index) => (
                  <SaleItemInput
                    key={item.id}
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
                    initiallyExpanded={index === 0} // First item is always expanded
                  />
                ))}
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
              </>
            )}
          </View>
        </KeyboardAwareScrollView>

        {/* Save Button - Fixed at bottom above nav bar */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={submitting}
            accessibilityLabel="Save sale"
          >
            {submitting ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Save Sale</Text>
            )}
          </TouchableOpacity>
        </View>

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
                Confirm Sale
              </Text>
              <Text style={{ marginBottom: 16, textAlign: "center" }}>
                Are you sure you want to record this sale?
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
                    {submitting ? "Saving..." : "Confirm"}
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
});
