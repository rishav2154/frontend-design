import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, X, MapPin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.thedesignhive.tech';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  /* ================= FETCH ADDRESSES ================= */
  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/addresses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
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
      const url = editingId
        ? `${API_BASE}/api/addresses/${editingId}`
        : `${API_BASE}/api/addresses`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          address_line2: form.address_line2 || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save address');
      }

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
      const response = await fetch(`${API_BASE}/api/addresses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete address');
      }

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
      const response = await fetch(
        `${API_BASE}/api/addresses/${id}/default`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update default address');
      }

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
      className="glass-card rounded-2xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold">Saved Addresses</h2>
        </div>
        {!showForm && (
          <Button variant="ghost" size="sm" onClick={handleAdd}>
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
                <div className="p-4 bg-muted/30 rounded-xl mb-4 space-y-3">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">
                      {editingId ? 'Edit Address' : 'New Address'}
                    </p>
                    <button onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(form).map(([key, value]) => (
                      <div
                        key={key}
                        className={key.includes('address') ? 'col-span-2' : ''}
                      >
                        <Label className="text-xs capitalize">
                          {key.replace(/_/g, ' ')} *
                        </Label>
                        <Input
                          value={value}
                          onChange={(e) =>
                            setForm({ ...form, [key]: e.target.value })
                          }
                          className="mt-1 h-9 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      size="sm"
                      className="flex-1"
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
                  className="p-4 bg-muted/20 rounded-xl relative"
                >
                  {addr.is_default === 1 && (
                    <span className="absolute top-3 right-3 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}

                  <p className="font-medium text-sm">{addr.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {addr.address_line1}
                    {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    📞 {addr.phone}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(addr)}
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
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
