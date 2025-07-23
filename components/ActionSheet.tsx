import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../theme";

export interface ActionSheetItem {
  label: string;
  icon?: string;
  onPress: () => void;
  type?: "default" | "danger" | "primary";
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  items: ActionSheetItem[];
  title?: string;
  subtitle?: string;
  showCancel?: boolean;
  cancelText?: string;
}

const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  items,
  title,
  subtitle,
  showCancel = true,
  cancelText = "Cancel",
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { height } = Dimensions.get("window");

  const maxHeight = height * 0.7;
  const itemHeight = 56;
  const headerHeight = title || subtitle ? 80 : 0;
  const cancelHeight = showCancel ? 72 : 0;
  const contentHeight = Math.min(
    items.length * itemHeight + headerHeight + cancelHeight + 32,
    maxHeight
  );

  const showActionSheet = () => {
    slideAnim.setValue(contentHeight);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideActionSheet = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: contentHeight,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getItemStyle = (type: ActionSheetItem["type"], disabled?: boolean) => {
    if (disabled) {
      return {
        textColor: colors.textSecondary,
        backgroundColor: colors.surface,
      };
    }

    switch (type) {
      case "danger":
        return {
          textColor: colors.error,
          backgroundColor: colors.surface,
        };
      case "primary":
        return {
          textColor: colors.primary,
          backgroundColor: colors.surface,
        };
      case "default":
      default:
        return {
          textColor: colors.textPrimary,
          backgroundColor: colors.surface,
        };
    }
  };

  const handleItemPress = (item: ActionSheetItem) => {
    if (item.disabled) return;

    hideActionSheet();
    // Small delay to allow animation to complete
    setTimeout(() => {
      item.onPress();
    }, 250);
  };

  useEffect(() => {
    if (visible) {
      showActionSheet();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hideActionSheet}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          opacity: fadeAnim,
          justifyContent: "flex-end",
        }}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          activeOpacity={1}
          onPress={hideActionSheet}
        />

        <Animated.View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: maxHeight,
            transform: [{ translateY: slideAnim }],
            shadowColor: colors.textPrimary,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 16,
          }}
        >
          {/* Drag Handle */}
          <View
            style={{
              alignItems: "center",
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                backgroundColor: colors.textSecondary + "40",
                borderRadius: 2,
              }}
            />
          </View>

          {/* Header */}
          {(title || subtitle) && (
            <View
              style={{
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.background,
              }}
            >
              {title && (
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: fonts.headline,
                    color: colors.textPrimary,
                    textAlign: "center",
                    marginBottom: subtitle ? 4 : 0,
                  }}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: fonts.body,
                    color: colors.textSecondary,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          {/* Items */}
          <ScrollView
            style={{
              maxHeight: maxHeight - headerHeight - cancelHeight - 60,
            }}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item, index) => {
              const itemStyle = getItemStyle(item.type, item.disabled);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleItemPress(item)}
                  disabled={item.disabled}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: itemHeight,
                    paddingHorizontal: 20,
                    backgroundColor: itemStyle.backgroundColor,
                    opacity: item.disabled ? 0.5 : 1,
                    borderBottomWidth: index < items.length - 1 ? 1 : 0,
                    borderBottomColor: colors.background,
                  }}
                  activeOpacity={0.7}
                >
                  {item.icon && (
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.background,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color={itemStyle.textColor}
                      />
                    </View>
                  )}
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontFamily: fonts.body,
                      color: itemStyle.textColor,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Cancel Button */}
          {showCancel && (
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderTopWidth: 1,
                borderTopColor: colors.background,
              }}
            >
              <TouchableOpacity
                onPress={hideActionSheet}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  height: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: fonts.body,
                    color: colors.textPrimary,
                  }}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ActionSheet;
