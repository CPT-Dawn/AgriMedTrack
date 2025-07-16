/**
 * Shared component styles using the Lovely White Mode theme
 */

import { StyleSheet } from "react-native";
import { Theme } from "../constants/Theme";

// Button styles following the design system
export const ButtonStyles = StyleSheet.create({
  primary: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius["2xl"],
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    ...Theme.shadows.sm,
  },

  primaryText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },

  secondary: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius["2xl"],
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    ...Theme.shadows.sm,
  },

  secondaryText: {
    color: Theme.colors.secondary,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },

  accent: {
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius["2xl"],
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    ...Theme.shadows.sm,
  },

  accentText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },

  pressed: {
    transform: [{ scale: Theme.animations.scale.pressed }],
  },
});

// Input field styles
export const InputStyles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },

  label: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },

  input: {
    backgroundColor: Theme.colors.white,
    borderWidth: 2,
    borderColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text,
    minHeight: 44,
  },

  inputFocused: {
    borderColor: Theme.colors.primary,
  },

  inputError: {
    borderColor: Theme.colors.error,
  },

  errorText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.error,
    marginTop: Theme.spacing.xs,
  },

  placeholder: {
    color: Theme.colors.textMuted,
  },
});

// Card styles
export const CardStyles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius["2xl"],
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },

  title: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.primary,
  },

  subtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: Theme.spacing.xs,
  },

  content: {
    gap: Theme.spacing.md,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
  },
});

// Modal styles
export const ModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Theme.colors.backdrop,
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.borderRadius["3xl"],
    borderTopRightRadius: Theme.borderRadius["3xl"],
    paddingTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing["2xl"],
    minHeight: 200,
    ...Theme.shadows.xl,
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: Theme.colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Theme.spacing.lg,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },

  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },

  closeButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
  },
});

// Toast styles
export const ToastStyles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.primary,
    opacity: 0.9,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    margin: Theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    ...Theme.shadows.md,
  },

  text: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    flex: 1,
  },

  icon: {
    marginRight: Theme.spacing.sm,
  },

  success: {
    backgroundColor: Theme.colors.success,
  },

  error: {
    backgroundColor: Theme.colors.error,
  },

  warning: {
    backgroundColor: Theme.colors.warning,
  },

  info: {
    backgroundColor: Theme.colors.info,
  },
});

// List item styles
export const ListStyles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },

  itemLast: {
    borderBottomWidth: 0,
  },

  itemAlternate: {
    backgroundColor: Theme.colors.secondary + "03",
  },

  itemContent: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },

  itemTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text,
  },

  itemSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: Theme.spacing.xs,
  },

  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },

  itemAction: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
  },
});

// Header styles
export const HeaderStyles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    paddingTop: 50, // Will be dynamic based on platform
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },

  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },

  subtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textMuted,
    marginTop: Theme.spacing.xs,
  },

  action: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
  },

  backButton: {
    padding: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
  },
});

// Search bar styles
export const SearchStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.lg,
    marginVertical: Theme.spacing.md,
    minHeight: 44,
    ...Theme.shadows.sm,
  },

  input: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text,
    padding: 0,
    marginLeft: Theme.spacing.xs,
  },

  icon: {
    color: Theme.colors.textMuted,
  },

  clearButton: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
});

export default {
  ButtonStyles,
  InputStyles,
  CardStyles,
  ModalStyles,
  ToastStyles,
  ListStyles,
  HeaderStyles,
  SearchStyles,
};
