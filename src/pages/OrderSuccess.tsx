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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>

          <div className="glass-card p-6 mb-6 text-left">
            <p><strong>Order #:</strong> {order.order_number}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ₹{order.total}</p>
          </div>

          <div className="flex gap-4">
            <Link to="/shop" className="flex-1">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">Home</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
