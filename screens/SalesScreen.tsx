import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SaleItemInput } from "../components/SaleItemInput";
import { AppColors } from "../constants/Colors";

// Theme colors matching the design system
const colors = {
  primary: "#0288D1",
  secondary: "#F9A825",
  accent: "#FF7043",
  bg: "#F5F5F5",
  text: "#263238",
  white: "#FFFFFF",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sizeLabel: string;
  quantity: string;
  unitPrice: string;
  totalPrice: number;
}

interface SaleEntry {
  id: string;
  buyer: string;
  addedBy: string;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  saleDate: Date;
  notes: string;
  items: SaleItem[];
  totalAmount: number;
}

// Mock stock data for product selection
const mockStockItems = [
  { id: "1", name: "Urea 50kg", size: "50kg Bag", price: 600 },
  { id: "2", name: "NPK 20-20-20", size: "25kg Bag", price: 450 },
  { id: "3", name: "DAP Fertilizer", size: "50kg Bag", price: 800 },
  { id: "4", name: "Organic Manure", size: "40kg Bag", price: 300 },
  { id: "5", name: "Micronutrients", size: "1kg Bottle", price: 150 },
  { id: "6", name: "Pesticide", size: "500ml Bottle", price: 200 },
];

// Mock sale entries data
const SALE_ENTRIES = [
  {
    id: "sale_001",
    buyer: "Gopal Verma",
    addedBy: "Gopal",
    saleDate: "2025-07-16T10:15:00",
    paymentStatus: "Partial",
    notes: "Paid ₹1000, ₹700 pending",
    items: [
      {
        productId: "p1",
        name: "Urea 50kg",
        packaging: "50kg Bag",
        quantity: 2,
        pricePerUnit: 600,
        total: 1200,
      },
      {
        productId: "p4",
        name: "Pendimethalin",
        packaging: "1L Bottle",
        quantity: 3,
        pricePerUnit: 250,
        total: 750,
      },
    ],
    totalAmount: 1950,
  },
  {
    id: "sale_002",
    buyer: "Anil Traders",
    addedBy: "Anil",
    saleDate: "2025-07-16T13:40:00",
    paymentStatus: "Paid",
    notes: "",
    items: [
      {
        productId: "p2",
        name: "DAP 45kg",
        packaging: "45kg Bag",
        quantity: 1,
        pricePerUnit: 1200,
        total: 1200,
      },
    ],
    totalAmount: 1200,
  },
];

export default function SalesScreen() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [buyer, setBuyer] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "Paid" | "Unpaid" | "Partial"
  >("Paid");
  const [notes, setNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [currentView, setCurrentView] = useState<"sales" | "add">("sales");

  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;

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

    setShowSummary(true);
  };

  // Confirm and save sale
  const confirmSale = async () => {
    try {
      setSubmitting(true);

      const saleEntry: SaleEntry = {
        id: Date.now().toString(),
        buyer,
        addedBy: "Gopal - Sales Manager",
        paymentStatus,
        saleDate: new Date(),
        notes,
        items: saleItems,
        totalAmount,
      };

      // Here you would typically save to backend/Firebase
      console.log("Sale Entry:", saleEntry);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form and go back to sales view
      setSaleItems([]);
      setBuyer("");
      setPaymentStatus("Paid");
      setNotes("");
      setShowSummary(false);
      setCurrentView("sales");

      Alert.alert("Success", "Sale recorded successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  };

  // Render sale card
  const renderSaleCard = ({ item }: { item: any }) => {
    const saleDate = new Date(item.saleDate);
    const isToday = saleDate.toDateString() === new Date().toDateString();

    return (
      <View style={styles.saleCard}>
        <View style={styles.saleCardHeader}>
          <View style={styles.saleCardHeaderLeft}>
            <MaterialIcons name="receipt" size={24} color={colors.primary} />
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
              item.paymentStatus === "Partial" && styles.paymentStatusPartial,
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
            {item.items.map((saleItem: any, index: number) => (
              <View key={index} style={styles.saleItemRow}>
                <View style={styles.saleItemInfo}>
                  <Text style={styles.saleItemName}>{saleItem.name}</Text>
                  <Text style={styles.saleItemDetails}>
                    {saleItem.packaging} • Qty: {saleItem.quantity}
                  </Text>
                </View>
                <View style={styles.saleItemPrice}>
                  <Text style={styles.saleItemUnitPrice}>
                    ₹{saleItem.pricePerUnit}
                  </Text>
                  <Text style={styles.saleItemTotal}>₹{saleItem.total}</Text>
                </View>
              </View>
            ))}
          </View>

          {item.notes && (
            <View style={styles.saleNotes}>
              <MaterialIcons name="note" size={16} color={colors.gray[500]} />
              <Text style={styles.saleNotesText}>{item.notes}</Text>
            </View>
          )}

          <View style={styles.saleCardFooter}>
            <View style={styles.saleCardFooterLeft}>
              <Text style={styles.saleCardFooterText}>By: {item.addedBy}</Text>
            </View>
            <View style={styles.saleCardFooterRight}>
              <Text style={styles.saleCardTotalLabel}>Total:</Text>
              <Text style={styles.saleCardTotalAmount}>
                ₹{item.totalAmount}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render sale item
  const renderSaleItem = ({
    item,
    index,
  }: {
    item: SaleItem;
    index: number;
  }) => (
    <SaleItemInput
      item={item}
      index={index}
      stockItems={mockStockItems}
      onUpdate={(updates: Partial<SaleItem>) =>
        updateSaleItem(item.id, updates)
      }
      onRemove={() => removeSaleItem(item.id)}
      errors={{
        product: errors[`item${index}Product`],
        quantity: errors[`item${index}Quantity`],
        price: errors[`item${index}Price`],
      }}
    />
  );

  // Render summary modal
  const renderSummaryModal = () => (
    <Modal
      visible={showSummary}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSummary(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Sale Entry</Text>
            <TouchableOpacity onPress={() => setShowSummary(false)}>
              <MaterialIcons name="close" size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>Sale Information</Text>
              {buyer && <Text style={styles.summaryText}>Buyer: {buyer}</Text>}
              <Text style={styles.summaryText}>
                Date: {new Date().toLocaleDateString()}
              </Text>
              <Text style={styles.summaryText}>
                Payment Status: {paymentStatus}
              </Text>
              {notes && <Text style={styles.summaryText}>Notes: {notes}</Text>}
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>
                Products ({saleItems.length})
              </Text>
              {saleItems.map((item, index) => (
                <View key={item.id} style={styles.summaryItem}>
                  <Text style={styles.summaryItemTitle}>
                    {index + 1}. {item.productName}
                  </Text>
                  <Text style={styles.summaryItemText}>
                    {item.sizeLabel} • Qty: {item.quantity} • ₹{item.unitPrice}
                  </Text>
                  <Text style={styles.summaryItemTotal}>
                    Total: ₹{item.totalPrice}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.summarySection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>₹{totalAmount}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowSummary(false)}
            >
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={confirmSale}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Confirm & Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render add sale form
  const renderAddSaleForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sale Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sale Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Buyer Name (Optional)</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="person"
                size={20}
                color={colors.gray[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={buyer}
                onChangeText={setBuyer}
                placeholder="Enter buyer name"
                placeholderTextColor={colors.gray[400]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sale Date & Time</Text>
            <TouchableOpacity style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>
                {new Date().toLocaleString()}
              </Text>
              <MaterialIcons name="event" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Status</Text>
            <View style={styles.paymentStatusContainer}>
              {(["Paid", "Unpaid", "Partial"] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.paymentStatusButton,
                    paymentStatus === status && styles.paymentStatusActive,
                  ]}
                  onPress={() => setPaymentStatus(status)}
                >
                  <Text
                    style={[
                      styles.paymentStatusText,
                      paymentStatus === status &&
                        styles.paymentStatusTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this sale..."
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.gray[400]}
            />
          </View>
        </View>

        {/* Product Selection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
            <TouchableOpacity
              style={styles.addProductButton}
              onPress={addSaleItem}
            >
              <MaterialIcons name="add" size={20} color={colors.primary} />
              <Text style={styles.addProductText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          {/* Form Status Indicator */}
          <View style={styles.formStatusContainer}>
            <View style={styles.formStatusItem}>
              <MaterialIcons
                name={
                  saleItems.length > 0
                    ? "check-circle"
                    : "radio-button-unchecked"
                }
                size={16}
                color={saleItems.length > 0 ? colors.primary : colors.gray[400]}
              />
              <Text
                style={[
                  styles.formStatusText,
                  saleItems.length > 0 && styles.formStatusTextActive,
                ]}
              >
                {saleItems.length} product{saleItems.length !== 1 ? "s" : ""}{" "}
                added
              </Text>
            </View>
            <View style={styles.formStatusItem}>
              <MaterialIcons
                name={
                  totalAmount > 0 ? "check-circle" : "radio-button-unchecked"
                }
                size={16}
                color={totalAmount > 0 ? colors.primary : colors.gray[400]}
              />
              <Text
                style={[
                  styles.formStatusText,
                  totalAmount > 0 && styles.formStatusTextActive,
                ]}
              >
                Total: ₹{totalAmount}
              </Text>
            </View>
          </View>

          {saleItems.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="shopping-cart"
                size={48}
                color={colors.gray[300]}
              />
              <Text style={styles.emptyStateText}>No products added</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap &quot;Add Product&quot; to start adding items to this sale
              </Text>
            </View>
          ) : (
            <FlatList
              data={saleItems}
              renderItem={renderSaleItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Total Amount */}
          {saleItems.length > 0 && (
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>₹{totalAmount}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <View style={styles.errorContainer}>
            <MaterialIcons
              name="error-outline"
              size={16}
              color={AppColors.error}
            />
            <View style={styles.errorContent}>
              {errors.items && (
                <Text style={styles.errorText}>{errors.items}</Text>
              )}
              {Object.keys(errors).filter((key) => key !== "items").length >
                0 && (
                <Text style={styles.errorText}>
                  Please fix the errors in the product items above
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (saleItems.length === 0 || submitting) && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={saleItems.length === 0 || submitting}
        >
          {submitting ? (
            <>
              <ActivityIndicator color={colors.white} size="small" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="receipt" size={20} color={colors.white} />
              <Text style={styles.saveButtonText}>
                Save Sale Entry ({saleItems.length} items)
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary Modal */}
      {renderSummaryModal()}
    </KeyboardAvoidingView>
  );

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
  const filteredSaleEntries = SALE_ENTRIES.filter(
    (entry) =>
      entry.buyer.toLowerCase().includes(search.toLowerCase()) ||
      entry.addedBy.toLowerCase().includes(search.toLowerCase())
  );

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case "add":
        return renderAddSaleForm();
      default:
        return (
          <FlatList
            data={filteredSaleEntries}
            renderItem={renderSaleCard}
            keyExtractor={(item) => item.id}
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          {currentView !== "sales" && (
            <TouchableOpacity
              onPress={handleBackToSales}
              style={styles.backButton}
              accessibilityLabel="Back to sales"
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        </View>

        {/* Search Bar - Only show in sales view */}
        {currentView === "sales" && (
          <View style={styles.searchBarContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.text}
              style={{ marginRight: 6 }}
            />
            <TextInput
              style={styles.searchBar}
              placeholder="Search sales..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#999"
              autoCapitalize="none"
              accessibilityLabel="Search sales"
            />
          </View>
        )}
      </View>

      {/* Content based on current view */}
      {renderContent()}

      {/* Floating Bubble - Add Sale */}
      <Animated.View
        style={[
          styles.bubbleContainer,
          { transform: [{ scale: bubbleScale }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bubble,
            {
              backgroundColor:
                currentView === "add" ? colors.secondary : colors.accent,
            },
          ]}
          onPress={handleBubblePress}
          activeOpacity={0.8}
          accessibilityLabel={
            currentView === "add" ? "Close add sale form" : "Add new sale"
          }
        >
          <MaterialIcons
            name={currentView === "add" ? "close" : "add"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </Animated.View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
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
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
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
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  // Search bar styles
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    marginTop: 12,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  listContainer: {
    paddingTop: 12,
    paddingBottom: 100,
  },
});
