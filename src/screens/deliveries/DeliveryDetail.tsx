import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Truck, X, AlertTriangle } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { StatusChip } from '../../components/common/StatusChip';
import { useInventory } from '../../contexts/InventoryContext';
import { toast } from 'sonner@2.0.3';
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

export function DeliveryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDelivery, validateDelivery, cancelDelivery, warehouses, products } = useInventory();

  const delivery = getDelivery(id!);

  if (!delivery) {
    return (
      <div>
        <Header title="Delivery Not Found" />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Truck className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Delivery order not found</p>
              <Button onClick={() => navigate('/deliveries')}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Deliveries
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const warehouse = warehouses.find(w => w.id === delivery.warehouseId);
  const canValidate = delivery.status === 'Ready';
  const canCancel = delivery.status !== 'Done' && delivery.status !== 'Canceled';

  const handleValidate = () => {
    try {
      validateDelivery(delivery.id);
      const totalItems = delivery.lines.reduce((sum, line) => sum + line.quantity, 0);
      toast.success('Delivery finalized successfully!', {
        description: `Stock decreased by ${totalItems} units for ${delivery.lines.length} product(s). Movement recorded in ledger.`,
      });
      setTimeout(() => navigate('/deliveries'), 1500);
    } catch (error: any) {
      toast.error('Failed to finalize delivery', {
        description: error.message || 'Please check stock availability.',
      });
    }
  };

  const handleCancel = () => {
    try {
      cancelDelivery(delivery.id);
      toast.success('Delivery canceled successfully!', {
        description: 'The delivery order has been canceled and no stock changes were made.',
      });
      setTimeout(() => navigate('/deliveries'), 1500);
    } catch (error: any) {
      toast.error('Failed to cancel delivery', {
        description: error.message,
      });
    }
  };

  return (
    <div>
      <Header title="Delivery Details" />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/deliveries')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Deliveries
          </Button>
          
          <div className="flex gap-2">
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <X className="mr-2 size-4" />
                    Reject Delivery
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="size-5 text-destructive" />
                      Reject Delivery
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the delivery as canceled. No stock changes will be made. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancel}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Reject Delivery
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {canValidate && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Check className="mr-2 size-4" />
                    Finalize Delivery
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Finalize Delivery</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will decrease stock levels for all items in this delivery and mark it as completed. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleValidate}>
                      Finalize Delivery
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{delivery.documentNumber}</CardTitle>
                <CardDescription>Delivery Order Information</CardDescription>
              </div>
              <StatusChip status={delivery.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="mt-1">{delivery.customerName}</p>
              </div>
              {delivery.customerContact && (
                <div>
                  <p className="text-sm text-muted-foreground">Customer Contact</p>
                  <p className="mt-1">{delivery.customerContact}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Warehouse</p>
                <p className="mt-1">{warehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="mt-1">{delivery.createdAt.toLocaleDateString()}</p>
              </div>
              {delivery.validatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {delivery.status === 'Done' ? 'Finalized Date' : 'Status Changed Date'}
                  </p>
                  <p className="mt-1">{delivery.validatedAt.toLocaleDateString()}</p>
                </div>
              )}
              {delivery.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{delivery.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>{delivery.lines.length} item(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left">Product</th>
                    <th className="pb-3 text-left">SKU</th>
                    <th className="pb-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {delivery.lines.map((line) => {
                    const product = products.find(p => p.id === line.productId);
                    return (
                      <tr key={line.id} className="border-b">
                        <td className="py-3">{product?.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{product?.sku}</td>
                        <td className="py-3 text-right">{line.quantity} {product?.uom}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td className="pt-3" colSpan={2}>
                      <span className="text-sm font-medium">Total Items:</span>
                    </td>
                    <td className="pt-3 text-right font-medium">
                      {delivery.lines.reduce((sum, line) => sum + line.quantity, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
