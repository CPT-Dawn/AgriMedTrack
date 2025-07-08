import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

const MOCK_STOCK = [
  {
    id: "1",
    medicine: "Amoxicillin",
    supplier: "AgroPharma",
    boughtOn: "2024-06-01",
    sizes: [
      { size: "100mg", quantity: 50 },
      { size: "250mg", quantity: 30 },
    ],
  },
  {
    id: "2",
    medicine: "Ivermectin",
    supplier: "VetMed",
    boughtOn: "2024-05-20",
    sizes: [
      { size: "10ml", quantity: 20 },
      { size: "50ml", quantity: 10 },
    ],
  },
];

export default function StockScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [stock] = useState(MOCK_STOCK);

  // Form state (for demo, not functional)
  const [form, setForm] = useState({
    medicine: "",
    supplier: "",
    boughtOn: "",
    sizes: "",
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Stock Inventory
      </ThemedText>
      <FlatList
        data={stock}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <IconSymbol
                name="pills.fill"
                size={28}
                color={Colors.light.tint}
                style={{ marginRight: 8 }}
              />
              <ThemedText type="subtitle" style={{ flex: 1 }}>
                {item.medicine}
              </ThemedText>
              <ThemedText style={styles.supplier}>{item.supplier}</ThemedText>
            </View>
            <ThemedText style={styles.date}>Bought: {item.boughtOn}</ThemedText>
            <View style={styles.sizesRow}>
              {item.sizes.map((sz, idx) => (
                <View key={idx} style={styles.sizeBox}>
                  <ThemedText style={styles.sizeText}>{sz.size}</ThemedText>
                  <ThemedText style={styles.qtyText}>
                    {sz.quantity} pcs
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      />
      <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
        <IconSymbol name="plus.circle.fill" size={32} color="#fff" />
        <ThemedText style={styles.addButtonText}>Add Stock</ThemedText>
      </Pressable>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="title" style={{ marginBottom: 12 }}>
              Add New Stock
            </ThemedText>
            <TextInput
              placeholder="Medicine Name"
              style={styles.input}
              value={form.medicine}
              onChangeText={(text) =>
                setForm((f) => ({ ...f, medicine: text }))
              }
            />
            <TextInput
              placeholder="Supplier"
              style={styles.input}
              value={form.supplier}
              onChangeText={(text) =>
                setForm((f) => ({ ...f, supplier: text }))
              }
            />
            <TextInput
              placeholder="Bought On (YYYY-MM-DD)"
              style={styles.input}
              value={form.boughtOn}
              onChangeText={(text) =>
                setForm((f) => ({ ...f, boughtOn: text }))
              }
            />
            <TextInput
              placeholder="Sizes & Quantities (e.g. 100mg:50, 250mg:30)"
              style={styles.input}
              value={form.sizes}
              onChangeText={(text) => setForm((f) => ({ ...f, sizes: text }))}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={{ color: "#fff" }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: Colors.light.tint },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={{ color: "#fff" }}>Add</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 0,
  },
  header: {
    marginTop: Platform.select({ ios: 60, android: 40, default: 30 }),
    marginBottom: 16,
    alignSelf: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  supplier: {
    fontSize: 13,
    color: Colors.light.icon,
    marginLeft: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.light.icon,
    marginBottom: 8,
  },
  sizesRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  sizeBox: {
    backgroundColor: "#F2F4F7",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  sizeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
  },
  qtyText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  addButton: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: Colors.light.tint,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    backgroundColor: Colors.light.icon,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginLeft: 8,
  },
});
