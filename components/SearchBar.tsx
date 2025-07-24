import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { colors, fonts } from "../theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
}) => {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: value ? colors.primary : colors.background,
      }}
    >
      {/* Search Icon */}
      <View
        style={{
          width: 20,
          height: 20,
          marginRight: 12,
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: colors.textSecondary,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 6,
            height: 2,
            backgroundColor: colors.textSecondary,
            transform: [{ rotate: "45deg" }],
            bottom: 2,
            right: 2,
          }}
        />
      </View>

      <TextInput
        style={{
          flex: 1,
          fontFamily: fonts.body,
          fontSize: 16,
          color: colors.textPrimary,
          paddingVertical: 0,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText("");
            onClear?.();
          }}
          style={{
            marginLeft: 8,
            padding: 4,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: colors.textSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 12,
                height: 2,
                backgroundColor: colors.surface,
                transform: [{ rotate: "45deg" }],
                position: "absolute",
              }}
            />
            <View
              style={{
                width: 12,
                height: 2,
                backgroundColor: colors.surface,
                transform: [{ rotate: "-45deg" }],
                position: "absolute",
              }}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
