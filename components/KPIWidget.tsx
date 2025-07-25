import React from "react";
import { Box, HStack, VStack, Text, Heading } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../theme";
import Animated, { FadeInRight } from "react-native-reanimated";

interface KPIWidgetProps {
  title: string;
  currentValue: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  icon: string;
  iconColor: string;
  showTrend?: boolean;
  formatAsCurrency?: boolean;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  currentValue,
  previousValue = 0,
  prefix = "",
  suffix = "",
  icon,
  iconColor,
  showTrend = true,
  formatAsCurrency = false,
}) => {
  const formatValue = (value: number) => {
    if (formatAsCurrency) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return `${prefix}${value.toLocaleString()}${suffix}`;
  };

  const calculateTrend = () => {
    if (!showTrend || previousValue === 0) return null;

    const percentChange =
      ((currentValue - previousValue) / previousValue) * 100;
    const isPositive = percentChange >= 0;

    return {
      percentage: Math.abs(percentChange).toFixed(1),
      isPositive,
      icon: isPositive ? "trending-up" : "trending-down",
      color: isPositive ? colors.success : colors.error,
    };
  };

  const trend = calculateTrend();

  return (
    <Animated.View entering={FadeInRight.duration(600)}>
      <Box
        bg={colors.surface}
        p="$4"
        borderRadius="$lg"
        shadowColor="$black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
        elevation={3}
        minH="$20"
      >
        <VStack space="sm" flex={1}>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack flex={1} space="xs">
              <Text
                size="xs"
                color={colors.textSecondary}
                fontFamily={fonts.body}
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                {title}
              </Text>
              <Heading
                size="xl"
                color={colors.textPrimary}
                fontFamily={fonts.headline}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatValue(currentValue)}
              </Heading>
            </VStack>
            <Box bg={iconColor} p="$2" borderRadius="$full" opacity={0.9}>
              <Ionicons name={icon as any} size={20} color="white" />
            </Box>
          </HStack>

          {trend && (
            <HStack space="xs" alignItems="center">
              <Ionicons
                name={trend.icon as any}
                size={16}
                color={trend.color}
              />
              <Text size="sm" color={trend.color} fontFamily={fonts.headline}>
                {trend.percentage}%
              </Text>
              <Text
                size="xs"
                color={colors.textSecondary}
                fontFamily={fonts.body}
              >
                vs last period
              </Text>
            </HStack>
          )}
        </VStack>
      </Box>
    </Animated.View>
  );
};

export default KPIWidget;
