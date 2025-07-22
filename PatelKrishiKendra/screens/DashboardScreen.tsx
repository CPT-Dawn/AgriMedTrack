import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../theme";

export default function DashboardScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: fonts.headline,
          fontSize: 24,
          color: colors.primary,
        }}
      >
        Dashboard
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          color: colors.textPrimary,
        }}
      >
        Your business at a glance.
      </Text>
    </View>
  );
}
