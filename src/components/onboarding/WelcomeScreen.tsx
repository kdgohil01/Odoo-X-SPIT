import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Warehouse, CheckCircle, ArrowRight } from 'lucide-react';
import { ProductCategory, UOM } from '../../types';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { user } = useAuth();
  const { addWarehouse, addProduct, warehouses, products } = useInventory();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Warehouse form
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseCode, setWarehouseCode] = useState('');
  const [warehouseAddress, setWarehouseAddress] = useState('');

  // Product form
  const [productName, setProductName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [productCategory, setProductCategory] = useState<ProductCategory>('Other');
  const [productUom, setProductUom] = useState<UOM>('pcs');
  const [reorderLevel, setReorderLevel] = useState(10);

  const handleCreateWarehouse = async () => {
    if (!warehouseName.trim() || !warehouseCode.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await addWarehouse({
        name: warehouseName.trim(),
        code: warehouseCode.trim().toUpperCase(),
        address: warehouseAddress.trim() || 'No address provided',
      });
      setStep(2);
    } catch (error) {
      console.error('Error creating warehouse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productName.trim() || !productSku.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await addProduct({
        name: productName.trim(),
        sku: productSku.trim().toUpperCase(),
        category: productCategory,
        uom: productUom,
        reorderLevel,
        description: `Sample product created during onboarding`,
      });
      setStep(3);
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipOnboarding = () => {
    onComplete();
  };

  const handleCompleteOnboarding = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Stock Master!</h1>
          <p className="text-muted-foreground">
            Hi {user?.name}! Let's set up your stock management system with some basic data.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
              {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
            </div>
            <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
              {step > 3 ? <CheckCircle className="w-4 h-4" /> : '3'}
            </div>
          </div>
        </div>

        {/* Step 1: Create Warehouse */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="w-5 h-5" />
                Create Your First Warehouse
              </CardTitle>
              <CardDescription>
                Start by creating a warehouse where you'll store your inventory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse-name">Warehouse Name *</Label>
                <Input
                  id="warehouse-name"
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  placeholder="e.g., Main Warehouse"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse-code">Warehouse Code *</Label>
                <Input
                  id="warehouse-code"
                  value={warehouseCode}
                  onChange={(e) => setWarehouseCode(e.target.value)}
                  placeholder="e.g., WH-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse-address">Address (Optional)</Label>
                <Input
                  id="warehouse-address"
                  value={warehouseAddress}
                  onChange={(e) => setWarehouseAddress(e.target.value)}
                  placeholder="e.g., 123 Industrial Blvd, City, State"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateWarehouse}
                  disabled={!warehouseName.trim() || !warehouseCode.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Warehouse'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={handleSkipOnboarding}>
                  Skip Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Create Product */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Create Your First Product
              </CardTitle>
              <CardDescription>
                Add a product to your inventory to get started with stock management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name *</Label>
                  <Input
                    id="product-name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Wireless Mouse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-sku">SKU *</Label>
                  <Input
                    id="product-sku"
                    value={productSku}
                    onChange={(e) => setProductSku(e.target.value)}
                    placeholder="e.g., WM-001"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select value={productCategory} onValueChange={(value) => setProductCategory(value as ProductCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Clothing">Clothing</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Books">Books</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-uom">Unit of Measure</Label>
                  <Select value={productUom} onValueChange={(value) => setProductUom(value as UOM)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="lbs">Pounds</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="carton">Carton</SelectItem>
                      <SelectItem value="dozen">Dozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder-level">Reorder Level</Label>
                <Input
                  id="reorder-level"
                  type="number"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
                  placeholder="10"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateProduct}
                  disabled={!productName.trim() || !productSku.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Product'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={handleSkipOnboarding}>
                  Skip Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Setup Complete!
              </CardTitle>
              <CardDescription>
                Great! You've successfully set up your inventory system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">What you've created:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ {warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''}</li>
                  <li>✓ {products.length} product{products.length !== 1 ? 's' : ''}</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Next steps:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Create receipts to add stock to your warehouse</li>
                  <li>• Set up deliveries to track outgoing inventory</li>
                  <li>• Use the dashboard to monitor your inventory levels</li>
                  <li>• Explore the different sections to manage your inventory</li>
                </ul>
              </div>

              <Button onClick={handleCompleteOnboarding} className="w-full">
                Get Started with Stock Master
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}