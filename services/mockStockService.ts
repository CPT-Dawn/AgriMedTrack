import {
  PackagingSize,
  Product,
  StockActivity,
  StockEntry,
  StockEntryFormData,
  Supplier,
} from "../types/stock";

// Mock data storage
let mockProducts: Product[] = [
  {
    id: "1",
    name: "Amoxicillin",
    category: "Antibiotics",
    description: "Broad-spectrum antibiotic",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Atorvastatin",
    category: "Cardiovascular",
    description: "Cholesterol-lowering medication",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "Metformin",
    category: "Diabetes",
    description: "Type 2 diabetes medication",
    createdAt: new Date("2024-01-25"),
  },
  {
    id: "4",
    name: "Ibuprofen",
    category: "Pain Relief",
    description: "Anti-inflammatory pain reliever",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "5",
    name: "Paracetamol",
    category: "Pain Relief",
    description: "Fever and pain reliever",
    createdAt: new Date("2024-02-05"),
  },
];

let mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "GreenPharma Ltd",
    contactInfo: {
      email: "contact@greenpharma.com",
      phone: "+1-555-0101",
      address: "123 Medical Drive, Healthcare City",
    },
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    name: "MediCorp Inc",
    contactInfo: {
      email: "sales@medicorp.com",
      phone: "+1-555-0102",
      address: "456 Pharma Boulevard, Medicine Town",
    },
    createdAt: new Date("2024-01-12"),
  },
  {
    id: "3",
    name: "VetMed Solutions",
    contactInfo: {
      email: "info@vetmed.com",
      phone: "+1-555-0103",
      address: "789 Veterinary Street, Animal Care City",
    },
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "4",
    name: "AgriHealth Co",
    contactInfo: {
      email: "orders@agrihealth.com",
      phone: "+1-555-0104",
      address: "321 Agriculture Lane, Farm Health Valley",
    },
    createdAt: new Date("2024-01-16"),
  },
];

let mockSizes: PackagingSize[] = [
  {
    id: "1",
    label: "10mg tablet",
    unit: "tablet",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    label: "20mg tablet",
    unit: "tablet",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    label: "50mg tablet",
    unit: "tablet",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    label: "100mg tablet",
    unit: "tablet",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    label: "10ml vial",
    unit: "vial",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "6",
    label: "20ml vial",
    unit: "vial",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "7",
    label: "50ml bottle",
    unit: "bottle",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "8",
    label: "100ml bottle",
    unit: "bottle",
    createdAt: new Date("2024-01-01"),
  },
];

let mockStockEntries: StockEntry[] = [
  {
    id: "1",
    productId: "1", // Amoxicillin
    supplierId: "1", // GreenPharma
    sizeId: "1", // 10mg tablet
    quantity: 500,
    notes: "Bulk purchase for Q1",
    updatedBy: "user1",
    updatedAt: new Date("2024-07-01"),
    createdAt: new Date("2024-07-01"),
  },
  {
    id: "2",
    productId: "1", // Amoxicillin
    supplierId: "2", // MediCorp
    sizeId: "2", // 20mg tablet
    quantity: 250,
    notes: "Emergency stock",
    updatedBy: "user1",
    updatedAt: new Date("2024-07-02"),
    createdAt: new Date("2024-07-02"),
  },
  {
    id: "3",
    productId: "2", // Atorvastatin
    supplierId: "1", // GreenPharma
    sizeId: "3", // 50mg tablet
    quantity: 300,
    notes: "Regular order",
    updatedBy: "user2",
    updatedAt: new Date("2024-07-03"),
    createdAt: new Date("2024-07-03"),
  },
  {
    id: "4",
    productId: "3", // Metformin
    supplierId: "3", // VetMed
    sizeId: "4", // 100mg tablet
    quantity: 400,
    notes: "Monthly restock",
    updatedBy: "user1",
    updatedAt: new Date("2024-07-04"),
    createdAt: new Date("2024-07-04"),
  },
  {
    id: "5",
    productId: "4", // Ibuprofen
    supplierId: "2", // MediCorp
    sizeId: "5", // 10ml vial
    quantity: 150,
    notes: "Liquid form for pediatric use",
    updatedBy: "user2",
    updatedAt: new Date("2024-07-05"),
    createdAt: new Date("2024-07-05"),
  },
  {
    id: "6",
    productId: "5", // Paracetamol
    supplierId: "4", // AgriHealth
    sizeId: "7", // 50ml bottle
    quantity: 200,
    notes: "Syrup form",
    updatedBy: "user1",
    updatedAt: new Date("2024-07-06"),
    createdAt: new Date("2024-07-06"),
  },
];

let mockActivities: StockActivity[] = [
  {
    id: "1",
    action: "added",
    stockEntryId: "6",
    productName: "Paracetamol",
    supplierName: "AgriHealth Co",
    sizeName: "50ml bottle",
    quantity: 200,
    updatedBy: "user1",
    updatedByName: "John Doe",
    timestamp: new Date("2024-07-06T10:30:00"),
  },
  {
    id: "2",
    action: "added",
    stockEntryId: "5",
    productName: "Ibuprofen",
    supplierName: "MediCorp Inc",
    sizeName: "10ml vial",
    quantity: 150,
    updatedBy: "user2",
    updatedByName: "Jane Smith",
    timestamp: new Date("2024-07-05T14:20:00"),
  },
  {
    id: "3",
    action: "added",
    stockEntryId: "4",
    productName: "Metformin",
    supplierName: "VetMed Solutions",
    sizeName: "100mg tablet",
    quantity: 400,
    updatedBy: "user1",
    updatedByName: "John Doe",
    timestamp: new Date("2024-07-04T09:15:00"),
  },
  {
    id: "4",
    action: "added",
    stockEntryId: "3",
    productName: "Atorvastatin",
    supplierName: "GreenPharma Ltd",
    sizeName: "50mg tablet",
    quantity: 300,
    updatedBy: "user2",
    updatedByName: "Jane Smith",
    timestamp: new Date("2024-07-03T11:45:00"),
  },
  {
    id: "5",
    action: "added",
    stockEntryId: "2",
    productName: "Amoxicillin",
    supplierName: "MediCorp Inc",
    sizeName: "20mg tablet",
    quantity: 250,
    updatedBy: "user1",
    updatedByName: "John Doe",
    timestamp: new Date("2024-07-02T16:30:00"),
  },
];

// Utility functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Mock Product services
export const productService = {
  async getAll(): Promise<Product[]> {
    await delay(100); // Simulate network delay
    return [...mockProducts].sort((a, b) => a.name.localeCompare(b.name));
  },

  async create(name: string): Promise<Product> {
    await delay(150);
    const newProduct: Product = {
      id: generateId(),
      name,
      createdAt: new Date(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  async findByName(name: string): Promise<Product | null> {
    await delay(50);
    return (
      mockProducts.find((p) => p.name.toLowerCase() === name.toLowerCase()) ||
      null
    );
  },
};

// Mock Supplier services
export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    await delay(100);
    return [...mockSuppliers].sort((a, b) => a.name.localeCompare(b.name));
  },

  async create(name: string): Promise<Supplier> {
    await delay(150);
    const newSupplier: Supplier = {
      id: generateId(),
      name,
      createdAt: new Date(),
    };
    mockSuppliers.push(newSupplier);
    return newSupplier;
  },

  async findByName(name: string): Promise<Supplier | null> {
    await delay(50);
    return (
      mockSuppliers.find((s) => s.name.toLowerCase() === name.toLowerCase()) ||
      null
    );
  },
};

// Mock Packaging size services
export const sizeService = {
  async getAll(): Promise<PackagingSize[]> {
    await delay(100);
    return [...mockSizes].sort((a, b) => a.label.localeCompare(b.label));
  },

  async create(label: string, unit: string): Promise<PackagingSize> {
    await delay(150);
    const newSize: PackagingSize = {
      id: generateId(),
      label,
      unit,
      createdAt: new Date(),
    };
    mockSizes.push(newSize);
    return newSize;
  },

  async findByLabel(label: string): Promise<PackagingSize | null> {
    await delay(50);
    return (
      mockSizes.find((s) => s.label.toLowerCase() === label.toLowerCase()) ||
      null
    );
  },
};

// Mock Stock entry services
export const stockService = {
  async getAll(): Promise<StockEntry[]> {
    await delay(200);
    return [...mockStockEntries].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  },

  async create(data: StockEntryFormData, userId: string): Promise<StockEntry> {
    await delay(300);

    const newEntry: StockEntry = {
      id: generateId(),
      productId: data.productId,
      supplierId: data.supplierId,
      sizeId: data.sizeId,
      quantity: parseInt(data.quantity),
      notes: data.notes || "",
      billImageUrl: data.billImage
        ? `mock://bill-${Date.now()}.jpg`
        : undefined,
      updatedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockStockEntries.unshift(newEntry);
    return newEntry;
  },

  async update(
    id: string,
    data: Partial<StockEntryFormData>,
    userId: string
  ): Promise<void> {
    await delay(200);

    const entryIndex = mockStockEntries.findIndex((e) => e.id === id);
    if (entryIndex === -1) throw new Error("Entry not found");

    const entry = mockStockEntries[entryIndex];
    const updatedEntry = {
      ...entry,
      quantity: data.quantity ? parseInt(data.quantity) : entry.quantity,
      notes: data.notes !== undefined ? data.notes : entry.notes,
      billImageUrl: data.billImage
        ? `mock://bill-${Date.now()}.jpg`
        : entry.billImageUrl,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    mockStockEntries[entryIndex] = updatedEntry;
  },

  async delete(id: string): Promise<void> {
    await delay(150);
    mockStockEntries = mockStockEntries.filter((entry) => entry.id !== id);
  },

  // Real-time listener simulation
  onSnapshot(callback: (entries: StockEntry[]) => void) {
    // Initial call
    callback([...mockStockEntries]);

    // Return unsubscribe function
    return () => {
      console.log("Unsubscribed from stock entries");
    };
  },
};

// Mock Activity log service
export const activityService = {
  async getRecent(limitCount = 50): Promise<StockActivity[]> {
    await delay(100);
    return [...mockActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limitCount);
  },

  async logActivity(
    activity: Omit<StockActivity, "id" | "timestamp">
  ): Promise<void> {
    await delay(100);

    const newActivity: StockActivity = {
      ...activity,
      id: generateId(),
      timestamp: new Date(),
    };

    mockActivities.unshift(newActivity);

    // Keep only last 100 activities
    if (mockActivities.length > 100) {
      mockActivities = mockActivities.slice(0, 100);
    }
  },

  // Real-time listener for activity feed
  onSnapshot(callback: (activities: StockActivity[]) => void, limitCount = 50) {
    // Initial call
    const recent = [...mockActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limitCount);
    callback(recent);

    // Return unsubscribe function
    return () => {
      console.log("Unsubscribed from activities");
    };
  },
};

// Mock image upload utility
export async function uploadBillImage(image: {
  uri: string;
  name: string;
  type: string;
}): Promise<string> {
  await delay(500); // Simulate upload time
  return `mock://uploaded-${Date.now()}-${image.name}`;
}

console.log("Mock stock service initialized with sample data");
