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
  label: string
): Promise<PackagingSize> => {
  try {
    const newSize = {
      label,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(packagingSizesCollection, newSize);
    return {
      id: docRef.id,
      label,
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
        packagingId: data.packagingId,
        packaging: data.packaging || "",
        quantity: data.quantity,
        buyPrice: data.buyPrice,
        sellPrice: data.sellPrice,
        billImageUrl: data.billImageUrl,
        notes: data.notes,
        batchId: data.batchId,
        updatedBy: data.updatedBy,
        updatedByName: data.updatedByName,
        updatedByAvatar: data.updatedByAvatar,
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
      let productId = item.productId;
      let supplierId = item.supplierId;
      let packagingId = item.packagingId;

      if (!productId) {
        const product = await createProduct(item.productName);
        productId = product.id;
      }
      if (!supplierId) {
        const supplier = await createSupplier(item.supplierName);
        supplierId = supplier.id;
      }
      if (!packagingId) {
        // Create or get packaging size by label
        const packaging = await createPackagingSize(item.packaging);
        packagingId = packaging.id;
      }

      // Create stock entry
      const stockEntryData = {
        productId,
        supplierId,
        packagingId,
        packaging: item.packaging,
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
        sizeName: item.packaging,
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
// Function to add stock back (restore stock)
export const restoreStockQuantity = async (
  productId: string,
  packagingLabel: string,
  quantityToRestore: number
): Promise<void> => {
  try {
    console.log(`🔄 restoreStockQuantity called with:`, {
      productId,
      packagingLabel,
      quantityToRestore,
    });

    // Find all stock entries for this product
    const entriesSnapshot = await getDocs(
      query(stockEntriesCollection, where("productId", "==", productId))
    );

    console.log(
      `📦 Found ${entriesSnapshot.docs.length} stock entries for product ${productId}`
    );

    // Define a type for the entry with the fields we need
    type StockEntryWithFields = {
      id: string;
      productId: string;
      packagingId: string;
      packaging: string;
      quantity: number;
      createdAt: Timestamp;
      productName?: string;
      supplierName?: string;
      buyPrice?: number | null;
      sellPrice?: number | null;
      [key: string]: any; // Allow other fields
    };

    // Filter entries by packaging label
    const matchingEntries = entriesSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as StockEntryWithFields))
      .filter((entry) => {
        // Match by packaging field (the unified packaging string)
        const matches = entry.packaging === packagingLabel;
        console.log(
          `🔍 Entry ${entry.id}: packaging="${entry.packaging}" matches "${packagingLabel}" = ${matches}`
        );
        return matches;
      });

    console.log(
      `📦 Found ${matchingEntries.length} matching entries for packaging "${packagingLabel}"`
    );

    if (matchingEntries.length === 0) {
      console.warn(
        `⚠️ No stock entries found for product ${productId} with packaging ${packagingLabel}`
      );
      return;
    }

    // Sort entries by creation date (oldest first) - FIFO method
    matchingEntries.sort((a, b) => {
      const dateA =
        a.createdAt instanceof Timestamp ? a.createdAt.toDate().getTime() : 0;
      const dateB =
        b.createdAt instanceof Timestamp ? b.createdAt.toDate().getTime() : 0;
      return dateA - dateB;
    });

    let remainingQuantity = quantityToRestore;
    console.log(`💰 Starting to restore ${quantityToRestore} units to stock`);

    // Update entries until we've restored all quantity
    for (const entry of matchingEntries) {
      if (remainingQuantity <= 0) break;

      const entryRef = doc(stockEntriesCollection, entry.id);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) {
        console.log(`⚠️ Entry ${entry.id} no longer exists, skipping`);
        continue;
      }

      const entryData = entryDoc.data();
      const currentQuantity = entryData.quantity || 0;

      console.log(
        `📦 Entry ${entry.id}: current quantity = ${currentQuantity}, remaining to restore = ${remainingQuantity}`
      );

      // Calculate how much to add to this entry
      const addition = Math.min(remainingQuantity, 1000000); // Reasonable max
      const newQuantity = currentQuantity + addition;

      console.log(
        `📦 Updating entry ${entry.id}: ${currentQuantity} + ${addition} = ${newQuantity}`
      );

      // Update the entry with new quantity
      await updateDoc(entryRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      });

      // Create activity log for the stock restoration
      const activityData = {
        action: "restored_stock",
        stockEntryId: entry.id,
        productName: entryData.productName || "",
        supplierName: entryData.supplierName || "",
        sizeName: packagingLabel,
        quantity: addition,
        buyPrice: entryData.buyPrice || null,
        sellPrice: entryData.sellPrice || null,
        updatedBy: "system-sale-edit",
        timestamp: serverTimestamp(),
      };

      await addDoc(stockActivitiesCollection, activityData);

      remainingQuantity -= addition;
      console.log(
        `✅ Restored ${addition} to entry ${entry.id}, remaining: ${remainingQuantity}`
      );
    }

    if (remainingQuantity > 0) {
      console.warn(
        `⚠️ Could not restore all stock for product ${productId} with packaging ${packagingLabel}. Remaining quantity: ${remainingQuantity}`
      );
    } else {
      console.log(
        `✅ Successfully restored all ${quantityToRestore} units to stock`
      );
    }
  } catch (error) {
    console.error("❌ Error restoring stock quantity:", error);
    throw error;
  }
};

export const updateStockQuantity = async (
  productId: string,
  packagingLabel: string,
  quantitySold: number
): Promise<void> => {
  try {
    console.log(`🔍 updateStockQuantity called with:`, {
      productId,
      packagingLabel,
      quantitySold,
    });

    // Find all stock entries for this product
    const entriesSnapshot = await getDocs(
      query(stockEntriesCollection, where("productId", "==", productId))
    );

    console.log(
      `📦 Found ${entriesSnapshot.docs.length} stock entries for product ${productId}`
    );

    // Define a type for the entry with the fields we need
    type StockEntryWithFields = {
      id: string;
      productId: string;
      packagingId: string;
      packaging: string;
      quantity: number;
      createdAt: Timestamp;
      productName?: string;
      supplierName?: string;
      buyPrice?: number | null;
      sellPrice?: number | null;
      [key: string]: any; // Allow other fields
    };

    // Filter entries by packaging label
    const matchingEntries = entriesSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as StockEntryWithFields))
      .filter((entry) => {
        // Match by packaging field (the unified packaging string)
        const matches = entry.packaging === packagingLabel;
        console.log(
          `🔍 Entry ${entry.id}: packaging="${entry.packaging}" matches "${packagingLabel}" = ${matches}`
        );
        return matches;
      });

    console.log(
      `📦 Found ${matchingEntries.length} matching entries for packaging "${packagingLabel}"`
    );

    if (matchingEntries.length === 0) {
      console.warn(
        `⚠️ No stock entries found for product ${productId} with packaging ${packagingLabel}`
      );
      return;
    }

    // Sort entries by creation date (oldest first) - FIFO method
    matchingEntries.sort((a, b) => {
      const dateA =
        a.createdAt instanceof Timestamp ? a.createdAt.toDate().getTime() : 0;
      const dateB =
        b.createdAt instanceof Timestamp ? b.createdAt.toDate().getTime() : 0;
      return dateA - dateB;
    });

    let remainingQuantity = quantitySold;
    console.log(`💰 Starting to deduct ${quantitySold} units from stock`);

    // Update entries until we've accounted for all sold quantity
    for (const entry of matchingEntries) {
      if (remainingQuantity <= 0) break;

      const entryRef = doc(stockEntriesCollection, entry.id);
      const entryDoc = await getDoc(entryRef);

      if (!entryDoc.exists()) {
        console.log(`⚠️ Entry ${entry.id} no longer exists, skipping`);
        continue;
      }

      const entryData = entryDoc.data();
      const currentQuantity = entryData.quantity || 0;

      console.log(
        `📦 Entry ${entry.id}: current quantity = ${currentQuantity}, remaining to deduct = ${remainingQuantity}`
      );

      if (currentQuantity <= 0) {
        console.log(`⚠️ Entry ${entry.id} has no stock, skipping`);
        continue;
      }

      // Calculate how much to deduct from this entry
      const deduction = Math.min(currentQuantity, remainingQuantity);
      const newQuantity = currentQuantity - deduction;

      console.log(
        `📦 Updating entry ${entry.id}: ${currentQuantity} - ${deduction} = ${newQuantity}`
      );

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
        sizeName: packagingLabel,
        quantity: deduction,
        buyPrice: entryData.buyPrice || null,
        sellPrice: entryData.sellPrice || null,
        updatedBy: "system-sale",
        timestamp: serverTimestamp(),
      };

      await addDoc(stockActivitiesCollection, activityData);

      remainingQuantity -= deduction;
      console.log(
        `✅ Deducted ${deduction} from entry ${entry.id}, remaining: ${remainingQuantity}`
      );
    }

    if (remainingQuantity > 0) {
      console.warn(
        `⚠️ Not enough stock for product ${productId} with packaging ${packagingLabel}. Remaining quantity: ${remainingQuantity}`
      );
    } else {
      console.log(
        `✅ Successfully deducted all ${quantitySold} units from stock`
      );
    }
  } catch (error) {
    console.error("❌ Error updating stock quantity:", error);
    throw error;
  }
};

// ===== SALES =====

export const addSale = async (
  saleData: Sale,
  userId: string = "current-user",
  userName: string = "Unknown User"
): Promise<string> => {
  try {
    console.log(`🛒 addSale called with:`, {
      buyer: saleData.buyer,
      itemsCount: saleData.items.length,
      totalAmount: saleData.totalAmount,
      userId,
      userName,
    });

    // Create sale document
    const sale = {
      buyer: saleData.buyer || "",
      addedBy: userId,
      addedByName: userName,
      paymentStatus: saleData.paymentStatus || "Paid",
      saleDate:
        typeof saleData.saleDate === "string"
          ? convertDateToTimestamp(new Date(saleData.saleDate))
          : convertDateToTimestamp(saleData.saleDate as Date),
      notes: saleData.notes || "",
      totalAmount: saleData.totalAmount || 0,
      createdAt: serverTimestamp(),
    };

    // Add sale to Firestore
    const saleRef = await addDoc(salesCollection, sale);
    const saleId = saleRef.id;

    console.log(`✅ Sale created with ID: ${saleId}`);

    // Add sale items as subcollection
    const itemsCollection = collection(db, "sales", saleId, "items");

    // Process each sale item
    for (const item of saleData.items) {
      console.log(`📦 Processing sale item:`, {
        productId: item.productId,
        productName: item.productName,
        packaging: item.packaging,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });

      const saleItemData = {
        productId: item.productId || "",
        productName: item.productName,
        packaging: item.packaging,
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
        sizeName: item.packaging,
        quantity: parseFloat(item.quantity) || 0,
        buyPrice: null,
        sellPrice: parseFloat(item.unitPrice) || 0,
        batchId: null,
        updatedBy: userId,
        updatedByName: userName,
        timestamp: serverTimestamp(),
      };

      await addDoc(stockActivitiesCollection, activityData);

      // Update stock quantities
      if (item.productId) {
        console.log(
          `🔄 Calling updateStockQuantity for product ${item.productId}`
        );
        await updateStockQuantity(
          item.productId,
          item.packaging,
          parseFloat(item.quantity) || 0
        );
      } else {
        console.warn(`⚠️ No productId for item: ${item.productName}`);
      }
    }

    console.log(`✅ Sale ${saleId} completed successfully`);
    return saleId;
  } catch (error) {
    console.error("❌ Error adding sale:", error);
    throw error;
  }
};

// Update an existing sale
export const updateSale = async (
  saleId: string,
  saleData: Sale,
  userId: string = "current-user",
  userName: string = "Unknown User"
): Promise<void> => {
  try {
    console.log(`🔄 updateSale called for sale ${saleId}`);

    // Get the existing sale to compare items
    const saleRef = doc(db, "sales", saleId);
    const saleDoc = await getDoc(saleRef);

    if (!saleDoc.exists()) {
      throw new Error(`Sale with ID ${saleId} not found`);
    }

    // Get existing items
    const existingItemsSnapshot = await getDocs(
      collection(db, "sales", saleId, "items")
    );
    const existingItems = existingItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as {
      id: string;
      productId: string;
      productName: string;
      packaging: string | number;
      quantity: string | number;
      unitPrice: string | number;
      totalPrice: number;
      supplierId?: string;
      supplierName?: string;
    }[];

    console.log(`📦 Original sale had ${existingItems.length} items`);
    console.log(`📦 New sale has ${saleData.items.length} items`);

    // First, restore stock quantities from the original sale
    console.log(`🔄 Restoring stock from original sale...`);
    for (const existingItem of existingItems) {
      if (existingItem.productId) {
        const originalQuantity = Number(existingItem.quantity) || 0;
        console.log(
          `🔄 Restoring ${originalQuantity} units of ${existingItem.productName} (${existingItem.packaging})`
        );
        await restoreStockQuantity(
          existingItem.productId,
          String(existingItem.packaging),
          originalQuantity
        );
      }
    }

    // Update the main sale document
    await updateDoc(saleRef, {
      buyer: saleData.buyer || "",
      paymentStatus: saleData.paymentStatus || "Paid",
      saleDate:
        typeof saleData.saleDate === "string"
          ? convertDateToTimestamp(new Date(saleData.saleDate))
          : convertDateToTimestamp(saleData.saleDate as Date),
      notes: saleData.notes || "",
      totalAmount: saleData.totalAmount || 0,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      updatedByName: userName,
    });

    // Delete all existing items
    for (const doc of existingItemsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Add new items
    const itemsCollection = collection(db, "sales", saleId, "items");

    // Process each new sale item
    console.log(`🔄 Processing new sale items...`);
    for (const item of saleData.items) {
      const saleItemData = {
        productId: item.productId || "",
        productName: item.productName,
        packaging: item.packaging,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        totalPrice: item.totalPrice || 0,
        supplierId: item.supplierId || "",
        supplierName: item.supplierName || "",
      };

      await addDoc(itemsCollection, saleItemData);

      // Create activity log for the updated sale
      const activityData = {
        action: "updated_sale",
        stockEntryId: "",
        productName: item.productName,
        supplierName: item.supplierName || "",
        sizeName: item.packaging,
        quantity: parseFloat(item.quantity) || 0,
        buyPrice: null,
        sellPrice: parseFloat(item.unitPrice) || 0,
        batchId: null,
        updatedBy: userId,
        timestamp: serverTimestamp(),
      };

      await addDoc(stockActivitiesCollection, activityData);

      // Now subtract the new quantities from stock
      if (item.productId) {
        const newQuantity = parseFloat(item.quantity) || 0;
        console.log(
          `🔄 Subtracting ${newQuantity} units of ${item.productName} (${item.packaging})`
        );
        await updateStockQuantity(item.productId, item.packaging, newQuantity);
      }
    }

    console.log(`✅ Sale ${saleId} updated successfully`);
  } catch (error) {
    console.error("❌ Error updating sale:", error);
    throw error;
  }
};

// Delete a sale
export const deleteSale = async (saleId: string): Promise<void> => {
  try {
    console.log(`🗑️ deleteSale called for sale ${saleId}`);

    // Get the sale items first to restore stock
    const itemsSnapshot = await getDocs(
      collection(db, "sales", saleId, "items")
    );

    // Restore stock quantities before deleting the sale
    console.log(`🔄 Restoring stock from deleted sale...`);
    for (const itemDoc of itemsSnapshot.docs) {
      const itemData = itemDoc.data();
      if (itemData.productId) {
        const quantity = parseFloat(itemData.quantity) || 0;
        console.log(
          `🔄 Restoring ${quantity} units of ${itemData.productName} (${itemData.packaging})`
        );
        await restoreStockQuantity(
          itemData.productId,
          String(itemData.packaging),
          quantity
        );
      }
    }

    // Delete all items in the subcollection
    for (const doc of itemsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Create activity log for the deleted sale
    const activityData = {
      action: "deleted_sale",
      saleId: saleId,
      timestamp: serverTimestamp(),
    };

    await addDoc(stockActivitiesCollection, activityData);

    // Delete the main sale document
    await deleteDoc(doc(db, "sales", saleId));

    console.log(`✅ Sale ${saleId} deleted successfully`);
  } catch (error) {
    console.error("❌ Error deleting sale:", error);
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
            packaging: itemData.packaging || "",
            quantity: String(itemData.quantity || 0),
            unitPrice: String(itemData.unitPrice || 0),
            totalPrice: itemData.totalPrice || 0,
            supplierId: itemData.supplierId,
            supplierName: itemData.supplierName,
          };
        });

        // Get user name if not already stored
        let addedByName = data.addedByName || "";
        if (!addedByName && data.addedBy) {
          try {
            addedByName = await getUserName(data.addedBy);
          } catch (error) {
            console.error("Error getting user name for sale:", error);
            addedByName = "Unknown User";
          }
        }

        return {
          id: doc.id,
          buyer: data.buyer || "",
          addedBy: data.addedBy || "",
          addedByName: addedByName,
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

// Get user name by ID
export const getUserName = async (userId: string): Promise<string> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.name || "Unknown User";
    }

    return "Unknown User";
  } catch (error) {
    console.error("Error getting user name:", error);
    return "Unknown User";
  }
};

// Get available stock for a specific product and packaging label
export const getAvailableStock = async (
  productId: string,
  packagingLabel: string
): Promise<number> => {
  try {
    // Define types for the entries and sizes
    type StockEntryData = {
      id: string;
      productId: string;
      packagingId?: string;
      packagingLabel?: string;
      packagingName?: string;
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

    // Get all entries and filter by packaging label
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

    // Find entries with matching packaging label
    let totalQuantity = 0;

    for (const entry of entries) {
      // Match by packaging field (the unified packaging string)
      if (entry.packaging === packagingLabel) {
        totalQuantity += entry.quantity || 0;
      }
    }

    return totalQuantity;
  } catch (error) {
    console.error("Error getting available stock:", error);
    return 0; // Return 0 if there's an error
  }
};
