import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../theme";

export type ModalSize = "small" | "medium" | "large" | "fullscreen";
export type ModalPosition = "center" | "bottom" | "top";

interface ModalAction {
  label: string;
  onPress: () => void;
  type?: "primary" | "secondary" | "danger";
  icon?: string;
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  position?: ModalPosition;
  showCloseButton?: boolean;
  children?: React.ReactNode;
  actions?: ModalAction[];
  closeOnBackdrop?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  size = "medium",
  position = "center",
  showCloseButton = true,
  children,
  actions,
  closeOnBackdrop = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get("window");

  const getModalStyles = () => {
    const baseStyles = {
      backgroundColor: colors.surface,
      borderRadius: position === "bottom" ? 20 : 16,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 16,
    };

    switch (size) {
      case "small":
        return {
          ...baseStyles,
          width: width * 0.8,
          maxHeight: height * 0.4,
        };
      case "medium":
        return {
          ...baseStyles,
          width: width * 0.9,
          maxHeight: height * 0.6,
        };
      case "large":
        return {
          ...baseStyles,
          width: width * 0.95,
          maxHeight: height * 0.8,
        };
      case "fullscreen":
        return {
          ...baseStyles,
          width: width,
          height: height,
          borderRadius: 0,
        };
      default:
        return baseStyles;
    }
  };

  const getContainerStyles = () => {
    switch (position) {
      case "top":
        return {
          justifyContent: "flex-start" as const,
          paddingTop: (StatusBar.currentHeight || 0) + 20,
        };
      case "bottom":
        return {
          justifyContent: "flex-end" as const,
          paddingBottom: 20,
        };
      case "center":
      default:
        return {
          justifyContent: "center" as const,
          alignItems: "center" as const,
        };
    }
  };

  const getInitialSlideValue = () => {
    switch (position) {
      case "top":
        return -height;
      case "bottom":
        return height;
      case "center":
      default:
        return 0;
    }
  };

  const showModal = () => {
    slideAnim.setValue(getInitialSlideValue());

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: getInitialSlideValue(),
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getActionButtonStyle = (type: ModalAction["type"] = "secondary") => {
    switch (type) {
      case "primary":
        return {
          backgroundColor: colors.primary,
          color: colors.surface,
        };
      case "danger":
        return {
          backgroundColor: colors.error,
          color: colors.surface,
        };
      case "secondary":
      default:
        return {
          backgroundColor: colors.background,
          color: colors.textPrimary,
        };
    }
  };

  useEffect(() => {
    if (visible) {
      showModal();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={hideModal}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          opacity: fadeAnim,
          ...getContainerStyles(),
          paddingHorizontal: 16,
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
          onPress={closeOnBackdrop ? hideModal : undefined}
        />

        <Animated.View
          style={{
            ...getModalStyles(),
            transform: [
              {
                translateY: position !== "center" ? slideAnim : 0,
              },
              {
                scale:
                  position === "center"
                    ? slideAnim.interpolate({
                        inputRange: [-100, 0],
                        outputRange: [0.8, 1],
                        extrapolate: "clamp",
                      })
                    : 1,
              },
            ],
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: subtitle ? 8 : 16,
                borderBottomWidth: children ? 1 : 0,
                borderBottomColor: colors.background,
              }}
            >
              <View style={{ flex: 1 }}>
                {title && (
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: fonts.headline,
                      color: colors.textPrimary,
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
                      lineHeight: 20,
                    }}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>

              {showCloseButton && (
                <TouchableOpacity
                  onPress={hideModal}
                  style={{
                    padding: 8,
                    marginLeft: 16,
                    borderRadius: 8,
                    backgroundColor: colors.background,
                  }}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          {children && (
            <ScrollView
              style={{
                maxHeight: size === "fullscreen" ? height * 0.7 : undefined,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ padding: 20 }}>{children}</View>
            </ScrollView>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <View
              style={{
                flexDirection: actions.length > 2 ? "column" : "row",
                padding: 20,
                gap: 12,
                borderTopWidth: 1,
                borderTopColor: colors.background,
              }}
            >
              {actions.map((action, index) => {
                const buttonStyle = getActionButtonStyle(action.type);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={action.onPress}
                    style={{
                      backgroundColor: buttonStyle.backgroundColor,
                      borderRadius: 12,
                      height: 48,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: actions.length <= 2 ? 1 : undefined,
                      shadowColor:
                        action.type === "primary"
                          ? colors.primary
                          : "transparent",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: action.type === "primary" ? 0.2 : 0,
                      shadowRadius: 4,
                      elevation: action.type === "primary" ? 4 : 0,
                    }}
                  >
                    {action.icon && (
                      <Ionicons
                        name={action.icon as any}
                        size={18}
                        color={buttonStyle.color}
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: fonts.body,
                        color: buttonStyle.color,
                      }}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CustomModal;
