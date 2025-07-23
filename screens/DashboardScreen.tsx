import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../theme";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useUI } from "../hooks/useUI";

export default function DashboardScreen() {
  const { logout } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { showConfirmDialog, showActionSheet, showContextMenu, showModal } =
    useUI();

  const handleLogout = () => {
    showConfirmDialog({
      title: "Sign Out",
      message: "Are you sure you want to sign out of your account?",
      type: "warning",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await logout();
          showSuccess("Signed Out", "You have been successfully signed out.");
        } catch (error) {
          showError("Error", "Failed to sign out. Please try again.");
        }
      },
    });
  };

  const handleDemoActions = () => {
    showActionSheet({
      title: "Demo UI Components",
      subtitle: "Try out the different UI components",
      items: [
        {
          label: "Show Success Toast",
          icon: "checkmark-circle-outline",
          type: "primary",
          onPress: () =>
            showSuccess("Success!", "This is a success toast message."),
        },
        {
          label: "Show Error Toast",
          icon: "close-circle-outline",
          type: "danger",
          onPress: () => showError("Error!", "This is an error toast message."),
        },
        {
          label: "Show Warning Toast",
          icon: "warning-outline",
          onPress: () =>
            showWarning("Warning!", "This is a warning toast message."),
        },
        {
          label: "Show Info Toast",
          icon: "information-circle-outline",
          onPress: () => showInfo("Info", "This is an info toast message."),
        },
        {
          label: "Show Confirm Dialog",
          icon: "help-circle-outline",
          onPress: () =>
            showConfirmDialog({
              title: "Demo Confirmation",
              message:
                "This is a demo confirmation dialog. Do you want to proceed?",
              type: "info",
              onConfirm: () =>
                showSuccess("Confirmed!", "You confirmed the action."),
            }),
        },
      ],
    });
  };

  const handleContextMenu = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    showContextMenu({
      anchor: { x: pageX, y: pageY },
      title: "Context Menu",
      items: [
        {
          label: "Edit",
          icon: "create-outline",
          onPress: () => showInfo("Edit", "Edit action selected."),
        },
        {
          label: "Share",
          icon: "share-outline",
          onPress: () => showInfo("Share", "Share action selected."),
        },
        {
          label: "Delete",
          icon: "trash-outline",
          type: "danger",
          onPress: () => showError("Delete", "Delete action selected."),
        },
      ],
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Header with logout button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 20,
          backgroundColor: colors.surface,
          shadowColor: colors.textPrimary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.headlineBlack,
            fontSize: 28,
            color: colors.textPrimary,
          }}
        >
          Dashboard
        </Text>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: colors.background,
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.headline,
            fontSize: 20,
            color: colors.textPrimary,
            marginBottom: 12,
          }}
        >
          Welcome to Patel Krishi Kendra
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          Your business dashboard will be implemented here with Bento Box layout
          showing KPIs like Total Sales, Gross Profit, Pending Payments, and Low
          Stock Items.
        </Text>

        {/* Demo Buttons */}
        <View style={{ gap: 16, width: "100%" }}>
          <TouchableOpacity
            onPress={handleDemoActions}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              height: 48,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: fonts.body,
                color: colors.surface,
              }}
            >
              Demo UI Components
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContextMenu}
            style={{
              backgroundColor: colors.secondary,
              borderRadius: 12,
              height: 48,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: fonts.body,
                color: colors.surface,
              }}
            >
              Show Context Menu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
