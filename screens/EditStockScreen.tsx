import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddStockForm } from "../components/AddStockForm";
import { Theme } from "../constants/Theme";
import { useStock } from "../hooks/useStock";

export default function EditStockScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Debug log for route params
  console.log("EditStockScreen params:", params);
  const batchRaw = params.batch ? JSON.parse(params.batch as string) : null;
  // Convert addedAt back to Date if it's a string
  const batch = useMemo(() => {
    if (!batchRaw) return null;
    return {
      ...batchRaw,
      addedAt:
        typeof batchRaw.addedAt === "string"
          ? new Date(batchRaw.addedAt)
          : batchRaw.addedAt,
    };
  }, [batchRaw]);
  const {
    products,
    suppliers,
    sizes,
    getOrCreateProduct,
    getOrCreateSupplier,
    getOrCreateSize,
    updateStockBatchEntry,
  } = useStock();

  // Prepare initialData and warnings using useMemo - moved before early return
  const { initialData, collectedWarnings } = useMemo(() => {
    if (!batch) {
      return { initialData: undefined, collectedWarnings: [] };
    }

    const localWarnings: string[] = [];
    const findIdByName = (
      arr: { id: string; name?: string; label?: string }[],
      value: string,
      type: string,
      idx: number
    ) => {
      if (!value) return "";
      const match = arr.find(
        (item) =>
          (item.name &&
            item.name.trim().toLowerCase() === value.trim().toLowerCase()) ||
          (item.label &&
            item.label.trim().toLowerCase() === value.trim().toLowerCase())
      );
      if (!match) {
        localWarnings.push(
          `Could not find ${type} for item #${idx + 1}: "${value}"`
        );
      }
      return match ? match.id : "";
    };

    return {
      initialData: {
        addedBy: batch.addedBy,
        items: batch.items.map((item: any, idx: number) => ({
          productId: findIdByName(products, item.productName, "product", idx),
          productName: item.productName,
          supplierId: findIdByName(
            suppliers,
            item.supplierName,
            "supplier",
            idx
          ),
          supplierName: item.supplierName,
          packagingId: findIdByName(sizes, item.sizeName, "packaging", idx),
          packaging: item.sizeName,
          quantity: item.quantity.toString(),
          sellPrice: item.sellPrice?.toString() || "",
        })),
      },
      collectedWarnings: localWarnings,
    };
  }, [batch, products, suppliers, sizes]);

  if (!batch) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Theme.colors.background }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "red", fontSize: 18, margin: 16 }}>
            Error: No batch data provided to Edit Stock page.
          </Text>
          <Text style={{ color: "gray", fontSize: 14 }}>
            Check navigation and ensure batch param is passed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handler for editing stock (should update the batch)
  const handleEditStock = async (formData: any) => {
    try {
      // Use the proper update function for existing batches
      await updateStockBatchEntry(batch.id, formData, batch.addedBy);
      router.back();
    } catch (error) {
      console.error("Error updating stock:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: Theme.colors.border,
          backgroundColor: Theme.colors.surface,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 8,
            marginRight: 12,
          }}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Theme.colors.text}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: Theme.colors.text,
          }}
        >
          Edit Stock
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {collectedWarnings.length > 0 && (
          <View
            style={{
              backgroundColor: "#fff3cd",
              padding: 12,
              marginHorizontal: 16,
              borderRadius: 8,
              marginBottom: 8,
              marginTop: 16,
            }}
          >
            {collectedWarnings.map((w, i) => (
              <Text key={i} style={{ color: "#856404", fontSize: 14 }}>
                {w}
              </Text>
            ))}
          </View>
        )}
        <AddStockForm
          onSubmit={handleEditStock}
          products={products}
          suppliers={suppliers}
          sizes={sizes}
          getOrCreateProduct={getOrCreateProduct}
          getOrCreateSupplier={getOrCreateSupplier}
          getOrCreateSize={getOrCreateSize}
          initialData={initialData}
        />
      </View>
    </SafeAreaView>
  );
}
