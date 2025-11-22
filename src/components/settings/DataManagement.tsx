import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useInventory } from '../../contexts/InventoryContext';
import { DataService } from '../../lib/dataService';
import { setupDemoData } from '../../lib/sampleDataGenerator';
import { Download, Upload, Trash2, RefreshCw, Database, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export function DataManagement() {
  const { user } = useAuth();
  const { products, warehouses, receipts, deliveries, transfers, adjustments, movements } = useInventory();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExportData = async () => {
    if (!user?.id) return;
    
    setIsExporting(true);
    try {
      const data = DataService.exportUserData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock-master-data-${user.email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('success', 'Data exported successfully!');
    } catch (error) {
      showMessage('error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure (basic check)
      if (typeof data !== 'object' || !data) {
        throw new Error('Invalid data format');
      }
      
      DataService.importUserData(user.id, data);
      
      // Refresh the page to reload data
      window.location.reload();
      
      showMessage('success', 'Data imported successfully! Page will refresh.');
    } catch (error) {
      showMessage('error', 'Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleResetData = async () => {
    if (!user?.id) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to reset all data? This will delete all your products, warehouses, documents, and movements. This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        DataService.clearUserData(user.id);
        DataService.initializeUserData(user.id);
        
        // Refresh the page to reload data
        window.location.reload();
        
        showMessage('success', 'Data reset successfully! Page will refresh.');
      } catch (error) {
        showMessage('error', 'Failed to reset data. Please try again.');
      }
    }
  };

  const handleLoadSampleData = async () => {
    if (!user?.id) return;
    
    const confirmed = window.confirm(
      'This will replace all your current data with sample data including products, warehouses, receipts, and deliveries. Are you sure you want to continue?'
    );
    
    if (confirmed) {
      try {
        const sampleData = setupDemoData(user.id);
        DataService.importUserData(user.id, sampleData);
        
        // Refresh the page to reload data
        window.location.reload();
        
        showMessage('success', 'Sample data loaded successfully! Page will refresh.');
      } catch (error) {
        showMessage('error', 'Failed to load sample data. Please try again.');
      }
    }
  };

  const totalDocuments = receipts.length + deliveries.length + transfers.length + adjustments.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Overview
          </CardTitle>
          <CardDescription>
            Current data statistics for your stock management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{products.length}</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{warehouses.length}</div>
              <div className="text-sm text-muted-foreground">Warehouses</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalDocuments}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{movements.length}</div>
              <div className="text-sm text-muted-foreground">Movements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export, import, or reset your stock data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground">
                Download all your data as a JSON file for backup or transfer
              </p>
              <Button 
                onClick={handleExportData} 
                disabled={isExporting}
                className="w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Import Data</h4>
              <p className="text-sm text-muted-foreground">
                Upload a previously exported JSON file to restore data
              </p>
              <div className="relative overflow-hidden">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  id="import-file-input"
                />
                <Button 
                  disabled={isImporting}
                  className="w-full relative z-0"
                  variant="outline"
                  asChild
                >
                  <label htmlFor="import-file-input" className="cursor-pointer flex items-center justify-center">
                    <Upload className="h-4 w-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Choose File to Import'}
                  </label>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Load Sample Data</h4>
              <p className="text-sm text-muted-foreground">
                Replace current data with sample products, warehouses, and documents
              </p>
              <Button 
                onClick={handleLoadSampleData}
                className="w-full"
                variant="secondary"
              >
                <Zap className="h-4 w-4 mr-2" />
                Load Sample Data
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Reset Data</h4>
              <p className="text-sm text-muted-foreground">
                Clear all data and start fresh with minimal setup
              </p>
              <Button 
                onClick={handleResetData}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}