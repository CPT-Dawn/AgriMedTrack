/**
 * Firestore Database Initialization Script
 *
 * This script initializes the Firestore database with the required collections and sample data.
 * Run this script once to set up the database structure.
 *
 * Usage: node scripts/init-firestore.js
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwdZmaX1SUbGdo-MmpabGMOUjdT7IvVzg",
  authDomain: "agrimedtrack.firebaseapp.com",
  projectId: "agrimedtrack",
  storageBucket: "agrimedtrack.appspot.com",
  messagingSenderId: "614502989101",
  appId: "1:614502989101:web:eed20758c964e317bde7a4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
const usersCollection = collection(db, "users");
const productsCollection = collection(db, "products");
const suppliersCollection = collection(db, "suppliers");
const packagingSizesCollection = collection(db, "packagingSizes");
const stockEntriesCollection = collection(db, "stockEntries");
const stockBatchesCollection = collection(db, "stockBatches");
const stockActivitiesCollection = collection(db, "stockActivities");
const salesCollection = collection(db, "sales");

// Sample data
const sampleUsers = [
  {
    name: "Admin User",
    avatar:
      "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
    role: "admin",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  },
  {
    name: "Store Manager",
    avatar:
      "https://ui-avatars.com/api/?name=Store+Manager&background=2E7D32&color=fff",
    role: "manager",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  },
];

const sampleProducts = [
  {
    name: "Organic Tomatoes",
    category: "Vegetables",
    description: "Fresh organic tomatoes",
    createdAt: serverTimestamp(),
  },
  {
    name: "Wheat Seeds",
    category: "Seeds",
    description: "High-quality wheat seeds",
    createdAt: serverTimestamp(),
  },
  {
    name: "Organic Fertilizer",
    category: "Fertilizers",
    description: "Natural organic fertilizer",
    createdAt: serverTimestamp(),
  },
];

const sampleSuppliers = [
  {
    name: "Green Farms",
    contactInfo: {
      email: "contact@greenfarms.com",
      phone: "+1234567890",
      address: "123 Farm Road",
    },
    createdAt: serverTimestamp(),
  },
  {
    name: "Organic Supplies Co.",
    contactInfo: {
      email: "info@organicsupplies.com",
      phone: "+9876543210",
      address: "456 Organic Lane",
    },
    createdAt: serverTimestamp(),
  },
];

const samplePackagingSizes = [
  {
    label: "1kg bag",
    unit: "kg",
    createdAt: serverTimestamp(),
  },
  {
    label: "500g packet",
    unit: "g",
    createdAt: serverTimestamp(),
  },
  {
    label: "5L container",
    unit: "L",
    createdAt: serverTimestamp(),
  },
];

// Initialize database
async function initializeDatabase() {
  try {
    console.log("Starting database initialization...");

    // Add sample users
    console.log("Adding sample users...");
    const userPromises = sampleUsers.map((user) =>
      addDoc(usersCollection, user)
    );
    const userRefs = await Promise.all(userPromises);
    const userId = userRefs[0].id;

    // Add sample products
    console.log("Adding sample products...");
    const productPromises = sampleProducts.map((product) =>
      addDoc(productsCollection, product)
    );
    const productRefs = await Promise.all(productPromises);

    // Add sample suppliers
    console.log("Adding sample suppliers...");
    const supplierPromises = sampleSuppliers.map((supplier) =>
      addDoc(suppliersCollection, supplier)
    );
    const supplierRefs = await Promise.all(supplierPromises);

    // Add sample packaging sizes
    console.log("Adding sample packaging sizes...");
    const sizePromises = samplePackagingSizes.map((size) =>
      addDoc(packagingSizesCollection, size)
    );
    const sizeRefs = await Promise.all(sizePromises);

    // Add a sample batch
    console.log("Adding a sample batch...");
    const batchData = {
      addedBy: userId,
      addedByName: "Admin User",
      addedAt: serverTimestamp(),
    };

    const batchRef = await addDoc(stockBatchesCollection, batchData);
    const batchId = batchRef.id;

    // Add sample stock entries
    console.log("Adding sample stock entries...");
    const stockEntry1 = {
      productId: productRefs[0].id,
      supplierId: supplierRefs[0].id,
      sizeId: sizeRefs[0].id,
      quantity: 50,
      buyPrice: 5.99,
      sellPrice: 9.99,
      batchId: batchId,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const stockEntry2 = {
      productId: productRefs[1].id,
      supplierId: supplierRefs[1].id,
      sizeId: sizeRefs[1].id,
      quantity: 100,
      buyPrice: 3.49,
      sellPrice: 6.99,
      batchId: batchId,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const stockEntryRef1 = await addDoc(stockEntriesCollection, stockEntry1);
    const stockEntryRef2 = await addDoc(stockEntriesCollection, stockEntry2);

    // Add sample activities
    console.log("Adding sample activities...");
    const activity1 = {
      action: "added",
      stockEntryId: stockEntryRef1.id,
      productName: "Organic Tomatoes",
      supplierName: "Green Farms",
      sizeName: "1kg bag",
      quantity: 50,
      buyPrice: 5.99,
      sellPrice: 9.99,
      batchId: batchId,
      updatedBy: userId,
      updatedByName: "Admin User",
      timestamp: serverTimestamp(),
    };

    const activity2 = {
      action: "added",
      stockEntryId: stockEntryRef2.id,
      productName: "Wheat Seeds",
      supplierName: "Organic Supplies Co.",
      sizeName: "500g packet",
      quantity: 100,
      buyPrice: 3.49,
      sellPrice: 6.99,
      batchId: batchId,
      updatedBy: userId,
      updatedByName: "Admin User",
      timestamp: serverTimestamp(),
    };

    await addDoc(stockActivitiesCollection, activity1);
    await addDoc(stockActivitiesCollection, activity2);

    // Add a sample sale
    console.log("Adding a sample sale...");
    const saleData = {
      buyer: "Sample Customer",
      addedBy: userId,
      paymentStatus: "Paid",
      saleDate: new Date(),
      notes: "First sale",
      totalAmount: 29.95,
      createdAt: serverTimestamp(),
    };

    const saleRef = await addDoc(salesCollection, saleData);

    // Add sale items
    const saleItemsCollection = collection(db, "sales", saleRef.id, "items");

    const saleItem1 = {
      productId: productRefs[0].id,
      productName: "Organic Tomatoes",
      sizeLabel: "1kg bag",
      quantity: 2,
      unitPrice: 9.99,
      totalPrice: 19.98,
    };

    const saleItem2 = {
      productId: productRefs[1].id,
      productName: "Wheat Seeds",
      sizeLabel: "500g packet",
      quantity: 1,
      unitPrice: 9.97,
      totalPrice: 9.97,
    };

    await addDoc(saleItemsCollection, saleItem1);
    await addDoc(saleItemsCollection, saleItem2);

    // Add sale activities
    const saleActivity1 = {
      action: "sold",
      stockEntryId: "",
      productName: "Organic Tomatoes",
      supplierName: "",
      sizeName: "1kg bag",
      quantity: 2,
      buyPrice: null,
      sellPrice: 9.99,
      updatedBy: userId,
      updatedByName: "Admin User",
      timestamp: serverTimestamp(),
    };

    const saleActivity2 = {
      action: "sold",
      stockEntryId: "",
      productName: "Wheat Seeds",
      supplierName: "",
      sizeName: "500g packet",
      quantity: 1,
      buyPrice: null,
      sellPrice: 9.97,
      updatedBy: userId,
      updatedByName: "Admin User",
      timestamp: serverTimestamp(),
    };

    await addDoc(stockActivitiesCollection, saleActivity1);
    await addDoc(stockActivitiesCollection, saleActivity2);

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log("Script execution completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });
