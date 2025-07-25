import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { Sale, Customer } from "../types/sales";
import { InventoryItem } from "../types/inventory";
import { useToast } from "./useToast";

export interface DashboardStats {
  totalSalesToday: number;
  totalSalesThisMonth: number;
  totalSalesThisYear: number;
  totalPendingPayments: number;
  totalInventoryValue: number;
  lowStockItems: number;
  expiringItems: number;
  expiredItems: number;
  totalProducts: number;
  totalCustomers: number;
  totalSalesCount: number;
  averageOrderValue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  profitMargin: number;
}

export interface RecentActivity {
  type: "sale" | "payment" | "stock" | "expiry";
  title: string;
  subtitle: string;
  amount?: number;
  time: Date;
  status?: "success" | "warning" | "error" | "info";
  icon: string;
}

export interface InventoryAlert {
  type: "low_stock" | "expiring" | "expired";
  productName: string;
  quantity: number;
  daysToExpiry?: number;
  priority: "high" | "medium" | "low";
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSalesToday: 0,
    totalSalesThisMonth: 0,
    totalSalesThisYear: 0,
    totalPendingPayments: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
    expiringItems: 0,
    expiredItems: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalSalesCount: 0,
    averageOrderValue: 0,
  });

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showError } = useToast();

  const fetchDashboardData = async () => {
    try {
      // Get date ranges
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

      const unsubscribers: (() => void)[] = [];

      // 1. Sales data listener
      const salesQuery = query(
        collection(db, "sales"),
        orderBy("saleDate", "desc")
      );

      const salesUnsubscribe = onSnapshot(salesQuery, async (snapshot) => {
        const salesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          saleDate: doc.data().saleDate?.toDate() || new Date(),
        })) as (Sale & { id: string })[];

        // Calculate sales metrics
        const todaySales = salesData.filter(
          (sale) => sale.saleDate >= startOfDay && sale.saleDate < endOfDay
        );
        const monthSales = salesData.filter(
          (sale) => sale.saleDate >= startOfMonth && sale.saleDate < endOfMonth
        );
        const yearSales = salesData.filter(
          (sale) => sale.saleDate >= startOfYear && sale.saleDate < endOfYear
        );

        const totalSalesToday = todaySales.reduce(
          (sum, sale) => sum + sale.totalAmount,
          0
        );
        const totalSalesThisMonth = monthSales.reduce(
          (sum, sale) => sum + sale.totalAmount,
          0
        );
        const totalSalesThisYear = yearSales.reduce(
          (sum, sale) => sum + sale.totalAmount,
          0
        );
        const totalPendingPayments = salesData.reduce(
          (sum, sale) => sum + sale.amountPending,
          0
        );
        const averageOrderValue =
          salesData.length > 0
            ? salesData.reduce((sum, sale) => sum + sale.totalAmount, 0) /
              salesData.length
            : 0;

        setStats((prev) => ({
          ...prev,
          totalSalesToday,
          totalSalesThisMonth,
          totalSalesThisYear,
          totalPendingPayments,
          totalSalesCount: salesData.length,
          averageOrderValue,
        }));

        // Generate recent activities from sales
        const activities: RecentActivity[] = salesData
          .slice(0, 8)
          .map((sale) => ({
            type: "sale",
            title: `Sale to ${sale.customerName}`,
            subtitle: `Bill #${sale.billNumber}`,
            amount: sale.totalAmount,
            time: sale.saleDate,
            status:
              sale.paymentStatus === "Paid"
                ? "success"
                : sale.paymentStatus === "Unpaid"
                  ? "error"
                  : "warning",
            icon:
              sale.paymentStatus === "Paid"
                ? "checkmark-circle"
                : sale.paymentStatus === "Unpaid"
                  ? "close-circle"
                  : "time",
          }));

        // Get detailed sales items for top products
        const productSales: { [key: string]: TopProduct } = {};

        for (const sale of salesData.slice(0, 50)) {
          // Analyze recent sales only
          try {
            const itemsQuery = query(
              collection(db, `sales/${sale.id}/items_sold`)
            );
            const itemsSnapshot = await getDocs(itemsQuery);

            itemsSnapshot.docs.forEach((itemDoc) => {
              const item = itemDoc.data();
              const key = item.productId;
              const profit = item.itemProfit || 0;
              const revenue = item.itemTotal || 0;

              if (productSales[key]) {
                productSales[key].quantity += item.quantitySold;
                productSales[key].revenue += revenue;
                productSales[key].profitMargin =
                  productSales[key].revenue > 0
                    ? ((productSales[key].revenue -
                        (productSales[key].revenue - profit)) /
                        productSales[key].revenue) *
                      100
                    : 0;
              } else {
                productSales[key] = {
                  id: key,
                  name: item.productName,
                  quantity: item.quantitySold,
                  revenue: revenue,
                  profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
                };
              }
            });
          } catch (error) {
            console.error("Error fetching sale items:", error);
          }
        }

        const topProductsArray = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopProducts(topProductsArray);
        setRecentActivities(activities);
      });
      unsubscribers.push(salesUnsubscribe);

      // 2. Inventory data listener
      const inventoryQuery = query(collection(db, "inventory"));
      const inventoryUnsubscribe = onSnapshot(inventoryQuery, (snapshot) => {
        const inventoryData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          mfgDate: doc.data().mfgDate?.toDate() || new Date(),
          expiryDate: doc.data().expiryDate?.toDate() || new Date(),
          quantity: doc.data().quantity || 0,
        })) as InventoryItem[];

        // Calculate inventory metrics
        const totalInventoryValue = inventoryData.reduce(
          (sum, item) => sum + item.quantity * item.buyPrice,
          0
        );

        const lowStockItems = inventoryData.filter(
          (item) => item.quantity < 10
        ).length;

        // Expiry calculations
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringItems = inventoryData.filter(
          (item) =>
            item.expiryDate <= thirtyDaysFromNow && item.expiryDate > now
        ).length;

        const expiredItems = inventoryData.filter(
          (item) => item.expiryDate <= now
        ).length;

        const uniqueProducts = new Set(
          inventoryData.map((item) => item.productId)
        ).size;

        setStats((prev) => ({
          ...prev,
          totalInventoryValue,
          lowStockItems,
          expiringItems,
          expiredItems,
          totalProducts: uniqueProducts,
        }));

        // Generate inventory alerts
        const alerts: InventoryAlert[] = [];

        // Low stock alerts
        inventoryData
          .filter((item) => item.quantity < 10 && item.quantity > 0)
          .forEach((item) => {
            alerts.push({
              type: "low_stock",
              productName: item.productName,
              quantity: item.quantity,
              priority: item.quantity < 5 ? "high" : "medium",
            });
          });

        // Expiring items alerts
        inventoryData
          .filter(
            (item) =>
              item.expiryDate <= thirtyDaysFromNow && item.expiryDate > now
          )
          .forEach((item) => {
            const daysToExpiry = Math.ceil(
              (item.expiryDate.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            alerts.push({
              type: "expiring",
              productName: item.productName,
              quantity: item.quantity,
              daysToExpiry,
              priority:
                daysToExpiry <= 7
                  ? "high"
                  : daysToExpiry <= 15
                    ? "medium"
                    : "low",
            });
          });

        // Expired items alerts
        inventoryData
          .filter((item) => item.expiryDate <= now)
          .forEach((item) => {
            alerts.push({
              type: "expired",
              productName: item.productName,
              quantity: item.quantity,
              priority: "high",
            });
          });

        setInventoryAlerts(alerts.slice(0, 10)); // Limit to 10 alerts
      });
      unsubscribers.push(inventoryUnsubscribe);

      // 3. Customers data listener
      const customersQuery = query(collection(db, "customers"));
      const customersUnsubscribe = onSnapshot(customersQuery, (snapshot) => {
        setStats((prev) => ({
          ...prev,
          totalCustomers: snapshot.docs.length,
        }));
      });
      unsubscribers.push(customersUnsubscribe);

      return () => {
        unsubscribers.forEach((unsubscribe) => unsubscribe());
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    topProducts,
    recentActivities,
    inventoryAlerts,
    loading,
    refreshing,
    refresh,
  };
};
