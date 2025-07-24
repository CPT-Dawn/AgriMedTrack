import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../theme";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: "inventory" | "search";
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = "inventory",
}) => {
  const renderIcon = () => {
    if (icon === "search") {
      return (
        <View
          style={{
            width: 80,
            height: 80,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {/* Search icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 3,
              borderColor: colors.textSecondary,
              opacity: 0.3,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 20,
              height: 3,
              backgroundColor: colors.textSecondary,
              opacity: 0.3,
              transform: [{ rotate: "45deg" }],
              bottom: 20,
              right: 20,
            }}
          />
        </View>
      );
    }

    // Default inventory icon
    return (
      <View
        style={{
          width: 80,
          height: 80,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {/* Box icon */}
        <View
          style={{
            width: 50,
            height: 40,
            borderWidth: 2,
            borderColor: colors.textSecondary,
            borderRadius: 4,
            opacity: 0.3,
            position: "relative",
          }}
        >
          {/* Box lid */}
          <View
            style={{
              position: "absolute",
              top: -8,
              left: -2,
              right: -2,
              height: 8,
              backgroundColor: colors.textSecondary,
              opacity: 0.3,
              borderRadius: 2,
            }}
          />
          {/* Box lines */}
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              right: 8,
              height: 1,
              backgroundColor: colors.textSecondary,
              opacity: 0.2,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 16,
              left: 8,
              right: 8,
              height: 1,
              backgroundColor: colors.textSecondary,
              opacity: 0.2,
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingVertical: 64,
      }}
    >
      {renderIcon()}

      <Text
        style={{
          fontFamily: fonts.headline,
          fontSize: 18,
          color: colors.textPrimary,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default EmptyState;
