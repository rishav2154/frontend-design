import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, X, MapPin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, endpoints } from '@/lib/api';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: number;
  created_at?: string;
}

const emptyForm = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
};

export const AddressManager = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  /* ================= FETCH ADDRESSES ================= */
  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const data = await apiFetch(endpoints.addresses.list);
      setAddresses(data);
    } catch (err: any) {
      console.error('Fetch addresses error:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  /* ================= FORM HANDLERS ================= */

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  /* ================= SAVE ADDRESS ================= */

  const handleSave = async () => {
    if (
      !form.full_name.trim() ||
      !form.phone.trim() ||
      !form.address_line1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const endpoint = editingId
        ? endpoints.addresses.detail
        : endpoints.addresses.create;
      const args = editingId ? [editingId] : [];
      const method = editingId ? 'PUT' : 'POST';

      await apiFetch(endpoint, {
        args,
        method,
        body: JSON.stringify({
          ...form,
          address_line2: form.address_line2 || null,
        }),
      });

      toast({
        title: editingId ? 'Address updated!' : 'Address added!',
      });

      handleCancel();
      fetchAddresses();
    } catch (err: any) {
      console.error('Save address error:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ADDRESS ================= */

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setDeletingId(id);

    try {
      await apiFetch(endpoints.addresses.detail, {
        args: [id],
        method: 'DELETE',
      });

      toast({ title: 'Address deleted' });
      fetchAddresses();
    } catch (err: any) {
      console.error('Delete address error:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= SET DEFAULT ================= */

  const handleSetDefault = async (id: string) => {
    try {
      await apiFetch(endpoints.addresses.setDefault, {
        args: [id],
        method: 'PATCH',
      });

      toast({ title: 'Default address updated' });
      fetchAddresses();
    } catch (err: any) {
      console.error('Set default error:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  /* ================= UI ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mb-6 min-w-0 rounded-2xl p-4 min-[360px]:p-5"
    >
      <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="h-5 w-5 shrink-0 text-accent" />
          <h2 className="break-words text-base font-bold min-[360px]:text-lg">Saved Addresses</h2>
        </div>
        {!showForm && (
          <Button variant="ghost" size="sm" onClick={handleAdd} className="min-h-11 shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : (
        <>
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-4 space-y-3 rounded-xl bg-muted/30 p-3 min-[360px]:p-4">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="font-medium text-sm">
                      {editingId ? 'Edit Address' : 'New Address'}
                    </p>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-muted"
                      aria-label="Close address form"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                    {Object.entries(form).map(([key, value]) => (
                      <div
                        key={key}
                        className={key.includes('address') ? 'min-[420px]:col-span-2' : ''}
                      >
                        <Label className="text-xs capitalize">
                          {key.replace(/_/g, ' ')} *
                        </Label>
                        <Input
                          value={value}
                          onChange={(e) =>
                            setForm({ ...form, [key]: e.target.value })
                          }
                          className="mt-1 h-11 min-w-0 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 pt-1 min-[360px]:flex-row">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      size="sm"
                      className="min-h-11 flex-1"
                    >
                      {saving && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      )}
                      {editingId ? 'Update' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="min-h-11"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No saved addresses yet.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="relative min-w-0 rounded-xl bg-muted/20 p-3 min-[360px]:p-4"
                >
                  {addr.is_default === 1 && (
                    <span className="mb-2 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent min-[420px]:absolute min-[420px]:right-3 min-[420px]:top-3 min-[420px]:mb-0">
                      Default
                    </span>
                  )}

                  <p className="break-words text-sm font-medium min-[420px]:pr-20">{addr.full_name}</p>
                  <p className="break-words text-xs text-muted-foreground">
                    {addr.address_line1}
                    {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                  </p>
                  <p className="break-words text-xs text-muted-foreground">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="break-words text-xs text-muted-foreground">
                    📞 {addr.phone}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1 min-[360px]:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11 px-2 min-[360px]:px-3"
                      onClick={() => handleEdit(addr)}
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11 px-2 min-[360px]:px-3"
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id}
                    >
                      {deletingId === addr.id ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="w-3 h-3 mr-1" />
                      )}
                      Delete
                    </Button>
                    {addr.is_default !== 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-11 px-2 min-[360px]:px-3"
                        onClick={() => handleSetDefault(addr.id)}
                      >
                        <Check className="w-3 h-3 mr-1" /> Set Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
