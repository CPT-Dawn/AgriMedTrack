import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { colors, fonts } from "../theme";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: "plus" | "add";
  label?: string;
  disabled?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = "plus",
  label,
  disabled = false,
}) => {
  const renderIcon = () => {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Plus icon */}
        <View
          style={{
            width: 20,
            height: 3,
            backgroundColor: colors.surface,
            borderRadius: 2,
          }}
        />
        <View
          style={{
            width: 3,
            height: 20,
            backgroundColor: colors.surface,
            borderRadius: 2,
            position: "absolute",
          }}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 24,
        right: 16,
        backgroundColor: disabled ? colors.textSecondary : colors.primary,
        borderRadius: label ? 28 : 28,
        paddingHorizontal: label ? 20 : 0,
        paddingVertical: label ? 12 : 0,
        width: label ? undefined : 56,
        height: label ? undefined : 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
      }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {renderIcon()}
      {label && (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.surface,
            fontWeight: "600",
            marginLeft: 8,
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default FloatingActionButton;
