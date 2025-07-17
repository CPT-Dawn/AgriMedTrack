import { useCallback, useEffect, useState } from "react";
import {
  BatchEntryFormData,
  PackagingSize,
  Product,
  StockActivity,
  StockBatch,
  StockEntry,
  StockEntryFormData,
  StockItem,
  Supplier,
} from "../types/stock";

export function useStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sizes, setSizes] = useState<PackagingSize[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [batchLogs, setBatchLogs] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed stock items with aggregated data
  const stockItems: StockItem[] = products
    .map((product) => {
      const productEntries = stockEntries.filter(
        (entry) => entry.productId === product.id
      );

      // Group by supplier
      const supplierGroups = suppliers
        .map((supplier) => {
          const supplierEntries = productEntries.filter(
            (entry) => entry.supplierId === supplier.id
          );

          if (supplierEntries.length === 0) return null;

          // Group by size
          const sizeGroups = sizes
            .map((size) => {
              const sizeEntries = supplierEntries.filter(
                (entry) => entry.sizeId === size.id
              );

              if (sizeEntries.length === 0) return null;

              const totalQuantity = sizeEntries.reduce(
                (sum, entry) => sum + entry.quantity,
                0
              );
              const lastEntry = sizeEntries.sort(
                (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
              )[0];

              return {
                size,
                quantity: totalQuantity,
                lastUpdated: lastEntry.updatedAt,
                updatedBy: lastEntry.updatedBy,
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          if (sizeGroups.length === 0) return null;

          return {
            supplier,
            sizes: sizeGroups,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const totalQuantity = productEntries.reduce(
        (sum, entry) => sum + entry.quantity,
        0
      );

      return {
        id: product.id,
        product,
        suppliers: supplierGroups,
        totalQuantity,
      };
    })
    .filter((item) => item.totalQuantity > 0); // Only show items with stock

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, set empty arrays since Firebase is not configured
      setProducts([]);
      setSuppliers([]);
      setSizes([]);
      setStockEntries([]);
      setActivities([]);
      setBatchLogs([]);
    } catch (err) {
      console.error("Error loading stock data:", err);
      setError("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create or find product
  const getOrCreateProduct = useCallback(
    async (name: string): Promise<Product> => {
      // For now, return a mock product since Firebase is not configured
      const newProduct: Product = {
        id: Date.now().toString(),
        name,
        createdAt: new Date(),
      };
      setProducts((prev) =>
        [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name))
      );
      return newProduct;
    },
    []
  );

  // Create or find supplier
  const getOrCreateSupplier = useCallback(
    async (name: string): Promise<Supplier> => {
      // For now, return a mock supplier since Firebase is not configured
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        name,
        createdAt: new Date(),
      };
      setSuppliers((prev) =>
        [...prev, newSupplier].sort((a, b) => a.name.localeCompare(b.name))
      );
      return newSupplier;
    },
    []
  );

  // Create or find packaging size
  const getOrCreateSize = useCallback(
    async (label: string): Promise<PackagingSize> => {
      // For now, return a mock size since Firebase is not configured
      const unit = label.includes("tablet")
        ? "tablet"
        : label.includes("ml")
        ? "ml"
        : label.includes("vial")
        ? "vial"
        : label.includes("mg")
        ? "mg"
        : label.includes("g")
        ? "g"
        : "unit";

      const newSize: PackagingSize = {
        id: Date.now().toString(),
        label,
        unit,
        createdAt: new Date(),
      };
      setSizes((prev) =>
        [...prev, newSize].sort((a, b) => a.label.localeCompare(b.label))
      );
      return newSize;
    },
    []
  );

  // Add new stock entry
  const addStockEntry = useCallback(
    async (
      formData: StockEntryFormData | BatchEntryFormData,
      userId: string = "current-user"
    ): Promise<void> => {
      try {
        setError(null);
        // For now, just log the data since Firebase is not configured
        console.log("Adding stock entry:", formData);
      } catch (err) {
        console.error("Error adding stock entry:", err);
        setError("Failed to add stock entry");
        throw err;
      }
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    products,
    suppliers,
    sizes,
    stockEntries,
    stockItems,
    activities,
    batchLogs,

    // State
    loading,
    error,

    // Actions
    addStockEntry,
    refreshData: loadData,
    clearError: clearError,

    // Utilities
    getOrCreateProduct,
    getOrCreateSupplier,
    getOrCreateSize,
  };
}
