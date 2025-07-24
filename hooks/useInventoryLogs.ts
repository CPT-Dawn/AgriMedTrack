import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

export interface InventoryLogItem {
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  packagingSize: string;
  batchNumber: string;
  quantityAdded: number;
  buyPrice: number;
  sellPrice: number;
  mfgDate: Date;
  expiryDate: Date;
}

export interface InventoryLog {
  logId: string;
  addedByUid: string;
  addedByName: string;
  addedAt: Date;
  items: InventoryLogItem[];
  totalItems: number;
  totalValue: number;
}

interface FirestoreInventoryLog {
  logId: string;
  addedByUid: string;
  addedByName: string;
  addedAt: Timestamp;
  items: Array<{
    productId: string;
    productName: string;
    supplierId: string;
    supplierName: string;
    packagingSize: string;
    batchNumber: string;
    quantityAdded: number;
    buyPrice: number;
    sellPrice: number;
    mfgDate: Timestamp;
    expiryDate: Timestamp;
  }>;
}

export const useInventoryLogs = () => {
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Create a real-time listener for inventory_logs collection
    const logsQuery = query(
      collection(db, "inventory_logs"),
      orderBy("addedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        try {
          const logs: InventoryLog[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data() as FirestoreInventoryLog;

            // Convert Firestore Timestamps to JavaScript Dates
            const logItems: InventoryLogItem[] = data.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              supplierId: item.supplierId,
              supplierName: item.supplierName,
              packagingSize: item.packagingSize,
              batchNumber: item.batchNumber,
              quantityAdded: item.quantityAdded,
              buyPrice: item.buyPrice,
              sellPrice: item.sellPrice,
              mfgDate: item.mfgDate.toDate(),
              expiryDate: item.expiryDate.toDate(),
            }));

            // Calculate totals
            const totalItems = logItems.reduce(
              (sum, item) => sum + item.quantityAdded,
              0
            );
            const totalValue = logItems.reduce(
              (sum, item) => sum + item.quantityAdded * item.buyPrice,
              0
            );

            const log: InventoryLog = {
              logId: doc.id,
              addedByUid: data.addedByUid,
              addedByName: data.addedByName,
              addedAt: data.addedAt.toDate(),
              items: logItems,
              totalItems,
              totalValue,
            };

            logs.push(log);
          });

          setInventoryLogs(logs);
          setLoading(false);
        } catch (err) {
          console.error("Error processing inventory logs:", err);
          setError("Failed to load inventory logs");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to inventory logs:", err);
        setError("Failed to connect to inventory logs");
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const filterLogs = (logs: InventoryLog[], searchText: string) => {
    if (!searchText.trim()) return logs;

    const searchLower = searchText.toLowerCase();
    return logs.filter(
      (log) =>
        log.addedByName.toLowerCase().includes(searchLower) ||
        log.items.some(
          (item) =>
            item.productName.toLowerCase().includes(searchLower) ||
            item.supplierName.toLowerCase().includes(searchLower) ||
            item.batchNumber.toLowerCase().includes(searchLower)
        )
    );
  };

  return {
    inventoryLogs,
    loading,
    error,
    filterLogs,
  };
};
