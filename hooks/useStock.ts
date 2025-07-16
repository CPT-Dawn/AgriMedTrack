import { useCallback, useEffect, useState } from "react";
import {
  activityService,
  batchActivityService,
  productService,
  sizeService,
  stockService,
  supplierService,
} from "../services/mockStockService";
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

      const [
        productsData,
        suppliersData,
        sizesData,
        stockData,
        activitiesData,
        batchLogsData,
      ] = await Promise.all([
        productService.getAll(),
        supplierService.getAll(),
        sizeService.getAll(),
        stockService.getAll(),
        activityService.getRecent(20),
        batchActivityService.getBatchLogs(),
      ]);

      setProducts(productsData);
      setSuppliers(suppliersData);
      setSizes(sizesData);
      setStockEntries(stockData);
      setActivities(activitiesData);
      setBatchLogs(batchLogsData);
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
      let product = await productService.findByName(name);
      if (!product) {
        product = await productService.create(name);
        setProducts((prev) =>
          [...prev, product!].sort((a, b) => a.name.localeCompare(b.name))
        );
      }
      return product;
    },
    []
  );

  // Create or find supplier
  const getOrCreateSupplier = useCallback(
    async (name: string): Promise<Supplier> => {
      let supplier = await supplierService.findByName(name);
      if (!supplier) {
        supplier = await supplierService.create(name);
        setSuppliers((prev) =>
          [...prev, supplier!].sort((a, b) => a.name.localeCompare(b.name))
        );
      }
      return supplier;
    },
    []
  );

  // Create or find packaging size
  const getOrCreateSize = useCallback(
    async (label: string): Promise<PackagingSize> => {
      let size = await sizeService.findByLabel(label);
      if (!size) {
        // Extract unit from label (simple heuristic)
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

        size = await sizeService.create(label, unit);
        setSizes((prev) =>
          [...prev, size!].sort((a, b) => a.label.localeCompare(b.label))
        );
      }
      return size;
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

        // Check if this is a batch entry
        if ("items" in formData) {
          // Handle batch entry
          const batchId = Date.now().toString(); // Generate a batch ID

          // Process each item in the batch
          for (const item of formData.items) {
            // Ensure all related entities exist
            const product = await getOrCreateProduct(item.productName);
            const supplier = await getOrCreateSupplier(item.supplierName);
            const size = await getOrCreateSize(item.sizeLabel);

            // Create the stock entry with actual IDs and batch ID
            const entryData = {
              ...item,
              productId: product.id,
              supplierId: supplier.id,
              sizeId: size.id,
              batchId: batchId,
            };

            const newEntry = await stockService.create(entryData, userId);
            setStockEntries((prev) => [newEntry, ...prev]);

            // Log the activity with batch ID
            await activityService.logActivity({
              action: "added",
              stockEntryId: newEntry.id,
              productName: product.name,
              supplierName: supplier.name,
              sizeName: size.label,
              quantity: newEntry.quantity,
              updatedBy: userId,
              updatedByName: "Gopal", // In a real app, get from auth
              batchId: batchId,
            });
          }
        } else {
          // Handle single entry
          // Ensure all related entities exist
          const product = await getOrCreateProduct(formData.productName);
          const supplier = await getOrCreateSupplier(formData.supplierName);
          const size = await getOrCreateSize(formData.sizeLabel);

          // Create the stock entry with actual IDs
          const entryData = {
            ...formData,
            productId: product.id,
            supplierId: supplier.id,
            sizeId: size.id,
          };

          const newEntry = await stockService.create(entryData, userId);
          setStockEntries((prev) => [newEntry, ...prev]);

          // Log the activity
          await activityService.logActivity({
            action: "added",
            stockEntryId: newEntry.id,
            productName: product.name,
            supplierName: supplier.name,
            sizeName: size.label,
            quantity: newEntry.quantity,
            updatedBy: userId,
            updatedByName: "Gopal", // In a real app, get from auth
          });
        }
      } catch (err) {
        console.error("Error adding stock entry:", err);
        setError("Failed to add stock entry");
        throw err;
      }
    },
    [getOrCreateProduct, getOrCreateSupplier, getOrCreateSize]
  );

  // Update stock entry
  const updateStockEntry = useCallback(
    async (
      id: string,
      data: Partial<StockEntryFormData>,
      userId: string = "current-user"
    ): Promise<void> => {
      try {
        setError(null);
        await stockService.update(id, data, userId);

        // Refresh data
        const updatedEntries = await stockService.getAll();
        setStockEntries(updatedEntries);

        // Log the activity
        const entry = stockEntries.find((e) => e.id === id);
        if (entry) {
          const product = products.find((p) => p.id === entry.productId);
          const supplier = suppliers.find((s) => s.id === entry.supplierId);
          const size = sizes.find((sz) => sz.id === entry.sizeId);

          if (product && supplier && size) {
            await activityService.logActivity({
              action: "updated",
              stockEntryId: id,
              productName: product.name,
              supplierName: supplier.name,
              sizeName: size.label,
              quantity: data.quantity
                ? parseInt(data.quantity)
                : entry.quantity,
              updatedBy: userId,
            });
          }
        }
      } catch (err) {
        console.error("Error updating stock entry:", err);
        setError("Failed to update stock entry");
        throw err;
      }
    },
    [stockEntries, products, suppliers, sizes]
  );

  // Delete stock entry
  const deleteStockEntry = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await stockService.delete(id);
      setStockEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error("Error deleting stock entry:", err);
      setError("Failed to delete stock entry");
      throw err;
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up real-time listeners for activities
  useEffect(() => {
    const unsubscribe = activityService.onSnapshot(
      (newActivities: StockActivity[]) => {
        setActivities(newActivities);
      }
    );

    return unsubscribe;
  }, []);

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
    updateStockEntry,
    deleteStockEntry,
    refreshData: loadData,
    clearError: () => setError(null),

    // Utilities
    getOrCreateProduct,
    getOrCreateSupplier,
    getOrCreateSize,
  };
}
