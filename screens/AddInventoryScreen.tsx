import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { colors, fonts } from "../theme";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useUI } from "../hooks/useUI";
import LoadingScreen from "../components/LoadingScreen";
import InventoryItemForm from "../components/InventoryItemForm";
import { Product, Supplier, InventoryItem } from "../types/inventory";

const AddInventoryScreen: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const { showConfirmDialog } = useUI();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Stock add date/time
  const [stockAddDate, setStockAddDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Master data
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Form data
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      supplierId: "",
      supplierName: "",
      packagingSizeValue: 0,
      packagingUnit: "",
      packagingSize: "",
      batchNumber: "",
      quantityAdded: 0,
      buyPrice: 0,
      sellPrice: 0,
      mfgDate: new Date(),
      expiryDate: new Date(),
      stockAddDate: new Date(),
    },
  ]);

  // Load master data on component mount
  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setLoading(true);

      // Load products
      const productsSnapshot = await getDocs(collection(db, "products"));
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      // Load suppliers
      const suppliersSnapshot = await getDocs(collection(db, "suppliers"));
      const suppliersData = suppliersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Supplier[];

      setProducts(productsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error loading master data:", error);
      showError("Failed to load products and suppliers");
    } finally {
      setLoading(false);
    }
  };

  const addNewProduct = async (
    productName: string,
    category: string = "Other"
  ) => {
    try {
      const newProduct = {
        name: productName,
        category: category,
      };

      const docRef = await addDoc(collection(db, "products"), newProduct);
      const newProductData: Product = {
        id: docRef.id,
        ...newProduct,
      };

      setProducts((prev) => [...prev, newProductData]);
      showSuccess(`Product "${productName}" added successfully`);
      return newProductData;
    } catch (error) {
      console.error("Error adding new product:", error);
      showError("Failed to add new product");
      throw error;
    }
  };

  const addNewSupplier = async (supplierName: string) => {
    try {
      const newSupplier = {
        name: supplierName,
        contactInfo: {},
      };

      const docRef = await addDoc(collection(db, "suppliers"), newSupplier);
      const newSupplierData: Supplier = {
        id: docRef.id,
        ...newSupplier,
      };

      setSuppliers((prev) => [...prev, newSupplierData]);
      showSuccess(`Supplier "${supplierName}" added successfully`);
      return newSupplierData;
    } catch (error) {
      console.error("Error adding new supplier:", error);
      showError("Failed to add new supplier");
      throw error;
    }
  };

  const addInventoryItem = () => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      supplierId: "",
      supplierName: "",
      packagingSizeValue: 0,
      packagingUnit: "",
      packagingSize: "",
      batchNumber: "",
      quantityAdded: 0,
      buyPrice: 0,
      sellPrice: 0,
      mfgDate: new Date(),
      expiryDate: new Date(),
      stockAddDate: new Date(),
    };

    setInventoryItems((prev) => [...prev, newItem]);
  };

  const removeInventoryItem = (itemId: string) => {
    if (inventoryItems.length === 1) {
      showWarning("At least one item is required");
      return;
    }

    setInventoryItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateInventoryItem = (
    itemId: string,
    updates: Partial<InventoryItem>
  ) => {
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...updates,
              // Auto-generate packaging size when size value or unit changes
              packagingSize:
                updates.packagingSizeValue !== undefined ||
                updates.packagingUnit !== undefined
                  ? `${updates.packagingSizeValue || item.packagingSizeValue} ${updates.packagingUnit || item.packagingUnit}`.trim()
                  : item.packagingSize,
            }
          : item
      )
    );
  };

  // Date/time picker handlers
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDateTime = new Date(stockAddDate);
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());
      setStockAddDate(newDateTime);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(stockAddDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setStockAddDate(newDateTime);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const validateForm = (): boolean => {
    for (let i = 0; i < inventoryItems.length; i++) {
      const item = inventoryItems[i];

      if (!item.productId || !item.productName) {
        showError(`Item ${i + 1}: Please select a product`);
        return false;
      }

      if (!item.supplierId || !item.supplierName) {
        showError(`Item ${i + 1}: Please select a supplier`);
        return false;
      }

      if (!item.packagingSizeValue || item.packagingSizeValue <= 0) {
        showError(`Item ${i + 1}: Please enter valid packaging size`);
        return false;
      }

      if (!item.packagingUnit.trim()) {
        showError(`Item ${i + 1}: Please enter packaging unit`);
        return false;
      }

      if (!item.batchNumber.trim()) {
        showError(`Item ${i + 1}: Please enter batch number`);
        return false;
      }

      if (!item.quantityAdded || item.quantityAdded <= 0) {
        showError(`Item ${i + 1}: Please enter valid quantity`);
        return false;
      }

      if (!item.buyPrice || item.buyPrice <= 0) {
        showError(`Item ${i + 1}: Please enter valid buy price`);
        return false;
      }

      if (!item.sellPrice || item.sellPrice <= 0) {
        showError(`Item ${i + 1}: Please enter valid sell price`);
        return false;
      }

      if (item.expiryDate <= item.mfgDate) {
        showError(
          `Item ${i + 1}: Expiry date must be after manufacturing date`
        );
        return false;
      }
    }

    return true;
  };

  const submitInventory = async () => {
    if (!validateForm()) {
      return;
    }

    showConfirmDialog({
      title: "Submit Inventory",
      message: `Are you sure you want to add ${inventoryItems.length} item(s) to inventory?`,
      onConfirm: async () => {
        await processSubmission();
      },
    });
  };

  const processSubmission = async () => {
    if (!user) {
      showError("User not authenticated");
      return;
    }

    try {
      setSubmitting(true);

      // Get user display name
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const userDisplayName =
        userData?.displayName || user.email || "Unknown User";

      // Prepare the inventory log payload
      const logPayload = {
        addedByUid: user.uid,
        addedByName: userDisplayName,
        addedAt: Timestamp.now(),
        items: inventoryItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          packagingSize: item.packagingSize,
          batchNumber: item.batchNumber,
          quantityAdded: item.quantityAdded,
          buyPrice: item.buyPrice,
          sellPrice: item.sellPrice,
          mfgDate: Timestamp.fromDate(item.mfgDate),
          expiryDate: Timestamp.fromDate(item.expiryDate),
        })),
      };

      // Add to inventory_logs collection
      await addDoc(collection(db, "inventory_logs"), logPayload);

      // TODO: In a real application, this would trigger a Cloud Function
      // For now, we'll directly update the inventory collection
      // This should be replaced with a Cloud Function call
      await updateInventoryDirect(inventoryItems);

      showSuccess(
        `Successfully added ${inventoryItems.length} item(s) to inventory`
      );

      // Reset form
      setInventoryItems([
        {
          id: Date.now().toString(),
          productId: "",
          productName: "",
          supplierId: "",
          supplierName: "",
          packagingSizeValue: 0,
          packagingUnit: "",
          packagingSize: "",
          batchNumber: "",
          quantityAdded: 0,
          buyPrice: 0,
          sellPrice: 0,
          mfgDate: new Date(),
          expiryDate: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error submitting inventory:", error);
      showError("Failed to add inventory. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Temporary direct inventory update - should be replaced with Cloud Function
  const updateInventoryDirect = async (items: InventoryItem[]) => {
    // This is a simplified version - in production, use Cloud Functions for atomicity
    for (const item of items) {
      try {
        // Create a unique inventory item
        const inventoryData = {
          productId: item.productId,
          productName: item.productName,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          packagingSize: item.packagingSize,
          packagingSizeValue: item.packagingSizeValue,
          packagingUnit: item.packagingUnit,
          batchNumber: item.batchNumber,
          quantity: item.quantityAdded,
          buyPrice: item.buyPrice,
          sellPrice: item.sellPrice,
          mfgDate: Timestamp.fromDate(item.mfgDate),
          expiryDate: Timestamp.fromDate(item.expiryDate),
          lastUpdated: Timestamp.now(),
        };

        await addDoc(collection(db, "inventory"), inventoryData);
      } catch (error) {
        console.error("Error updating inventory item:", error);
        throw error;
      }
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading products and suppliers..." />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.textSecondary + "20",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.headline,
              fontSize: 24,
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            Add Inventory
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            Add new stock items to your inventory
          </Text>
        </View>

        {/* Stock Add Date/Time Picker */}
        <View
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.textSecondary + "20",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textPrimary,
              marginBottom: 12,
              fontWeight: "600",
            }}
          >
            Stock Addition Date & Time
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.textSecondary + "30",
                borderRadius: 8,
                padding: 12,
                minHeight: 48,
                justifyContent: "center",
              }}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.textPrimary,
                }}
              >
                📅 {stockAddDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.textSecondary + "30",
                borderRadius: 8,
                padding: 12,
                minHeight: 48,
                justifyContent: "center",
              }}
              onPress={() => setShowTimePicker(true)}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.textPrimary,
                }}
              >
                🕒{" "}
                {stockAddDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textSecondary,
              marginTop: 8,
            }}
          >
            Current: {formatDateTime(stockAddDate)}
          </Text>
        </View>

        {/* Form Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {inventoryItems.map((item, index) => (
            <InventoryItemForm
              key={item.id}
              item={item}
              index={index}
              products={products}
              suppliers={suppliers}
              onUpdate={(updates) => updateInventoryItem(item.id, updates)}
              onRemove={() => removeInventoryItem(item.id)}
              onAddProduct={addNewProduct}
              onAddSupplier={addNewSupplier}
              showRemove={inventoryItems.length > 1}
            />
          ))}

          {/* Add Another Product Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.primary,
              borderStyle: "dashed",
              alignItems: "center",
              marginTop: 16,
            }}
            onPress={addInventoryItem}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                color: colors.primary,
                fontWeight: "600",
              }}
            >
              + Add Another Product
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={{
              backgroundColor: submitting
                ? colors.textSecondary
                : colors.primary,
              padding: 18,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 24,
              marginBottom: 40,
            }}
            onPress={submitInventory}
            disabled={submitting}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                color: colors.surface,
                fontWeight: "600",
              }}
            >
              {submitting
                ? "Adding to Inventory..."
                : `Add ${inventoryItems.length} Item(s) to Inventory`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={stockAddDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={stockAddDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

export default AddInventoryScreen;
