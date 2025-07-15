import {
  PackagingSize,
  Product,
  StockActivity,
  StockEntry,
  StockEntryFormData,
  Supplier,
} from "../types/stock";

// Replace all mock data with the provided fertilizer/pesticide data
// 1. Define new mockProducts (unique Product Names)
const mockProducts = [
  { id: "1", name: "Urea", createdAt: new Date() },
  { id: "2", name: "DAP", createdAt: new Date() },
  { id: "3", name: "NPK 20:20:0", createdAt: new Date() },
  { id: "4", name: "MOP", createdAt: new Date() },
  { id: "5", name: "SSP", createdAt: new Date() },
  { id: "6", name: "Compost", createdAt: new Date() },
  { id: "7", name: "Confidor", createdAt: new Date() },
  { id: "8", name: "Coragen", createdAt: new Date() },
  { id: "9", name: "Karate", createdAt: new Date() },
  { id: "10", name: "Thimet", createdAt: new Date() },
  { id: "11", name: "Rogor", createdAt: new Date() },
  { id: "12", name: "Agromin", createdAt: new Date() },
  { id: "13", name: "Planofix", createdAt: new Date() },
  { id: "14", name: "Humic Power", createdAt: new Date() },
  { id: "15", name: "Biozyme", createdAt: new Date() },
  { id: "16", name: "Sudozol", createdAt: new Date() },
];
// 2. Define new mockSuppliers (unique Company names)
const supplierNames = [
  "IFFCO",
  "Nagarjuna Fert.",
  "Tata Chemicals",
  "IPL",
  "Coromandel",
  "GSFC",
  "Chambal Fertilizer",
  "Zuari Agro",
  "FACT",
  "Local Organic Co.",
  "GreenManure Pvt.",
  "Bayer",
  "Crystal Crop",
  "FMC",
  "Adama",
  "Syngenta",
  "UPL",
  "Dhanuka",
  "Rallis India",
  "Indofil",
  "PI Industries",
  "Advent Agro",
  "Mahadhan",
  "Multiplex",
  "Biostadt India",
  "Zuari Biotech",
];
const mockSuppliers = supplierNames.map((name, idx) => ({
  id: (idx + 1).toString(),
  name,
  createdAt: new Date(),
}));
// 3. Define new mockSizes (unique Packaging Size labels)
const sizeLabels = [
  "45 kg",
  "50 kg",
  "25 kg",
  "100 ml",
  "250 ml",
  "500 ml",
  "1 L",
  "1 kg",
  "5 kg",
  "250 gm",
  "500 gm",
];
const mockSizes = sizeLabels.map((label, idx) => ({
  id: (idx + 1).toString(),
  label,
  unit: label.match(/kg|gm|ml|L/)?.[0] || "unit",
  createdAt: new Date(),
}));
// 4. Define new mockStockEntries (all rows from the provided table)
const mockStockEntries = [
  // Urea
  {
    productId: "1",
    supplierId: "1",
    sizeId: "1",
    quantity: 120,
    buyPrice: 240,
    sellPrice: 266,
  },
  {
    productId: "1",
    supplierId: "2",
    sizeId: "2",
    quantity: 70,
    buyPrice: 265,
    sellPrice: 290,
  },
  // DAP
  {
    productId: "2",
    supplierId: "3",
    sizeId: "2",
    quantity: 80,
    buyPrice: 1200,
    sellPrice: 1350,
  },
  {
    productId: "2",
    supplierId: "4",
    sizeId: "3",
    quantity: 60,
    buyPrice: 650,
    sellPrice: 720,
  },
  // NPK 20:20:0
  {
    productId: "3",
    supplierId: "5",
    sizeId: "2",
    quantity: 100,
    buyPrice: 1050,
    sellPrice: 1150,
  },
  {
    productId: "3",
    supplierId: "6",
    sizeId: "3",
    quantity: 90,
    buyPrice: 540,
    sellPrice: 590,
  },
  // MOP
  {
    productId: "4",
    supplierId: "7",
    sizeId: "2",
    quantity: 60,
    buyPrice: 1200,
    sellPrice: 1300,
  },
  {
    productId: "4",
    supplierId: "8",
    sizeId: "3",
    quantity: 45,
    buyPrice: 620,
    sellPrice: 680,
  },
  // SSP
  {
    productId: "5",
    supplierId: "9",
    sizeId: "2",
    quantity: 90,
    buyPrice: 400,
    sellPrice: 450,
  },
  {
    productId: "5",
    supplierId: "5",
    sizeId: "3",
    quantity: 100,
    buyPrice: 210,
    sellPrice: 240,
  },
  // Compost
  {
    productId: "6",
    supplierId: "10",
    sizeId: "3",
    quantity: 50,
    buyPrice: 150,
    sellPrice: 200,
  },
  {
    productId: "6",
    supplierId: "11",
    sizeId: "2",
    quantity: 30,
    buyPrice: 280,
    sellPrice: 330,
  },
  // Confidor
  {
    productId: "7",
    supplierId: "12",
    sizeId: "4",
    quantity: 200,
    buyPrice: 260,
    sellPrice: 300,
  },
  {
    productId: "7",
    supplierId: "13",
    sizeId: "5",
    quantity: 150,
    buyPrice: 630,
    sellPrice: 700,
  },
  // Coragen
  {
    productId: "8",
    supplierId: "14",
    sizeId: "6",
    quantity: 80,
    buyPrice: 580,
    sellPrice: 650,
  },
  {
    productId: "8",
    supplierId: "15",
    sizeId: "4",
    quantity: 40,
    buyPrice: 1100,
    sellPrice: 1200,
  },
  // Karate
  {
    productId: "9",
    supplierId: "16",
    sizeId: "5",
    quantity: 100,
    buyPrice: 480,
    sellPrice: 550,
  },
  {
    productId: "9",
    supplierId: "17",
    sizeId: "4",
    quantity: 60,
    buyPrice: 190,
    sellPrice: 230,
  },
  // Thimet
  {
    productId: "10",
    supplierId: "14",
    sizeId: "8",
    quantity: 150,
    buyPrice: 170,
    sellPrice: 200,
  },
  {
    productId: "10",
    supplierId: "13",
    sizeId: "9",
    quantity: 40,
    buyPrice: 800,
    sellPrice: 950,
  },
  // Rogor
  {
    productId: "11",
    supplierId: "18",
    sizeId: "6",
    quantity: 60,
    buyPrice: 280,
    sellPrice: 320,
  },
  {
    productId: "11",
    supplierId: "19",
    sizeId: "5",
    quantity: 80,
    buyPrice: 150,
    sellPrice: 180,
  },
  // Agromin
  {
    productId: "12",
    supplierId: "8",
    sizeId: "6",
    quantity: 90,
    buyPrice: 220,
    sellPrice: 250,
  },
  {
    productId: "12",
    supplierId: "20",
    sizeId: "7",
    quantity: 45,
    buyPrice: 400,
    sellPrice: 460,
  },
  // Planofix
  {
    productId: "13",
    supplierId: "21",
    sizeId: "4",
    quantity: 110,
    buyPrice: 100,
    sellPrice: 120,
  },
  {
    productId: "13",
    supplierId: "22",
    sizeId: "5",
    quantity: 50,
    buyPrice: 220,
    sellPrice: 260,
  },
  // Humic Power
  {
    productId: "14",
    supplierId: "23",
    sizeId: "6",
    quantity: 70,
    buyPrice: 240,
    sellPrice: 280,
  },
  {
    productId: "14",
    supplierId: "24",
    sizeId: "7",
    quantity: 40,
    buyPrice: 460,
    sellPrice: 530,
  },
  // Biozyme
  {
    productId: "15",
    supplierId: "25",
    sizeId: "5",
    quantity: 85,
    buyPrice: 200,
    sellPrice: 240,
  },
  {
    productId: "15",
    supplierId: "8",
    sizeId: "6",
    quantity: 30,
    buyPrice: 380,
    sellPrice: 420,
  },
  // Sudozol
  {
    productId: "16",
    supplierId: "19",
    sizeId: "10",
    quantity: 95,
    buyPrice: 130,
    sellPrice: 160,
  },
  {
    productId: "16",
    supplierId: "16",
    sizeId: "11",
    quantity: 60,
    buyPrice: 250,
    sellPrice: 300,
  },
].map((entry, idx) => ({
  id: (idx + 1).toString(),
  ...entry,
  notes: "",
  updatedBy: "user1",
  updatedAt: new Date(),
  createdAt: new Date(),
}));

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
