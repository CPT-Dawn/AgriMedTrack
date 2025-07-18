import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { AddStockForm } from "../components/AddStockForm";
import { useStock } from "../hooks/useStock";

export default function EditStockScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // Debug log for route params
  console.log("EditStockScreen route.params:", route.params);
  const batchRaw = route.params && (route.params as any).batch;
  // Convert addedAt back to Date if it's a string
  const batch = batchRaw && {
    ...batchRaw,
    addedAt:
      typeof batchRaw.addedAt === "string"
        ? new Date(batchRaw.addedAt)
        : batchRaw.addedAt,
  };
  const {
    products,
    suppliers,
    sizes,
    getOrCreateProduct,
    getOrCreateSupplier,
    getOrCreateSize,
    addStockEntry,
  } = useStock();

  if (!batch) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", fontSize: 18, margin: 16 }}>
          Error: No batch data provided to Edit Stock page.
        </Text>
        <Text style={{ color: "gray", fontSize: 14 }}>
          Check navigation and ensure batch param is passed.
        </Text>
      </View>
    );
  }

  // Handler for editing stock (should update the batch)
  const handleEditStock = async (formData: any) => {
    await addStockEntry(formData, batch.addedBy); // You may want to implement a dedicated updateBatch function
    navigation.goBack();
  };

  // Prepare initialData and warnings using useMemo
  const { initialData, collectedWarnings } = useMemo(() => {
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

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", margin: 16 }}>
        Edit Stock
      </Text>
      {collectedWarnings.length > 0 && (
        <View
          style={{
            backgroundColor: "#fff3cd",
            padding: 12,
            marginHorizontal: 16,
            borderRadius: 8,
            marginBottom: 8,
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
  );
}
