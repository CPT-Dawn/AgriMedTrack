# AgriMedTrack

AgriMedTrack is a React Native app built with Expo for agricultural inventory, sales, and stock audit management. It is designed for Patel Krishi Kendra and uses Firebase for authentication, Firestore for data storage, and real-time listeners for operational views.

This repository is being prepared for public release and is still an active work in progress. The core experience is in place, but some production workflows are intentionally unfinished and will continue to evolve.

## What It Does

- Tracks inventory in real time with batch, packaging, expiry, and stock value visibility.
- Captures sales transactions with customer, payment, and profit tracking.
- Surfaces a dashboard with live business metrics, alerts, and recent activity.
- Maintains an immutable inventory log for stock additions and auditing.
- Supports Firebase Authentication with persisted session state.
- Uses reusable form and card components for consistent data entry and review flows.

## Current Status

The app is functional for internal use and demo flows, but it is not yet fully production hardened.

- Dashboard, inventory browsing, sales browsing, and inventory logs are implemented.
- Add inventory and add sale forms are present and validate user input.
- Some write-heavy workflows, reporting features, and other backend-hardening tasks are still in progress.
- Development-only seed actions exist in a few screens to help populate sample data during testing.

## Tech Stack

- Expo and React Native
- TypeScript
- Firebase Authentication and Firestore
- React Navigation
- Gluestack UI
- React Native Reanimated
- Expo Google Fonts
- AsyncStorage for auth persistence

## Architecture Overview

The data model is intentionally denormalized for fast reads and predictable screen rendering.

- `inventory` stores the current sellable stock.
- `inventory_logs` stores an append-only audit trail for stock additions.
- `sales` stores transaction summaries.
- `sales/{saleId}/items_sold` stores the line items for each sale.
- `customers` stores aggregated customer balances and pending sale data.
- `products` and `suppliers` provide master data for cascading forms.

The app uses real-time Firestore listeners in its main hooks so dashboard and list screens update automatically when the underlying data changes.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- An Expo-compatible development environment
- A Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository.
2. Install dependencies.

```bash
npm install
```

3. Update Firebase configuration in `services/firebase.ts` with your own project settings.
4. Make sure email/password authentication is enabled in Firebase Auth.
5. Create the Firestore collections required by the app, or seed them from your own data setup.

### Run the App

```bash
npm start
```

Additional scripts:

```bash
npm run android
npm run ios
npm run web
```

Note: `npm run ios` requires macOS.

## Project Structure

- `App.tsx` - app bootstrap, navigation, and providers.
- `screens/` - top-level screens for dashboard, inventory, sales, login, and logs.
- `components/` - reusable UI components such as cards, chips, forms, and loading states.
- `hooks/` - data hooks and UI helpers.
- `services/` - Firebase initialization.
- `theme/` - colors and font tokens.
- `types/` - shared TypeScript models.
- `utils/` - development seed data and helper utilities.
- `docs/` - implementation notes and design documentation.

## Key Screens

- Dashboard: live KPIs, alerts, top products, and recent activity.
- Inventory: searchable inventory view with stock stats and quick actions.
- Sales: sales list with summary metrics and payment-state tracking.
- Add Inventory: multi-item stock entry with cascading master-data selection.
- Add Sale: multi-item sale entry with inventory-backed selection and validation.
- Inventory Logs: immutable view of stock addition history.
- Login: Firebase-authenticated entry point for the app.

## Development Notes

- The theme uses Montserrat for headlines and Lato for body text.
- Firestore reads are organized around the app's most common queries to keep screens responsive.
- Development seed helpers are present to speed up local testing, but they should be treated as non-production utilities.
- Before public deployment, review Firestore security rules, authentication settings, and any remaining hardcoded environment values.

## Roadmap

Planned or in-progress work includes:

- Cloud Function-backed transaction processing for sale and stock mutations.
- Reporting and export features.
- Additional production hardening and validation.
- Offline-oriented improvements and further performance tuning.

## Contributing

This project is still evolving, so contributions should be focused and deliberate.

1. Open an issue before starting larger changes.
2. Keep TypeScript models, hooks, and Firestore documents aligned.
3. Match the existing UI patterns and theme tokens.
4. Test inventory, sales, and log flows after making data-model changes.

## License

MIT
