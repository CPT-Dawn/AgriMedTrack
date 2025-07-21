import { useCallback, useEffect, useState } from "react";
import {
  addStockEntryBatch,
  createPackagingSize,
  createProduct,
  createSupplier,
  deleteBatch,
  getPackagingSizes,
  getProducts,
  getSales,
  getStockActivities,
  getStockBatches,
  getStockEntries,
  getSuppliers,
  updateStockBatch,
} from "../services/stockService";
import {
  BatchEntryFormData,
  PackagingSize,
  Product,
  Sale,
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
  const [sales, setSales] = useState<Sale[]>([]);
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

          // Group by packaging (was size)
          const packagingGroups = sizes
            .map((size) => {
              const sizeEntries = supplierEntries.filter(
                (entry) => entry.packagingId === size.id
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
                size: {
                  id: size.id,
                  label: size.label,
                  pack: size.pack,
                  unit: size.unit,
                },
                quantity: totalQuantity,
                lastUpdated: lastEntry.updatedAt,
                updatedBy: lastEntry.updatedBy,
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          if (packagingGroups.length === 0) return null;

          return {
            supplier,
            sizes: packagingGroups,
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

      // Fetch data from Firebase
      const [
        productsData,
        suppliersData,
        sizesData,
        entriesData,
        activitiesData,
        batchesData,
        salesData,
      ] = await Promise.all([
        getProducts(),
        getSuppliers(),
        getPackagingSizes(),
        getStockEntries(),
        getStockActivities(),
        getStockBatches(),
        getSales(),
      ]);

      setProducts(productsData);
      setSuppliers(suppliersData);
      setSizes(sizesData);
      setStockEntries(entriesData);
      setActivities(activitiesData);
      setBatchLogs(batchesData);
      setSales(salesData);
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
      // Check if product already exists
      const existingProduct = products.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );

      if (existingProduct) {
        return existingProduct;
      }

      // Create new product
      const newProduct = await createProduct(name);

      // Update local state
      setProducts((prev) =>
        [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name))
      );

      return newProduct;
    },
    [products]
  );

  // Create or find supplier
  const getOrCreateSupplier = useCallback(
    async (name: string): Promise<Supplier> => {
      // Check if supplier already exists
      const existingSupplier = suppliers.find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );

      if (existingSupplier) {
        return existingSupplier;
      }

      // Create new supplier
      const newSupplier = await createSupplier(name);

      // Update local state
      setSuppliers((prev) =>
        [...prev, newSupplier].sort((a, b) => a.name.localeCompare(b.name))
      );

      return newSupplier;
    },
    [suppliers]
  );

  // Create or find packaging size
  const getOrCreateSize = useCallback(
    async (label: string): Promise<PackagingSize> => {
      // Check if size already exists
      const existingSize = sizes.find(
        (s) => s.label.toLowerCase() === label.toLowerCase()
      );

      if (existingSize) {
        return existingSize;
      }

      // Create new size
      const newSize = await createPackagingSize(label);

      // Update local state
      setSizes((prev) =>
        [...prev, newSize].sort((a, b) => a.label.localeCompare(b.label))
      );

      return newSize;
    },
    [sizes]
  );

  // Add new stock entry
  const addStockEntry = useCallback(
    async (
      formData: StockEntryFormData | BatchEntryFormData,
      userId: string = "current-user"
    ): Promise<void> => {
      try {
        setError(null);

        // Add stock entry batch to Firestore
        await addStockEntryBatch(formData as BatchEntryFormData, userId);

        // Refresh data to get the latest entries
        await loadData();
      } catch (err) {
        console.error("Error adding stock entry:", err);
        setError("Failed to add stock entry");
        throw err;
      }
    },
    [loadData]
  );

  // Delete batch
  const deleteStockBatch = useCallback(
    async (batchId: string): Promise<void> => {
      try {
        setError(null);
        setLoading(true);

        // Delete the batch from Firestore
        await deleteBatch(batchId);

        // Refresh data to update the UI
        await loadData();
      } catch (err) {
        console.error("Error deleting batch:", err);
        setError("Failed to delete batch");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadData]
  );

  // Update stock batch
  const updateStockBatchEntry = useCallback(
    async (
      batchId: string,
      formData: BatchEntryFormData,
      userId: string = "current-user"
    ): Promise<void> => {
      try {
        setError(null);
        setLoading(true);

        // Update the batch in Firestore
        await updateStockBatch(batchId, formData, userId);

        // Refresh data to update the UI
        await loadData();
      } catch (err) {
        console.error("Error updating batch:", err);
        setError("Failed to update batch");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadData]
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
    sales,

    // State
    loading,
    error,

    // Actions
    addStockEntry,
    deleteStockBatch,
    updateStockBatchEntry,
    refreshData: loadData,
    clearError: clearError,

    // Utilities
    getOrCreateProduct,
    getOrCreateSupplier,
    getOrCreateSize,
  };
}
