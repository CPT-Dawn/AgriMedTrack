import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../theme";

export default function InventoryScreen() {
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
        Inventory
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          color: colors.textPrimary,
        }}
      >
        Manage your stock here.
      </Text>
    </View>
  );
}
