// Data Service for Dynamic Data Management
import {
  Product,
  Warehouse,
  StockLocation,
  Receipt,
  Delivery,
  InternalTransfer,
  StockAdjustment,
  StockMovement,
  User,
  ProductCategory,
  DocumentStatus,
} from '../types';

// Storage keys for different data types
const STORAGE_KEYS = {
  PRODUCTS: 'inventory_products',
  WAREHOUSES: 'inventory_warehouses',
  STOCK_LOCATIONS: 'inventory_stock_locations',
  RECEIPTS: 'inventory_receipts',
  DELIVERIES: 'inventory_deliveries',
  TRANSFERS: 'inventory_transfers',
  ADJUSTMENTS: 'inventory_adjustments',
  MOVEMENTS: 'inventory_movements',
  USER_PREFERENCES: 'inventory_user_preferences',
  DATA_INITIALIZED: 'inventory_data_initialized',
} as const;

// Default initial data for new users
const getInitialWarehouses = (): Warehouse[] => [
  {
    id: `wh-${Date.now()}`,
    name: 'Main Warehouse',
    code: 'WH-001',
    address: '123 Industrial Blvd, City, State 12345',
    racks: [],
  },
];

const getInitialProducts = (): Product[] => [
  {
    id: `prod-${Date.now()}`,
    sku: 'SAMPLE-001',
    name: 'Sample Product',
    category: 'Other' as ProductCategory,
    uom: 'pcs',
    reorderLevel: 10,
    description: 'This is a sample product. You can edit or delete it.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Data serialization helpers
export class DataService {
  private static getUserStorageKey(baseKey: string, userId?: string): string {
    return userId ? `${baseKey}_${userId}` : baseKey;
  }

  // Generic data loading with date parsing
  static loadFromStorage<T>(key: string, defaultValue: T, userId?: string): T {
    try {
      const storageKey = this.getUserStorageKey(key, userId);
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Convert date strings back to Date objects for specific data types
        if (key === STORAGE_KEYS.PRODUCTS) {
          return parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          })) as T;
        }
        
        if ([STORAGE_KEYS.RECEIPTS, STORAGE_KEYS.DELIVERIES, STORAGE_KEYS.TRANSFERS, STORAGE_KEYS.ADJUSTMENTS].includes(key as any)) {
          return parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            validatedAt: item.validatedAt ? new Date(item.validatedAt) : undefined,
          })) as T;
        }
        
        if (key === STORAGE_KEYS.MOVEMENTS) {
          return parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })) as T;
        }
        
        return parsed as T;
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    
    return defaultValue;
  }

  // Generic data saving
  static saveToStorage<T>(key: string, data: T, userId?: string): void {
    try {
      const storageKey = this.getUserStorageKey(key, userId);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  // Initialize data for new users
  static initializeUserData(userId: string): void {
    const initKey = this.getUserStorageKey(STORAGE_KEYS.DATA_INITIALIZED, userId);
    
    if (!localStorage.getItem(initKey)) {
      // Initialize with minimal starter data
      this.saveToStorage(STORAGE_KEYS.WAREHOUSES, getInitialWarehouses(), userId);
      this.saveToStorage(STORAGE_KEYS.PRODUCTS, getInitialProducts(), userId);
      this.saveToStorage(STORAGE_KEYS.STOCK_LOCATIONS, [], userId);
      this.saveToStorage(STORAGE_KEYS.RECEIPTS, [], userId);
      this.saveToStorage(STORAGE_KEYS.DELIVERIES, [], userId);
      this.saveToStorage(STORAGE_KEYS.TRANSFERS, [], userId);
      this.saveToStorage(STORAGE_KEYS.ADJUSTMENTS, [], userId);
      this.saveToStorage(STORAGE_KEYS.MOVEMENTS, [], userId);
      
      // Mark as initialized
      localStorage.setItem(initKey, 'true');
      
      console.log('Initialized data for new user:', userId);
    }
  }

  // Check if user has existing data
  static hasUserData(userId: string): boolean {
    const initKey = this.getUserStorageKey(STORAGE_KEYS.DATA_INITIALIZED, userId);
    return localStorage.getItem(initKey) === 'true';
  }

  // Clear all user data (for logout or account deletion)
  static clearUserData(userId: string): void {
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(key => {
      const storageKey = this.getUserStorageKey(key, userId);
      localStorage.removeItem(storageKey);
    });
    console.log('Cleared data for user:', userId);
  }

  // Migrate existing data to user-specific storage (for existing users)
  static migrateExistingData(userId: string): void {
    const keys = Object.values(STORAGE_KEYS);
    let hasMigrated = false;
    
    keys.forEach(key => {
      const oldData = localStorage.getItem(key);
      if (oldData && !this.hasUserData(userId)) {
        const newKey = this.getUserStorageKey(key, userId);
        localStorage.setItem(newKey, oldData);
        localStorage.removeItem(key); // Remove old global data
        hasMigrated = true;
      }
    });
    
    if (hasMigrated) {
      const initKey = this.getUserStorageKey(STORAGE_KEYS.DATA_INITIALIZED, userId);
      localStorage.setItem(initKey, 'true');
      console.log('Migrated existing data for user:', userId);
    }
  }

  // Export user data (for backup/transfer)
  static exportUserData(userId: string): Record<string, any> {
    const data: Record<string, any> = {};
    const keys = Object.values(STORAGE_KEYS);
    
    keys.forEach(key => {
      const storageKey = this.getUserStorageKey(key, userId);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          data[key] = JSON.parse(stored);
        } catch (error) {
          console.error(`Error parsing ${key}:`, error);
        }
      }
    });
    
    return data;
  }

  // Import user data (for restore/transfer)
  static importUserData(userId: string, data: Record<string, any>): void {
    const keys = Object.values(STORAGE_KEYS);
    
    keys.forEach(key => {
      if (data[key]) {
        const storageKey = this.getUserStorageKey(key, userId);
        localStorage.setItem(storageKey, JSON.stringify(data[key]));
      }
    });
    
    const initKey = this.getUserStorageKey(STORAGE_KEYS.DATA_INITIALIZED, userId);
    localStorage.setItem(initKey, 'true');
    
    console.log('Imported data for user:', userId);
  }

  // Get storage usage statistics
  static getStorageStats(userId: string): { totalSize: number; itemCount: number; breakdown: Record<string, number> } {
    const keys = Object.values(STORAGE_KEYS);
    let totalSize = 0;
    let itemCount = 0;
    const breakdown: Record<string, number> = {};
    
    keys.forEach(key => {
      const storageKey = this.getUserStorageKey(key, userId);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const size = new Blob([stored]).size;
        totalSize += size;
        itemCount++;
        breakdown[key] = size;
      }
    });
    
    return { totalSize, itemCount, breakdown };
  }
}

export { STORAGE_KEYS };