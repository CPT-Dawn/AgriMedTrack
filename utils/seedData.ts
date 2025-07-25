import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase";

// Sample inventory data based on the Firestore schema
const sampleInventoryData = [
  {
    productId: "prod_001",
    productName: "Urea",
    supplierId: "supp_001",
    supplierName: "IFFCO",
    packagingSize: "50 kg",
    packagingSizeValue: 50,
    packagingUnit: "kg",
    batchNumber: "URE001",
    quantity: 25,
    buyPrice: 280,
    sellPrice: 320,
    mfgDate: Timestamp.fromDate(new Date("2024-01-15")),
    expiryDate: Timestamp.fromDate(new Date("2026-01-15")),
    lastUpdated: Timestamp.now(),
  },
  {
    productId: "prod_002",
    productName: "DAP",
    supplierId: "supp_001",
    supplierName: "IFFCO",
    packagingSize: "50 kg",
    packagingSizeValue: 50,
    packagingUnit: "kg",
    batchNumber: "DAP001",
    quantity: 8,
    buyPrice: 1250,
    sellPrice: 1350,
    mfgDate: Timestamp.fromDate(new Date("2024-02-10")),
    expiryDate: Timestamp.fromDate(new Date("2027-02-10")),
    lastUpdated: Timestamp.now(),
  },
  {
    productId: "prod_003",
    productName: "NPK 10:26:26",
    supplierId: "supp_002",
    supplierName: "Coromandel",
    packagingSize: "50 kg",
    packagingSizeValue: 50,
    packagingUnit: "kg",
    batchNumber: "NPK001",
    quantity: 45,
    buyPrice: 1180,
    sellPrice: 1280,
    mfgDate: Timestamp.fromDate(new Date("2024-03-05")),
    expiryDate: Timestamp.fromDate(new Date("2027-03-05")),
    lastUpdated: Timestamp.now(),
  },
  {
    productId: "prod_004",
    productName: "Glyphosate",
    supplierId: "supp_003",
    supplierName: "Bayer",
    packagingSize: "1 litre",
    packagingSizeValue: 1,
    packagingUnit: "litre",
    batchNumber: "GLY001",
    quantity: 15,
    buyPrice: 450,
    sellPrice: 520,
    mfgDate: Timestamp.fromDate(new Date("2024-01-20")),
    expiryDate: Timestamp.fromDate(new Date("2025-08-20")), // Expiring soon
    lastUpdated: Timestamp.now(),
  },
  {
    productId: "prod_005",
    productName: "2,4-D",
    supplierId: "supp_003",
    supplierName: "Bayer",
    packagingSize: "500 ml",
    packagingSizeValue: 500,
    packagingUnit: "ml",
    batchNumber: "24D001",
    quantity: 3, // Low stock
    buyPrice: 180,
    sellPrice: 220,
    mfgDate: Timestamp.fromDate(new Date("2024-02-15")),
    expiryDate: Timestamp.fromDate(new Date("2026-02-15")),
    lastUpdated: Timestamp.now(),
  },
  {
    productId: "prod_006",
    productName: "Potash",
    supplierId: "supp_004",
    supplierName: "IPL",
    packagingSize: "50 kg",
    packagingSizeValue: 50,
    packagingUnit: "kg",
    batchNumber: "POT001",
    quantity: 60,
    buyPrice: 850,
    sellPrice: 950,
    mfgDate: Timestamp.fromDate(new Date("2024-04-01")),
    expiryDate: Timestamp.fromDate(new Date("2029-04-01")),
    lastUpdated: Timestamp.now(),
  },
  {
    productId: "prod_007",
    productName: "Zinc Sulphate",
    supplierId: "supp_002",
    supplierName: "Coromandel",
    packagingSize: "25 kg",
    packagingSizeValue: 25,
    packagingUnit: "kg",
    batchNumber: "ZIN001",
    quantity: 12,
    buyPrice: 120,
    sellPrice: 150,
    mfgDate: Timestamp.fromDate(new Date("2024-03-20")),
    expiryDate: Timestamp.fromDate(new Date("2027-03-20")),
    lastUpdated: Timestamp.now(),
  },
  {
    productId: "prod_008",
    productName: "Fungicide - Mancozeb",
    supplierId: "supp_005",
    supplierName: "UPL",
    packagingSize: "1 kg",
    packagingSizeValue: 1,
    packagingUnit: "kg",
    batchNumber: "MAN001",
    quantity: 22,
    buyPrice: 320,
    sellPrice: 380,
    mfgDate: Timestamp.fromDate(new Date("2024-01-30")),
    expiryDate: Timestamp.fromDate(new Date("2026-01-30")),
    lastUpdated: Timestamp.now(),
  },
];

export const seedInventoryData = async () => {
  try {
    console.log("Starting to seed inventory data...");

    const inventoryRef = collection(db, "inventory");

    for (const item of sampleInventoryData) {
      await addDoc(inventoryRef, item);
      console.log(`Added: ${item.productName} - ${item.supplierName}`);
    }

    console.log("Successfully seeded inventory data!");
    return { success: true, message: "Sample data added successfully!" };
  } catch (error) {
    console.error("Error seeding inventory data:", error);
    return { success: false, message: "Failed to add sample data" };
  }
};

// Sample products data
const sampleProducts = [
  { name: "Urea", category: "Fertilizer" },
  { name: "DAP", category: "Fertilizer" },
  { name: "NPK 10:26:26", category: "Fertilizer" },
  { name: "Glyphosate", category: "Herbicide" },
  { name: "2,4-D", category: "Herbicide" },
  { name: "Potash", category: "Fertilizer" },
  { name: "Zinc Sulphate", category: "Micronutrient" },
  { name: "Fungicide - Mancozeb", category: "Fungicide" },
];

// Sample suppliers data
const sampleSuppliers = [
  { name: "IFFCO", contactInfo: { phone: "+91-9876543210", address: "Delhi" } },
  {
    name: "Coromandel",
    contactInfo: { phone: "+91-9876543211", address: "Hyderabad" },
  },
  {
    name: "Bayer",
    contactInfo: { phone: "+91-9876543212", address: "Mumbai" },
  },
  { name: "IPL", contactInfo: { phone: "+91-9876543213", address: "Kolkata" } },
  { name: "UPL", contactInfo: { phone: "+91-9876543214", address: "Mumbai" } },
];

export const seedMasterData = async () => {
  try {
    console.log("Starting to seed master data...");

    // Seed products
    const productsRef = collection(db, "products");
    for (const product of sampleProducts) {
      await addDoc(productsRef, product);
      console.log(`Added product: ${product.name}`);
    }

    // Seed suppliers
    const suppliersRef = collection(db, "suppliers");
    for (const supplier of sampleSuppliers) {
      await addDoc(suppliersRef, supplier);
      console.log(`Added supplier: ${supplier.name}`);
    }

    console.log("Successfully seeded master data!");
    return { success: true, message: "Master data added successfully!" };
  } catch (error) {
    console.error("Error seeding master data:", error);
    return { success: false, message: "Failed to add master data" };
  }
};

// Sample inventory logs data
const sampleInventoryLogs = [
  {
    addedByUid: "user123",
    addedByName: "Admin User",
    addedAt: Timestamp.fromDate(new Date("2024-07-20T10:30:00")),
    items: [
      {
        productId: "prod_001",
        productName: "Urea",
        supplierId: "supp_001",
        supplierName: "IFFCO",
        packagingSize: "50 kg",
        batchNumber: "URE001",
        quantityAdded: 50,
        buyPrice: 280,
        sellPrice: 320,
        mfgDate: Timestamp.fromDate(new Date("2024-01-15")),
        expiryDate: Timestamp.fromDate(new Date("2026-01-15")),
      },
      {
        productId: "prod_002",
        productName: "DAP",
        supplierId: "supp_001",
        supplierName: "IFFCO",
        packagingSize: "50 kg",
        batchNumber: "DAP001",
        quantityAdded: 30,
        buyPrice: 1250,
        sellPrice: 1350,
        mfgDate: Timestamp.fromDate(new Date("2024-02-10")),
        expiryDate: Timestamp.fromDate(new Date("2027-02-10")),
      },
    ],
  },
  {
    addedByUid: "user123",
    addedByName: "Admin User",
    addedAt: Timestamp.fromDate(new Date("2024-07-22T14:15:00")),
    items: [
      {
        productId: "prod_003",
        productName: "NPK 10:26:26",
        supplierId: "supp_002",
        supplierName: "Coromandel",
        packagingSize: "50 kg",
        batchNumber: "NPK001",
        quantityAdded: 60,
        buyPrice: 1180,
        sellPrice: 1280,
        mfgDate: Timestamp.fromDate(new Date("2024-03-05")),
        expiryDate: Timestamp.fromDate(new Date("2027-03-05")),
      },
    ],
  },
  {
    addedByUid: "user123",
    addedByName: "Admin User",
    addedAt: Timestamp.fromDate(new Date("2024-07-23T09:45:00")),
    items: [
      {
        productId: "prod_004",
        productName: "Glyphosate",
        supplierId: "supp_003",
        supplierName: "Bayer",
        packagingSize: "1 litre",
        batchNumber: "GLY001",
        quantityAdded: 20,
        buyPrice: 450,
        sellPrice: 520,
        mfgDate: Timestamp.fromDate(new Date("2024-01-20")),
        expiryDate: Timestamp.fromDate(new Date("2025-08-20")),
      },
      {
        productId: "prod_005",
        productName: "2,4-D",
        supplierId: "supp_003",
        supplierName: "Bayer",
        packagingSize: "500 ml",
        batchNumber: "24D001",
        quantityAdded: 15,
        buyPrice: 180,
        sellPrice: 220,
        mfgDate: Timestamp.fromDate(new Date("2024-02-15")),
        expiryDate: Timestamp.fromDate(new Date("2026-02-15")),
      },
    ],
  },
  {
    addedByUid: "user123",
    addedByName: "Admin User",
    addedAt: Timestamp.fromDate(new Date("2024-07-24T16:20:00")),
    items: [
      {
        productId: "prod_006",
        productName: "Potash",
        supplierId: "supp_004",
        supplierName: "IPL",
        packagingSize: "50 kg",
        batchNumber: "POT001",
        quantityAdded: 80,
        buyPrice: 850,
        sellPrice: 950,
        mfgDate: Timestamp.fromDate(new Date("2024-04-01")),
        expiryDate: Timestamp.fromDate(new Date("2029-04-01")),
      },
    ],
  },
  {
    addedByUid: "user123",
    addedByName: "Admin User",
    addedAt: Timestamp.fromDate(new Date("2024-07-25T11:10:00")),
    items: [
      {
        productId: "prod_007",
        productName: "Zinc Sulphate",
        supplierId: "supp_004",
        supplierName: "IPL",
        packagingSize: "25 kg",
        batchNumber: "ZIN001",
        quantityAdded: 40,
        buyPrice: 85,
        sellPrice: 105,
        mfgDate: Timestamp.fromDate(new Date("2024-03-10")),
        expiryDate: Timestamp.fromDate(new Date("2027-03-10")),
      },
      {
        productId: "prod_008",
        productName: "Fungicide - Mancozeb",
        supplierId: "supp_005",
        supplierName: "UPL",
        packagingSize: "1 kg",
        batchNumber: "MAN001",
        quantityAdded: 25,
        buyPrice: 320,
        sellPrice: 380,
        mfgDate: Timestamp.fromDate(new Date("2024-02-20")),
        expiryDate: Timestamp.fromDate(new Date("2026-02-20")),
      },
    ],
  },
];

export const seedInventoryLogs = async () => {
  try {
    console.log("Starting to seed inventory logs...");

    const logsRef = collection(db, "inventory_logs");
    for (const log of sampleInventoryLogs) {
      await addDoc(logsRef, log);
      console.log(
        `Added inventory log: ${log.addedAt.toDate().toLocaleString()}`
      );
    }

    console.log("Successfully seeded inventory logs!");
    return { success: true, message: "Inventory logs added successfully!" };
  } catch (error) {
    console.error("Error seeding inventory logs:", error);
    return { success: false, message: "Failed to add inventory logs" };
  }
};

// Sample sales data based on the Firestore schema
const sampleSalesData = [
  {
    billNumber: "PKK20241201001",
    customerName: "Ramesh Patel",
    customerPhone: "9876543210",
    saleDate: Timestamp.fromDate(new Date("2024-12-01")),
    totalAmount: 1680,
    totalProfit: 160,
    paymentStatus: "Paid" as const,
    amountPaid: 1680,
    amountPending: 0,
    items: [
      {
        productId: "prod_001",
        productName: "Urea",
        supplierId: "supp_001",
        supplierName: "IFFCO",
        packagingSize: "50 kg",
        batchNumber: "URE001",
        quantitySold: 5,
        sellPricePerUnit: 320,
        buyPricePerUnit: 280,
        itemTotal: 1600,
        itemProfit: 200,
      },
      {
        productId: "prod_007",
        productName: "Zinc Sulphate",
        supplierId: "supp_004",
        supplierName: "IPL",
        packagingSize: "25 kg",
        batchNumber: "ZIN001",
        quantitySold: 1,
        sellPricePerUnit: 105,
        buyPricePerUnit: 85,
        itemTotal: 105,
        itemProfit: 20,
      },
    ],
    createdBy: "admin@pkk.com",
    createdAt: Timestamp.fromDate(new Date("2024-12-01")),
    lastUpdated: Timestamp.fromDate(new Date("2024-12-01")),
  },
  {
    billNumber: "PKK20241202001",
    customerName: "Suresh Kumar",
    customerPhone: "9876543211",
    saleDate: Timestamp.fromDate(new Date("2024-12-02")),
    totalAmount: 2700,
    totalProfit: 200,
    paymentStatus: "Partial" as const,
    amountPaid: 2000,
    amountPending: 700,
    items: [
      {
        productId: "prod_002",
        productName: "DAP",
        supplierId: "supp_001",
        supplierName: "IFFCO",
        packagingSize: "50 kg",
        batchNumber: "DAP001",
        quantitySold: 2,
        sellPricePerUnit: 1350,
        buyPricePerUnit: 1250,
        itemTotal: 2700,
        itemProfit: 200,
      },
    ],
    createdBy: "admin@pkk.com",
    createdAt: Timestamp.fromDate(new Date("2024-12-02")),
    lastUpdated: Timestamp.fromDate(new Date("2024-12-02")),
  },
  {
    billNumber: "PKK20241203001",
    customerName: "Mukesh Singh",
    customerPhone: "9876543212",
    saleDate: Timestamp.fromDate(new Date("2024-12-03")),
    totalAmount: 2560,
    totalProfit: 200,
    paymentStatus: "Unpaid" as const,
    amountPaid: 0,
    amountPending: 2560,
    items: [
      {
        productId: "prod_003",
        productName: "NPK 10:26:26",
        supplierId: "supp_002",
        supplierName: "Coromandel",
        packagingSize: "50 kg",
        batchNumber: "NPK001",
        quantitySold: 2,
        sellPricePerUnit: 1280,
        buyPricePerUnit: 1180,
        itemTotal: 2560,
        itemProfit: 200,
      },
    ],
    createdBy: "admin@pkk.com",
    createdAt: Timestamp.fromDate(new Date("2024-12-03")),
    lastUpdated: Timestamp.fromDate(new Date("2024-12-03")),
  },
  {
    billNumber: "PKK20241204001",
    customerName: "Raj Yadav",
    customerPhone: "9876543213",
    saleDate: Timestamp.fromDate(new Date("2024-12-04")),
    totalAmount: 1520,
    totalProfit: 240,
    paymentStatus: "Paid" as const,
    amountPaid: 1520,
    amountPending: 0,
    items: [
      {
        productId: "prod_008",
        productName: "Fungicide - Mancozeb",
        supplierId: "supp_005",
        supplierName: "UPL",
        packagingSize: "1 kg",
        batchNumber: "MAN001",
        quantitySold: 4,
        sellPricePerUnit: 380,
        buyPricePerUnit: 320,
        itemTotal: 1520,
        itemProfit: 240,
      },
    ],
    createdBy: "admin@pkk.com",
    createdAt: Timestamp.fromDate(new Date("2024-12-04")),
    lastUpdated: Timestamp.fromDate(new Date("2024-12-04")),
  },
  {
    billNumber: "PKK20241205001",
    customerName: "Gopal Mehta",
    customerPhone: "9876543214",
    saleDate: Timestamp.fromDate(new Date("2024-12-05")),
    totalAmount: 1950,
    totalProfit: 150,
    paymentStatus: "Partial" as const,
    amountPaid: 1000,
    amountPending: 950,
    items: [
      {
        productId: "prod_004",
        productName: "Potash",
        supplierId: "supp_002",
        supplierName: "Coromandel",
        packagingSize: "50 kg",
        batchNumber: "POT001",
        quantitySold: 3,
        sellPricePerUnit: 650,
        buyPricePerUnit: 600,
        itemTotal: 1950,
        itemProfit: 150,
      },
    ],
    createdBy: "admin@pkk.com",
    createdAt: Timestamp.fromDate(new Date("2024-12-05")),
    lastUpdated: Timestamp.fromDate(new Date("2024-12-05")),
  },
];

export const seedSalesData = async () => {
  try {
    console.log("Starting to seed sales data...");

    const salesRef = collection(db, "sales");
    for (const sale of sampleSalesData) {
      await addDoc(salesRef, sale);
      console.log(`Added sale: ${sale.billNumber} for ${sale.customerName}`);
    }

    console.log("Successfully seeded sales data!");
    return { success: true, message: "Sales data added successfully!" };
  } catch (error) {
    console.error("Error seeding sales data:", error);
    return { success: false, message: "Failed to add sales data" };
  }
};
