import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { colors, fonts } from "../theme";
import { useToast } from "../hooks/useToast";
import { Product, Supplier, InventoryItem } from "../types/inventory";

interface InventoryItemFormProps {
  item: InventoryItem;
  index: number;
  products: Product[];
  suppliers: Supplier[];
  onUpdate: (updates: Partial<InventoryItem>) => void;
  onRemove: () => void;
  onAddProduct: (name: string, category?: string) => Promise<Product>;
  onAddSupplier: (name: string) => Promise<Supplier>;
  showRemove: boolean;
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  item,
  index,
  products,
  suppliers,
  onUpdate,
  onRemove,
  onAddProduct,
  onAddSupplier,
  showRemove,
}) => {
  const { showSuccess, showError } = useToast();
  const [showMfgDatePicker, setShowMfgDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      showError("Please enter a product name");
      return;
    }

    try {
      const newProduct = await onAddProduct(newProductName.trim());
      onUpdate({
        productId: newProduct.id,
        productName: newProduct.name,
      });
      setNewProductName("");
      setShowAddProduct(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      showError("Please enter a supplier name");
      return;
    }

    try {
      const newSupplier = await onAddSupplier(newSupplierName.trim());
      onUpdate({
        supplierId: newSupplier.id,
        supplierName: newSupplier.name,
      });
      setNewSupplierName("");
      setShowAddSupplier(false);
    } catch (error) {
      console.error("Error adding supplier:", error);
    }
  };

  const renderInput = (
    label: string,
    value: string | number,
    onChangeText: (text: string) => void,
    placeholder?: string,
    keyboardType: "default" | "numeric" | "decimal-pad" = "default",
    multiline = false
  ) => (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: colors.textPrimary,
          marginBottom: 8,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.textSecondary + "30",
          borderRadius: 8,
          padding: 12,
          fontFamily: fonts.body,
          fontSize: 16,
          color: colors.textPrimary,
          minHeight: multiline ? 80 : 48,
          textAlignVertical: multiline ? "top" : "center",
        }}
        value={value.toString()}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );

  const renderPicker = (
    label: string,
    value: string,
    onValueChange: (value: string) => void,
    items: Array<{ label: string; value: string }>,
    showAddButton = false,
    onAddPress?: () => void
  ) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const selectedItem = items.find((item) => item.value === value);

    return (
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textPrimary,
            marginBottom: 8,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.textSecondary + "30",
            borderRadius: 8,
            padding: 12,
            minHeight: 48,
            justifyContent: "center",
          }}
          onPress={() => setShowDropdown(true)}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 16,
              color: selectedItem ? colors.textPrimary : colors.textSecondary,
            }}
          >
            {selectedItem ? selectedItem.label : `Select ${label}`}
          </Text>
        </TouchableOpacity>

        {/* Dropdown Modal */}
        <Modal
          visible={showDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 20,
                maxHeight: "70%",
                width: "90%",
                maxWidth: 400,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 18,
                  color: colors.textPrimary,
                  marginBottom: 16,
                }}
              >
                Select {label}
              </Text>
              <ScrollView>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.textSecondary + "20",
                    }}
                    onPress={() => {
                      onValueChange(item.value);
                      setShowDropdown(false);
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 16,
                        color: colors.textPrimary,
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.textSecondary,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginTop: 16,
                }}
                onPress={() => setShowDropdown(false)}
              >
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: colors.surface,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {showAddButton && (
          <TouchableOpacity
            style={{
              marginTop: 8,
              backgroundColor: colors.secondary,
              padding: 8,
              borderRadius: 6,
              alignItems: "center",
            }}
            onPress={onAddPress}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: colors.surface,
                fontWeight: "600",
              }}
            >
              + Add New {label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderDatePicker = (
    label: string,
    value: Date,
    onChange: (date: Date) => void,
    showPicker: boolean,
    setShowPicker: (show: boolean) => void
  ) => {
    const [showDateModal, setShowDateModal] = useState(false);
    const [tempDate, setTempDate] = useState(value);

    const handleDateChange = () => {
      onChange(tempDate);
      setShowDateModal(false);
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    return (
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textPrimary,
            marginBottom: 8,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.textSecondary + "30",
            borderRadius: 8,
            padding: 12,
            minHeight: 48,
            justifyContent: "center",
          }}
          onPress={() => setShowDateModal(true)}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 16,
              color: colors.textPrimary,
            }}
          >
            {formatDate(value)}
          </Text>
        </TouchableOpacity>

        {/* Date Modal */}
        <Modal
          visible={showDateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDateModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 20,
                width: "90%",
                maxWidth: 400,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.headline,
                  fontSize: 18,
                  color: colors.textPrimary,
                  marginBottom: 16,
                }}
              >
                Select {label}
              </Text>

              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 16,
                }}
              >
                Current: {formatDate(tempDate)}
              </Text>

              {/* Simple date input - you can replace this with a proper date picker */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  For now, use the buttons below or implement a proper date
                  picker
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.primary,
                      padding: 8,
                      borderRadius: 6,
                    }}
                    onPress={() => setTempDate(new Date())}
                  >
                    <Text
                      style={{
                        color: colors.surface,
                        fontSize: 12,
                        fontFamily: fonts.body,
                      }}
                    >
                      Today
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.secondary,
                      padding: 8,
                      borderRadius: 6,
                    }}
                    onPress={() => {
                      const nextYear = new Date(tempDate);
                      nextYear.setFullYear(nextYear.getFullYear() + 1);
                      setTempDate(nextYear);
                    }}
                  >
                    <Text
                      style={{
                        color: colors.surface,
                        fontSize: 12,
                        fontFamily: fonts.body,
                      }}
                    >
                      +1 Year
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={handleDateChange}
                >
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 14,
                      color: colors.surface,
                      fontWeight: "600",
                    }}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.textSecondary,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    setTempDate(value);
                    setShowDateModal(false);
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 14,
                      color: colors.surface,
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.textSecondary + "20",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.headline,
            fontSize: 18,
            color: colors.textPrimary,
          }}
        >
          Item #{index + 1}
        </Text>
        {showRemove && (
          <TouchableOpacity
            style={{
              backgroundColor: colors.error,
              padding: 8,
              borderRadius: 6,
            }}
            onPress={onRemove}
          >
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: colors.surface,
                fontWeight: "600",
              }}
            >
              Remove
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Product Picker */}
      {renderPicker(
        "Product",
        item.productId,
        (value) => {
          const selectedProduct = products.find((p) => p.id === value);
          onUpdate({
            productId: value,
            productName: selectedProduct?.name || "",
          });
        },
        products.map((p) => ({ label: p.name, value: p.id })),
        true,
        () => setShowAddProduct(true)
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <View
          style={{
            backgroundColor: colors.background,
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.primary,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textPrimary,
              marginBottom: 8,
              fontWeight: "600",
            }}
          >
            Add New Product
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.textSecondary + "30",
              borderRadius: 8,
              padding: 12,
              fontFamily: fonts.body,
              fontSize: 16,
              color: colors.textPrimary,
              marginBottom: 12,
            }}
            value={newProductName}
            onChangeText={setNewProductName}
            placeholder="Enter product name"
            placeholderTextColor={colors.textSecondary}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                padding: 12,
                borderRadius: 6,
                alignItems: "center",
              }}
              onPress={handleAddProduct}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.surface,
                  fontWeight: "600",
                }}
              >
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.textSecondary,
                padding: 12,
                borderRadius: 6,
                alignItems: "center",
              }}
              onPress={() => {
                setShowAddProduct(false);
                setNewProductName("");
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.surface,
                  fontWeight: "600",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Supplier Picker */}
      {renderPicker(
        "Supplier",
        item.supplierId,
        (value) => {
          const selectedSupplier = suppliers.find((s) => s.id === value);
          onUpdate({
            supplierId: value,
            supplierName: selectedSupplier?.name || "",
          });
        },
        suppliers.map((s) => ({ label: s.name, value: s.id })),
        true,
        () => setShowAddSupplier(true)
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <View
          style={{
            backgroundColor: colors.background,
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.primary,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textPrimary,
              marginBottom: 8,
              fontWeight: "600",
            }}
          >
            Add New Supplier
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.textSecondary + "30",
              borderRadius: 8,
              padding: 12,
              fontFamily: fonts.body,
              fontSize: 16,
              color: colors.textPrimary,
              marginBottom: 12,
            }}
            value={newSupplierName}
            onChangeText={setNewSupplierName}
            placeholder="Enter supplier name"
            placeholderTextColor={colors.textSecondary}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                padding: 12,
                borderRadius: 6,
                alignItems: "center",
              }}
              onPress={handleAddSupplier}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.surface,
                  fontWeight: "600",
                }}
              >
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.textSecondary,
                padding: 12,
                borderRadius: 6,
                alignItems: "center",
              }}
              onPress={() => {
                setShowAddSupplier(false);
                setNewSupplierName("");
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.surface,
                  fontWeight: "600",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Packaging Size - Split into value and unit */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          {renderInput(
            "Package Size",
            item.packagingSizeValue,
            (text) =>
              onUpdate({
                packagingSizeValue: parseFloat(text) || 0,
              }),
            "50",
            "decimal-pad"
          )}
        </View>
        <View style={{ flex: 1 }}>
          {renderInput(
            "Unit",
            item.packagingUnit,
            (text) => onUpdate({ packagingUnit: text }),
            "kg"
          )}
        </View>
      </View>

      {/* Batch Number */}
      {renderInput(
        "Batch Number",
        item.batchNumber,
        (text) => onUpdate({ batchNumber: text }),
        "BATCH001"
      )}

      {/* Quantity */}
      {renderInput(
        "Quantity",
        item.quantityAdded,
        (text) => onUpdate({ quantityAdded: parseInt(text) || 0 }),
        "100",
        "numeric"
      )}

      {/* Prices */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          {renderInput(
            "Buy Price",
            item.buyPrice,
            (text) => onUpdate({ buyPrice: parseFloat(text) || 0 }),
            "500",
            "decimal-pad"
          )}
        </View>
        <View style={{ flex: 1 }}>
          {renderInput(
            "Sell Price",
            item.sellPrice,
            (text) => onUpdate({ sellPrice: parseFloat(text) || 0 }),
            "600",
            "decimal-pad"
          )}
        </View>
      </View>

      {/* Dates */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          {renderDatePicker(
            "Manufacturing Date",
            item.mfgDate,
            (date) => onUpdate({ mfgDate: date }),
            showMfgDatePicker,
            setShowMfgDatePicker
          )}
        </View>
        <View style={{ flex: 1 }}>
          {renderDatePicker(
            "Expiry Date",
            item.expiryDate,
            (date) => onUpdate({ expiryDate: date }),
            showExpiryDatePicker,
            setShowExpiryDatePicker
          )}
        </View>
      </View>
    </View>
  );
};

export default InventoryItemForm;
