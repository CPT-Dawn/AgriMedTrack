export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalPendingAmount: number;
  pendingSales: { [saleId: string]: number };
}

export interface Sale {
  saleId: string;
  billNumber: string;
  customerId: string;
  customerName: string;
  soldByUid: string;
  soldByName: string;
  saleDate: Date;
  totalAmount: number;
  totalProfit: number;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  amountPaid: number;
  amountPending: number;
}

export interface SaleItem {
  itemSoldId: string;
  inventoryItemId: string;
  productId: string;
  productName: string;
  supplierName: string;
  packagingSize: string;
  batchNumber: string;
  quantitySold: number;
  buyPricePerUnit: number;
  sellPricePerUnit: number;
  itemTotal: number;
  itemProfit: number;
}

export interface SaleFormItem {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  packagingSize: string;
  batchNumber: string;
  inventoryItemId: string;
  quantitySold: number;
  sellPricePerUnit: number;
  buyPricePerUnit: number;
  availableStock: number;
  itemTotal: number;
  itemProfit: number;
}

export interface InventoryItemForSale {
  inventoryItemId: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  packagingSize: string;
  batchNumber: string;
  quantity: number;
  sellPrice: number;
  buyPrice: number;
}
