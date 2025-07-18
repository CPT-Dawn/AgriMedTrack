import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
import { Theme } from "../constants/Theme";

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

  // Fix: Check for both id and label to determine the selected option
  const selectedOption = options.find(
    (opt) => opt.id === value || opt.label === value
  );

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
    <Pressable
      style={({ pressed }) => [
        styles.optionItem,
        pressed && styles.optionItemPressed,
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.optionText}>{item.label}</Text>
      {selectedOption?.id === item.id && (
        <MaterialIcons name="check" size={18} color={Theme.colors.primary} />
      )}
    </Pressable>
  );

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.dropdown,
          pressed && styles.dropdownPressed,
          style,
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedOption && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={Theme.colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.searchContainer}>
              <MaterialIcons
                name="search"
                size={20}
                color={Theme.colors.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search or type to create..."
                placeholderTextColor={Theme.colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderOption}
              style={styles.optionsList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No options found</Text>
                </View>
              }
            />

            {showCreateOption && (
              <Pressable
                style={({ pressed }) => [
                  styles.createOption,
                  pressed && styles.createOptionPressed,
                ]}
                onPress={handleCreate}
                disabled={isCreating}
              >
                <MaterialIcons
                  name="add-circle"
                  size={20}
                  color={Theme.colors.primary}
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
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.surface,
    minHeight: 50,
    ...Theme.shadows.sm,
  },
  dropdownPressed: {
    backgroundColor: Theme.colors.surfacePressed,
    borderColor: Theme.colors.primary,
  },
  dropdownText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  placeholderText: {
    color: Theme.colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    width: "90%",
    maxHeight: "70%",
    ...Theme.shadows.lg,
    overflow: "hidden",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.surfaceSecondary,
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    paddingVertical: Theme.spacing.lg,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    flex: 1,
  },
  optionsList: {
    maxHeight: 250,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.border,
  },
  optionItemPressed: {
    backgroundColor: Theme.colors.surfacePressed,
  },
  optionText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
  },
  createOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  createOptionPressed: {
    backgroundColor: Theme.colors.surfacePressed,
  },
  createIcon: {
    marginRight: Theme.spacing.sm,
  },
  createText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  emptyContainer: {
    padding: Theme.spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: Theme.typography.fontSize.base,
  },
});
