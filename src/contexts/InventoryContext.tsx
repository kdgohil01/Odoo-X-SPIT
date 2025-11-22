import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Product,
  Warehouse,
  StockLocation,
  Receipt,
  Delivery,
  InternalTransfer,
  StockAdjustment,
  StockMovement,
  DocumentLine,
  AdjustmentLine,
} from '../types';
import { DataService, STORAGE_KEYS } from '../lib/dataService';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  getProduct: (id: string) => Product | undefined;
  
  // Warehouses
  warehouses: Warehouse[];
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'racks'>) => Warehouse;
  updateWarehouse: (id: string, updates: Partial<Pick<Warehouse, 'name' | 'address'>>) => void;
  
  // Stock Locations
  stockLocations: StockLocation[];
  getStockByProduct: (productId: string) => StockLocation[];
  getTotalStock: (productId: string) => number;
  getStockByProductAndWarehouse: (productId: string, warehouseId: string) => number;
  updateStock: (productId: string, warehouseId: string, quantity: number) => void;
  checkStockAvailability: (productId: string, warehouseId: string, quantity: number) => boolean;
  
  // Receipts
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt'>) => Receipt;
  validateReceipt: (id: string) => void;
  cancelReceipt: (id: string) => void;
  getReceipt: (id: string) => Receipt | undefined;
  
  // Deliveries
  deliveries: Delivery[];
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt'>) => Delivery;
  validateDelivery: (id: string) => void;
  updateDeliveryStatus: (id: string, status: DocumentStatus) => void;
  cancelDelivery: (id: string) => void;
  getDelivery: (id: string) => Delivery | undefined;
  
  // Transfers
  transfers: InternalTransfer[];
  addTransfer: (transfer: Omit<InternalTransfer, 'id' | 'createdAt'>) => InternalTransfer;
  validateTransfer: (id: string) => void;
  getTransfer: (id: string) => InternalTransfer | undefined;
  
  // Adjustments
  adjustments: StockAdjustment[];
  addAdjustment: (adjustment: Omit<StockAdjustment, 'id' | 'createdAt'>) => StockAdjustment;
  validateAdjustment: (id: string) => void;
  cancelAdjustment: (id: string) => void;
  getAdjustment: (id: string) => StockAdjustment | undefined;
  
  // Movements
  movements: StockMovement[];
  addMovement: (movement: Omit<StockMovement, 'id'>) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Initialize user data when user changes
  useEffect(() => {
    if (user?.id) {
      // Check if user has existing data, if not initialize
      if (!DataService.hasUserData(user.id)) {
        // Try to migrate existing global data first
        DataService.migrateExistingData(user.id);
        
        // If still no data, initialize with defaults
        if (!DataService.hasUserData(user.id)) {
          DataService.initializeUserData(user.id);
        }
      }
    }
  }, [user?.id]);
  
  const [products, setProducts] = useState<Product[]>(() => 
    user?.id ? DataService.loadFromStorage(STORAGE_KEYS.PRODUCTS, [], user.id) : []
  );
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => 
    user?.id ? DataService.loadFromStorage(STORAGE_KEYS.WAREHOUSES, [], user.id) : []
  );
  const [stockLocations, setStockLocations] = useState<StockLocation[]>(() => 
    user?.id ? DataService.loadFromStorage(STORAGE_KEYS.STOCK_LOCATIONS, [], user.id) : []
  );
  const [receipts, setReceipts] = useState<Receipt[]>(() => 
    user?.id ? DataService.loadFromStorage(STORAGE_KEYS.RECEIPTS, [], user.id) : []
  );
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => 
    user?.id ? DataService.loadFromStorage(STORAGE_KEYS.DELIVERIES, [], user.id) : []
  );
  const [transfers, setTransfers] = useState<InternalTransfer[]>(() => 
    user?.id ? DataService.loadFromStorage(STORAGE_KEYS.TRANSFERS, [], user.id) : []
  );
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(() => 
    user?.id ? DataService.loadFromStorage(STORAGE_KEYS.ADJUSTMENTS, [], user.id) : []
  );
  const [movements, setMovements] = useState<StockMovement[]>(() => 
    user?.id ? DataService.loadFromStorage(STORAGE_KEYS.MOVEMENTS, [], user.id) : []
  );

  // Reload data when user changes (login/logout)
  useEffect(() => {
    if (user?.id) {
      setProducts(DataService.loadFromStorage(STORAGE_KEYS.PRODUCTS, [], user.id));
      setWarehouses(DataService.loadFromStorage(STORAGE_KEYS.WAREHOUSES, [], user.id));
      setStockLocations(DataService.loadFromStorage(STORAGE_KEYS.STOCK_LOCATIONS, [], user.id));
      setReceipts(DataService.loadFromStorage(STORAGE_KEYS.RECEIPTS, [], user.id));
      setDeliveries(DataService.loadFromStorage(STORAGE_KEYS.DELIVERIES, [], user.id));
      setTransfers(DataService.loadFromStorage(STORAGE_KEYS.TRANSFERS, [], user.id));
      setAdjustments(DataService.loadFromStorage(STORAGE_KEYS.ADJUSTMENTS, [], user.id));
      setMovements(DataService.loadFromStorage(STORAGE_KEYS.MOVEMENTS, [], user.id));
    } else {
      // Clear data when user logs out
      setProducts([]);
      setWarehouses([]);
      setStockLocations([]);
      setReceipts([]);
      setDeliveries([]);
      setTransfers([]);
      setAdjustments([]);
      setMovements([]);
    }
  }, [user?.id]);
  
  // Persist to localStorage whenever state changes (user-specific)
  useEffect(() => {
    if (user?.id && products.length >= 0) {
      DataService.saveToStorage(STORAGE_KEYS.PRODUCTS, products, user.id);
    }
  }, [products, user?.id]);
  
  useEffect(() => {
    if (user?.id && warehouses.length >= 0) {
      DataService.saveToStorage(STORAGE_KEYS.WAREHOUSES, warehouses, user.id);
    }
  }, [warehouses, user?.id]);
  
  useEffect(() => {
    if (user?.id && stockLocations.length >= 0) {
      DataService.saveToStorage(STORAGE_KEYS.STOCK_LOCATIONS, stockLocations, user.id);
    }
  }, [stockLocations, user?.id]);
  
  useEffect(() => {
    if (user?.id && receipts.length >= 0) {
      DataService.saveToStorage(STORAGE_KEYS.RECEIPTS, receipts, user.id);
    }
  }, [receipts, user?.id]);
  
  useEffect(() => {
    if (user?.id && deliveries.length >= 0) {
      DataService.saveToStorage(STORAGE_KEYS.DELIVERIES, deliveries, user.id);
    }
  }, [deliveries, user?.id]);
  
  useEffect(() => {
    if (user?.id && transfers.length >= 0) {
      DataService.saveToStorage(STORAGE_KEYS.TRANSFERS, transfers, user.id);
    }
  }, [transfers, user?.id]);
  
  useEffect(() => {
    if (user?.id && adjustments.length >= 0) {
      DataService.saveToStorage(STORAGE_KEYS.ADJUSTMENTS, adjustments, user.id);
    }
  }, [adjustments, user?.id]);
  
  useEffect(() => {
    if (user?.id && movements.length >= 0) {
      DataService.saveToStorage(STORAGE_KEYS.MOVEMENTS, movements, user.id);
    }
  }, [movements, user?.id]);

  // Products
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
  }, []);

  const getProduct = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  // Warehouses
  const addWarehouse = useCallback((warehouseData: Omit<Warehouse, 'id' | 'racks'>) => {
    // light safeguard: prevent duplicate codes (case-insensitive, trimmed)
    const normalizedCode = warehouseData.code.trim().toUpperCase();
    const exists = warehouses.some(w => w.code.trim().toUpperCase() === normalizedCode);
    if (exists) {
      throw new Error(`Warehouse code "${warehouseData.code}" already exists`);
    }

    const newWarehouse: Warehouse = {
      ...warehouseData,
      code: warehouseData.code.trim(),
      id: `wh-${Date.now()}`,
      racks: [],
    };
    setWarehouses(prev => [...prev, newWarehouse]);
    return newWarehouse;
  }, [warehouses]);

  const updateWarehouse = useCallback((id: string, updates: Partial<Pick<Warehouse, 'name' | 'address'>>) => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  // Stock Locations
  const getStockByProduct = useCallback((productId: string) => {
    return stockLocations.filter(sl => sl.productId === productId);
  }, [stockLocations]);

  const getTotalStock = useCallback((productId: string) => {
    return stockLocations
      .filter(sl => sl.productId === productId)
      .reduce((sum, sl) => sum + sl.quantity, 0);
  }, [stockLocations]);

  const getStockByProductAndWarehouse = useCallback((productId: string, warehouseId: string) => {
    const location = stockLocations.find(
      sl => sl.productId === productId && sl.warehouseId === warehouseId
    );
    return location ? location.quantity : 0;
  }, [stockLocations]);

  const checkStockAvailability = useCallback((productId: string, warehouseId: string, quantity: number) => {
    const availableStock = getStockByProductAndWarehouse(productId, warehouseId);
    return availableStock >= quantity;
  }, [getStockByProductAndWarehouse]);

  const updateStock = useCallback((productId: string, warehouseId: string, quantityChange: number) => {
    setStockLocations(prev => {
      const existing = prev.find(sl => sl.productId === productId && sl.warehouseId === warehouseId);
      if (existing) {
        const newQuantity = existing.quantity + quantityChange;
        // Prevent negative stock
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock. Available: ${existing.quantity}, Requested: ${Math.abs(quantityChange)}`);
        }
        return prev.map(sl => 
          sl.productId === productId && sl.warehouseId === warehouseId
            ? { ...sl, quantity: newQuantity }
            : sl
        );
      } else {
        // Prevent negative stock for new locations
        if (quantityChange < 0) {
          throw new Error(`Insufficient stock. Available: 0, Requested: ${Math.abs(quantityChange)}`);
        }
        return [...prev, { productId, warehouseId, quantity: quantityChange }];
      }
    });
  }, []);

  // Receipts
  const addReceipt = useCallback((receiptData: Omit<Receipt, 'id' | 'createdAt'>) => {
    const newReceipt: Receipt = {
      ...receiptData,
      id: `rec-${Date.now()}`,
      createdAt: new Date(),
    };
    setReceipts(prev => [...prev, newReceipt]);
    return newReceipt;
  }, []);

  const validateReceipt = useCallback((id: string) => {
    const receipt = receipts.find(r => r.id === id);
    if (!receipt) return;

    // Update receipt status only - NO STOCK CHANGES
    setReceipts(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'Done', validatedAt: new Date() } : r
    ));

    // Receipts do not affect stock levels - they are for record keeping only
    // No stock updates, no movements recorded
  }, [receipts]);

  const cancelReceipt = useCallback((id: string) => {
    const receipt = receipts.find(r => r.id === id);
    if (!receipt) return;

    // Only allow cancellation if not already done
    if (receipt.status === 'Done') {
      throw new Error('Cannot cancel a completed receipt');
    }

    // Update receipt status to Canceled
    setReceipts(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'Canceled' as DocumentStatus, validatedAt: new Date() } : r
    ));
  }, [receipts]);

  const getReceipt = useCallback((id: string) => {
    return receipts.find(r => r.id === id);
  }, [receipts]);

  // Deliveries
  const addDelivery = useCallback((deliveryData: Omit<Delivery, 'id' | 'createdAt'>) => {
    const newDelivery: Delivery = {
      ...deliveryData,
      id: `del-${Date.now()}`,
      createdAt: new Date(),
    };
    setDeliveries(prev => [...prev, newDelivery]);
    return newDelivery;
  }, []);

  const validateDelivery = useCallback((id: string) => {
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    // Check stock availability before validation
    for (const line of delivery.lines) {
      const availableStock = getStockByProductAndWarehouse(line.productId, delivery.warehouseId);
      if (availableStock < line.quantity) {
        throw new Error(`Insufficient stock for product. Available: ${availableStock}, Required: ${line.quantity}`);
      }
    }

    // Update delivery status
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'Done', validatedAt: new Date() } : d
    ));

    // Update stock
    delivery.lines.forEach(line => {
      // Get warehouse-specific stock before update
      const previousStock = getStockByProductAndWarehouse(line.productId, delivery.warehouseId);
      
      updateStock(line.productId, delivery.warehouseId, -line.quantity);
      
      // Get warehouse-specific stock after update
      const newStock = previousStock - line.quantity;
      
      // Add movement
      addMovement({
        productId: line.productId,
        warehouseId: delivery.warehouseId,
        movementType: 'Delivery',
        documentType: 'Delivery',
        documentId: id,
        documentNumber: delivery.documentNumber,
        quantity: -line.quantity,
        previousStock: previousStock,
        newStock: newStock,
        timestamp: new Date(),
        userId: user?.id || 'unknown',
      });
    });
  }, [deliveries, updateStock, getStockByProductAndWarehouse, user?.id]);

  const updateDeliveryStatus = useCallback((id: string, status: DocumentStatus) => {
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    // Update delivery status
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, status, validatedAt: new Date() } : d
    ));
  }, [deliveries]);

  const cancelDelivery = useCallback((id: string) => {
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    // Only allow cancellation if not already done
    if (delivery.status === 'Done') {
      throw new Error('Cannot cancel a completed delivery');
    }

    // Update delivery status to Canceled
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'Canceled' as DocumentStatus, validatedAt: new Date() } : d
    ));
  }, [deliveries]);

  const getDelivery = useCallback((id: string) => {
    return deliveries.find(d => d.id === id);
  }, [deliveries]);

  // Transfers
  const addTransfer = useCallback((transferData: Omit<InternalTransfer, 'id' | 'createdAt'>) => {
    const newTransfer: InternalTransfer = {
      ...transferData,
      id: `trans-${Date.now()}`,
      createdAt: new Date(),
    };
    setTransfers(prev => [...prev, newTransfer]);
    return newTransfer;
  }, []);

  const validateTransfer = useCallback((id: string) => {
    const transfer = transfers.find(t => t.id === id);
    if (!transfer) return;

    // Check stock availability in source warehouse before validation
    for (const line of transfer.lines) {
      const availableStock = getStockByProductAndWarehouse(line.productId, transfer.sourceWarehouseId);
      if (availableStock < line.quantity) {
        throw new Error(`Insufficient stock in source warehouse. Available: ${availableStock}, Required: ${line.quantity}`);
      }
    }

    // Update transfer status
    setTransfers(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'Done', validatedAt: new Date() } : t
    ));

    // Update stock
    transfer.lines.forEach(line => {
      // Get warehouse-specific stock before update
      const sourcePreviousStock = getStockByProductAndWarehouse(line.productId, transfer.sourceWarehouseId);
      const destPreviousStock = getStockByProductAndWarehouse(line.productId, transfer.destinationWarehouseId);
      
      // Remove from source
      updateStock(line.productId, transfer.sourceWarehouseId, -line.quantity);
      
      // Add to destination
      updateStock(line.productId, transfer.destinationWarehouseId, line.quantity);
      
      // Calculate new stock after updates
      const sourceNewStock = sourcePreviousStock - line.quantity;
      const destNewStock = destPreviousStock + line.quantity;
      
      // Add movements
      addMovement({
        productId: line.productId,
        warehouseId: transfer.sourceWarehouseId,
        movementType: 'Transfer Out',
        documentType: 'Internal',
        documentId: id,
        documentNumber: transfer.documentNumber,
        quantity: -line.quantity,
        previousStock: sourcePreviousStock,
        newStock: sourceNewStock,
        timestamp: new Date(),
        userId: user?.id || 'unknown',
      });
      
      addMovement({
        productId: line.productId,
        warehouseId: transfer.destinationWarehouseId,
        movementType: 'Transfer In',
        documentType: 'Internal',
        documentId: id,
        documentNumber: transfer.documentNumber,
        quantity: line.quantity,
        previousStock: destPreviousStock,
        newStock: destNewStock,
        timestamp: new Date(),
        userId: user?.id || 'unknown',
      });
    });
  }, [transfers, updateStock, getStockByProductAndWarehouse, user?.id]);

  const getTransfer = useCallback((id: string) => {
    return transfers.find(t => t.id === id);
  }, [transfers]);

  // Adjustments
  const addAdjustment = useCallback((adjustmentData: Omit<StockAdjustment, 'id' | 'createdAt'>) => {
    const newAdjustment: StockAdjustment = {
      ...adjustmentData,
      id: `adj-${Date.now()}`,
      createdAt: new Date(),
    };
    setAdjustments(prev => [...prev, newAdjustment]);
    return newAdjustment;
  }, []);

  const validateAdjustment = useCallback((id: string) => {
    const adjustment = adjustments.find(a => a.id === id);
    if (!adjustment) return;

    // Check stock availability for negative adjustments
    for (const line of adjustment.lines) {
      if (line.difference < 0) {
        const availableStock = getStockByProductAndWarehouse(line.productId, adjustment.warehouseId);
        const requiredStock = Math.abs(line.difference);
        if (availableStock < requiredStock) {
          throw new Error(`Insufficient stock for adjustment. Available: ${availableStock}, Required: ${requiredStock}`);
        }
      }
    }

    // Update adjustment status
    setAdjustments(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'Done', validatedAt: new Date() } : a
    ));

    // Update stock
    adjustment.lines.forEach((line: AdjustmentLine) => {
      // Get warehouse-specific stock before update
      const previousStock = getStockByProductAndWarehouse(line.productId, adjustment.warehouseId);
      
      updateStock(line.productId, adjustment.warehouseId, line.difference);
      
      // Get warehouse-specific stock after update
      const newStock = previousStock + line.difference;
      
      // Add movement
      addMovement({
        productId: line.productId,
        warehouseId: adjustment.warehouseId,
        movementType: 'Adjustment',
        documentType: 'Adjustment',
        documentId: id,
        documentNumber: adjustment.documentNumber,
        quantity: line.difference,
        previousStock: previousStock,
        newStock: newStock,
        timestamp: new Date(),
        userId: user?.id || 'unknown',
      });
    });
  }, [adjustments, updateStock, getStockByProductAndWarehouse, user?.id]);

  const cancelAdjustment = useCallback((id: string) => {
    const adjustment = adjustments.find(a => a.id === id);
    if (!adjustment) return;

    // Only allow cancellation if not already done
    if (adjustment.status === 'Done') {
      throw new Error('Cannot cancel a completed adjustment');
    }

    // Update adjustment status to Canceled
    setAdjustments(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'Canceled' as DocumentStatus, validatedAt: new Date() } : a
    ));
  }, [adjustments]);

  const getAdjustment = useCallback((id: string) => {
    return adjustments.find(a => a.id === id);
  }, [adjustments]);

  // Movements
  const addMovement = useCallback((movementData: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: `mov-${Date.now()}`,
    };
    setMovements(prev => [...prev, newMovement]);
  }, []);

  const value: InventoryContextType = {
    products,
    addProduct,
    updateProduct,
    getProduct,
    warehouses,
    addWarehouse,
    updateWarehouse,
    stockLocations,
    getStockByProduct,
    getTotalStock,
    getStockByProductAndWarehouse,
    updateStock,
    checkStockAvailability,
    receipts,
    addReceipt,
    validateReceipt,
    cancelReceipt,
    getReceipt,
    deliveries,
    addDelivery,
    validateDelivery,
    updateDeliveryStatus,
    cancelDelivery,
    getDelivery,
    transfers,
    addTransfer,
    validateTransfer,
    getTransfer,
    adjustments,
    addAdjustment,
    validateAdjustment,
    cancelAdjustment,
    getAdjustment,
    movements,
    addMovement,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}