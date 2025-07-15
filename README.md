# AgriMedTrack - Stock Management System

A comprehensive React Native mobile application for managing medical/veterinary stock inventory with Firebase backend integration.

## 🚀 Current Status - Ready to Test!

**The app is currently configured with mock data and ready to test immediately!**

✅ **No Firebase setup required** - Uses realistic mock data  
✅ **All features functional** - Add stock, create suppliers, upload mock photos  
✅ **Sample data included** - 5 products, 4 suppliers, 6 stock entries  
✅ **Real-time simulation** - Activity log and data updates

### Quick Start

```bash
cd AgriMedTrack
npm install
npm start
```

Then scan the QR code with Expo Go or press 'w' for web.

---

## Features

### ✅ Complete Stock Management

- **Item List**: Scrollable list showing medical formulas/products with:
  - Product name
  - Multiple vendors per formula
  - Packaging sizes (tablets, vials, bottles, etc.)
  - Quantity available (aggregated per vendor/size and total per formula)

### ✅ Add New Stock Entry

- **FAB Button**: Circular "+" floating action button in bottom-right corner
- **Modal Form** with:
  - Product dropdown with inline creation
  - Supplier/vendor dropdown with inline creation
  - Packaging size dropdown with inline creation
  - Numeric quantity input
  - Bill photo picker (camera/gallery)
  - Optional notes field
  - Real-time Firebase Firestore integration

### ✅ Activity Log

- Timestamped feed of stock additions/updates
- Shows who added/updated each entry
- Real-time updates via Firebase listeners

### ✅ Modern UI/UX

- Custom color scheme (Teal Blue, Harvest Gold, Coral)
- 2xl-radius cards with subtle shadows
- Responsive layout optimized for mobile
- Smooth modal animations
- Loading states and error handling

## Color Scheme

```typescript
Primary: Teal Blue #0288D1
Secondary: Harvest Gold #F9A825
Accent: Coral #FF7043
Background: Misty White #F5F5F5
Text: Charcoal #263238
```

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Firebase Firestore** for real-time database
- **Firebase Storage** for bill images
- **Expo Image Picker** for camera/gallery access

## Data Model

### Firebase Collections

```javascript
// Lookup collections
products: [{ id, name, category?, description?, createdAt }]
suppliers: [{ id, name, contactInfo?, createdAt }]
packaging_sizes: [{ id, label, unit, createdAt }]

// Main stock entries
stock_entries: [{
  id,
  productId,
  supplierId,
  sizeId,
  quantity,
  billImageUrl?,
  notes?,
  updatedBy,
  updatedAt,
  createdAt
}]

// Activity log
stock_activities: [{
  id,
  action: 'added' | 'updated' | 'removed',
  stockEntryId,
  productName,
  supplierName,
  sizeName,
  quantity,
  updatedBy,
  timestamp
}]
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project setup

### 2. Firebase Configuration

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database and Storage
3. Get your Firebase config object
4. Update `services/firebase.ts` with your config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

### 3. Install Dependencies

```bash
cd AgriMedTrack
npm install
```

### 4. Run the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### 5. Initialize Sample Data (Optional)

To test the app with sample data, temporarily add the `DataSetupComponent` to your main screen:

```typescript
// In screens/StockScreen.tsx
import { DataSetupComponent } from "../components/DataSetupComponent";

// Add above the stock items list
<DataSetupComponent />;
```

Run the app and tap "Setup Sample Data" once, then remove the component.

## Project Structure

```
app/
├── (tabs)/
│   ├── stock.tsx           # Stock tab entry point
│   └── ...
components/
├── CreatableDropdown.tsx   # Reusable dropdown with inline creation
├── DataSetupComponent.tsx  # Sample data initialization
└── ui/                     # UI components
constants/
├── Colors.ts              # Custom color palette
hooks/
├── useStock.ts           # Stock management hook
screens/
├── StockScreen.tsx       # Main stock screen implementation
services/
├── firebase.ts           # Firebase configuration
├── stockService.ts       # Firebase CRUD operations
types/
├── stock.ts             # TypeScript type definitions
utils/
├── sampleData.ts        # Sample data setup utilities
```

## Key Components

### StockScreen

- Main screen with stock list, activity log, and FAB
- Real-time data updates via Firebase listeners
- Responsive design with loading states

### CreatableDropdown

- Reusable dropdown component
- Supports searching and inline creation
- Integrates with Firebase services

### useStock Hook

- Manages all stock-related state and operations
- Provides CRUD operations for stock entries
- Aggregates data for display

### Stock Services

- Firebase integration layer
- CRUD operations for all collections
- Image upload handling
- Real-time listeners setup

## Usage

1. **View Stock**: Browse current inventory grouped by product
2. **Add Stock**: Tap the + FAB to open the form modal
3. **Create Items**: Use dropdowns to select or create products/suppliers/sizes
4. **Upload Bills**: Tap camera icon to attach bill photos
5. **Track Activity**: View real-time activity log at bottom

## Development

### Adding New Features

- Stock editing/updating functionality
- Barcode scanning for products
- Inventory alerts and notifications
- Export/reporting features
- Multi-user support with authentication

### Testing

- Ensure Firebase configuration is correct
- Test on both iOS and Android
- Verify image upload functionality
- Test offline behavior

## Troubleshooting

### Common Issues

1. **Firebase Connection**: Verify config in `services/firebase.ts`
2. **Image Upload**: Check Firebase Storage rules and permissions
3. **Build Errors**: Run `npm install` and restart Expo

### Firebase Rules

Make sure your Firestore security rules allow read/write access:

```javascript
// Firestore rules (for development)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Update for production
    }
  }
}
```

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using React Native and Firebase
