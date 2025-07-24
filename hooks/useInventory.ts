import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { InventoryItem } from "../components/ProductCard";

export interface FirestoreInventoryItem {
  inventoryItemId: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  packagingSize: string;
  packagingSizeValue: number;
  packagingUnit: string;
  batchNumber: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  mfgDate: Timestamp;
  expiryDate: Timestamp;
  lastUpdated: Timestamp;
}

export const useInventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Create a real-time listener for inventory collection
    const inventoryQuery = query(
      collection(db, "inventory"),
      orderBy("lastUpdated", "desc")
    );

    const unsubscribe = onSnapshot(
      inventoryQuery,
      (snapshot) => {
        try {
          const items: InventoryItem[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data() as FirestoreInventoryItem;

            // Convert Firestore Timestamps to JavaScript Dates
            const item: InventoryItem = {
              inventoryItemId: doc.id,
              productId: data.productId,
              productName: data.productName,
              supplierId: data.supplierId,
              supplierName: data.supplierName,
              packagingSize: data.packagingSize,
              packagingSizeValue: data.packagingSizeValue,
              packagingUnit: data.packagingUnit,
              batchNumber: data.batchNumber,
              quantity: data.quantity,
              buyPrice: data.buyPrice,
              sellPrice: data.sellPrice,
              mfgDate: data.mfgDate.toDate(),
              expiryDate: data.expiryDate.toDate(),
              lastUpdated: data.lastUpdated.toDate(),
            };

            items.push(item);
          });

          setInventoryItems(items);
          setLoading(false);
        } catch (err) {
          console.error("Error processing inventory data:", err);
          setError("Failed to load inventory data");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to inventory:", err);
        setError("Failed to connect to inventory data");
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const filterItems = (items: InventoryItem[], searchText: string) => {
    if (!searchText.trim()) return items;

    const searchLower = searchText.toLowerCase();
    return items.filter(
      (item) =>
        item.productName.toLowerCase().includes(searchLower) ||
        item.supplierName.toLowerCase().includes(searchLower) ||
        item.batchNumber.toLowerCase().includes(searchLower) ||
        item.packagingSize.toLowerCase().includes(searchLower)
    );
  };

  return {
    inventoryItems,
    loading,
    error,
    filterItems,
  };
};
