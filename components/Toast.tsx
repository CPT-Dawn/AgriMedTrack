import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../theme";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
  position?: "top" | "bottom";
}

const Toast: React.FC<ToastProps> = ({
  visible,
  type,
  title,
  message,
  duration = 4000,
  onHide,
  position = "top",
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get("window");

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: colors.success,
          icon: "checkmark-circle" as const,
          borderColor: colors.success,
        };
      case "error":
        return {
          backgroundColor: colors.error,
          icon: "close-circle" as const,
          borderColor: colors.error,
        };
      case "warning":
        return {
          backgroundColor: colors.warning,
          icon: "warning" as const,
          borderColor: colors.warning,
        };
      case "info":
        return {
          backgroundColor: colors.primary,
          icon: "information-circle" as const,
          borderColor: colors.primary,
        };
      default:
        return {
          backgroundColor: colors.primary,
          icon: "information-circle" as const,
          borderColor: colors.primary,
        };
    }
  };

  const config = getToastConfig();

  // Pan responder for swipe to dismiss
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 10
      );
    },
    onPanResponderMove: (_, gestureState) => {
      slideAnim.setValue(gestureState.dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (Math.abs(gestureState.dx) > width * 0.3) {
        // Dismiss if swiped more than 30% of screen width
        hideToast();
      } else {
        // Return to original position
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const showToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: position === "top" ? -width : width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(position === "top" ? -width : width);
      showToast();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: position === "top" ? 60 : undefined,
        bottom: position === "bottom" ? 100 : undefined,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: colors.textPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          borderLeftWidth: 4,
          borderLeftColor: config.borderColor,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: config.backgroundColor + "20",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Ionicons
            name={config.icon}
            size={24}
            color={config.backgroundColor}
          />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: fonts.headline,
              color: colors.textPrimary,
              marginBottom: message ? 4 : 0,
            }}
          >
            {title}
          </Text>
          {message && (
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.body,
                color: colors.textSecondary,
                lineHeight: 20,
              }}
            >
              {message}
            </Text>
          )}
        </View>

        {/* Close button */}
        <TouchableOpacity
          onPress={hideToast}
          style={{
            padding: 8,
            marginLeft: 8,
          }}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Toast;
