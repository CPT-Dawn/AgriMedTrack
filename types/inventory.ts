export interface Product {
  id: string;
  name: string;
  category: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo?: {
    phone?: string;
    address?: string;
  };
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  packagingSizeValue: number;
  packagingUnit: string;
  packagingSize: string;
  batchNumber: string;
  quantityAdded: number;
  buyPrice: number;
  sellPrice: number;
  mfgDate: Date;
  expiryDate: Date;
  stockAddDate?: Date; // New field for when stock was added
}
