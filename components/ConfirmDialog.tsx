import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomModal from "./CustomModal";
import { colors, fonts } from "../theme";

export type ConfirmDialogType = "info" | "warning" | "danger" | "success";

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  type?: ConfirmDialogType;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case "danger":
        return {
          iconName: icon || "warning",
          iconColor: colors.error,
          iconBgColor: colors.error + "20",
          confirmButtonType: "danger" as const,
        };
      case "warning":
        return {
          iconName: icon || "alert-circle",
          iconColor: colors.warning,
          iconBgColor: colors.warning + "20",
          confirmButtonType: "primary" as const,
        };
      case "success":
        return {
          iconName: icon || "checkmark-circle",
          iconColor: colors.success,
          iconBgColor: colors.success + "20",
          confirmButtonType: "primary" as const,
        };
      case "info":
      default:
        return {
          iconName: icon || "information-circle",
          iconColor: colors.primary,
          iconBgColor: colors.primary + "20",
          confirmButtonType: "primary" as const,
        };
    }
  };

  const config = getTypeConfig();

  const handleConfirm = () => {
    onClose();
    onConfirm();
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      size="small"
      position="center"
      showCloseButton={false}
      closeOnBackdrop={false}
      actions={[
        {
          label: cancelText,
          onPress: onClose,
          type: "secondary",
        },
        {
          label: confirmText,
          onPress: handleConfirm,
          type: config.confirmButtonType,
        },
      ]}
    >
      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        {/* Icon */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: config.iconBgColor,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons
            name={config.iconName as any}
            size={32}
            color={config.iconColor}
          />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 18,
            fontFamily: fonts.headline,
            color: colors.textPrimary,
            textAlign: "center",
            marginBottom: message ? 12 : 0,
          }}
        >
          {title}
        </Text>

        {/* Message */}
        {message && (
          <Text
            style={{
              fontSize: 16,
              fontFamily: fonts.body,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            {message}
          </Text>
        )}
      </View>
    </CustomModal>
  );
};

export default ConfirmDialog;
