import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../theme";

export default function SalesScreen() {
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
        Sales
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          color: colors.textPrimary,
        }}
      >
        Track your sales here.
      </Text>
    </View>
  );
}
