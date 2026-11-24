import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, Package, Truck, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, endpoints } from "@/lib/api";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  created_at: string;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await apiFetch(endpoints.orders.detail, { args: [orderId] });
        setOrder(data);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-dvh min-h-dvh items-center justify-center px-4">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-dvh min-h-dvh overflow-x-clip bg-background">
      <Navbar />

      <main className="pb-12 pt-20 sm:pb-16 sm:pt-24">
        <div className="container mx-auto max-w-2xl px-3 text-center min-[360px]:px-4">
          <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-500 min-[360px]:h-16 min-[360px]:w-16" />
          <h1 className="mb-4 text-2xl font-bold min-[360px]:text-3xl">Order Confirmed!</h1>

          <div className="glass-card mb-6 min-w-0 space-y-2 p-4 text-left min-[360px]:p-6">
            <p className="break-all"><strong>Order #:</strong> {order.order_number}</p>
            <p className="break-words"><strong>Status:</strong> {order.status}</p>
            <p className="break-words"><strong>Total:</strong> ₹{order.total}</p>
          </div>

          <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:gap-4">
            <Link to="/shop" className="min-w-0 flex-1">
              <Button className="min-h-11 w-full">Continue Shopping</Button>
            </Link>
            <Link to="/" className="min-w-0 flex-1">
              <Button variant="outline" className="min-h-11 w-full">Home</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
