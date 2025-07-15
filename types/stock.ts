export interface Product {
  id: string;
  name: string;
  category?: string;
  description?: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  createdAt: Date;
}

export interface PackagingSize {
  id: string;
  label: string; // e.g., "10mg tablet", "20ml vial"
  unit: string; // e.g., "tablet", "vial", "ml", "g"
  createdAt: Date;
}

export interface StockEntry {
  id: string;
  productId: string;
  supplierId: string;
  sizeId: string;
  quantity: number;
  billImageUrl?: string;
  notes?: string;
  updatedBy: string; // profile/user ID
  updatedAt: Date;
  createdAt: Date;
}

// Aggregated view for display
export interface StockItem {
  id: string;
  product: Product;
  suppliers: {
    supplier: Supplier;
    sizes: {
      size: PackagingSize;
      quantity: number;
      lastUpdated: Date;
      updatedBy: string;
    }[];
  }[];
  totalQuantity: number;
}

// For activity log
export interface StockActivity {
  id: string;
  action: "added" | "updated" | "removed";
  stockEntryId: string;
  productName: string;
  supplierName: string;
  sizeName: string;
  quantity: number;
  updatedBy: string;
  updatedByName?: string;
  timestamp: Date;
}

// Form data types
export interface StockEntryFormData {
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  sizeId: string;
  sizeLabel: string;
  quantity: string;
  billImage?: {
    uri: string;
    name: string;
    type: string;
  };
  notes?: string;
}
