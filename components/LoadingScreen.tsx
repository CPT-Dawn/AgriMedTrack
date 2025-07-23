import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { colors, fonts } from "../theme";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
}) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 24,
      }}
    >
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ marginBottom: 16 }}
      />
      <Text
        style={{
          fontSize: 16,
          fontFamily: fonts.body,
          color: colors.textSecondary,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default LoadingScreen;
