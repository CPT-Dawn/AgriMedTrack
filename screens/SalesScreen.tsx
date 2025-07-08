import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const VIBRANT_HEADER = {
  light: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
  dark: "linear-gradient(90deg, #232526 0%, #414345 100%)",
};

const MOCK_SALES = [
  {
    id: "1",
    date: "2024-06-10",
    soldTo: "Green Valley Farm",
    soldBy: "Alice",
    payment: { status: "completed" as const, amount: 0 },
    items: [
      { name: "Amoxicillin 100mg", qty: 10, price: 5 },
      { name: "Ivermectin 10ml", qty: 2, price: 12 },
    ],
    total: 74,
  },
  {
    id: "2",
    date: "2024-06-09",
    soldTo: "Sunrise Dairy",
    soldBy: "Bob",
    payment: { status: "partial" as const, amount: 30 },
    items: [{ name: "Amoxicillin 250mg", qty: 5, price: 8 }],
    total: 40,
  },
  {
    id: "3",
    date: "2024-06-08",
    soldTo: "AgroMart",
    soldBy: "Charlie",
    payment: { status: "pending" as const, amount: 0 },
    items: [{ name: "Ivermectin 50ml", qty: 1, price: 40 }],
    total: 40,
  },
];

type PaymentStatus = {
  status: "completed" | "pending" | "partial";
  amount: number;
};

function getPaymentStatus(payment: PaymentStatus) {
  if (payment.status === "completed") return "Completed";
  if (payment.status === "pending") return "Pending";
  if (payment.status === "partial") return `Partial (₹${payment.amount})`;
  return "";
}

export default function SalesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [sales] = useState(MOCK_SALES);
  const [form, setForm] = useState({
    date: "",
    soldTo: "",
    soldBy: "",
    paymentStatus: "pending",
    paymentAmount: "",
    items: "",
    total: "",
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#43cea2", dark: "#232526" }}
      headerImage={
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={styles.headerImageWrap}
        >
          <IconSymbol
            name="cart.fill"
            size={120}
            color="#fff"
            style={{ opacity: 0.9 }}
          />
          <ThemedText type="title" style={styles.headerTitle}>
            Sales
          </ThemedText>
        </Animated.View>
      }
    >
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 80).duration(600)}
            style={styles.cardShadow}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <IconSymbol
                  name="cart.fill"
                  size={28}
                  color="#43cea2"
                  style={{ marginRight: 8 }}
                />
                <ThemedText type="subtitle" style={{ flex: 1 }}>
                  {item.soldTo}
                </ThemedText>
                <ThemedText style={styles.soldBy}>By: {item.soldBy}</ThemedText>
              </View>
              <ThemedText style={styles.date}>Date: {item.date}</ThemedText>
              <ThemedText style={styles.paymentStatus}>
                Payment: {getPaymentStatus(item.payment)}
              </ThemedText>
              <View style={styles.itemsRow}>
                {item.items.map((itm, idx) => (
                  <View key={idx} style={styles.itemBox}>
                    <ThemedText style={styles.itemName}>{itm.name}</ThemedText>
                    <ThemedText style={styles.itemQty}>
                      Qty: {itm.qty}
                    </ThemedText>
                    <ThemedText style={styles.itemPrice}>
                      ₹{itm.price} ea
                    </ThemedText>
                  </View>
                ))}
              </View>
              <ThemedText style={styles.total}>Total: ₹{item.total}</ThemedText>
            </View>
          </Animated.View>
        )}
      />
      <Animated.View
        entering={FadeInUp.delay(300).duration(800)}
        style={styles.addButtonWrap}
      >
        <Pressable
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <IconSymbol name="plus.circle.fill" size={32} color="#fff" />
          <ThemedText style={styles.addButtonText}>Add Sale</ThemedText>
        </Pressable>
      </Animated.View>
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.modalContent}
          >
            <ThemedText
              type="title"
              style={{ marginBottom: 12, color: "#43cea2" }}
            >
              Add New Sale
            </ThemedText>
            <TextInput
              placeholder="Date (YYYY-MM-DD)"
              style={styles.input}
              value={form.date}
              onChangeText={(text) => setForm((f) => ({ ...f, date: text }))}
            />
            <TextInput
              placeholder="Sold To"
              style={styles.input}
              value={form.soldTo}
              onChangeText={(text) => setForm((f) => ({ ...f, soldTo: text }))}
            />
            <TextInput
              placeholder="Sold By"
              style={styles.input}
              value={form.soldBy}
              onChangeText={(text) => setForm((f) => ({ ...f, soldBy: text }))}
            />
            <TextInput
              placeholder="Payment Status (pending, partial, completed)"
              style={styles.input}
              value={form.paymentStatus}
              onChangeText={(text) =>
                setForm((f) => ({ ...f, paymentStatus: text }))
              }
            />
            {form.paymentStatus === "partial" && (
              <TextInput
                placeholder="Partial Payment Amount"
                style={styles.input}
                value={form.paymentAmount}
                onChangeText={(text) =>
                  setForm((f) => ({ ...f, paymentAmount: text }))
                }
              />
            )}
            <TextInput
              placeholder="Items Sold (e.g. Amoxicillin 100mg:10:5, Ivermectin 10ml:2:12)"
              style={styles.input}
              value={form.items}
              onChangeText={(text) => setForm((f) => ({ ...f, items: text }))}
            />
            <TextInput
              placeholder="Total Cost (₹)"
              style={styles.input}
              value={form.total}
              onChangeText={(text) => setForm((f) => ({ ...f, total: text }))}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={{ color: "#fff" }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#43cea2" }]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={{ color: "#fff" }}>Add</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
    textShadowColor: "#0008",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 120,
  },
  cardShadow: {
    shadowColor: "#43cea2",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    borderRadius: 20,
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    borderLeftWidth: 6,
    borderLeftColor: "#43cea2",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  soldBy: {
    fontSize: 13,
    color: "#185a9d",
    marginLeft: 8,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    color: "#43cea2",
    marginBottom: 4,
    fontWeight: "bold",
  },
  paymentStatus: {
    fontSize: 13,
    color: "#185a9d",
    marginBottom: 8,
    fontWeight: "bold",
  },
  itemsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  itemBox: {
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#43cea2",
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#185a9d",
  },
  itemQty: {
    fontSize: 12,
    color: "#43cea2",
  },
  itemPrice: {
    fontSize: 12,
    color: "#185a9d",
    fontWeight: "bold",
  },
  total: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#43cea2",
    marginTop: 4,
    textAlign: "right",
  },
  addButtonWrap: {
    position: "absolute",
    right: 24,
    bottom: 32,
    zIndex: 10,
    shadowColor: "#185a9d",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 32,
  },
  addButton: {
    backgroundColor: "#185a9d",
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 18,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(24,90,157,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: "90%",
    elevation: 12,
    shadowColor: "#43cea2",
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#43cea2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: "#f0fefe",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    backgroundColor: "#185a9d",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginLeft: 8,
  },
});
