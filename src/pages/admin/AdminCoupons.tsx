import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Tag, Pencil } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number | null;
  is_active: boolean;
  valid_until: string | null;
}

const AdminCoupons = () => {
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_discount: 0,
    usage_limit: 0,
    valid_until: '',
  });

  /* ================= FETCH ================= */

  const fetchCoupons = async () => {
    try {
      const data = await apiFetch('/api/admin/coupons');
      setCoupons(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ================= FORM ================= */

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      max_discount: 0,
      usage_limit: 0,
      valid_until: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      code: formData.code.toUpperCase(),
    };

    try {
      if (editingCoupon) {
        await apiFetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Coupon updated' });
      } else {
        await apiFetch('/api/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Coupon created' });
      }

      setDialogOpen(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message });
    }
  };

  /* ================= ACTIONS ================= */

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || 0,
      max_discount: coupon.max_discount || 0,
      usage_limit: coupon.usage_limit || 0,
      valid_until: coupon.valid_until?.split('T')[0] || '',
    });
    setDialogOpen(true);
  };

  const toggleActive = async (coupon: Coupon) => {
    await apiFetch(`/api/admin/coupons/${coupon.id}/toggle`, {
      method: 'PATCH',
    });
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await apiFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    fetchCoupons();
  };

  /* ================= UI ================= */

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Coupons</h1>
            <p className="text-muted-foreground">Manage discount coupons</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 w-4 h-4" />
                Add Coupon
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Coupon Code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                />

                <Select
                  value={formData.discount_type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, discount_type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Discount Value"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_value: Number(e.target.value),
                    })
                  }
                />

                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_until: e.target.value })
                  }
                />

                <Button type="submit" className="w-full">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              All Coupons
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {coupons.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">
                        {c.code}
                      </TableCell>
                      <TableCell>
                        <Badge>{c.discount_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {c.discount_type === 'percentage'
                          ? `${c.discount_value}%`
                          : `₹${c.discount_value}`}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={c.is_active}
                          onCheckedChange={() => toggleActive(c)}
                        />
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button size="sm" onClick={() => handleEdit(c)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
