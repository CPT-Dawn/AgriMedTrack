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
  where,
} from "firebase/firestore";
import {
  BatchEntryFormData,
  PackagingSize,
  Product,
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
    // Extract unit from label (e.g., "10mg tablet" -> "tablet")
    // This handles both combined format (10mg) and separate format where label might just be a unit
    let unit = "unit";

    if (label.includes("tablet")) unit = "tablet";
    else if (label.includes("ml")) unit = "ml";
    else if (label.includes("vial")) unit = "vial";
    else if (label.includes("mg")) unit = "mg";
    else if (label.includes("g") && !label.includes("mg")) unit = "g";
    else if (label.includes("kg")) unit = "kg";
    else if (label.includes("L")) unit = "L";
    // If label is just a unit without a value, use it directly
    else if (
      ["tablet", "ml", "vial", "mg", "g", "kg", "L", "unit"].includes(
        label.toLowerCase()
      )
    ) {
      unit = label.toLowerCase();
    }

    const newSize = {
      label,
      unit,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(packagingSizesCollection, newSize);

    return {
      id: docRef.id,
      label,
      unit,
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
    // 1. Create batch document
    const batchData: {
      addedBy: string;
      addedByName: string;
      addedAt: any;
      billUrl?: string;
      billThumbnail?: string;
    } = {
      addedBy: userId,
      addedByName: "User", // Replace with actual user name when user management is implemented
      addedAt: serverTimestamp(),
    };

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
        // Create a combined label if we have separate size value and unit
        const combinedLabel =
          item.sizeValue && item.unit
            ? `${item.sizeValue} ${item.unit}`
            : item.sizeLabel;

        const size = await createPackagingSize(combinedLabel);
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
        updatedByName: "User", // Replace with actual user name
        timestamp: serverTimestamp(),
      };

      await addDoc(stockActivitiesCollection, activityData);
    }
  } catch (error) {
    console.error("Error adding stock entry batch:", error);
    throw error;
  }
};

// ===== SALES =====

export const addSale = async (
  saleData: any,
  userId: string = "current-user"
): Promise<string> => {
  try {
    // Create sale document
    const sale = {
      buyer: saleData.buyer || "",
      addedBy: userId,
      paymentStatus: saleData.paymentStatus || "Paid",
      saleDate: convertDateToTimestamp(new Date(saleData.saleDate)),
      notes: saleData.notes || "",
      totalAmount: saleData.totalAmount || 0,
      discount: saleData.discount ? parseFloat(saleData.discount) : 0,
      tax: saleData.tax ? parseFloat(saleData.tax) : 0,
      createdAt: serverTimestamp(),
    };

    // Add sale to Firestore
    const saleRef = await addDoc(salesCollection, sale);
    const saleId = saleRef.id;

    // Add sale items as subcollection
    const itemsCollection = collection(db, "sales", saleId, "items");

    for (const item of saleData.items) {
      const saleItemData = {
        productId: item.productId,
        productName: item.productName,
        sizeLabel: item.sizeLabel,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.totalPrice),
      };

      await addDoc(itemsCollection, saleItemData);

      // Create activity log for the sale
      const activityData = {
        action: "sold",
        stockEntryId: "", // No direct reference to stock entry
        productName: item.productName,
        supplierName: "", // Not applicable for sales
        sizeName: item.sizeLabel,
        quantity: parseFloat(item.quantity),
        buyPrice: null,
        sellPrice: parseFloat(item.unitPrice),
        batchId: null,
        updatedBy: userId,
        updatedByName: "User", // Replace with actual user name
        timestamp: serverTimestamp(),
      };

      await addDoc(stockActivitiesCollection, activityData);

      // Update stock quantities (in a real app, you would need to implement inventory reduction logic)
    }

    return saleId;
  } catch (error) {
    console.error("Error adding sale:", error);
    throw error;
  }
};

export const getSales = async () => {
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
            productId: itemData.productId,
            productName: itemData.productName,
            sizeLabel: itemData.sizeLabel,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            totalPrice: itemData.totalPrice,
          };
        });

        return {
          id: doc.id,
          buyer: data.buyer,
          addedBy: data.addedBy,
          paymentStatus: data.paymentStatus,
          saleDate: convertTimestampToDate(data.saleDate),
          notes: data.notes,
          totalAmount: data.totalAmount,
          discount: data.discount,
          tax: data.tax,
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
