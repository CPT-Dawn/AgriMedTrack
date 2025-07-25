import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { Sale, InventoryItemForSale } from "../types/sales";

interface FirestoreSale {
  saleId: string;
  billNumber: string;
  customerId: string;
  customerName: string;
  soldByUid: string;
  soldByName: string;
  saleDate: Timestamp;
  totalAmount: number;
  totalProfit: number;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  amountPaid: number;
  amountPending: number;
}

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Create a real-time listener for sales collection
    const salesQuery = query(
      collection(db, "sales"),
      orderBy("saleDate", "desc")
    );

    const unsubscribe = onSnapshot(
      salesQuery,
      (snapshot) => {
        try {
          const salesData: Sale[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data() as FirestoreSale;

            const sale: Sale = {
              saleId: doc.id,
              billNumber: data.billNumber,
              customerId: data.customerId,
              customerName: data.customerName,
              soldByUid: data.soldByUid,
              soldByName: data.soldByName,
              saleDate: data.saleDate.toDate(),
              totalAmount: data.totalAmount,
              totalProfit: data.totalProfit,
              paymentStatus: data.paymentStatus,
              amountPaid: data.amountPaid,
              amountPending: data.amountPending,
            };

            salesData.push(sale);
          });

          setSales(salesData);
          setLoading(false);
        } catch (err) {
          console.error("Error processing sales data:", err);
          setError("Failed to load sales data");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to sales:", err);
        setError("Failed to connect to sales data");
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const filterSales = (sales: Sale[], searchText: string) => {
    if (!searchText.trim()) return sales;

    const searchLower = searchText.toLowerCase();
    return sales.filter(
      (sale) =>
        sale.customerName.toLowerCase().includes(searchLower) ||
        sale.billNumber.toLowerCase().includes(searchLower) ||
        sale.paymentStatus.toLowerCase().includes(searchLower)
    );
  };

  return {
    sales,
    loading,
    error,
    filterSales,
  };
};

export const useAvailableInventory = () => {
  const [availableItems, setAvailableItems] = useState<InventoryItemForSale[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all inventory items with quantity > 0
      const inventoryQuery = query(
        collection(db, "inventory"),
        where("quantity", ">", 0),
        orderBy("productName")
      );

      const snapshot = await getDocs(inventoryQuery);
      const items: InventoryItemForSale[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const item: InventoryItemForSale = {
          inventoryItemId: doc.id,
          productId: data.productId,
          productName: data.productName,
          supplierId: data.supplierId,
          supplierName: data.supplierName,
          packagingSize: data.packagingSize,
          batchNumber: data.batchNumber,
          quantity: data.quantity,
          sellPrice: data.sellPrice,
          buyPrice: data.buyPrice,
        };
        items.push(item);
      });

      setAvailableItems(items);
    } catch (err) {
      console.error("Error loading available inventory:", err);
      setError("Failed to load available inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableInventory();
  }, []);

  const getProductOptions = () => {
    const uniqueProducts = Array.from(
      new Set(availableItems.map((item) => item.productName))
    ).map((productName) => {
      const item = availableItems.find((i) => i.productName === productName);
      return {
        label: productName,
        value: item?.productId || "",
      };
    });
    return uniqueProducts;
  };

  const getSupplierOptions = (productId: string) => {
    const filteredItems = availableItems.filter(
      (item) => item.productId === productId
    );
    const uniqueSuppliers = Array.from(
      new Set(filteredItems.map((item) => item.supplierName))
    ).map((supplierName) => {
      const item = filteredItems.find((i) => i.supplierName === supplierName);
      return {
        label: supplierName,
        value: item?.supplierId || "",
      };
    });
    return uniqueSuppliers;
  };

  const getPackagingOptions = (productId: string, supplierId: string) => {
    const filteredItems = availableItems.filter(
      (item) => item.productId === productId && item.supplierId === supplierId
    );
    return filteredItems.map((item) => ({
      label: item.packagingSize,
      value: item.packagingSize,
    }));
  };

  const getBatchOptions = (
    productId: string,
    supplierId: string,
    packagingSize: string
  ) => {
    const filteredItems = availableItems.filter(
      (item) =>
        item.productId === productId &&
        item.supplierId === supplierId &&
        item.packagingSize === packagingSize
    );
    return filteredItems.map((item) => ({
      label: item.batchNumber,
      value: item.batchNumber,
      inventoryItem: item,
    }));
  };

  const getInventoryItem = (
    productId: string,
    supplierId: string,
    packagingSize: string,
    batchNumber: string
  ) => {
    return availableItems.find(
      (item) =>
        item.productId === productId &&
        item.supplierId === supplierId &&
        item.packagingSize === packagingSize &&
        item.batchNumber === batchNumber
    );
  };

  return {
    availableItems,
    loading,
    error,
    getProductOptions,
    getSupplierOptions,
    getPackagingOptions,
    getBatchOptions,
    getInventoryItem,
    refreshInventory: loadAvailableInventory,
  };
};
