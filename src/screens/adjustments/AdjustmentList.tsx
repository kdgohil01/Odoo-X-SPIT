import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ClipboardList, Plus, Eye, Check, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventory } from '../../contexts/InventoryContext';
import { StatusChip } from '../../components/common/StatusChip';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

export function AdjustmentList() {
  const { adjustments, warehouses, validateAdjustment, cancelAdjustment } = useInventory();

  const handleFinalize = (adjustmentId: string, adjustmentNumber: string) => {
    try {
      const adjustment = adjustments.find(a => a.id === adjustmentId);
      if (!adjustment) return;

      validateAdjustment(adjustmentId);
      const totalAdjustments = adjustment.lines.reduce((sum, line) => sum + Math.abs(line.difference), 0);
      toast.success('Adjustment approved successfully!', {
        description: `${adjustmentNumber}: ${totalAdjustments} total adjustments applied to ${adjustment.lines.length} product(s).`,
      });
    } catch (error: any) {
      toast.error('Failed to approve adjustment', {
        description: error.message || 'Please check stock availability.',
      });
    }
  };

  const handleReject = (adjustmentId: string, adjustmentNumber: string) => {
    try {
      cancelAdjustment(adjustmentId);
      toast.success('Adjustment rejected successfully!', {
        description: `${adjustmentNumber}: The adjustment has been canceled.`,
      });
    } catch (error: any) {
      toast.error('Failed to reject adjustment', {
        description: error.message,
      });
    }
  };

  return (
    <div>
      <Header title="Stock Adjustments" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <h2>Adjustment List</h2>
          <Link to="/adjustments/create">
            <Button>
              <Plus className="mr-2 size-4" />
              Create Adjustment
            </Button>
          </Link>
        </div>

        {adjustments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No adjustments found</p>
              <Link to="/adjustments/create">
                <Button>
                  <Plus className="mr-2 size-4" />
                  Create Adjustment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="p-4 text-left">Document #</th>
                      <th className="p-4 text-left">Type</th>
                      <th className="p-4 text-left">Warehouse</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Created</th>
                      <th className="p-4 text-left">Items</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.map(adj => {
                      const warehouse = warehouses.find(w => w.id === adj.warehouseId);
                      return (
                        <tr key={adj.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 text-primary">{adj.documentNumber}</td>
                          <td className="p-4 text-sm">{adj.adjustmentType}</td>
                          <td className="p-4 text-sm">{warehouse?.name}</td>
                          <td className="p-4"><StatusChip status={adj.status} /></td>
                          <td className="p-4 text-sm">{adj.createdAt.toLocaleDateString()}</td>
                          <td className="p-4 text-sm">{adj.lines.length}</td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Link to={`/adjustments/${adj.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="mr-2 size-4" />
                                  View
                                </Button>
                              </Link>
                              
                              {adj.status === 'Draft' && (
                                <>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700">
                                        <Check className="mr-2 size-4" />
                                        Approve
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Approve Adjustment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will apply all stock adjustments in {adj.documentNumber} and mark it as completed. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleFinalize(adj.id, adj.documentNumber)}
                                          className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                                        >
                                          Approve Adjustment
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive">
                                        <X className="mr-2 size-4" />
                                        Reject
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                          <AlertTriangle className="size-5 text-destructive" />
                                          Reject Adjustment
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will mark {adj.documentNumber} as canceled. No stock changes will be made. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleReject(adj.id, adj.documentNumber)}
                                          className="bg-destructive hover:bg-destructive/90"
                                        >
                                          Reject Adjustment
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}

                              {/* Show only Reject button for other statuses that can be canceled */}
                              {adj.status !== 'Done' && adj.status !== 'Canceled' && adj.status !== 'Draft' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <X className="mr-2 size-4" />
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="size-5 text-destructive" />
                                        Reject Adjustment
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will mark {adj.documentNumber} as canceled. No stock changes will be made. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleReject(adj.id, adj.documentNumber)}
                                        className="bg-destructive hover:bg-destructive/90"
                                      >
                                        Reject Adjustment
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}


                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
