import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { Theme } from "../constants/Theme";

export type ToastType = "success" | "error" | "info" | "warning";

interface CustomToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide: () => void;
  duration?: number;
}

const ICONS = {
  success: "check-circle",
  error: "error",
  info: "info",
  warning: "warning",
};

const COLORS = {
  success: Theme.colors.success,
  error: Theme.colors.error,
  info: Theme.colors.info,
  warning: Theme.colors.warning,
};

export const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  message,
  type = "success",
  onHide,
  duration = 2000,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: COLORS[type] },
        { opacity: fadeAnim },
      ]}
      pointerEvents="none"
    >
      <MaterialIcons
        name={ICONS[type] as any}
        size={22}
        color={Theme.colors.white}
        style={styles.icon}
      />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 70, // Appear below header
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
    zIndex: 9999,
    ...Theme.shadows.lg,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
});

export default CustomToast;
