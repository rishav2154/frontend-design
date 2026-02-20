import { useEffect, useState } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, DollarSign, Users, Tag, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  activeCoupons: number;
  pendingOrders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeCoupons: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats({
          totalOrders: res.data.totalOrders,
          totalRevenue: res.data.totalRevenue,
          totalUsers: res.data.totalUsers,
          activeCoupons: res.data.activeCoupons,
          pendingOrders: res.data.pendingOrders,
        });

        setRecentOrders(res.data.recentOrders || []);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401) {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, token]);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Revenue',
      value: `₹${Number(stats.totalRevenue).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Active Coupons',
      value: stats.activeCoupons,
      icon: Tag,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* LOWER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-500">
                {stats.pendingOrders}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Orders awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : recentOrders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₹{Number(order.final_amount).toFixed(2)}
                        </p>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
