/**
 * Lovely White Mode Design System
 * A unified theme configuration for AgriMedTrack
 */

// Core color palette - Modern Soft Blue Theme
export const ThemeColors = {
  // Modern gradient background with soft blue undertones
  background: "#F0F6FF", // Soft sky blue - much more noticeable than white
  surface: "#FFFFFF", // Pure white for cards & elevated content
  primary: "#2563EB", // Modern bright blue (like GitHub/Linear)
  secondary: "#8B5CF6", // Purple accent (like Discord/Notion)
  accent: "#F59E0B", // Modern amber (like Slack/Figma)

  // Modern text hierarchy
  text: "#0F172A", // Almost black for perfect readability
  textSecondary: "#475569", // Cooler gray for secondary content
  textMuted: "#94A3B8", // Lighter gray for muted elements

  // Interactive states with modern hover effects
  primaryHover: "#1D4ED8", // Deeper blue for interactions
  secondaryHover: "#7C3AED", // Deeper purple for interactions
  accentHover: "#D97706", // Deeper amber for interactions

  // Status colors - Reserved for your important quantities
  success: "#059669", // Modern emerald (for your green values)
  warning: "#D97706", // Modern orange (for your yellow values)
  error: "#DC2626", // Modern red (for your red values)
  info: "#0EA5E9", // Modern sky blue for info

  // Utility colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // Modern border system
  border: "#CBD5E1", // Subtle blue-gray borders
  divider: "#E2E8F0", // Very light dividers with blue undertone

  // Modern shadow and overlay system
  shadow: "rgba(15, 23, 42, 0.08)", // Softer, more modern shadows
  overlay: "rgba(15, 23, 42, 0.6)", // Rich dark overlay
  backdrop: "rgba(37, 99, 235, 0.1)", // Subtle blue backdrop

  // Surface variants with depth
  surfaceElevated: "#FFFFFF", // Elevated cards stay pure white
  surfacePressed: "#E2E8F0", // Pressed state with blue tint
  surfaceSecondary: "#F1F5F9", // Secondary surfaces with subtle blue
};

// Typography scale
export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },

  // Font weights
  fontWeight: {
    light: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
};

// Spacing scale (based on 4px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  "7xl": 80,
  "8xl": 96,
};

// Border radius scale - Modern rounded corners
export const BorderRadius = {
  none: 0,
  sm: 6, // Slightly more rounded
  md: 10, // More modern
  lg: 16, // Generous rounding
  xl: 20, // Very rounded
  "2xl": 24, // Extra rounded
  "3xl": 32, // Super rounded
  full: 9999,
};

// Shadow styles - Modern depth system
export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: ThemeColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: ThemeColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: ThemeColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: ThemeColors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 9,
  },
};

// Component specific styles - Modern design system
export const Components = {
  button: {
    // Minimum touch target size
    minHeight: 48, // Larger for better touch
    minWidth: 48,

    // Primary button - Modern style
    primary: {
      backgroundColor: ThemeColors.primary,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
      ...Shadows.md,
    },

    // Secondary button - Modern outline style
    secondary: {
      backgroundColor: ThemeColors.surface,
      borderWidth: 2, // Thicker border for modern look
      borderColor: ThemeColors.border,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
      ...Shadows.sm,
    },

    // Accent button - Modern gradient-ready
    accent: {
      backgroundColor: ThemeColors.accent,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
      ...Shadows.md,
    },
  },

  card: {
    backgroundColor: ThemeColors.surface,
    borderRadius: BorderRadius.xl, // More rounded
    padding: Spacing["2xl"], // More spacious
    ...Shadows.md, // Better depth
  },

  input: {
    backgroundColor: ThemeColors.surface,
    borderWidth: 2,
    borderColor: ThemeColors.border,
    borderRadius: BorderRadius.lg, // More rounded
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg, // More padding
    fontSize: Typography.fontSize.base, // Larger text
    color: ThemeColors.text,
    ...Shadows.sm, // Subtle depth
  },

  modal: {
    backgroundColor: ThemeColors.surface,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    ...Shadows.xl,
  },

  toast: {
    backgroundColor: ThemeColors.primary,
    opacity: 0.95, // Slightly more opaque
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.lg, // More prominent shadow
  },
};

// Animation configurations
export const Animations = {
  timing: {
    fast: 100,
    normal: 200,
    slow: 300,
  },

  easing: {
    easeInOut: "ease-in-out",
    easeIn: "ease-in",
    easeOut: "ease-out",
    linear: "linear",
  },

  scale: {
    pressed: 0.95,
    normal: 1,
    expanded: 1.05,
  },
};

// Layout constants
export const Layout = {
  screen: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },

  container: {
    flex: 1,
    backgroundColor: ThemeColors.background,
  },

  header: {
    height: 48,
    paddingHorizontal: Spacing.lg,
  },

  tabBar: {
    height: 48,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
  },

  gap: {
    xs: Spacing.xs,
    sm: Spacing.sm,
    md: Spacing.md,
    lg: Spacing.lg,
  },
};

// Export a combined theme object
export const Theme = {
  colors: ThemeColors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  components: Components,
  animations: Animations,
  layout: Layout,
} as const;

export default Theme;
