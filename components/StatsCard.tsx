import React from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Heading,
  Pressable,
} from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../theme";
import Animated, { FadeInUp } from "react-native-reanimated";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor: string;
  backgroundColor?: string;
  onPress?: () => void;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  backgroundColor = colors.surface,
  onPress,
  delay = 0,
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      if (
        title.toLowerCase().includes("sales") ||
        title.toLowerCase().includes("pending") ||
        title.toLowerCase().includes("value")
      ) {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(delay)}>
      <Pressable onPress={onPress} disabled={!onPress}>
        <Box
          bg={backgroundColor}
          p="$4"
          borderRadius="$lg"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={3}
        >
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack flex={1} space="xs">
              <Text
                size="sm"
                color={colors.textSecondary}
                fontFamily={fonts.body}
                numberOfLines={1}
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
                {formatValue(value)}
              </Heading>
              {subtitle && (
                <Text
                  size="xs"
                  color={colors.textSecondary}
                  fontFamily={fonts.body}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </VStack>
            <Box bg={iconColor} p="$2" borderRadius="$full" opacity={0.9}>
              <Ionicons name={icon as any} size={20} color="white" />
            </Box>
          </HStack>
        </Box>
      </Pressable>
    </Animated.View>
  );
};

export default StatsCard;
