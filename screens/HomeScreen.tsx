import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const BUSINESS_METRICS = {
  totalSales: "₹1,25,000",
  totalItems: 156,
  lowStockItems: 8,
  monthlyGrowth: "+12.5%",
};

const RECENT_SALES = [
  {
    id: "1",
    customer: "Green Valley Farm",
    amount: "₹12,500",
    time: "2 hours ago",
  },
  { id: "2", customer: "Sunrise Dairy", amount: "₹8,750", time: "4 hours ago" },
  { id: "3", customer: "AgroMart", amount: "₹15,200", time: "6 hours ago" },
];

const LOW_STOCK_ALERTS = [
  { id: "1", item: "Amoxicillin 100mg", current: 5, min: 10 },
  { id: "2", item: "Ivermectin 10ml", current: 3, min: 8 },
  { id: "3", item: "Vitamin B12", current: 2, min: 5 },
];

const QUICK_ACTIONS = [
  { id: "1", title: "Add Sale", icon: "💸", color: "#43cea2" },
  { id: "2", title: "Add Stock", icon: "💊", color: "#185a9d" },
  { id: "3", title: "View Reports", icon: "📊", color: "#ff6b6b" },
  { id: "4", title: "Settings", icon: "⚙️", color: "#f39c12" },
];

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#43cea2", dark: "#232526" }}
      headerImage={
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={styles.headerImageWrap}
        >
          <IconSymbol
            name="house.fill"
            size={120}
            color="#fff"
            style={{ opacity: 0.9 }}
          />
          <ThemedText type="title" style={styles.headerTitle}>
            AgriMedTrack
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Your Agricultural Medicine Hub
          </ThemedText>
        </Animated.View>
      }
    >
      {/* Welcome Section */}
      <Animated.View
        entering={FadeInUp.delay(100).duration(600)}
        style={styles.welcomeSection}
      >
        <ThemedText type="subtitle" style={styles.welcomeText}>
          Welcome back! 👋
        </ThemedText>
        <ThemedText style={styles.dateText}>
          Today is a great day for business
        </ThemedText>
      </Animated.View>

      {/* Business Metrics */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(600)}
        style={styles.section}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📈 Business Overview
        </ThemedText>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <ThemedText style={styles.metricIcon}>💰</ThemedText>
            <ThemedText style={styles.metricValue}>
              {BUSINESS_METRICS.totalSales}
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Total Sales</ThemedText>
            <ThemedText style={styles.metricGrowth}>
              {BUSINESS_METRICS.monthlyGrowth}
            </ThemedText>
          </View>
          <View style={styles.metricCard}>
            <ThemedText style={styles.metricIcon}>📦</ThemedText>
            <ThemedText style={styles.metricValue}>
              {BUSINESS_METRICS.totalItems}
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Stock Items</ThemedText>
            <ThemedText style={styles.metricGrowth}>+5 items</ThemedText>
          </View>
          <View style={styles.metricCard}>
            <ThemedText style={styles.metricIcon}>⚠️</ThemedText>
            <ThemedText style={styles.metricValue}>
              {BUSINESS_METRICS.lowStockItems}
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Low Stock</ThemedText>
            <ThemedText style={styles.metricGrowth}>Needs attention</ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(600)}
        style={styles.section}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          ⚡ Quick Actions
        </ThemedText>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, index) => (
            <Pressable
              key={action.id}
              style={[styles.actionCard, { backgroundColor: action.color }]}
            >
              <ThemedText style={styles.actionIcon}>{action.icon}</ThemedText>
              <ThemedText style={styles.actionTitle}>{action.title}</ThemedText>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Recent Sales */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(600)}
        style={styles.section}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          🕒 Recent Sales
        </ThemedText>
        <View style={styles.card}>
          {RECENT_SALES.map((sale, index) => (
            <View
              key={sale.id}
              style={[
                styles.saleRow,
                index < RECENT_SALES.length - 1 && styles.saleRowBorder,
              ]}
            >
              <View style={styles.saleInfo}>
                <ThemedText style={styles.customerName}>
                  {sale.customer}
                </ThemedText>
                <ThemedText style={styles.saleTime}>{sale.time}</ThemedText>
              </View>
              <ThemedText style={styles.saleAmount}>{sale.amount}</ThemedText>
            </View>
          ))}
          <Pressable style={styles.viewAllButton}>
            <ThemedText style={styles.viewAllText}>View All Sales ›</ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      {/* Low Stock Alerts */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(600)}
        style={styles.section}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          🚨 Low Stock Alerts
        </ThemedText>
        <View style={styles.card}>
          {LOW_STOCK_ALERTS.map((alert, index) => (
            <View
              key={alert.id}
              style={[
                styles.alertRow,
                index < LOW_STOCK_ALERTS.length - 1 && styles.alertRowBorder,
              ]}
            >
              <View style={styles.alertInfo}>
                <ThemedText style={styles.alertItem}>{alert.item}</ThemedText>
                <ThemedText style={styles.alertStatus}>
                  Current: {alert.current} | Min: {alert.min}
                </ThemedText>
              </View>
              <Pressable style={styles.restockButton}>
                <ThemedText style={styles.restockText}>Restock</ThemedText>
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.viewAllButton}>
            <ThemedText style={styles.viewAllText}>
              View All Alerts ›
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      {/* Business Tips */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(600)}
        style={styles.tipSection}
      >
        <View style={styles.tipCard}>
          <ThemedText style={styles.tipIcon}>💡</ThemedText>
          <ThemedText style={styles.tipTitle}>Business Tip</ThemedText>
          <ThemedText style={styles.tipText}>
            Keep track of seasonal demands for agricultural medicines. Stock up
            before peak farming seasons!
          </ThemedText>
        </View>
      </Animated.View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 8,
    textShadowColor: "#0008",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    color: "#fff",
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
    textShadowColor: "#0008",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#185a9d",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#185a9d",
    marginBottom: 12,
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#43cea2",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#43cea2",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  metricGrowth: {
    fontSize: 12,
    color: "#43cea2",
    fontWeight: "bold",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#43cea2",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#43cea2",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  saleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  saleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  saleInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#185a9d",
  },
  saleTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#43cea2",
  },
  alertRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  alertRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  alertInfo: {
    flex: 1,
  },
  alertItem: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#185a9d",
  },
  alertStatus: {
    fontSize: 14,
    color: "#ff6b6b",
    marginTop: 2,
  },
  restockButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  restockText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: "#43cea2",
    fontSize: 16,
    fontWeight: "bold",
  },
  tipSection: {
    marginBottom: 40,
  },
  tipCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#43cea2",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#185a9d",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
