// Sample Data Generator for Demo Purposes
import {
  Product,
  Warehouse,
  StockLocation,
  Receipt,
  Delivery,
  InternalTransfer,
  StockAdjustment,
  StockMovement,
  ProductCategory,
  DocumentStatus,
  UOM,
} from '../types';

// Generate sample warehouses
export const generateSampleWarehouses = (): Warehouse[] => [
  {
    id: `wh-${Date.now()}`,
    name: 'Main Warehouse',
    code: 'WH-001',
    address: '123 Industrial Blvd, City, State 12345',
    racks: [],
  },
  {
    id: `wh-${Date.now() + 1}`,
    name: 'Secondary Warehouse',
    code: 'WH-002',
    address: '456 Commerce St, City, State 12346',
    racks: [],
  },
];

// Generate sample products
export const generateSampleProducts = (): Product[] => {
  const categories: ProductCategory[] = ['Electronics', 'Furniture', 'Clothing', 'Food', 'Books', 'Tools', 'Other'];
  const uoms: UOM[] = ['pcs', 'kg', 'lbs', 'box', 'carton', 'dozen'];
  
  const sampleProducts = [
    { name: 'Wireless Mouse', category: 'Electronics', sku: 'ELC-001', uom: 'pcs', reorderLevel: 20 },
    { name: 'Bluetooth Keyboard', category: 'Electronics', sku: 'ELC-002', uom: 'pcs', reorderLevel: 15 },
    { name: 'Office Chair', category: 'Furniture', sku: 'FUR-001', uom: 'pcs', reorderLevel: 5 },
    { name: 'Desk Lamp', category: 'Furniture', sku: 'FUR-002', uom: 'pcs', reorderLevel: 10 },
    { name: 'T-Shirt', category: 'Clothing', sku: 'CLO-001', uom: 'pcs', reorderLevel: 50 },
    { name: 'Coffee Beans', category: 'Food', sku: 'FOD-001', uom: 'kg', reorderLevel: 25 },
    { name: 'Programming Book', category: 'Books', sku: 'BOK-001', uom: 'pcs', reorderLevel: 12 },
    { name: 'Screwdriver Set', category: 'Tools', sku: 'TOL-001', uom: 'box', reorderLevel: 8 },
  ];

  return sampleProducts.map((product, index) => ({
    id: `prod-${Date.now() + index}`,
    sku: product.sku,
    name: product.name,
    category: product.category as ProductCategory,
    uom: product.uom as UOM,
    reorderLevel: product.reorderLevel,
    description: `Sample ${product.name.toLowerCase()} for demonstration purposes`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    updatedAt: new Date(),
  }));
};

// Generate sample stock locations
export const generateSampleStockLocations = (products: Product[], warehouses: Warehouse[]): StockLocation[] => {
  const stockLocations: StockLocation[] = [];
  
  products.forEach((product, index) => {
    warehouses.forEach((warehouse, warehouseIndex) => {
      // Not all products in all warehouses
      if (Math.random() > 0.3) {
        stockLocations.push({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: Math.floor(Math.random() * 100) + 10, // Random quantity between 10-110
        });
      }
    });
  });
  
  return stockLocations;
};

// Generate sample receipts
export const generateSampleReceipts = (products: Product[], warehouses: Warehouse[]): Receipt[] => {
  const vendors = ['Tech Supplies Inc.', 'Office Furniture Co.', 'Tool Distributors', 'Electronics Wholesale'];
  const statuses: DocumentStatus[] = ['Done', 'Draft', 'Waiting'];
  
  return Array.from({ length: 5 }, (_, index) => {
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
    const selectedProducts = products.slice(0, Math.floor(Math.random() * 3) + 1);
    
    return {
      id: `rec-${Date.now() + index}`,
      documentNumber: `REC-${String(index + 1).padStart(3, '0')}`,
      vendorName: vendors[Math.floor(Math.random() * vendors.length)],
      vendorContact: `vendor${index + 1}@example.com`,
      warehouseId: warehouse.id,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lines: selectedProducts.map((product, lineIndex) => ({
        id: `line-${Date.now() + index}-${lineIndex}`,
        productId: product.id,
        quantity: Math.floor(Math.random() * 50) + 10,
      })),
      createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000), // Random date within last 15 days
      notes: `Sample receipt #${index + 1}`,
    };
  });
};

// Generate sample deliveries
export const generateSampleDeliveries = (products: Product[], warehouses: Warehouse[]): Delivery[] => {
  const customers = ['ABC Corp', 'XYZ Retail', 'Tech Solutions Ltd', 'Office Supplies Co'];
  const statuses: DocumentStatus[] = ['Done', 'Ready', 'Draft'];
  
  return Array.from({ length: 4 }, (_, index) => {
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
    const selectedProducts = products.slice(0, Math.floor(Math.random() * 2) + 1);
    
    return {
      id: `del-${Date.now() + index}`,
      documentNumber: `DEL-${String(index + 1).padStart(3, '0')}`,
      customerName: customers[Math.floor(Math.random() * customers.length)],
      customerContact: `customer${index + 1}@example.com`,
      warehouseId: warehouse.id,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lines: selectedProducts.map((product, lineIndex) => ({
        id: `line-${Date.now() + index}-${lineIndex}`,
        productId: product.id,
        quantity: Math.floor(Math.random() * 20) + 5,
      })),
      createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Random date within last 10 days
      notes: `Sample delivery #${index + 1}`,
    };
  });
};

// Generate complete sample data set
export const generateSampleDataSet = () => {
  const warehouses = generateSampleWarehouses();
  const products = generateSampleProducts();
  const stockLocations = generateSampleStockLocations(products, warehouses);
  const receipts = generateSampleReceipts(products, warehouses);
  const deliveries = generateSampleDeliveries(products, warehouses);
  
  return {
    warehouses,
    products,
    stockLocations,
    receipts,
    deliveries,
    transfers: [], // Empty for now
    adjustments: [], // Empty for now
    movements: [], // Will be generated when documents are validated
  };
};

// Quick setup function for demo purposes
export const setupDemoData = (userId: string) => {
  const { warehouses, products, stockLocations, receipts, deliveries } = generateSampleDataSet();
  
  return {
    [STORAGE_KEYS.WAREHOUSES]: warehouses,
    [STORAGE_KEYS.PRODUCTS]: products,
    [STORAGE_KEYS.STOCK_LOCATIONS]: stockLocations,
    [STORAGE_KEYS.RECEIPTS]: receipts,
    [STORAGE_KEYS.DELIVERIES]: deliveries,
    [STORAGE_KEYS.TRANSFERS]: [],
    [STORAGE_KEYS.ADJUSTMENTS]: [],
    [STORAGE_KEYS.MOVEMENTS]: [],
  };
};

// Import storage keys
import { STORAGE_KEYS } from './dataService';