# Copilot Instructions for AgriMedTrack (Patel Krishi Kendra)

## Project Overview

- **AgriMedTrack** is a React Native (Expo) mobile app for agricultural business management, focused on inventory, sales, and dashboard analytics for 'Patel Krishi Kendra'.
- The app is designed for performance, clarity, and usability, even in low-connectivity environments.
- UI/UX follows a flat, vibrant, information-centric design with a Bento Box dashboard layout and semantic color palette.

## Architecture & Data Flow

- **Navigation:** Uses React Navigation with a bottom tab navigator (Dashboard, Inventory, Sales) and contextual header actions ("bubbles") for quick access to forms.
- **UI Components:** Built with a custom system (see `components/` and `hooks/`), leveraging Gluestack UI and NativeWind for utility-first styling. All UI follows the color and typography system in `theme/index.ts` and `docs/UI_COMPONENTS.md`.
- **State & Data:** State is managed locally (React Context/Zustand) and via Firestore. Forms use dynamic, cascading dropdowns (see `react-native-element-dropdown`), with "add-on-the-fly" creation modals.
- **Backend:** Firebase Firestore with a hierarchical, denormalized schema. Key collections: `products`, `suppliers`, `sales`, and subcollections for inventory and sale items. See `services/firebase.ts` and `docs/guideline.md` for schema details.
- **Offline:** Firestore offline persistence is enabled by default.

## Developer Workflows

- **Start Dev Server:** Use `npm start` (see VS Code task: "Start Expo Development Server").
- **UI Providers:** Wrap the app in `GluestackUIProvider`, `ToastProvider`, and `UIProvider` (see `App.tsx`).
- **Component Usage:** Use hooks from `hooks/useToast.tsx` and `hooks/useUI.tsx` for toasts, modals, action sheets, and dialogs. See `docs/UI_COMPONENTS.md` for usage examples.
- **Testing:** (No explicit test setup found; add tests in the future as needed.)

## Project-Specific Patterns & Conventions

- **Flat Design:** No gradients or heavy shadows. Use semantic colors for status (success, warning, error).
- **Typography:** Headlines use Montserrat, body text uses Lato.
- **Dashboard:** Use Bento Box layout with Card components for KPIs. Filter chips for dashboard filtering (planned).
- **Forms:** Use cascading dropdowns with async Firestore queries and modals for "add new" actions.
- **Animations:** Use React Native's Animated API for all UI feedback (see `docs/UI_COMPONENTS.md`).
- **Data Integrity:** Deleting a parent document (e.g., product) requires recursive deletion of subcollections (implement with Firebase Cloud Functions).

## Integration Points

- **Firebase:** All data and auth via Firestore/Firebase Auth. See `services/firebase.ts` for setup.
- **UI Library:** Gluestack UI (preferred) or React Native Elements.
- **Icons:** Use `react-native-vector-icons` for tab and action icons.

## Key References

- `docs/guideline.md`: Architecture, design, and data model blueprint
- `docs/UI_COMPONENTS.md`: UI system, color palette, and usage patterns
- `theme/index.ts`: Centralized theme config
- `services/firebase.ts`: Firestore/Firebase integration
- `components/`: Custom UI components
- `hooks/`: Custom hooks for UI and state

## Best Practices

- Keep UI lightweight and responsive; avoid unnecessary re-renders.
- Use semantic colors and clear, actionable messaging in all user feedback.
- Prefer action sheets and modals for mobile-friendly interactions.
- Always provide feedback for user actions (toasts, loading, confirmations).

---

For more details, see the referenced docs. If any section is unclear or missing, please provide feedback for further refinement.
