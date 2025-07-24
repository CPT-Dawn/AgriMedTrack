# AgriMedTrack - AI Coding Agent Instructions

## Project Overview

AgriMedTrack is a React Native Expo app for agricultural medicine inventory management using Firebase/Firestore. It features complex cascading dropdowns, real-time stock tracking, and sophisticated denormalized data modeling optimized for read performance.

## Architecture Patterns

### Data Architecture (Critical)

- **Denormalized Firestore Design**: Data is strategically duplicated across collections to optimize read performance. When creating sales, copy `productName`, `supplierName` etc. directly into sale documents for self-contained records
- **Subcollections for Unbounded Growth**: Use `sales/{saleId}/items_sold` pattern instead of arrays to avoid 1MB document limits
- **Separation of State vs Logs**: `inventory` (current stock) vs `inventory_logs` (immutable audit trail)
- **Historical Data Preservation**: Store point-in-time prices (`buyPrice`, `sellPrice`) in sales records for accurate profit calculations

### Component Library System

- **Context-Based UI Management**: Use `useUI()` and `useToast()` hooks for all user feedback
- **Reusable Components**: All major UI elements in `/components/` follow consistent patterns with TypeScript interfaces
- **Animation Strategy**: Use `react-native-reanimated` Layout animations for list operations, Lottie for success states

### Firebase Integration

- **Cloud Functions Required**: Complex operations (sales processing, inventory updates) must use server-side functions for atomicity
- **Real-time Listeners**: Dashboard uses `onSnapshot` listeners for live data updates
- **Batch Operations**: Inventory additions process multiple items in single transactions

## Key Development Workflows

### Start Development Server

```bash
npm start  # Use the configured VS Code task "Start Expo Development Server"
```

### Data Flow Patterns

1. **Cascading Dropdowns**: Product → Supplier → Packaging → Batch (see `AddSaleScreen` logic)
2. **Stock Validation**: Always check `inventory.quantity > 0` before allowing selection
3. **Atomic Updates**: Use Firestore transactions for multi-document operations

## Project-Specific Conventions

### Component Structure

- Export interfaces for all component props (e.g., `ActionSheetItem`, `ToastType`)
- Use context providers for cross-component state (`ToastProvider`, `UIProvider`)
- Implement animation with `Animated.timing` or `react-native-reanimated`

### Styling Approach

- **Theme System**: Import colors/fonts from `./theme/index.ts`
- **UI Library**: Gluestack UI components with custom theming
- **Color Coding**: Red/Orange/Green for stock levels, payment status indicators

### Data Validation Patterns

```typescript
// Always validate stock before sale operations
const stockAvailable = inventoryItem.quantity >= quantityRequested;

// Use real-time feedback in forms
const stockDisplay = `Stock available: ${availableQuantity}`;
```

### Error Handling

- Use `useToast()` for user feedback: `showSuccess()`, `showError()`, `showWarning()`
- Use `useUI()` for confirmations: `showConfirmDialog()` before destructive operations
- Implement proper loading states with `LoadingScreen` component

## Critical Integration Points

### Firebase Collections Schema

- `inventory`: Current sellable stock (quantity decremented on sales)
- `inventory_logs`: Immutable audit trail of stock additions
- `sales`: Transaction summaries with `items_sold` subcollection
- `customers`: Aggregated pending payment tracking

### Navigation Structure

- Bottom tabs: Dashboard/Sales/Inventory
- Header "bubbles" (Chips) for sub-page navigation
- Stack navigation for detailed views

### Form Patterns

- **Dynamic Forms**: Use array state for multi-item forms (inventory additions, sales)
- **Add-to-Dropdown**: Allow creating new products/suppliers inline during form completion
- **Packaging Input**: Split into numeric value + unit, combine on submission

## Development Guidelines

### File Organization

- Screens in `/screens/` (main views)
- Reusable components in `/components/`
- Business logic hooks in `/hooks/`
- Firebase config in `/services/firebase.ts`

### TypeScript Patterns

- Define interfaces for all Firestore document types
- Use proper typing for navigation params
- Export component prop interfaces from component files

### Animation Implementation

- Layout animations for list changes
- Spring animations for button interactions
- Lottie animations for major success states

### Testing Considerations

- Test cascading dropdown logic thoroughly
- Validate denormalized data consistency
- Test offline behavior with Firebase persistence
