# Patel Krishi Kendra - UI Component System

This document outlines the comprehensive UI component system designed for the Patel Krishi Kendra mobile application, following the flat design principles and color palette defined in the guideline.md.

## Design Philosophy

All UI components follow these core principles:

- **Flat Design**: Clean lines, crisp edges, vibrant colors without 3D effects
- **Performance-Driven**: Lightweight components optimized for agricultural environments
- **Information-Centric**: Focus on data and functionality over decoration
- **Consistent**: Unified design language across all components

## Color Palette

```typescript
colors = {
  primary: "#0540F2", // Patel Blue
  secondary: "#6A7C5F", // Growth Green
  background: "#FFFEFA", // Off-White
  surface: "#FFFFFF", // Pure White
  textPrimary: "#012340", // Charcoal
  textSecondary: "#97A4A6", // Slate Gray
  accent: "#F26101", // Vibrant Orange
  success: "#28a745", // Success Green
  warning: "#ffc107", // Warning Amber
  error: "#dc3545", // Error Red
};
```

## Typography

- **Headlines**: Montserrat (Bold/Black) - For titles and KPIs
- **Body Text**: Lato (Regular) - For descriptions and UI text

## Component Overview

### 1. Toast Notifications

Elegant, dismissible notifications that slide in from the top or bottom of the screen.

#### Features:

- **Types**: Success, Error, Warning, Info
- **Swipe to Dismiss**: Users can swipe left/right to dismiss
- **Auto-dismiss**: Configurable duration (default 4 seconds)
- **Position**: Top or bottom placement
- **Semantic Colors**: Color-coded by type

#### Usage:

```typescript
import { useToast } from "../hooks/useToast";

const { showSuccess, showError, showWarning, showInfo } = useToast();

// Show different types of toasts
showSuccess("Operation Complete", "Data saved successfully");
showError("Login Failed", "Invalid credentials provided");
showWarning("Low Stock", "Only 2 items remaining");
showInfo("New Feature", "Check out the updated dashboard");
```

### 2. Custom Modal

Flexible modal component for forms, confirmations, and detailed content.

#### Features:

- **Sizes**: Small, Medium, Large, Fullscreen
- **Positions**: Center, Top, Bottom
- **Animations**: Smooth slide and fade transitions
- **Actions**: Configurable action buttons
- **Scrollable Content**: Handles long content gracefully

#### Usage:

```typescript
import { useUI } from "../hooks/useUI";

const { showModal } = useUI();

showModal({
  title: "Add New Product",
  subtitle: "Enter product details",
  size: "medium",
  children: <ProductForm />,
  actions: [
    { label: "Cancel", onPress: () => {}, type: "secondary" },
    { label: "Save", onPress: handleSave, type: "primary", icon: "save" }
  ]
});
```

### 3. Context Menu

Right-click style popup menus that appear at specific coordinates.

#### Features:

- **Smart Positioning**: Automatically adjusts to stay within screen bounds
- **Icon Support**: Optional icons for menu items
- **Type Safety**: Typed menu item configurations
- **Disabled States**: Support for disabled menu items

#### Usage:

```typescript
const { showContextMenu } = useUI();

const handleLongPress = (event) => {
  const { pageX, pageY } = event.nativeEvent;
  showContextMenu({
    anchor: { x: pageX, y: pageY },
    title: "Product Options",
    items: [
      { label: "Edit", icon: "create-outline", onPress: handleEdit },
      {
        label: "Delete",
        icon: "trash-outline",
        type: "danger",
        onPress: handleDelete,
      },
    ],
  });
};
```

### 4. Action Sheet

Bottom-sliding sheet with a list of actions, perfect for mobile interactions.

#### Features:

- **Bottom Slide Animation**: Smooth slide up from bottom
- **Scrollable**: Handles long lists of actions
- **Cancel Button**: Optional cancel button
- **Icon Support**: Visual icons for each action
- **Drag Handle**: Visual indicator for dismissal

#### Usage:

```typescript
const { showActionSheet } = useUI();

showActionSheet({
  title: "Product Actions",
  subtitle: "Choose an action for this product",
  items: [
    { label: "View Details", icon: "eye-outline", onPress: viewDetails },
    { label: "Edit Product", icon: "create-outline", onPress: editProduct },
    {
      label: "Delete",
      icon: "trash-outline",
      type: "danger",
      onPress: deleteProduct,
    },
  ],
});
```

### 5. Confirm Dialog

Specialized modal for confirmations with semantic styling.

#### Features:

- **Types**: Info, Warning, Danger, Success
- **Icon Integration**: Automatic icons based on type
- **Two-Button Layout**: Cancel and Confirm actions
- **Semantic Colors**: Visual cues for action severity

#### Usage:

```typescript
const { showConfirmDialog } = useUI();

showConfirmDialog({
  title: "Delete Product",
  message: "This action cannot be undone. Are you sure?",
  type: "danger",
  confirmText: "Delete",
  cancelText: "Cancel",
  onConfirm: () => deleteProduct(),
});
```

## Provider Setup

Wrap your app with the providers to enable the UI system:

```typescript
import { ToastProvider } from "./hooks/useToast";
import { UIProvider } from "./hooks/useUI";

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <ToastProvider>
        <UIProvider>
          {/* Your app content */}
        </UIProvider>
      </ToastProvider>
    </GluestackUIProvider>
  );
}
```

## Best Practices

### 1. Consistent Messaging

- Use clear, actionable language
- Keep messages concise but informative
- Use semantic colors appropriately

### 2. Performance

- Avoid showing multiple toasts simultaneously
- Use appropriate component sizes
- Prefer action sheets over complex modals on mobile

### 3. Accessibility

- All components support proper contrast ratios
- Touch targets are minimum 44px
- Screen reader friendly text

### 4. User Experience

- Provide feedback for all user actions
- Use confirmations for destructive actions
- Show loading states during async operations

## Animation Details

All components use React Native's Animated API for smooth, performant animations:

- **Toast**: Slide + Fade (300ms)
- **Modal**: Scale + Fade (300ms)
- **Action Sheet**: Slide Up (300ms)
- **Context Menu**: Scale + Fade (200ms)

## Integration with Design Guidelines

This UI system directly implements the design principles from guideline.md:

1. **Flat Design**: No gradients, shadows are subtle and functional
2. **Vibrant Colors**: Strategic use of accent colors for CTAs
3. **Information-Centric**: Typography hierarchy emphasizes content
4. **Performance**: Lightweight animations and minimal resource usage
5. **Agricultural Context**: Color palette evokes trust and nature

## Future Enhancements

Potential additions following the same design principles:

- **Filter Chips**: For dashboard filtering (mentioned in guidelines)
- **Progress Indicators**: For multi-step forms
- **Skeleton Loaders**: For data loading states
- **Floating Action Button**: For primary actions
- **Snackbar**: For quick actions and undo functionality

This UI system provides a solid foundation for the entire Patel Krishi Kendra application, ensuring consistency, performance, and excellent user experience across all features.
