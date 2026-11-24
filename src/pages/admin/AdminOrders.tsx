import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useInvoiceDownload } from '@/hooks/useInvoiceDownload';
import { Loader2, Eye, Package, FileText, User } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { apiFetch, endpoints } from '@/lib/api';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  shipped: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  delivered: 'bg-green-500/10 text-green-600 border-green-500/30',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/30',
};

// ✅ MATCHES BACKEND API FIELDS EXACTLY
interface Order {
  id: string;
  user_id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
  razorpay_signature?: string | null;
  created_at: string;
  subtotal: number;
  tax: number;
  shipping_charge: number;
  discount: number;
  final_amount: number;
  pay_on_delivery: number;
  address: string; // JSON string from backend
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items_count: number;
  items_total: number;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number | string;
  customization?: {
    imageUrl?: string;
    text?: string;
    brand?: string;
    model?: string;
    coverType?: string;
    specialInstructions?: string;
  } | null;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const { toast } = useToast();
  const { downloadInvoice, downloading } = useInvoiceDownload();

  const fetchOrders = async () => {
    try {
      const data = await apiFetch(endpoints.admin.orders);
      console.log('🔍 RAW ORDERS:', data);

      // ✅ Process backend response - address is JSON string
      const safeOrders: Order[] = (Array.isArray(data) ? data : []).map((order: any) => ({
        id: order?.id || '',
        user_id: order?.user_id || '',
        status: order?.status || 'pending',
        payment_method: order?.payment_method || 'cod',
        payment_status: order?.payment_status || 'pending',
        razorpay_payment_id: order?.razorpay_payment_id || null,
        razorpay_order_id: order?.razorpay_order_id || null,
        razorpay_signature: order?.razorpay_signature || null,
        created_at: order?.created_at || new Date().toISOString(),
        subtotal: Number(order?.subtotal) || 0,
        tax: Number(order?.tax) || 0,
        shipping_charge: Number(order?.shipping_charge) || 0,
        discount: Number(order?.discount) || 0,
        final_amount: Number(order?.final_amount) || 0,
        pay_on_delivery: Number(order?.pay_on_delivery) || 0,
        address: order?.address || '{}',
        customer_name: order?.customer_name || 'Customer',
        customer_phone: order?.customer_phone || 'N/A',
        customer_email: order?.customer_email || 'N/A',
        items_count: Number(order?.items_count) || 0,
        items_total: Number(order?.items_total) || 0,
      }));

      setOrders(safeOrders);
    } catch (e: any) {
      console.error('Fetch orders error:', e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Helper functions - match backend structure
  const formatCurrency = (value: any): string => {
    const num = Number(value);
    return `₹${isNaN(num) ? 0 : num.toLocaleString('en-IN')}`;
  };

  const getCustomerName = (order: Order | null): string => {
    return order?.customer_name || 'Customer';
  };

  const getOrderNumber = (order: Order | null): string => {
    return `ORD-${order?.id.slice(-8).toUpperCase()}`;
  };

  // ✅ Status update
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await apiFetch(endpoints.admin.orderStatus, {
        args: [orderId],
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      toast({ title: '✅ Status Updated!' });
      await fetchOrders();
    } catch (e: any) {
      toast({ title: '❌ Update Failed', description: e.message, variant: 'destructive' });
    }
  };

  // ✅ Order details - parse address JSON
  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setItemsLoading(true);
    try {
      const items = await apiFetch(endpoints.admin.orderItems, { args: [order.id] });
      setOrderItems(Array.isArray(items) ? items : []);
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to load order details', variant: 'destructive' });
      setOrderItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  const parseAddress = (order: Order | null) => {
    if (!order?.address) return {};
    try {
      return typeof order.address === 'string' ? JSON.parse(order.address) : order.address;
    } catch {
      return {};
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders Management</h1>
            <p className="mt-2 text-muted-foreground">Manage customer orders and update delivery status</p>
          </div>
          <div className="text-sm font-medium text-muted-foreground sm:text-right">
            {orders.length} Total Orders
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex gap-3 items-center text-xl">
              <Package className="w-6 h-6" />
              Recent Orders
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-primary" />
                <span className="text-muted-foreground">Loading orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No orders found</h3>
                <p className="text-sm text-muted-foreground">Orders will appear here when customers place them.</p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="w-24 font-semibold">Order #</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="w-32 font-semibold">Date</TableHead>
                      <TableHead className="w-32 font-semibold text-right">Total</TableHead>
                      <TableHead className="w-36 font-semibold">Payment</TableHead>
                      <TableHead className="w-36 font-semibold">Status</TableHead>
                      <TableHead className="w-32 text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30 border-b last:border-b-0">
                        <TableCell className="font-mono font-semibold text-primary/90">
                          {getOrderNumber(order)}
                        </TableCell>
                        <TableCell className="font-medium text-foreground/90">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {getCustomerName(order)}
                          </div>
                          {order.customer_phone !== 'N/A' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {order.customer_phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-lg text-right">
                          {formatCurrency(order.final_amount)}
                          {order.pay_on_delivery > 0 && (
                            <div className="text-xs font-normal text-amber-600 mt-1">
                              {formatCurrency(order.pay_on_delivery)} on delivery
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={order.payment_method === 'cod' ? 'secondary' : 'default'}
                            className={`${
                              order.payment_method === 'cod' 
                                ? 'bg-amber-100 text-amber-800 border-amber-200' 
                                : 'bg-green-100 text-green-800 border-green-200'
                            }`}
                          >
                            {order.payment_method.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-36 h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(statusColors).map((status) => (
                                <SelectItem key={status} value={status}>
                                  <Badge className={`${statusColors[status]} px-2 py-0.5 mr-2`}>
                                    {status.toUpperCase()}
                                  </Badge>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewOrderDetails(order)}
                            className="h-9 px-3"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadInvoice(order.id)}
                            disabled={downloading === order.id}
                            className="h-9 px-3"
                          >
                            {downloading === order.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4 mr-1" />
                            )}
                            Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                <div className="space-y-3 md:hidden">
                  {orders.map((order) => (
                    <article key={order.id} className="rounded-xl border bg-card p-4 shadow-sm">
                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="break-all font-mono text-sm font-semibold text-primary/90">
                            {getOrderNumber(order)}
                          </p>
                          <div className="mt-2 flex min-w-0 items-center gap-2">
                            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="break-words font-medium">{getCustomerName(order)}</span>
                          </div>
                          {order.customer_phone !== 'N/A' && (
                            <p className="mt-1 break-all text-xs text-muted-foreground">{order.customer_phone}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-lg font-semibold">{formatCurrency(order.final_amount)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge
                          variant={order.payment_method === 'cod' ? 'secondary' : 'default'}
                          className={order.payment_method === 'cod'
                            ? 'border-amber-200 bg-amber-100 text-amber-800'
                            : 'border-green-200 bg-green-100 text-green-800'}
                        >
                          {order.payment_method.toUpperCase()}
                        </Badge>
                        <Badge className={statusColors[order.status] || ''}>
                          {order.status.toUpperCase()}
                        </Badge>
                        {order.pay_on_delivery > 0 && (
                          <span className="text-xs text-amber-600">
                            {formatCurrency(order.pay_on_delivery)} on delivery
                          </span>
                        )}
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="min-h-11 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(statusColors).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="min-h-11"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            className="min-h-11"
                            onClick={() => downloadInvoice(order.id)}
                            disabled={downloading === order.id}
                          >
                            {downloading === order.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="mr-2 h-4 w-4" />
                            )}
                            Invoice
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ✅ Order Details Modal - Backend Compatible */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-hidden p-0 sm:p-1">
            <DialogHeader className="border-b bg-muted/30 p-4 pr-12 sm:p-6 sm:pr-12">
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <DialogTitle className="break-all text-xl font-bold sm:text-2xl">
                    Order #{getOrderNumber(selectedOrder)}
                  </DialogTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground sm:gap-4">
                    <span>Customer: {getCustomerName(selectedOrder)}</span>
                    <span>Items: {selectedOrder?.items_count || 0}</span>
                    <Badge className={statusColors[selectedOrder?.status || 'pending']}>
                      {selectedOrder?.status?.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(selectedOrder?.final_amount)}
                    </span>
                  </div>
                </div>
                {selectedOrder?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 w-full sm:w-auto"
                    onClick={() => downloadInvoice(selectedOrder.id)}
                    disabled={downloading === selectedOrder.id}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
              </div>
            </DialogHeader>

            <div className="max-h-[70dvh] space-y-6 overflow-y-auto p-4 sm:p-6">
              {/* ✅ Backend-matched breakdown */}
              <div className="rounded-2xl border bg-gradient-to-r from-primary/5 to-secondary/5 p-4 sm:p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  💰 Order Breakdown
                </h3>
                <div className="grid grid-cols-1 gap-4 text-sm min-[400px]:grid-cols-2 md:grid-cols-4">
                  <div>
                    <div className="text-muted-foreground mb-1">Subtotal</div>
                    <div className="font-bold text-lg">{formatCurrency(selectedOrder?.subtotal)}</div>
                  </div>
                  {selectedOrder?.discount > 0 && (
                    <div className="text-red-600">
                      <div className="text-muted-foreground mb-1">Discount</div>
                      <div className="font-bold text-lg">- {formatCurrency(selectedOrder?.discount)}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground mb-1">Tax ({(selectedOrder?.tax / selectedOrder?.subtotal * 100 || 8).toFixed(0)}%)</div>
                    <div className="font-bold text-lg">{formatCurrency(selectedOrder?.tax)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Shipping</div>
                    <div className="font-bold text-lg">
                      {formatCurrency(selectedOrder?.shipping_charge)}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-3 mt-4">
                  <div className="flex flex-wrap justify-between gap-2 text-xl font-bold text-primary sm:text-2xl">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder?.final_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    📍 Shipping Address
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-xl text-sm">
                    <div className="font-medium">{getCustomerName(selectedOrder)}</div>
                    <div>{parseAddress(selectedOrder)?.address_line1}</div>
                    {parseAddress(selectedOrder)?.address_line2 && (
                      <div>{parseAddress(selectedOrder)?.address_line2}</div>
                    )}
                    <div>{parseAddress(selectedOrder)?.city}, {parseAddress(selectedOrder)?.state}</div>
                    <div>Pin: {parseAddress(selectedOrder)?.pincode}</div>
                    <div className="text-muted-foreground mt-2">{selectedOrder?.customer_phone}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    💳 Payment Info
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-xl text-sm space-y-2">
                    <div>Method: <Badge>{selectedOrder?.payment_method.toUpperCase()}</Badge></div>
                    <div>Status: <Badge variant={selectedOrder?.payment_status === 'paid' ? 'default' : 'secondary'}>{selectedOrder?.payment_status}</Badge></div>
                    {(selectedOrder?.pay_on_delivery || 0) > 0 && (
                      <div>
                        Pay on Delivery:{' '}
                        <span className="font-semibold text-amber-600">
                          {formatCurrency(selectedOrder?.pay_on_delivery)}
                        </span>
                      </div>
                    )}
                    {selectedOrder?.razorpay_payment_id && (
                      <div>ID: {selectedOrder.razorpay_payment_id}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {itemsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mr-3" />
                  Loading order items...
                </div>
              ) : orderItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No items in this order
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    📦 Order Items ({orderItems.length})
                  </h3>
                  {orderItems.map((item) => (
                    <div key={item.id} className="rounded-xl border p-4 transition-all hover:shadow-md sm:p-6">
                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-2 break-words text-lg font-bold sm:text-xl">{item.product_name}</h4>
                          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm sm:gap-4">
                            <span className="text-muted-foreground">Qty: {item.quantity}</span>
                            <span className="font-semibold">
                              ₹{Number(item.price || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-lg font-bold text-primary">
                              Item Total: ₹{(item.quantity * Number(item.price || 0)).toLocaleString('en-IN')}
                            </span>
                          </div>
                          {item.customization?.text && (
                            <div className="mb-3 break-words rounded-lg border border-green-100 bg-green-50 p-3">
                              <span className="font-medium text-black">✏️ Custom Text: </span>
                              <span className="mt-1 inline-block max-w-full break-words rounded border bg-white px-3 py-1 font-mono text-sm text-black">
                                "{item.customization.text}"
                              </span>
                            </div>
                          )}
                          {(item.customization?.brand || item.customization?.model || item.customization?.coverType) && (
                            <div className="mb-3 grid gap-2 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-3">
                              {item.customization.brand && <p><span className="font-medium">Brand:</span> {item.customization.brand}</p>}
                              {item.customization.model && <p><span className="font-medium">Model:</span> {item.customization.model}</p>}
                              {item.customization.coverType && <p><span className="font-medium">Cover:</span> {item.customization.coverType}</p>}
                            </div>
                          )}
                          {item.customization?.specialInstructions && (
                            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                              <span className="font-medium">Production instructions:</span>{' '}
                              {item.customization.specialInstructions}
                            </div>
                          )}
                        </div>
                        {item.customization?.imageUrl && (
                          <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:items-end">
                            <img
                              src={item.customization.imageUrl}
                              alt="Custom design"
                              className="h-auto max-h-48 w-full rounded-2xl border-2 border-border object-cover shadow-lg sm:h-32 sm:w-32"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
