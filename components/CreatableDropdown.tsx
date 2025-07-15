import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppColors } from "../constants/Colors";
import { IconSymbol } from "./ui/IconSymbol";

interface DropdownOption {
  id: string;
  label: string;
}

interface CreatableDropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder: string;
  onSelect: (option: DropdownOption) => void;
  onCreate?: (name: string) => Promise<DropdownOption>;
  createLabel?: string;
  style?: any;
}

export function CreatableDropdown({
  options,
  value,
  placeholder,
  onSelect,
  onCreate,
  createLabel = "Create new",
  style,
}: CreatableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedOption = options.find((opt) => opt.id === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchText.toLowerCase())
  );

  const showCreateOption =
    onCreate &&
    searchText.length > 0 &&
    !filteredOptions.some(
      (opt) => opt.label.toLowerCase() === searchText.toLowerCase()
    );

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
    setSearchText("");
  };

  const handleCreate = async () => {
    if (!onCreate || !searchText.trim()) return;

    try {
      setIsCreating(true);
      const newOption = await onCreate(searchText.trim());
      handleSelect(newOption);
    } catch (error) {
      console.error("Error creating option:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <Pressable style={styles.optionItem} onPress={() => handleSelect(item)}>
      <Text style={styles.optionText}>{item.label}</Text>
    </Pressable>
  );

  return (
    <>
      <Pressable
        style={[styles.dropdown, style]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <IconSymbol name="chevron.down" size={16} color={AppColors.text} />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search or type to create..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderOption}
              style={styles.optionsList}
              keyboardShouldPersistTaps="handled"
            />

            {showCreateOption && (
              <Pressable
                style={styles.createOption}
                onPress={handleCreate}
                disabled={isCreating}
              >
                <IconSymbol
                  name="plus.circle"
                  size={16}
                  color={AppColors.accent}
                  style={styles.createIcon}
                />
                <Text style={styles.createText}>
                  {isCreating
                    ? "Creating..."
                    : `${createLabel} "${searchText}"`}
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.white,
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    color: AppColors.text,
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: AppColors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    width: "90%",
    maxHeight: "70%",
    elevation: 8,
    shadowColor: AppColors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: AppColors.text,
  },
  optionsList: {
    maxHeight: 200,
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
  },
  optionText: {
    fontSize: 16,
    color: AppColors.text,
  },
  createOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF8E1",
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  createIcon: {
    marginRight: 8,
  },
  createText: {
    fontSize: 16,
    color: AppColors.accent,
    fontWeight: "500",
  },
});
