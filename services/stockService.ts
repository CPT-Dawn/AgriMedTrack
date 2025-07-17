import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  BatchEntryFormData,
  PackagingSize,
  Product,
  Sale,
  StockActivity,
  StockBatch,
  StockEntry,
  Supplier,
} from "../types/stock";
import {
  convertDateToTimestamp,
  convertTimestampToDate,
  db,
  packagingSizesCollection,
  productsCollection,
  salesCollection,
  stockActivitiesCollection,
  stockBatchesCollection,
  stockEntriesCollection,
  suppliersCollection,
  uploadImage,
} from "./firebase";

// ===== PRODUCTS =====

export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(
      query(productsCollection, orderBy("name"))
    );

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        category: data.category,
        description: data.description,
        createdAt: convertTimestampToDate(data.createdAt),
      };
    });
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

export const getProduct = async (
  productId: string
): Promise<Product | null> => {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        category: data.category,
        description: data.description,
        createdAt: convertTimestampToDate(data.createdAt),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

export const createProduct = async (name: string): Promise<Product> => {
  try {
    const newProduct = {
      name,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(productsCollection, newProduct);

    return {
      id: docRef.id,
      name,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// ===== SUPPLIERS =====

export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const querySnapshot = await getDocs(
      query(suppliersCollection, orderBy("name"))
    );

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        contactInfo: data.contactInfo,
        createdAt: convertTimestampToDate(data.createdAt),
      };
    });
  } catch (error) {
    console.error("Error getting suppliers:", error);
    throw error;
  }
};

export const createSupplier = async (name: string): Promise<Supplier> => {
  try {
    const newSupplier = {
      name,
      contactInfo: {},
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(suppliersCollection, newSupplier);

    return {
      id: docRef.id,
      name,
      contactInfo: {},
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating supplier:", error);
    throw error;
  }
};

// ===== PACKAGING SIZES =====

export const getPackagingSizes = async (): Promise<PackagingSize[]> => {
  try {
    const querySnapshot = await getDocs(
      query(packagingSizesCollection, orderBy("label"))
    );

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        label: data.label,
        unit: data.unit,
        value: data.value || "",
        createdAt: convertTimestampToDate(data.createdAt),
      };
    });
  } catch (error) {
    console.error("Error getting packaging sizes:", error);
    throw error;
  }
};

export const createPackagingSize = async (
  label: string,
  sizeValue?: string,
  unit?: string
): Promise<PackagingSize> => {
  try {
    // If we have explicit size value and unit, use them
    if (sizeValue && unit) {
      const combinedLabel = `${sizeValue} ${unit}`;

      const newSize = {
        label: combinedLabel,
        unit,
        value: sizeValue,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(packagingSizesCollection, newSize);

      return {
        id: docRef.id,
        label: combinedLabel,
        unit,
        value: sizeValue,
        createdAt: new Date(),
      };
    }

    // Otherwise, try to extract unit from label (legacy approach)
    // Extract unit from label (e.g., "10mg tablet" -> "tablet")
    // This handles both combined format (10mg) and separate format where label might just be a unit
    let extractedUnit = "unit";
    let extractedValue = "";

    // Try to parse the label into a value and unit
    const match = label.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
    if (match) {
      extractedValue = match[1];
      extractedUnit = match[2];
    } else if (!isNaN(parseFloat(label))) {
      // If it's just a number
      extractedValue = label;
    } else {
      // If it's just a unit
      extractedUnit = label;
    }

    // Fallback checks for common units
    if (!extractedUnit || extractedUnit === "unit") {
      if (label.includes("tablet")) extractedUnit = "tablet";
      else if (label.includes("ml")) extractedUnit = "ml";
      else if (label.includes("vial")) extractedUnit = "vial";
      else if (label.includes("mg")) extractedUnit = "mg";
      else if (label.includes("g") && !label.includes("mg"))
        extractedUnit = "g";
      else if (label.includes("kg")) extractedUnit = "kg";
      else if (label.includes("L")) extractedUnit = "L";
      // If label is just a unit without a value, use it directly
      else if (
        ["tablet", "ml", "vial", "mg", "g", "kg", "L", "unit"].includes(
          label.toLowerCase()
        )
      ) {
        extractedUnit = label.toLowerCase();
      }
    }

    const newSize = {
      label,
      unit: extractedUnit,
      value: extractedValue,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(packagingSizesCollection, newSize);

    return {
      id: docRef.id,
      label,
      unit: extractedUnit,
      value: extractedValue,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating packaging size:", error);
    throw error;
  }
};

// ===== STOCK ENTRIES =====

export const getStockEntries = async (): Promise<StockEntry[]> => {
  try {
    const querySnapshot = await getDocs(
      query(stockEntriesCollection, orderBy("createdAt", "desc"))
    );

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        productId: data.productId,
        supplierId: data.supplierId,
        sizeId: data.sizeId,
        quantity: data.quantity,
        buyPrice: data.buyPrice,
        sellPrice: data.sellPrice,
        billImageUrl: data.billImageUrl,
        notes: data.notes,
        batchId: data.batchId,
        updatedBy: data.updatedBy,
        updatedAt: convertTimestampToDate(data.updatedAt),
        createdAt: convertTimestampToDate(data.createdAt),
      };
    });
  } catch (error) {
    console.error("Error getting stock entries:", error);
    throw error;
  }
};

// ===== STOCK ACTIVITIES =====

export const getStockActivities = async (): Promise<StockActivity[]> => {
  try {
    const querySnapshot = await getDocs(
      query(stockActivitiesCollection, orderBy("timestamp", "desc"))
    );

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        action: data.action,
        stockEntryId: data.stockEntryId,
        productName: data.productName,
        supplierName: data.supplierName,
        sizeName: data.sizeName,
        quantity: data.quantity,
        buyPrice: data.buyPrice,
        sellPrice: data.sellPrice,
        batchId: data.batchId,
        updatedBy: data.updatedBy,
        updatedByName: data.updatedByName,
        timestamp: convertTimestampToDate(data.timestamp),
      };
    });
  } catch (error) {
    console.error("Error getting stock activities:", error);
    throw error;
  }
};

// ===== STOCK BATCHES =====

export const getStockBatches = async (): Promise<StockBatch[]> => {
  try {
    const querySnapshot = await getDocs(
      query(stockBatchesCollection, orderBy("addedAt", "desc"))
    );

    const batches = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Get activities for this batch
        const activitiesSnapshot = await getDocs(
          query(
            stockActivitiesCollection,
            where("batchId", "==", doc.id),
            orderBy("timestamp", "desc")
          )
        );

        const items = activitiesSnapshot.docs.map((activityDoc) => {
          const activityData = activityDoc.data();
          return {
            id: activityDoc.id,
            action: activityData.action,
            stockEntryId: activityData.stockEntryId,
            productName: activityData.productName,
            supplierName: activityData.supplierName,
            sizeName: activityData.sizeName,
            quantity: activityData.quantity,
            buyPrice: activityData.buyPrice,
            sellPrice: activityData.sellPrice,
            batchId: activityData.batchId,
            updatedBy: activityData.updatedBy,
            updatedByName: activityData.updatedByName,
            timestamp: convertTimestampToDate(activityData.timestamp),
          };
        });

        return {
          id: doc.id,
          addedBy: data.addedBy,
          addedByName: data.addedByName,
          addedAt: convertTimestampToDate(data.addedAt),
          billUrl: data.billUrl,
          billThumbnail: data.billThumbnail,
          items,
        };
      })
    );

    return batches;
  } catch (error) {
    console.error("Error getting stock batches:", error);
    throw error;
  }
};

export const deleteBatch = async (batchId: string): Promise<void> => {
  try {
    // 1. Get all stock entries for this batch
    const entriesSnapshot = await getDocs(
      query(stockEntriesCollection, where("batchId", "==", batchId))
    );

    // 2. Get all activities for this batch
    const activitiesSnapshot = await getDocs(
      query(stockActivitiesCollection, where("batchId", "==", batchId))
    );

    // 3. Delete all stock entries
    const entryDeletePromises = entriesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );

    // 4. Delete all activities
    const activityDeletePromises = activitiesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );

    // 5. Wait for all deletions to complete
    await Promise.all([...entryDeletePromises, ...activityDeletePromises]);

    // 6. Delete the batch document itself
    await deleteDoc(doc(db, "stockBatches", batchId));

    console.log(`Batch ${batchId} and all related data deleted successfully`);
  } catch (error) {
    console.error("Error deleting batch:", error);
    throw error;
  }
};

// ===== ADD STOCK ENTRY =====

export const addStockEntryBatch = async (
  formData: BatchEntryFormData,
  userId: string = "current-user"
): Promise<void> => {
  try {
    // Get user information
    let userName = "User";
    let userAvatar = "";

    // Try to get user information if we have a valid userId
    if (userId && userId !== "unknown-user" && userId !== "current-user") {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName = userData.name || "User";
          userAvatar = userData.avatar || "";
        }
      } catch (userError) {
        console.error("Error fetching user data:", userError);
      }
    }

    // 1. Create batch document
    const batchData: {
      addedBy: string;
      addedByName: string;
      addedByAvatar?: string;
      addedAt: any;
      billUrl?: string;
      billThumbnail?: string;
    } = {
      addedBy: userId,
      addedByName: userName,
      addedAt: serverTimestamp(),
    };

    // Add avatar if available
    if (userAvatar) {
      batchData.addedByAvatar = userAvatar;
    }

    // Upload bill image if provided
    if (formData.billImage) {
      const fileName = `bill_${Date.now()}.jpg`;
      const billUrl = await uploadImage(
        formData.billImage.uri,
        "bills",
        fileName
      );

      // Add bill URL to batch data
      batchData.billUrl = billUrl;
      // In a real app, you would generate a thumbnail here
      batchData.billThumbnail = billUrl;
    }

    // Add batch to Firestore
    const batchRef = await addDoc(stockBatchesCollection, batchData);
    const batchId = batchRef.id;

    // 2. Process each item in the batch
    for (const item of formData.items) {
      // Get or create product, supplier, and size
      let productId = item.productId;
      let supplierId = item.supplierId;
      let sizeId = item.sizeId;

      // If IDs are empty strings, create new entries
      if (!productId) {
        const product = await createProduct(item.productName);
        productId = product.id;
      }

      if (!supplierId) {
        const supplier = await createSupplier(item.supplierName);
        supplierId = supplier.id;
      }

      if (!sizeId) {
        // Create a size entry with separate value and unit
        let size;
        if (item.sizeValue && item.unit) {
          // Use the new approach with separate value and unit
          size = await createPackagingSize("", item.sizeValue, item.unit);
        } else if (item.sizeLabel) {
          // Fallback to the legacy approach
          size = await createPackagingSize(item.sizeLabel);
        } else {
          // Create a default size if nothing is provided
          size = await createPackagingSize("unit");
        }
        sizeId = size.id;
      }

      // Create combined sizeLabel if not already set
      if (!item.sizeLabel && item.sizeValue && item.unit) {
        item.sizeLabel = `${item.sizeValue} ${item.unit}`;
      }

      // Create stock entry
      const stockEntryData = {
        productId,
        supplierId,
        sizeId,
        quantity: parseInt(item.quantity),
        buyPrice: item.buyPrice ? parseFloat(item.buyPrice) : null,
        sellPrice: item.sellPrice ? parseFloat(item.sellPrice) : null,
        notes: item.notes || "",
        batchId,
        updatedBy: userId,
        updatedByName: userName,
        updatedByAvatar: userAvatar || "",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const stockEntryRef = await addDoc(
        stockEntriesCollection,
        stockEntryData
      );

      // Create activity log
      const activityData = {
        action: "added",
        stockEntryId: stockEntryRef.id,
        productName: item.productName,
        supplierName: item.supplierName,
        sizeName: item.sizeLabel,
        quantity: parseInt(item.quantity),
        buyPrice: item.buyPrice ? parseFloat(item.buyPrice) : null,
        sellPrice: item.sellPrice ? parseFloat(item.sellPrice) : null,
        batchId,
        updatedBy: userId,
        updatedByName: userName,
        updatedByAvatar: userAvatar || "",
        timestamp: serverTimestamp(),
      };

      await addDoc(stockActivitiesCollection, activityData);
    }
  } catch (error) {
    console.error("Error adding stock entry batch:", error);
    throw error;
  }
};

// Helper function to update stock quantities after a sale
export const updateStockQuantity = async (
  productId: string,
  sizeLabel: string,
  quantitySold: number
): Promise<void> => {
  try {
    // Find all stock entries for this product and size
    const entriesSnapshot = await getDocs(
      query(stockEntriesCollection, where("productId", "==", productId))
    );

    // Define a type for the entry with the fields we need
    type StockEntryWithFields = {
      id: string;
      productId: string;
      sizeId: string;
      quantity: number;
      createdAt: Timestamp;
      productName?: string;
      supplierName?: string;
      sizeLabel?: string;
      sizeName?: string;
      buyPrice?: number | null;
      sellPrice?: number | null;
      [key: string]: any; // Allow other fields
    };

    // Filter entries by size label (since we don't have direct sizeId in sale items)
    const matchingEntries = entriesSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as StockEntryWithFields))
      .filter((entry) => {
        // Get the size document to check its label
        return entry.sizeLabel === sizeLabel || entry.sizeName === sizeLabel;
      });

    if (matchingEntries.length === 0) {
      console.warn(
        `No stock entries found for product ${productId} with size ${sizeLabel}`
      );
      return;
    }

    // Sort entries by creation date (oldest first)
    matchingEntries.sort((a, b) => {
      const dateA =
        a.createdAt instanceof Timestamp ? a.createdAt.toDate().getTime() : 0;
      const dateB =
        b.createdAt instanceof Timestamp ? b.createdAt.toDate().getTime() : 0;
      return dateA - dateB;
    });

    let remainingQuantity = quantitySold;

    // Update entries until we've accounted for all sold quantity
    for (const entry of matchingEntries) {
      if (remainingQuantity <= 0) break;

      const entryRef = doc(stockEntriesCollection, entry.id);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) continue;

      const entryData = entryDoc.data();
      const currentQuantity = entryData.quantity || 0;

      if (currentQuantity <= 0) continue;

      // Calculate how much to deduct from this entry
      const deduction = Math.min(currentQuantity, remainingQuantity);
      const newQuantity = currentQuantity - deduction;

      // Update the entry with new quantity
      await updateDoc(entryRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      });

      // Create activity log for the stock reduction
      const activityData = {
        action: "sold",
        stockEntryId: entry.id,
        productName: entryData.productName || "",
        supplierName: entryData.supplierName || "",
        sizeName: sizeLabel,
        quantity: deduction,
        buyPrice: entryData.buyPrice || null,
        sellPrice: entryData.sellPrice || null,
        updatedBy: "system-sale",
        timestamp: serverTimestamp(),
      };

      await addDoc(stockActivitiesCollection, activityData);

      remainingQuantity -= deduction;
    }

    if (remainingQuantity > 0) {
      console.warn(
        `Not enough stock for product ${productId} with size ${sizeLabel}. Remaining quantity: ${remainingQuantity}`
      );
    }
  } catch (error) {
    console.error("Error updating stock quantity:", error);
    throw error;
  }
};

// ===== SALES =====

export const addSale = async (
  saleData: Sale,
  userId: string = "current-user"
): Promise<string> => {
  try {
    // Create sale document
    const sale = {
      buyer: saleData.buyer || "",
      addedBy: userId,
      paymentStatus: saleData.paymentStatus || "Paid",
      saleDate:
        typeof saleData.saleDate === "string"
          ? convertDateToTimestamp(new Date(saleData.saleDate))
          : convertDateToTimestamp(saleData.saleDate as Date),
      notes: saleData.notes || "",
      totalAmount: saleData.totalAmount || 0,
      discount: saleData.discount || 0,
      tax: saleData.tax || 0,
      createdAt: serverTimestamp(),
    };

    // Add sale to Firestore
    const saleRef = await addDoc(salesCollection, sale);
    const saleId = saleRef.id;

    // Add sale items as subcollection
    const itemsCollection = collection(db, "sales", saleId, "items");

    // Process each sale item
    for (const item of saleData.items) {
      const saleItemData = {
        productId: item.productId || "",
        productName: item.productName,
        sizeLabel: item.sizeLabel,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        totalPrice: item.totalPrice || 0,
        supplierId: item.supplierId || "",
        supplierName: item.supplierName || "",
      };

      await addDoc(itemsCollection, saleItemData);

      // Create activity log for the sale
      const activityData = {
        action: "sold",
        stockEntryId: "", // No direct reference to stock entry
        productName: item.productName,
        supplierName: item.supplierName || "",
        sizeName: item.sizeLabel,
        quantity: parseFloat(item.quantity) || 0,
        buyPrice: null,
        sellPrice: parseFloat(item.unitPrice) || 0,
        batchId: null,
        updatedBy: userId,
        updatedByName: "User", // Replace with actual user name
        timestamp: serverTimestamp(),
      };

      await addDoc(stockActivitiesCollection, activityData);

      // Update stock quantities
      if (item.productId) {
        await updateStockQuantity(
          item.productId,
          item.sizeLabel,
          parseFloat(item.quantity) || 0
        );
      }
    }

    return saleId;
  } catch (error) {
    console.error("Error adding sale:", error);
    throw error;
  }
};

export const getSales = async (): Promise<Sale[]> => {
  try {
    const querySnapshot = await getDocs(
      query(salesCollection, orderBy("createdAt", "desc"))
    );

    const sales = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Get items for this sale
        const itemsSnapshot = await getDocs(
          collection(db, "sales", doc.id, "items")
        );

        const items = itemsSnapshot.docs.map((itemDoc) => {
          const itemData = itemDoc.data();
          return {
            id: itemDoc.id,
            productId: itemData.productId || "",
            productName: itemData.productName || "",
            sizeLabel: itemData.sizeLabel || "",
            quantity: String(itemData.quantity || 0),
            unitPrice: String(itemData.unitPrice || 0),
            totalPrice: itemData.totalPrice || 0,
            supplierId: itemData.supplierId,
            supplierName: itemData.supplierName,
          };
        });

        return {
          id: doc.id,
          buyer: data.buyer || "",
          addedBy: data.addedBy || "",
          paymentStatus: data.paymentStatus || "Paid",
          saleDate: convertTimestampToDate(data.saleDate),
          notes: data.notes || "",
          totalAmount: data.totalAmount || 0,
          discount: data.discount || 0,
          tax: data.tax || 0,
          createdAt: convertTimestampToDate(data.createdAt),
          items,
        };
      })
    );

    return sales;
  } catch (error) {
    console.error("Error getting sales:", error);
    throw error;
  }
};

// Get available stock for a specific product and size
export const getAvailableStock = async (
  productId: string,
  sizeLabel: string
): Promise<number> => {
  try {
    // Define types for the entries and sizes
    type StockEntryData = {
      id: string;
      productId: string;
      sizeId?: string;
      sizeLabel?: string;
      sizeName?: string;
      quantity: number;
      [key: string]: any;
    };

    type SizeData = {
      id: string;
      label: string;
      unit: string;
      [key: string]: any;
    };

    // Find all stock entries for this product
    const entriesSnapshot = await getDocs(
      query(stockEntriesCollection, where("productId", "==", productId))
    );

    // Get all entries and filter by size label
    const entries: StockEntryData[] = entriesSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as StockEntryData)
    );

    // Get all size documents to match by label
    const sizesSnapshot = await getDocs(packagingSizesCollection);
    const sizes: SizeData[] = sizesSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as SizeData)
    );

    // Find entries with matching size label
    let totalQuantity = 0;

    for (const entry of entries) {
      // If entry has sizeLabel or sizeName directly, check it
      if (entry.sizeLabel === sizeLabel || entry.sizeName === sizeLabel) {
        totalQuantity += entry.quantity || 0;
        continue;
      }

      // Otherwise, look up the size by ID
      if (entry.sizeId) {
        const matchingSize = sizes.find((size) => size.id === entry.sizeId);
        if (matchingSize && matchingSize.label === sizeLabel) {
          totalQuantity += entry.quantity || 0;
        }
      }
    }

    return totalQuantity;
  } catch (error) {
    console.error("Error getting available stock:", error);
    return 0; // Return 0 if there's an error
  }
};
