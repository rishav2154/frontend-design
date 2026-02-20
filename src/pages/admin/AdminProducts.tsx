// AdminProducts.tsx - COMPLETE FIXED VERSION
// ✅ All bugs fixed: images array sync, payload, form population, reset, etc.

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Upload, X, Package, Image as ImageIcon } from 'lucide-react';

const API = 'http://localhost:5000/api';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  stock: number;
  tags: string[];
  images: (string | null)[];
  customization_options: {
    canAddText?: boolean;
    canAddImage?: boolean;
  };
  is_active?: boolean;
}

const CATEGORIES = ['T-Shirts', 'Mugs', 'Posters', 'Frames', 'Phone Cases', 'Combos', 'Keychains', 'Lamps', 'Phone Covers'];

const AdminProducts = () => {
  const { toast } = useToast();
  const token = localStorage.getItem('token');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ✅ FIXED: Separate states for preview and API payload
  const [images, setImages] = useState<string[]>([]);        // API payload (array)
  const [imageUrl, setImageUrl] = useState('');             // Preview (single string)
  const [uploading, setUploading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [canAddText, setCanAddText] = useState(false);
  const [canAddImage, setCanAddImage] = useState(false);
  const [tags, setTags] = useState('');

  // ✅ HELPER: Get first valid image from images array
  const getProductImage = (product: Product): string | null => {
    if (!product.images || !Array.isArray(product.images)) return null;
    const firstImage = product.images[0];
    if (firstImage === null || firstImage === 'null') return null;
    return typeof firstImage === 'string' ? firstImage : null;
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.response?.data?.error || err.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= IMAGE UPLOAD - FIXED ================= */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${API}/upload`, formData);
      const newImageUrl = res.data.imageUrl;
      
      // ✅ FIXED: Set BOTH states correctly
      setImageUrl(newImageUrl);           // For preview
      setImages([newImageUrl]);           // For API payload
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /* ================= CLEAR IMAGE ================= */
  const clearImage = () => {
    setImageUrl('');
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ================= CREATE / UPDATE - FIXED ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name?.trim() || !price || !category) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setSaving(true);

    // ✅ FIXED: Correct payload structure
    const payload = {
      name,
      description: description || null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      category,
      images, // ✅ FIXED: Now correctly sends images array
      stock: Number(stock),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      is_active: isActive,
      customization_options: { 
        canAddText, 
        canAddImage 
      },
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Product updated successfully' });
      } else {
        await axios.post(`${API}/admin/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Product created successfully' });
      }
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.response?.data?.error || err.response?.data?.message || err.message, 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(`${API}/admin/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Product deleted successfully' });
      fetchProducts();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  /* ================= STATUS TOGGLE ================= */
  const toggleStatus = async (product: Product) => {
    try {
      await axios.patch(
        `${API}/admin/products/${product.id}/status`,
        { is_active: !product.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
      toast({ title: 'Status updated' });
    } catch (err: any) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  /* ================= RESET FORM - FIXED ================= */
  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setCategory('');
    setImageUrl('');  // ✅ FIXED
    setImages([]);    // ✅ FIXED
    setStock('0');
    setIsActive(true);
    setCanAddText(false);
    setCanAddImage(false);
    setTags('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ================= POPULATE FORM FOR EDITING - FIXED ================= */
  const populateForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price?.toString() || '');
    setOriginalPrice(product.original_price ? product.original_price.toString() : '');
    setCategory(product.category || '');
    
    // ✅ FIXED: Sync both image states
    const firstImage = getProductImage(product);
    setImageUrl(firstImage || '');
    setImages(firstImage ? [firstImage] : []);
    
    setStock(product.stock?.toString() || '0');
    setIsActive(Boolean(product.is_active));
    setCanAddText(Boolean(product.customization_options?.canAddText));
    setCanAddImage(Boolean(product.customization_options?.canAddImage));
    setTags(product.tags?.join(', ') || '');
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Products Management ({products.length})</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input 
                      id="name"
                      placeholder="Enter product name" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      required 
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input 
                      id="price"
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="99.99" 
                      value={price} 
                      onChange={e => setPrice(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input 
                      id="originalPrice"
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="149.99" 
                      value={originalPrice} 
                      onChange={e => setOriginalPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input 
                      id="stock"
                      type="number" 
                      min="0"
                      placeholder="0" 
                      value={stock} 
                      onChange={e => setStock(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <Label className="text-sm">Active</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Product description..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* ✅ IMAGE UPLOAD - FULLY FIXED */}
                <div>
                  <Label>Product Image</Label>
                  <div className="space-y-3">
                    <Input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      disabled={uploading || saving}
                    />
                    
                    {imageUrl && (
                      <div className="flex items-center gap-3 p-4 bg-muted/50 border rounded-xl">
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextSibling as HTMLElement)?.classList.remove('hidden');
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">✅ Image ready to save</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {imageUrl}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={clearImage}
                          title="Clear image"
                          disabled={saving}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <ImageIcon className="w-8 h-8 text-muted-foreground hidden" />
                      </div>
                    )}
                    
                    {uploading && (
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Uploading image...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch checked={canAddText} onCheckedChange={setCanAddText} />
                    <Label className="text-sm">Allow Custom Text</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={canAddImage} onCheckedChange={setCanAddImage} />
                    <Label className="text-sm">Allow Custom Image</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input 
                    id="tags"
                    placeholder="premium, new, sale, best-seller" 
                    value={tags} 
                    onChange={e => setTags(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={saving || uploading || !name.trim() || !price || !category}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingProduct ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingProduct ? 'Update Product' : 'Create Product'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    disabled={saving || uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              <span>Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p>Create your first product to get started!</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const imageUrl = getProductImage(p);
                    return (
                      <TableRow key={p.id} className="hover:bg-accent/50">
                        <TableCell>
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<Package className="w-12 h-12 text-muted-foreground mx-auto" />';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px]">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{p.category || 'Uncategorized'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono font-bold">₹{p.price}</div>
                          {p.original_price && (
                            <div className="text-xs text-muted-foreground line-through">₹{p.original_price}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.stock > 0 ? "default" : "destructive"}>
                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} available`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={p.is_active ? "default" : "secondary"}
                            className="cursor-pointer hover:opacity-80 transition"
                            onClick={() => toggleStatus(p)}
                          >
                            {p.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => populateForm(p)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => {
                              setProductToDelete(p);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{productToDelete?.name}</strong> 
              and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProducts;
