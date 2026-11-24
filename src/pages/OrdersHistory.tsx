import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useInvoiceDownload } from '@/hooks/useInvoiceDownload';
import { apiFetch, endpoints } from '@/lib/api';

interface Customization {
  imageUrl?: string;
  text?: string;
  color?: string;
  brand?: string;
  model?: string;
  coverType?: string;
  specialInstructions?: string;
}

interface OrderItem {
  id: string;
  product_id?: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  customization?: Customization | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  pay_on_delivery: number;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'bg-blue-500' },
  processing: { label: 'Processing', icon: Package, color: 'bg-purple-500' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-indigo-500' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', icon: Package, color: 'bg-red-500' },
};

const OrdersHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { downloadInvoice, downloading } = useInvoiceDownload();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const data = await apiFetch(endpoints.orders.list);
        console.log('Orders response:', data);
        setOrders(data || []);
      } catch (err: any) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, token]);

  const downloadUploadedImage = async (imageUrl: string, productName: string) => {
    if (!imageUrl || downloadingImage === imageUrl) return;

    setDownloadingImage(imageUrl);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Image fetch failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extension = imageUrl.split('.').pop()?.toLowerCase() || 'png';
      a.download = `${productName.replace(/[^a-zA-Z0-9]/g, '-')}-design.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download image');
    } finally {
      setDownloadingImage(null);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId);
  };

  const hasCustomDesign = (item: OrderItem) => {
    return item.customization && item.customization.imageUrl;
  };

  if (loading) {
    return (
      <div className="min-h-dvh min-h-dvh overflow-x-clip bg-background">
        <Navbar />
        <CartDrawer />
        <main className="pb-12 pt-20 sm:pb-16 sm:pt-24">
          <div className="container mx-auto max-w-4xl px-3 min-[360px]:px-4">
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="glass-card rounded-2xl p-6">
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh min-h-dvh overflow-x-clip bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pb-12 pt-20 sm:pb-16 sm:pt-24">
        <div className="container mx-auto max-w-4xl px-3 min-[360px]:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 min-w-0 sm:mb-8"
          >
            <h1 className="flex min-w-0 items-center gap-3 text-2xl font-bold min-[360px]:text-3xl">
              <ShoppingBag className="h-7 w-7 shrink-0 text-accent min-[360px]:h-8 min-[360px]:w-8" />
              My Orders
            </h1>
            <p className="text-muted-foreground mt-2">
              View and download your orders & invoices
            </p>
          </motion.div>

          {/* EMPTY STATE */}
          {orders.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center min-[360px]:p-8 sm:p-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <Button onClick={() => navigate('/shop')}>Browse Products</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const statusInfo = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrder === order.id;
                const hasCustomItems = order.order_items.some(hasCustomDesign);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-2xl overflow-hidden"
                  >
                    {/* HEADER */}
                    <button
                      onClick={() => toggleOrderExpand(order.id)}
                      className="flex min-h-11 w-full min-w-0 flex-col items-stretch justify-between gap-3 p-4 text-left min-[520px]:flex-row min-[520px]:items-center sm:p-6"
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} order ${order.order_number}`}
                    >
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2 min-[360px]:gap-3">
                          <span className="break-all text-base font-semibold min-[360px]:text-lg">
                            {order.order_number}
                          </span>
                          <Badge className={`${statusInfo.color} text-white`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          {hasCustomItems && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Custom Design
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {order.payment_method.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                          {order.pay_on_delivery > 0 && (
                            <>
                              {' · '}
                              <span className="text-accent font-medium">
                                ₹{order.pay_on_delivery.toLocaleString('en-IN')} to pay on delivery
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-3 text-left min-[520px]:justify-end min-[520px]:text-right">
                        <p className="break-words text-xl font-bold min-[360px]:text-2xl">₹{order.total.toLocaleString('en-IN')}</p>
                        {isExpanded ? <ChevronUp className="shrink-0" /> : <ChevronDown className="shrink-0" />}
                      </div>
                    </button>

                    {/* EXPANDED */}
                    {isExpanded && (
                      <div className="space-y-5 border-t p-4 min-[360px]:p-5 sm:space-y-6 sm:p-6">
                        {/* ADDRESS */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              📍 Delivery Address
                            </h4>
                            <div className="min-w-0 break-words rounded-xl bg-muted/50 p-4 text-sm space-y-1">
                              <div className="font-medium">{order.shipping_address.full_name}</div>
                              <div>{order.shipping_address.address_line1}</div>
                              {order.shipping_address.address_line2 && (
                                <div>{order.shipping_address.address_line2}</div>
                              )}
                              <div>{order.shipping_address.city}, {order.shipping_address.state}</div>
                              <div>Pin: {order.shipping_address.pincode}</div>
                              <div className="text-muted-foreground">
                                {order.shipping_address.phone}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              💳 Payment
                            </h4>
                            <div className="min-w-0 rounded-xl bg-muted/50 p-4 text-sm space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">Method:</span>
                                <Badge>{order.payment_method.toUpperCase()}</Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">Status:</span>
                                <Badge variant={order.payment_status === 'paid' ? "default" : "secondary"}>
                                  {order.payment_status}
                                </Badge>
                              </div>
                              {order.pay_on_delivery > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium">Pay on Delivery:</span>
                                  <span className="font-semibold text-accent">
                                    ₹{order.pay_on_delivery.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ITEMS */}
                        <div>
                          {order.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="mb-4 flex min-w-0 flex-col gap-3 rounded-xl bg-muted/30 p-3 min-[420px]:flex-row min-[420px]:gap-4 min-[420px]:p-4 last:mb-0"
                            >
                              {/* PRODUCT IMAGE */}
                              <img
                                src={item.product_image || '/placeholder.svg'}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                alt={item.product_name}
                              />

                              <div className="flex-1 min-w-0">
                                <p className="mb-1 break-words text-base font-medium">
                                  {item.product_name}
                                </p>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                </p>

                                {/* CUSTOMIZATION INFO */}
                                {item.customization && (
                                  <div className="space-y-2 text-xs text-muted-foreground mb-3">
                                    {item.customization.text && (
                                      <p className="flex min-w-0 flex-wrap items-center gap-2">
                                        <span className="font-medium">✏️ Text:</span>
                                        <span className="max-w-full break-all rounded bg-background px-2 py-1 font-mono text-sm">
                                          "{item.customization.text}"
                                        </span>
                                      </p>
                                    )}
                                    {item.customization.color && (
                                      <p className="flex min-w-0 flex-wrap items-center gap-2">
                                        <span className="font-medium">🎨 Color:</span>
                                        <span 
                                          className="w-4 h-4 rounded-full border inline-block mr-1"
                                          style={{ backgroundColor: item.customization.color }}
                                        />
                                        {item.customization.color}
                                      </p>
                                    )}
                                    {item.customization.brand && <p><span className="font-medium">Brand:</span> {item.customization.brand}</p>}
                                    {item.customization.model && <p><span className="font-medium">Model:</span> {item.customization.model}</p>}
                                    {item.customization.coverType && <p><span className="font-medium">Cover:</span> {item.customization.coverType}</p>}
                                    {item.customization.specialInstructions && (
                                      <p className="rounded bg-amber-50 p-2 text-amber-950">
                                        <span className="font-medium">Instructions:</span> {item.customization.specialInstructions}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* CUSTOM DESIGN DOWNLOAD */}
                              {hasCustomDesign(item) && (
                                <div className="ml-0 flex shrink-0 flex-row items-center justify-between gap-3 min-[420px]:ml-auto min-[420px]:flex-col min-[420px]:items-end min-[420px]:gap-2">
                                  <div className="relative">
                                    <img
                                      src={item.customization!.imageUrl!}
                                      className="w-16 h-16 rounded-lg object-cover border shadow-sm"
                                      alt="Your design"
                                      onError={(e) => {
                                        console.error('Custom image failed:', item.customization!.imageUrl);
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                                      <ImageIcon className="w-3 h-3" />
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="min-h-11 px-3 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadUploadedImage(
                                        item.customization!.imageUrl!,
                                        item.product_name
                                      );
                                    }}
                                    disabled={downloadingImage === item.customization!.imageUrl}
                                  >
                                    {downloadingImage === item.customization!.imageUrl ? (
                                      <>
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Downloading...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-3 h-3 mr-1" />
                                        Design
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* SUMMARY & INVOICE */}
                        <div className="pt-4 border-t bg-muted/50 p-5 rounded-xl space-y-3">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm md:grid-cols-4">
                            <div>Subtotal:</div>
                            <div className="text-right font-medium">₹{order.subtotal.toLocaleString('en-IN')}</div>
                            <div>Shipping:</div>
                            <div className="text-right font-medium">₹{order.shipping.toLocaleString('en-IN')}</div>
                            <div>Tax:</div>
                            <div className="text-right font-medium">₹{order.tax.toLocaleString('en-IN')}</div>
                            {order.discount > 0 && (
                              <>
                                <div>Discount:</div>
                                <div className="text-right font-medium text-destructive">-₹{order.discount.toLocaleString('en-IN')}</div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap items-baseline justify-between gap-3 border-t pt-3">
                            <span className="text-lg font-semibold">Total:</span>
                            <span className="break-words text-right text-xl font-bold text-accent min-[360px]:text-2xl">
                              ₹{order.total.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-stretch min-[420px]:justify-end">
                            <Button
                              variant="outline"
                              onClick={() => downloadInvoice(order.id)}
                              className="min-h-11 w-full min-[420px]:w-auto"
                              disabled={downloading === order.id}
                            >
                              {downloading === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <FileText className="w-4 h-4 mr-2" />
                              )}
                              Download Invoice
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrdersHistory;
