import React, { useState, useEffect } from "react";
import { ScrollView, RefreshControl, Dimensions, Alert } from "react-native";
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  Heading,
  Divider,
  Icon,
} from "@gluestack-ui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../theme";
import LoadingScreen from "../components/LoadingScreen";
import StatsCard from "../components/StatsCard";
import { useDashboard } from "../hooks/useDashboard";
import { seedDashboardData } from "../utils/dashboardSeedData";
import Animated, {
  FadeInUp,
  FadeInDown,
  Layout,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

const DashboardScreen = ({ navigation }: any) => {
  const {
    stats,
    topProducts,
    recentActivities,
    inventoryAlerts,
    loading,
    refreshing,
    refresh,
  } = useDashboard();

  const cardScale = useSharedValue(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const navigateToScreen = (screen: string) => {
    navigation.navigate(screen);
  };

  const onRefresh = () => {
    refresh();
  };

  const handleSeedData = async () => {
    try {
      const result = await seedDashboardData();
      if (result.success) {
        Alert.alert("Success", "Sample data has been added to the database!");
        refresh();
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to seed data");
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)}>
          <Box px="$4" pt="$4" pb="$2">
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Heading
                  size="xl"
                  color={colors.textPrimary}
                  fontFamily={fonts.headline}
                >
                  Dashboard
                </Heading>
                <Text
                  size="sm"
                  color={colors.textSecondary}
                  fontFamily={fonts.body}
                >
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </VStack>
              <HStack space="sm">
                {/* Development Seed Data Button */}
                {__DEV__ && (
                  <Pressable
                    onPress={handleSeedData}
                    bg={colors.secondary}
                    p="$2"
                    borderRadius="$md"
                    shadowColor={colors.secondary}
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.25}
                    shadowRadius={2}
                    elevation={3}
                  >
                    <Ionicons name="download" size={20} color="white" />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => navigation.navigate("AddSale")}
                  bg={colors.primary}
                  p="$3"
                  borderRadius="$full"
                  shadowColor={colors.primary}
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.25}
                  shadowRadius={4}
                  elevation={5}
                >
                  <Ionicons name="add" size={24} color="white" />
                </Pressable>
              </HStack>
            </HStack>
          </Box>
        </Animated.View>

        {/* Quick Stats Cards */}
        <Animated.View entering={FadeInUp.duration(800).delay(200)}>
          <Box px="$4" pb="$4">
            <VStack space="sm">
              {/* Today's Sales - Hero Card */}
              <Pressable onPress={() => navigateToScreen("Sales")}>
                <Box
                  bg={colors.surface}
                  p="$4"
                  borderRadius="$lg"
                  shadowColor="$black"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.15}
                  shadowRadius={4}
                  elevation={5}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 12,
                    }}
                  />
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack flex={1}>
                      <Text
                        size="sm"
                        color="$white"
                        opacity={0.9}
                        fontFamily={fonts.body}
                      >
                        Today's Sales Revenue
                      </Text>
                      <Heading
                        size="2xl"
                        color="$white"
                        fontFamily={fonts.headline}
                      >
                        {formatCurrency(stats.totalSalesToday)}
                      </Heading>
                      <Text
                        size="xs"
                        color="$white"
                        opacity={0.8}
                        fontFamily={fonts.body}
                      >
                        {stats.totalSalesCount} total transactions
                      </Text>
                    </VStack>
                    <Box bg="$white" p="$3" borderRadius="$full" opacity={0.9}>
                      <Ionicons
                        name="trending-up"
                        size={28}
                        color={colors.primary}
                      />
                    </Box>
                  </HStack>
                </Box>
              </Pressable>

              {/* Monthly Sales & Pending Payments */}
              <HStack space="sm">
                <StatsCard
                  title="This Month"
                  value={stats.totalSalesThisMonth}
                  subtitle={`Avg: ${formatCurrency(stats.averageOrderValue)}`}
                  icon="calendar"
                  iconColor={colors.success}
                  onPress={() => navigateToScreen("Sales")}
                  delay={100}
                />
                <StatsCard
                  title="Pending Payments"
                  value={stats.totalPendingPayments}
                  subtitle="Requires follow-up"
                  icon="time"
                  iconColor={colors.warning}
                  onPress={() => navigateToScreen("Sales")}
                  delay={150}
                />
              </HStack>

              {/* Inventory Overview Grid */}
              <VStack space="sm">
                <HStack space="sm">
                  <StatsCard
                    title="Inventory Value"
                    value={stats.totalInventoryValue}
                    subtitle={`${stats.totalProducts} products`}
                    icon="cube"
                    iconColor={colors.secondary}
                    onPress={() => navigateToScreen("Inventory")}
                    delay={200}
                  />
                  <StatsCard
                    title="Low Stock"
                    value={stats.lowStockItems}
                    subtitle="Items below 10"
                    icon="warning"
                    iconColor={colors.error}
                    onPress={() => navigateToScreen("Inventory")}
                    delay={250}
                  />
                </HStack>

                <HStack space="sm">
                  <StatsCard
                    title="Expiring Soon"
                    value={stats.expiringItems}
                    subtitle="Next 30 days"
                    icon="time-outline"
                    iconColor={colors.warning}
                    onPress={() => navigateToScreen("Inventory")}
                    delay={300}
                  />
                  <StatsCard
                    title="Expired Items"
                    value={stats.expiredItems}
                    subtitle="Immediate action"
                    icon="close-circle"
                    iconColor={colors.error}
                    onPress={() => navigateToScreen("Inventory")}
                    delay={350}
                  />
                  <StatsCard
                    title="Customers"
                    value={stats.totalCustomers}
                    subtitle="Total registered"
                    icon="people"
                    iconColor={colors.primary}
                    onPress={() => navigateToScreen("Sales")}
                    delay={400}
                  />
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.duration(1000).delay(400)}>
          <Box px="$4" pb="$4">
            <Heading
              size="lg"
              color={colors.textPrimary}
              fontFamily={fonts.headline}
              mb="$3"
            >
              Quick Actions
            </Heading>
            <HStack space="sm">
              <Pressable
                flex={1}
                onPress={() => navigation.navigate("AddSale")}
              >
                <Box
                  bg={colors.surface}
                  p="$4"
                  borderRadius="$lg"
                  alignItems="center"
                  shadowColor="$black"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={2}
                  elevation={2}
                >
                  <Box bg={colors.primary} p="$3" borderRadius="$full" mb="$2">
                    <Ionicons name="add-circle" size={24} color="white" />
                  </Box>
                  <Text
                    size="sm"
                    color={colors.textPrimary}
                    fontFamily={fonts.body}
                    textAlign="center"
                  >
                    New Sale
                  </Text>
                </Box>
              </Pressable>

              <Pressable
                flex={1}
                onPress={() => navigation.navigate("AddInventory")}
              >
                <Box
                  bg={colors.surface}
                  p="$4"
                  borderRadius="$lg"
                  alignItems="center"
                  shadowColor="$black"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={2}
                  elevation={2}
                >
                  <Box
                    bg={colors.secondary}
                    p="$3"
                    borderRadius="$full"
                    mb="$2"
                  >
                    <Ionicons name="cube" size={24} color="white" />
                  </Box>
                  <Text
                    size="sm"
                    color={colors.textPrimary}
                    fontFamily={fonts.body}
                    textAlign="center"
                  >
                    Add Stock
                  </Text>
                </Box>
              </Pressable>

              <Pressable
                flex={1}
                onPress={() => navigation.navigate("ViewLogs")}
              >
                <Box
                  bg={colors.surface}
                  p="$4"
                  borderRadius="$lg"
                  alignItems="center"
                  shadowColor="$black"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={2}
                  elevation={2}
                >
                  <Box bg={colors.accent} p="$3" borderRadius="$full" mb="$2">
                    <Ionicons name="document-text" size={24} color="white" />
                  </Box>
                  <Text
                    size="sm"
                    color={colors.textPrimary}
                    fontFamily={fonts.body}
                    textAlign="center"
                  >
                    View Logs
                  </Text>
                </Box>
              </Pressable>
            </HStack>
          </Box>
        </Animated.View>

        {/* Inventory Alerts */}
        {inventoryAlerts.length > 0 && (
          <Animated.View entering={FadeInUp.duration(1000).delay(500)}>
            <Box px="$4" pb="$4">
              <HStack
                justifyContent="space-between"
                alignItems="center"
                mb="$3"
              >
                <Heading
                  size="lg"
                  color={colors.textPrimary}
                  fontFamily={fonts.headline}
                >
                  Inventory Alerts
                </Heading>
                <Pressable onPress={() => navigateToScreen("Inventory")}>
                  <Text
                    size="sm"
                    color={colors.primary}
                    fontFamily={fonts.body}
                  >
                    View All
                  </Text>
                </Pressable>
              </HStack>
              <VStack space="xs">
                {inventoryAlerts.slice(0, 3).map((alert, index) => (
                  <Box
                    key={index}
                    bg={colors.surface}
                    p="$3"
                    borderRadius="$lg"
                    borderLeftWidth={4}
                    borderLeftColor={
                      alert.priority === "high"
                        ? colors.error
                        : alert.priority === "medium"
                          ? colors.warning
                          : colors.secondary
                    }
                    shadowColor="$black"
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.1}
                    shadowRadius={2}
                    elevation={2}
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space="sm" alignItems="center" flex={1}>
                        <Box
                          bg={
                            alert.type === "expired"
                              ? colors.error
                              : alert.type === "expiring"
                                ? colors.warning
                                : colors.accent
                          }
                          p="$2"
                          borderRadius="$full"
                        >
                          <Ionicons
                            name={
                              alert.type === "expired"
                                ? "close-circle"
                                : alert.type === "expiring"
                                  ? "time"
                                  : "warning"
                            }
                            size={16}
                            color="white"
                          />
                        </Box>
                        <VStack flex={1}>
                          <Text
                            size="sm"
                            color={colors.textPrimary}
                            fontFamily={fonts.body}
                            numberOfLines={1}
                          >
                            {alert.productName}
                          </Text>
                          <Text size="xs" color={colors.textSecondary}>
                            {alert.type === "low_stock"
                              ? `Only ${alert.quantity} units left`
                              : alert.type === "expiring"
                                ? `Expires in ${alert.daysToExpiry} days`
                                : "Expired - Remove from inventory"}
                          </Text>
                        </VStack>
                      </HStack>
                      <Text
                        size="xs"
                        color={
                          alert.priority === "high"
                            ? colors.error
                            : alert.priority === "medium"
                              ? colors.warning
                              : colors.textSecondary
                        }
                        fontFamily={fonts.headline}
                      >
                        {alert.priority.toUpperCase()}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Animated.View>
        )}

        {/* Top Products */}
        <Animated.View entering={FadeInDown.duration(800).delay(600)}>
          <Box px="$4" pb="$4">
            <HStack justifyContent="space-between" alignItems="center" mb="$3">
              <Heading
                size="lg"
                color={colors.textPrimary}
                fontFamily={fonts.headline}
              >
                Top Selling Products
              </Heading>
              <Pressable onPress={() => navigateToScreen("Sales")}>
                <Text size="sm" color={colors.primary} fontFamily={fonts.body}>
                  View All
                </Text>
              </Pressable>
            </HStack>
            <VStack space="sm">
              {topProducts.map((product, index) => (
                <Box
                  key={product.id}
                  bg={colors.surface}
                  p="$4"
                  borderRadius="$lg"
                  shadowColor="$black"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={2}
                  elevation={2}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="sm" alignItems="center" flex={1}>
                      <Box
                        bg={
                          index === 0
                            ? colors.accent
                            : index === 1
                              ? colors.warning
                              : colors.primary
                        }
                        w="$10"
                        h="$10"
                        borderRadius="$full"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text
                          color="white"
                          fontFamily={fonts.headline}
                          size="lg"
                        >
                          {index + 1}
                        </Text>
                      </Box>
                      <VStack flex={1}>
                        <Text
                          size="md"
                          color={colors.textPrimary}
                          fontFamily={fonts.headline}
                          numberOfLines={1}
                        >
                          {product.name}
                        </Text>
                        <HStack space="md" alignItems="center">
                          <Text size="xs" color={colors.textSecondary}>
                            {product.quantity} units sold
                          </Text>
                          <Text size="xs" color={colors.success}>
                            {product.profitMargin.toFixed(1)}% margin
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    <VStack alignItems="flex-end">
                      <Text
                        size="md"
                        color={colors.primary}
                        fontFamily={fonts.headline}
                      >
                        {formatCurrency(product.revenue)}
                      </Text>
                      <Text size="xs" color={colors.textSecondary}>
                        Revenue
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
              {topProducts.length === 0 && (
                <Box
                  bg={colors.surface}
                  p="$6"
                  borderRadius="$lg"
                  alignItems="center"
                  shadowColor="$black"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={2}
                  elevation={2}
                >
                  <Ionicons
                    name="analytics-outline"
                    size={48}
                    color={colors.textSecondary}
                  />
                  <Text
                    size="sm"
                    color={colors.textSecondary}
                    textAlign="center"
                    mt="$2"
                    fontFamily={fonts.body}
                  >
                    No sales data available yet
                  </Text>
                  <Text
                    size="xs"
                    color={colors.textSecondary}
                    textAlign="center"
                    mt="$1"
                  >
                    Start making sales to see top products
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.duration(1000).delay(800)}>
          <Box px="$4" pb="$6">
            <HStack justifyContent="space-between" alignItems="center" mb="$3">
              <Heading
                size="lg"
                color={colors.textPrimary}
                fontFamily={fonts.headline}
              >
                Recent Activity
              </Heading>
              <Pressable onPress={() => navigateToScreen("Sales")}>
                <Text size="sm" color={colors.primary} fontFamily={fonts.body}>
                  View All
                </Text>
              </Pressable>
            </HStack>
            <VStack space="sm">
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  bg={colors.surface}
                  p="$4"
                  borderRadius="$lg"
                  shadowColor="$black"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={2}
                  elevation={2}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="sm" alignItems="center" flex={1}>
                      <Box
                        bg={
                          activity.status === "success"
                            ? colors.success
                            : activity.status === "warning"
                              ? colors.warning
                              : activity.status === "error"
                                ? colors.error
                                : colors.primary
                        }
                        p="$2"
                        borderRadius="$full"
                      >
                        <Ionicons
                          name={activity.icon as any}
                          size={20}
                          color="white"
                        />
                      </Box>
                      <VStack flex={1}>
                        <Text
                          size="sm"
                          color={colors.textPrimary}
                          fontFamily={fonts.body}
                          numberOfLines={1}
                        >
                          {activity.title}
                        </Text>
                        <Text size="xs" color={colors.textSecondary}>
                          {activity.subtitle}
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack alignItems="flex-end">
                      {activity.amount && (
                        <Text
                          size="sm"
                          color={colors.primary}
                          fontFamily={fonts.headline}
                        >
                          {formatCurrency(activity.amount)}
                        </Text>
                      )}
                      <Text size="xs" color={colors.textSecondary}>
                        {formatTimeAgo(activity.time)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
              {recentActivities.length === 0 && (
                <Box
                  bg={colors.surface}
                  p="$6"
                  borderRadius="$lg"
                  alignItems="center"
                  shadowColor="$black"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={2}
                  elevation={2}
                >
                  <Ionicons
                    name="time-outline"
                    size={48}
                    color={colors.textSecondary}
                  />
                  <Text
                    size="sm"
                    color={colors.textSecondary}
                    textAlign="center"
                    mt="$2"
                    fontFamily={fonts.body}
                  >
                    No recent activity
                  </Text>
                  <Text
                    size="xs"
                    color={colors.textSecondary}
                    textAlign="center"
                    mt="$1"
                  >
                    Start making sales to see activity here
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
