import { useMemo, useState } from 'react';
import { Package, AlertTriangle, XCircle, FileInput, Truck, ArrowRightLeft } from 'lucide-react';
import { KPICard } from '../components/common/KPICard';
import { Header } from '../components/layout/Header';
import { useInventory } from '../contexts/InventoryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DocumentType, DocumentStatus, ProductCategory } from '../types';
import { StatusChip } from '../components/common/StatusChip';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { products, stockLocations, receipts, deliveries, transfers, adjustments, warehouses, movements } = useInventory();
  
  const [documentTypeFilter, setDocumentTypeFilter] = useState<DocumentType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'All'>('All');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');

  // Calculate KPIs - filtered
  const kpis = useMemo(() => {
    const filteredProducts = products.filter(product => 
      categoryFilter === 'All' || product.category === categoryFilter
    );
    
    const totalProducts = filteredProducts.length;
    
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    filteredProducts.forEach(product => {
      const totalStock = stockLocations
        .filter(sl => {
          if (warehouseFilter !== 'All' && sl.warehouseId !== warehouseFilter) return false;
          return sl.productId === product.id;
        })
        .reduce((sum, sl) => sum + sl.quantity, 0);
      
      if (totalStock === 0) {
        outOfStockCount++;
      } else if (totalStock < product.reorderLevel) {
        lowStockCount++;
      }
    });

    const filteredReceipts = receipts.filter(r => {
      if (warehouseFilter !== 'All' && r.warehouseId !== warehouseFilter) return false;
      if (documentTypeFilter !== 'All' && documentTypeFilter !== 'Receipt') return false;
      return true;
    });
    const pendingReceipts = filteredReceipts.filter(r => r.status === 'Draft' || r.status === 'Waiting').length;

    const filteredDeliveries = deliveries.filter(d => {
      if (warehouseFilter !== 'All' && d.warehouseId !== warehouseFilter) return false;
      if (documentTypeFilter !== 'All' && documentTypeFilter !== 'Delivery') return false;
      return true;
    });
    const pendingDeliveries = filteredDeliveries.filter(d => d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready').length;

    const filteredTransfers = transfers.filter(t => {
      if (warehouseFilter !== 'All' && t.sourceWarehouseId !== warehouseFilter && t.destinationWarehouseId !== warehouseFilter) return false;
      if (documentTypeFilter !== 'All' && documentTypeFilter !== 'Internal') return false;
      return true;
    });
    const scheduledTransfers = filteredTransfers.filter(t => t.status === 'Draft' || t.status === 'Waiting').length;

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
    };
  }, [products, stockLocations, receipts, deliveries, transfers, categoryFilter, warehouseFilter, documentTypeFilter]);

  // Stock by category - filtered
  const stockByCategory = useMemo(() => {
    const categoryMap = new Map<ProductCategory, number>();
    
    products
      .filter(product => categoryFilter === 'All' || product.category === categoryFilter)
      .forEach(product => {
        const totalStock = stockLocations
          .filter(sl => {
            if (warehouseFilter !== 'All' && sl.warehouseId !== warehouseFilter) return false;
            return sl.productId === product.id;
          })
          .reduce((sum, sl) => sum + sl.quantity, 0);
        
        const current = categoryMap.get(product.category) || 0;
        categoryMap.set(product.category, current + totalStock);
      });

    return Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      value,
    }));
  }, [products, stockLocations, categoryFilter, warehouseFilter]);

  // Recent movements - filtered
  const recentMovements = useMemo(() => {
    return movements
      .filter(movement => {
        if (warehouseFilter !== 'All' && movement.warehouseId !== warehouseFilter) return false;
        
        const product = products.find(p => p.id === movement.productId);
        if (categoryFilter !== 'All' && product?.category !== categoryFilter) return false;
        
        return true;
      })
      .slice()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }, [movements, warehouseFilter, categoryFilter, products]);

  // Document status distribution - filtered and enhanced
  const documentStats = useMemo(() => {
    const allDocs = [
      ...receipts.map(r => ({ 
        type: 'Receipt' as DocumentType, 
        status: r.status, 
        date: r.createdAt, 
        warehouseId: r.warehouseId,
        id: r.id,
        documentNumber: r.documentNumber
      })),
      ...deliveries.map(d => ({ 
        type: 'Delivery' as DocumentType, 
        status: d.status, 
        date: d.createdAt, 
        warehouseId: d.warehouseId,
        id: d.id,
        documentNumber: d.documentNumber
      })),
      ...transfers.map(t => ({ 
        type: 'Internal' as DocumentType, 
        status: t.status, 
        date: t.createdAt, 
        warehouseId: t.sourceWarehouseId,
        id: t.id,
        documentNumber: t.documentNumber
      })),
      ...adjustments.map(a => ({ 
        type: 'Adjustment' as DocumentType, 
        status: a.status, 
        date: a.createdAt, 
        warehouseId: a.warehouseId,
        id: a.id,
        documentNumber: a.documentNumber
      })),
    ];

    // Apply filters with proper validation
    const filtered = allDocs.filter(doc => {
      // Document type filter
      if (documentTypeFilter !== 'All' && doc.type !== documentTypeFilter) return false;
      
      // Status filter
      if (statusFilter !== 'All' && doc.status !== statusFilter) return false;
      
      // Warehouse filter - handle transfers properly (include if either source or destination matches)
      if (warehouseFilter !== 'All') {
        if (doc.type === 'Internal') {
          // For transfers, check both source and destination warehouses
          const transfer = transfers.find(t => t.id === doc.id);
          if (transfer && transfer.sourceWarehouseId !== warehouseFilter && transfer.destinationWarehouseId !== warehouseFilter) {
            return false;
          }
        } else {
          // For other document types, check the warehouse directly
          if (doc.warehouseId !== warehouseFilter) return false;
        }
      }
      
      return true;
    });

    // Initialize status counts
    const statusCount: Record<DocumentStatus, number> = {
      Draft: 0,
      Waiting: 0,
      Ready: 0,
      Done: 0,
      Canceled: 0,
    };

    // Count documents by status
    filtered.forEach(doc => {
      if (doc.status in statusCount) {
        statusCount[doc.status]++;
      }
    });

    // Convert to array format for chart, including percentage calculation
    const totalDocs = filtered.length;
    
    // Define status order for consistent display
    const statusOrder: DocumentStatus[] = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];
    
    return statusOrder
      .map(status => ({
        status,
        count: statusCount[status],
        percentage: totalDocs > 0 ? Math.round((statusCount[status] / totalDocs) * 100) : 0,
      }))
      .filter(item => item.count > 0) // Only show statuses that have documents
      .sort((a, b) => b.count - a.count); // Sort by count descending for better visual hierarchy
  }, [receipts, deliveries, transfers, adjustments, documentTypeFilter, statusFilter, warehouseFilter]);

  // Status color mapping - logical progression from draft to completion
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Draft':
        return '#6b7280'; // Gray - initial state
      case 'Waiting':
        return '#f59e0b'; // Amber - waiting for action
      case 'Ready':
        return '#3b82f6'; // Blue - ready for processing
      case 'Done':
        return '#10b981'; // Green - completed successfully
      case 'Canceled':
        return '#ef4444'; // Red - canceled/failed
      default:
        return '#6b7280'; // Gray - fallback
    }
  };

  return (
    <div>
      <Header title="Dashboard" />
      
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KPICard
            title="Total Products"
            value={kpis.totalProducts}
            icon={Package}
          />
          <KPICard
            title="Low Stock"
            value={kpis.lowStockCount}
            icon={AlertTriangle}
            className="border-yellow-200 dark:border-yellow-900"
          />
          <KPICard
            title="Out of Stock"
            value={kpis.outOfStockCount}
            icon={XCircle}
            className="border-red-200 dark:border-red-900"
          />
          <KPICard
            title="Pending Receipts"
            value={kpis.pendingReceipts}
            icon={FileInput}
          />
          <KPICard
            title="Pending Deliveries"
            value={kpis.pendingDeliveries}
            icon={Truck}
          />
          <KPICard
            title="Scheduled Transfers"
            value={kpis.scheduledTransfers}
            icon={ArrowRightLeft}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Filters</CardTitle>
            <CardDescription>Filter data by document type, status, warehouse, or category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm">Document Type</label>
                <Select value={documentTypeFilter} onValueChange={(value) => setDocumentTypeFilter(value as DocumentType | 'All')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Receipt">Receipt</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                    <SelectItem value="Internal">Internal Transfer</SelectItem>
                    <SelectItem value="Adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Status</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DocumentStatus | 'All')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Waiting">Waiting</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Warehouse</label>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Warehouses</SelectItem>
                    {warehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Product Category</label>
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ProductCategory | 'All')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
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
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Document Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Document Status Distribution</CardTitle>
              <CardDescription>
                {documentStats.length > 0 
                  ? `Overview of ${documentStats.reduce((sum, item) => sum + item.count, 0)} documents across ${documentStats.length} status${documentStats.length !== 1 ? 'es' : ''}`
                  : 'No documents match the current filters'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={documentStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count, percentage }) => 
                        count > 0 ? `${status}: ${count} (${percentage}%)` : ''
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {documentStats.map((entry) => (
                        <Cell key={`cell-${entry.status}`} fill={getStatusColor(entry.status)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value} documents (${props.payload.percentage}%)`,
                        props.payload.status
                      ]}
                    />
                    <Legend 
                      formatter={(value, entry: any) => {
                        const item = documentStats.find(d => d.status === entry.payload?.status);
                        return `${entry.payload?.status || value} (${item?.count || 0})`;
                      }}
                      payload={documentStats.map((entry) => ({
                        value: entry.status,
                        type: 'circle',
                        id: entry.status,
                        color: getStatusColor(entry.status),
                        payload: { status: entry.status }
                      }))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-sm mb-4">Try adjusting your filters or create some documents</p>
                    <div className="text-xs space-y-1">
                      <p>Total documents in system: {receipts.length + deliveries.length + transfers.length + adjustments.length}</p>
                      <p>Active filters: {[
                        documentTypeFilter !== 'All' ? `Type: ${documentTypeFilter}` : null,
                        statusFilter !== 'All' ? `Status: ${statusFilter}` : null,
                        warehouseFilter !== 'All' ? `Warehouse: ${warehouses.find(w => w.id === warehouseFilter)?.name}` : null
                      ].filter(Boolean).join(', ') || 'None'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Stock by Category</CardTitle>
              <CardDescription>Stock distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Stock Movements</CardTitle>
                <CardDescription>Latest stock transactions</CardDescription>
              </div>
              <Link to="/ledger" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left">Date & Time</th>
                    <th className="pb-3 text-left">Product</th>
                    <th className="pb-3 text-left">Movement Type</th>
                    <th className="pb-3 text-left">Document</th>
                    <th className="pb-3 text-right">Quantity</th>
                    <th className="pb-3 text-right">New Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((movement) => {
                    const product = products.find(p => p.id === movement.productId);
                    const warehouse = warehouses.find(w => w.id === movement.warehouseId);
                    
                    return (
                      <tr key={movement.id} className="border-b">
                        <td className="py-3 text-sm">
                          {movement.timestamp.toLocaleDateString()} {movement.timestamp.toLocaleTimeString()}
                        </td>
                        <td className="py-3 text-sm">
                          <div>
                            <p>{product?.name}</p>
                            <p className="text-xs text-muted-foreground">{warehouse?.name}</p>
                          </div>
                        </td>
                        <td className="py-3 text-sm">{movement.movementType}</td>
                        <td className="py-3 text-sm text-primary">{movement.documentNumber}</td>
                        <td className={`py-3 text-sm text-right ${movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                        </td>
                        <td className="py-3 text-sm text-right">{movement.newStock}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
