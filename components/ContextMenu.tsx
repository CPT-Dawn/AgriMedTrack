import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../theme";

export interface ContextMenuItem {
  label: string;
  icon?: string;
  onPress: () => void;
  type?: "default" | "danger" | "primary";
  disabled?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
  anchor: {
    x: number;
    y: number;
  };
  title?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  onClose,
  items,
  anchor,
  title,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { width, height } = Dimensions.get("window");

  const menuWidth = 220;
  const itemHeight = 48;
  const menuHeight = items.length * itemHeight + (title ? 40 : 0) + 16;

  // Calculate menu position to keep it within screen bounds
  const getMenuPosition = () => {
    let x = anchor.x;
    let y = anchor.y;

    // Adjust horizontal position
    if (x + menuWidth > width - 16) {
      x = width - menuWidth - 16;
    }
    if (x < 16) {
      x = 16;
    }

    // Adjust vertical position
    if (y + menuHeight > height - 100) {
      y = anchor.y - menuHeight - 10;
    }
    if (y < 100) {
      y = 100;
    }

    return { x, y };
  };

  const menuPosition = getMenuPosition();

  const showMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getItemTextColor = (
    type: ContextMenuItem["type"],
    disabled?: boolean
  ) => {
    if (disabled) return colors.textSecondary;

    switch (type) {
      case "danger":
        return colors.error;
      case "primary":
        return colors.primary;
      case "default":
      default:
        return colors.textPrimary;
    }
  };

  const handleItemPress = (item: ContextMenuItem) => {
    if (item.disabled) return;

    hideMenu();
    // Small delay to allow animation to complete
    setTimeout(() => {
      item.onPress();
    }, 150);
  };

  useEffect(() => {
    if (visible) {
      showMenu();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hideMenu}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
        activeOpacity={1}
        onPress={hideMenu}
      >
        <Animated.View
          style={{
            position: "absolute",
            left: menuPosition.x,
            top: menuPosition.y,
            width: menuWidth,
            backgroundColor: colors.surface,
            borderRadius: 12,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            shadowColor: colors.textPrimary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 16,
          }}
        >
          {/* Title */}
          {title && (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.background,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: fonts.body,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                {title}
              </Text>
            </View>
          )}

          {/* Menu Items */}
          <View style={{ paddingVertical: 8 }}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleItemPress(item)}
                disabled={item.disabled}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: itemHeight,
                  paddingHorizontal: 16,
                  opacity: item.disabled ? 0.5 : 1,
                }}
                activeOpacity={0.7}
              >
                {item.icon && (
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={getItemTextColor(item.type, item.disabled)}
                    style={{ marginRight: 12, width: 20 }}
                  />
                )}
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: fonts.body,
                    color: getItemTextColor(item.type, item.disabled),
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ContextMenu;
