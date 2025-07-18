import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import EditStockScreen from "../../screens/EditStockScreen";
import StockScreen from "../../screens/StockScreen";

const Stack = createNativeStackNavigator();

export default function StockStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StockMain" component={StockScreen} />
      <Stack.Screen name="EditStock" component={EditStockScreen} />
    </Stack.Navigator>
  );
}
