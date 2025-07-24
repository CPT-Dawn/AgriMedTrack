import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { colors, fonts } from "../theme";

interface ChipProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}) => {
  const getChipStyles = () => {
    if (disabled) {
      return {
        backgroundColor: colors.background,
        borderColor: colors.textSecondary,
        textColor: colors.textSecondary,
      };
    }

    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.surface,
        };
      case "secondary":
        return {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          textColor: colors.primary,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.surface,
        };
    }
  };

  const styles = getChipStyles();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: styles.backgroundColor,
        borderWidth: 1,
        borderColor: styles.borderColor,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: styles.textColor,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Chip;
