import {
  collection,
  addDoc,
  doc,
  setDoc,
  Timestamp,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";

export const seedDashboardData = async () => {
  try {
    const batch = writeBatch(db);

    // Seed customers
    const customers = [
      {
        id: "customer1",
        name: "Rajesh Patel",
        phone: "+91 98765 43210",
        totalPendingAmount: 5000,
        pendingSales: { sale1: 2500, sale2: 2500 },
      },
      {
        id: "customer2",
        name: "Priya Sharma",
        phone: "+91 87654 32109",
        totalPendingAmount: 0,
        pendingSales: {},
      },
      {
        id: "customer3",
        name: "Amit Kumar",
        phone: "+91 76543 21098",
        totalPendingAmount: 1500,
        pendingSales: { sale3: 1500 },
      },
    ];

    customers.forEach((customer) => {
      const customerRef = doc(db, "customers", customer.id);
      batch.set(customerRef, customer);
    });

    // Seed products
    const products = [
      { id: "prod1", name: "Urea Fertilizer", category: "Fertilizers" },
      { id: "prod2", name: "DAP Fertilizer", category: "Fertilizers" },
      { id: "prod3", name: "Potash", category: "Fertilizers" },
      { id: "prod4", name: "Pesticide Spray", category: "Pesticides" },
      { id: "prod5", name: "Herbicide", category: "Pesticides" },
    ];

    products.forEach((product) => {
      const productRef = doc(db, "products", product.id);
      batch.set(productRef, product);
    });

    // Seed suppliers
    const suppliers = [
      {
        id: "supplier1",
        name: "Gujarat Fertilizers Ltd",
        contactInfo: {
          phone: "+91 99999 88888",
          address: "Ahmedabad, Gujarat",
        },
      },
      {
        id: "supplier2",
        name: "Indian Farmers Supply Co",
        contactInfo: {
          phone: "+91 88888 77777",
          address: "Mumbai, Maharashtra",
        },
      },
    ];

    suppliers.forEach((supplier) => {
      const supplierRef = doc(db, "suppliers", supplier.id);
      batch.set(supplierRef, supplier);
    });

    // Seed inventory with realistic data
    const now = new Date();
    const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    const expiringDate = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000); // 20 days from now
    const expiredDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago

    const inventoryItems = [
      {
        id: "inv1",
        productId: "prod1",
        productName: "Urea Fertilizer",
        supplierId: "supplier1",
        supplierName: "Gujarat Fertilizers Ltd",
        packagingSizeValue: 50,
        packagingUnit: "kg",
        packagingSize: "50kg",
        batchNumber: "UREA2024001",
        quantityAdded: 100,
        quantity: 85, // Some sold
        buyPrice: 1200,
        sellPrice: 1350,
        mfgDate: Timestamp.fromDate(
          new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        ),
        expiryDate: Timestamp.fromDate(futureDate),
        stockAddDate: Timestamp.fromDate(
          new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
        ),
      },
      {
        id: "inv2",
        productId: "prod2",
        productName: "DAP Fertilizer",
        supplierId: "supplier1",
        supplierName: "Gujarat Fertilizers Ltd",
        packagingSizeValue: 50,
        packagingUnit: "kg",
        packagingSize: "50kg",
        batchNumber: "DAP2024002",
        quantityAdded: 50,
        quantity: 8, // Low stock alert
        buyPrice: 1500,
        sellPrice: 1650,
        mfgDate: Timestamp.fromDate(
          new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)
        ),
        expiryDate: Timestamp.fromDate(futureDate),
        stockAddDate: Timestamp.fromDate(
          new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
        ),
      },
      {
        id: "inv3",
        productId: "prod4",
        productName: "Pesticide Spray",
        supplierId: "supplier2",
        supplierName: "Indian Farmers Supply Co",
        packagingSizeValue: 1,
        packagingUnit: "liter",
        packagingSize: "1L",
        batchNumber: "PEST2024003",
        quantityAdded: 30,
        quantity: 25,
        buyPrice: 800,
        sellPrice: 950,
        mfgDate: Timestamp.fromDate(
          new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        ),
        expiryDate: Timestamp.fromDate(expiringDate), // Expiring soon
        stockAddDate: Timestamp.fromDate(
          new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
        ),
      },
      {
        id: "inv4",
        productId: "prod5",
        productName: "Herbicide",
        supplierId: "supplier2",
        supplierName: "Indian Farmers Supply Co",
        packagingSizeValue: 500,
        packagingUnit: "ml",
        packagingSize: "500ml",
        batchNumber: "HERB2023004",
        quantityAdded: 20,
        quantity: 15,
        buyPrice: 600,
        sellPrice: 750,
        mfgDate: Timestamp.fromDate(
          new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000)
        ),
        expiryDate: Timestamp.fromDate(expiredDate), // Expired
        stockAddDate: Timestamp.fromDate(
          new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        ),
      },
    ];

    inventoryItems.forEach((item) => {
      const invRef = doc(db, "inventory", item.id);
      batch.set(invRef, item);
    });

    // Seed sales data for the last 7 days
    const salesData = [];
    for (let i = 0; i < 7; i++) {
      const saleDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isToday = i === 0;
      const numSales = isToday ? 3 : Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numSales; j++) {
        const saleId = `sale_${i}_${j}`;
        const customerId = customers[j % customers.length].id;
        const customerName = customers[j % customers.length].name;
        const billNumber = `PKK${saleDate.getFullYear()}${String(saleDate.getMonth() + 1).padStart(2, "0")}${String(saleDate.getDate()).padStart(2, "0")}${String(j + 1).padStart(3, "0")}`;

        const totalAmount = Math.floor(Math.random() * 5000) + 1000;
        const totalProfit = totalAmount * 0.12; // 12% profit margin
        const paymentStatus =
          Math.random() > 0.7
            ? Math.random() > 0.5
              ? "Unpaid"
              : "Partial"
            : "Paid";
        const amountPaid =
          paymentStatus === "Paid"
            ? totalAmount
            : paymentStatus === "Partial"
              ? totalAmount * 0.6
              : 0;

        const sale = {
          saleId,
          billNumber,
          customerId,
          customerName,
          soldByUid: "user1",
          soldByName: "Store Manager",
          saleDate: Timestamp.fromDate(saleDate),
          totalAmount,
          totalProfit,
          paymentStatus,
          amountPaid,
          amountPending: totalAmount - amountPaid,
        };

        const saleRef = doc(db, "sales", saleId);
        batch.set(saleRef, sale);

        // Add sale items
        const itemsToSell = inventoryItems.slice(
          0,
          Math.floor(Math.random() * 2) + 1
        );
        itemsToSell.forEach((invItem, itemIndex) => {
          const quantitySold = Math.floor(Math.random() * 3) + 1;
          const itemTotal = quantitySold * invItem.sellPrice;
          const itemProfit =
            quantitySold * (invItem.sellPrice - invItem.buyPrice);

          const saleItem = {
            itemSoldId: `${saleId}_item_${itemIndex}`,
            inventoryItemId: invItem.id,
            productId: invItem.productId,
            productName: invItem.productName,
            supplierName: invItem.supplierName,
            packagingSize: invItem.packagingSize,
            batchNumber: invItem.batchNumber,
            quantitySold,
            buyPricePerUnit: invItem.buyPrice,
            sellPricePerUnit: invItem.sellPrice,
            itemTotal,
            itemProfit,
          };

          const saleItemRef = doc(
            db,
            "sales",
            saleId,
            "items_sold",
            `item_${itemIndex}`
          );
          batch.set(saleItemRef, saleItem);
        });
      }
    }

    await batch.commit();
    console.log("Dashboard seed data created successfully!");
    return { success: true, message: "Seed data created successfully" };
  } catch (error) {
    console.error("Error seeding dashboard data:", error);
    return { success: false, message: "Failed to create seed data", error };
  }
};

// Function to clear all collections (for testing)
export const clearDashboardData = async () => {
  try {
    const collections = [
      "customers",
      "products",
      "suppliers",
      "inventory",
      "sales",
    ];

    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);

      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    }

    console.log("All dashboard data cleared successfully!");
    return { success: true, message: "Data cleared successfully" };
  } catch (error) {
    console.error("Error clearing dashboard data:", error);
    return { success: false, message: "Failed to clear data", error };
  }
};
