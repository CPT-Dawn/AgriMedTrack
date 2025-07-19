import { Stack } from "expo-router";
import EditStockScreen from "../screens/EditStockScreen";

export default function EditStockPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title: "Edit Stock",
        }}
      />
      <EditStockScreen />
    </>
  );
}
