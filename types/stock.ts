export interface Product {
  id: string;
  name: string;
  category?: string;
  description?: string;
  createdAt?: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo?: any;
  createdAt?: Date;
}

export interface PackagingSize {
  id: string;
  label: string;
  unit: string;
  value?: string;
  createdAt?: Date;
}

export interface StockEntry {
  id: string;
  productId: string;
  supplierId: string;
  sizeId: string;
  quantity: number;
  buyPrice?: number;
  sellPrice?: number;
  billImageUrl?: string;
  notes?: string;
  batchId?: string; // Reference to the batch this entry belongs to
  updatedBy: string; // profile/user ID
  updatedByName?: string;
  updatedByAvatar?: string;
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
  action: "added" | "updated" | "removed" | "sold";
  stockEntryId: string;
  productName: string;
  supplierName: string;
  sizeName: string;
  quantity: number;
  buyPrice?: number; // Add buyPrice for log display
  sellPrice?: number; // Add sellPrice for completeness
  batchId?: string; // Reference to the batch this activity belongs to
  updatedBy: string;
  updatedByName?: string;
  updatedByAvatar?: string;
  timestamp: Date;
}

// New interface for batch entries
export interface StockBatch {
  id: string;
  addedBy: string;
  addedByName?: string;
  addedByAvatar?: string;
  addedAt: Date;
  billUrl?: string;
  billThumbnail?: string;
  items: StockActivity[];
}

// Form data types
export interface StockEntryFormData {
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  sizeId: string;
  sizeLabel: string;
  sizeValue: string; // New field for size value (e.g., "10", "20")
  unit: string; // New field for unit (e.g., "tablet", "ml")
  quantity: string;
  buyPrice?: string;
  sellPrice?: string;
  billImage?: {
    uri: string;
    name: string;
    type: string;
  };
  notes?: string;
  batchId?: string; // Optional batch ID if part of a batch
}

// Batch form data
export interface BatchEntryFormData {
  addedBy: string;
  billImage?: {
    uri: string;
    name: string;
    type: string;
  };
  items: StockEntryFormData[];
}
