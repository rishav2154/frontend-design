// AdminProducts.tsx - COMPLETE FIXED VERSION
// ✅ All bugs fixed: images array sync, payload, form population, reset, etc.

import { useState, useEffect, useRef } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { ArrowLeft, ArrowRight, Layers, Plus, Pencil, Trash2, Loader2, Upload, X, Package, Image as ImageIcon, Smartphone, Star } from 'lucide-react';
import { apiFetch, apiUpload, endpoints } from '@/lib/api';
import { normalizeProductCategory } from '@/lib/productTaxonomy';
import type {
  PhoneCoverBrand,
  PhoneCoverCatalogProduct,
  PhoneCoverModel,
  PhoneCoverProductModel,
  PhoneCoverType,
} from '@/lib/phoneCoverCatalog';

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
const MAX_PRODUCT_IMAGES = 5;
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong';

const AdminProducts = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<string[]>([]);
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

  // Phone-case catalog configuration
  const [phoneBrands, setPhoneBrands] = useState<PhoneCoverBrand[]>([]);
  const [phoneModels, setPhoneModels] = useState<PhoneCoverModel[]>([]);
  const [phoneCoverTypes, setPhoneCoverTypes] = useState<PhoneCoverType[]>([]);
  const [phoneCatalogProducts, setPhoneCatalogProducts] = useState<PhoneCoverCatalogProduct[]>([]);
  const [phoneCatalogLoading, setPhoneCatalogLoading] = useState(false);
  const [phoneCoverTypeId, setPhoneCoverTypeId] = useState('none');
  const [phoneModelOptions, setPhoneModelOptions] = useState<PhoneCoverProductModel[]>([]);
  const [phoneFeatured, setPhoneFeatured] = useState(false);
  const [phoneRequiresImage, setPhoneRequiresImage] = useState(true);
  const [phoneSortOrder, setPhoneSortOrder] = useState('0');
  const [phoneBrandFilter, setPhoneBrandFilter] = useState('all');

  // Inline catalog creation
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelBrandId, setNewModelBrandId] = useState('');
  const [newCoverTypeName, setNewCoverTypeName] = useState('');
  const [newCoverTypePrice, setNewCoverTypePrice] = useState('');
  const [quickCreating, setQuickCreating] = useState<'brand' | 'model' | 'type' | null>(null);

  const isPhoneCase = normalizeProductCategory(category) === 'phone-cover';

  const getProductImage = (product: Product): string | null => {
    if (!product.images || !Array.isArray(product.images)) return null;
    return product.images.find(
      (image): image is string =>
        typeof image === 'string' && image.trim().length > 0 && image !== 'null',
    ) || null;
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const data = await apiFetch(endpoints.admin.products);
      setProducts(data);
    } catch (err: unknown) {
      toast({ 
        title: 'Error', 
        description: getErrorMessage(err), 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPhoneCatalog = async () => {
    setPhoneCatalogLoading(true);
    try {
      const [brands, models, coverTypes, catalogProducts] = await Promise.all([
        apiFetch<PhoneCoverBrand[]>(endpoints.admin.phoneCover.brands),
        apiFetch<PhoneCoverModel[]>(endpoints.admin.phoneCover.models),
        apiFetch<PhoneCoverType[]>(endpoints.admin.phoneCover.coverTypes),
        apiFetch<PhoneCoverCatalogProduct[]>(endpoints.admin.phoneCover.catalogProducts),
      ]);
      setPhoneBrands(brands);
      setPhoneModels(models);
      setPhoneCoverTypes(coverTypes);
      setPhoneCatalogProducts(catalogProducts);
      setNewModelBrandId((current) => current || brands[0]?.id || '');
      return { brands, models, coverTypes, catalogProducts };
    } catch (err: unknown) {
      toast({
        title: 'Phone-case options failed to load',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
      return null;
    } finally {
      setPhoneCatalogLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPhoneCatalog();
  }, []);

  /* ================= PRODUCT IMAGE GALLERY ================= */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const remainingSlots = MAX_PRODUCT_IMAGES - images.length;
    if (remainingSlots <= 0) {
      toast({
        title: `Maximum ${MAX_PRODUCT_IMAGES} images`,
        description: 'Remove an image before adding another one.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    const files = selectedFiles
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, remainingSlots);

    if (!files.length) {
      toast({ title: 'Choose valid image files', variant: 'destructive' });
      e.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      let failedUploads = 0;

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        try {
          const res = await apiUpload<{ imageUrl?: string }>(endpoints.upload, formData);
          if (typeof res.imageUrl === 'string' && res.imageUrl.trim()) {
            uploadedUrls.push(res.imageUrl.trim());
          } else {
            failedUploads += 1;
          }
        } catch {
          failedUploads += 1;
        }
      }

      if (uploadedUrls.length) {
        setImages((current) =>
          [...current, ...uploadedUrls].slice(0, MAX_PRODUCT_IMAGES),
        );
        toast({
          title: `${uploadedUrls.length} image${uploadedUrls.length === 1 ? '' : 's'} uploaded`,
          description:
            selectedFiles.length > files.length
              ? `Only ${MAX_PRODUCT_IMAGES} product images can be saved.`
              : 'Use the arrows to reorder them. The first image is the primary image.',
        });
      }

      if (failedUploads > 0) {
        toast({
          title: `${failedUploads} image${failedUploads === 1 ? '' : 's'} failed to upload`,
          variant: 'destructive',
        });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const reordered = [...current];
      [reordered[index], reordered[targetIndex]] = [
        reordered[targetIndex],
        reordered[index],
      ];
      return reordered;
    });
  };

  const makePrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((current) => {
      const reordered = [...current];
      const [selectedImage] = reordered.splice(index, 1);
      reordered.unshift(selectedImage);
      return reordered;
    });
  };

  const clearImages = () => {
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePhoneModel = (modelId: string, checked: boolean) => {
    setPhoneModelOptions((current) =>
      checked
        ? current.some((option) => option.model_id === modelId)
          ? current
          : [...current, { model_id: modelId }]
        : current.filter((option) => option.model_id !== modelId),
    );
  };

  const updatePhoneModelOption = (
    modelId: string,
    field: 'sku' | 'price_override' | 'stock_override',
    value: string,
  ) => {
    setPhoneModelOptions((current) => current.map((option) => {
      if (option.model_id !== modelId) return option;
      if (field === 'sku') return { ...option, sku: value || null };
      return { ...option, [field]: value === '' ? null : Number(value) };
    }));
  };

  const createPhoneBrand = async () => {
    const brandName = newBrandName.trim();
    if (!brandName) return;
    setQuickCreating('brand');
    try {
      const created = await apiFetch<PhoneCoverBrand>(endpoints.admin.phoneCover.brands, {
        method: 'POST',
        body: JSON.stringify({ name: brandName }),
      });
      setNewBrandName('');
      const refreshed = await fetchPhoneCatalog();
      setPhoneBrandFilter(created.id);
      setNewModelBrandId(created.id || refreshed?.brands[0]?.id || '');
      toast({ title: 'Brand created and selected' });
    } catch (err: unknown) {
      toast({ title: 'Could not create brand', description: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setQuickCreating(null);
    }
  };

  const createPhoneModel = async () => {
    const modelName = newModelName.trim();
    if (!modelName || !newModelBrandId) return;
    setQuickCreating('model');
    try {
      const created = await apiFetch<PhoneCoverModel>(endpoints.admin.phoneCover.models, {
        method: 'POST',
        body: JSON.stringify({ name: modelName, brand_id: newModelBrandId }),
      });
      setNewModelName('');
      await fetchPhoneCatalog();
      togglePhoneModel(created.id, true);
      setPhoneBrandFilter(newModelBrandId);
      toast({ title: 'Phone model created and selected' });
    } catch (err: unknown) {
      toast({ title: 'Could not create model', description: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setQuickCreating(null);
    }
  };

  const createPhoneCoverType = async () => {
    const coverName = newCoverTypeName.trim();
    const coverPrice = Number(newCoverTypePrice);
    if (!coverName || !Number.isFinite(coverPrice)) return;
    setQuickCreating('type');
    try {
      const created = await apiFetch<PhoneCoverType>(endpoints.admin.phoneCover.coverTypes, {
        method: 'POST',
        body: JSON.stringify({ name: coverName, price: coverPrice }),
      });
      setNewCoverTypeName('');
      setNewCoverTypePrice('');
      await fetchPhoneCatalog();
      setPhoneCoverTypeId(created.id);
      toast({ title: 'Case type created and selected' });
    } catch (err: unknown) {
      toast({ title: 'Could not create case type', description: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setQuickCreating(null);
    }
  };

  /* ================= CREATE / UPDATE - FIXED ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name?.trim() || !price || !category) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (isPhoneCase && phoneCoverTypeId === 'none') {
      toast({ title: 'Please select or create a phone case type', variant: 'destructive' });
      return;
    }

    setSaving(true);

    // ✅ FIXED: Correct payload structure
    const payload = {
      name,
      description: description || null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      category: isPhoneCase ? 'phone-cover' : category,
      images, // ✅ FIXED: Now correctly sends images array
      stock: Number(stock),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      is_active: isActive,
      customization_options: { 
        canAddText, 
        canAddImage,
      },
      ...(isPhoneCase ? {
        cover_type_id: phoneCoverTypeId,
        requires_image: canAddImage && phoneRequiresImage,
        is_featured: phoneFeatured,
        sort_order: Number(phoneSortOrder) || 0,
        models: phoneModelOptions,
      } : {}),
    };

    try {
      if (isPhoneCase) {
        if (editingProduct) {
          await apiFetch(endpoints.admin.phoneCover.catalogProduct, {
            args: [editingProduct.id],
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          toast({ title: 'Phone-case product updated successfully' });
        } else {
          await apiFetch(endpoints.admin.phoneCover.catalogProducts, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          toast({ title: 'Phone-case product created successfully' });
        }
      } else {
        if (editingProduct) {
          await apiFetch(endpoints.admin.product, {
            args: [editingProduct.id],
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          toast({ title: 'Product updated successfully' });
        } else {
          await apiFetch(endpoints.admin.products, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          toast({ title: 'Product created successfully' });
        }
      }
      setDialogOpen(false);
      resetForm();
      await Promise.all([fetchProducts(), fetchPhoneCatalog()]);
    } catch (err: unknown) {
      toast({ 
        title: 'Error', 
        description: getErrorMessage(err), 
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
      await apiFetch(endpoints.admin.product, {
        args: [productToDelete.id],
        method: 'DELETE',
      });
      toast({ title: 'Product deleted successfully' });
      fetchProducts();
    } catch (err: unknown) {
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  /* ================= STATUS TOGGLE ================= */
  const toggleStatus = async (product: Product) => {
    try {
      await apiFetch(endpoints.admin.productStatus, {
        args: [product.id],
        method: 'PATCH',
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      fetchProducts();
      toast({ title: 'Status updated' });
    } catch {
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
    setImages([]);
    setStock('0');
    setIsActive(true);
    setCanAddText(false);
    setCanAddImage(false);
    setTags('');
    setPhoneCoverTypeId('none');
    setPhoneModelOptions([]);
    setPhoneFeatured(false);
    setPhoneRequiresImage(true);
    setPhoneSortOrder('0');
    setPhoneBrandFilter('all');
    setNewBrandName('');
    setNewModelName('');
    setNewCoverTypeName('');
    setNewCoverTypePrice('');
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
    setCategory(
      normalizeProductCategory(product.category) === 'phone-cover'
        ? 'Phone Covers'
        : product.category || '',
    );
    
    const productImages = Array.isArray(product.images)
      ? product.images
          .filter(
            (image): image is string =>
              typeof image === 'string' && image.trim().length > 0 && image !== 'null',
          )
          .slice(0, MAX_PRODUCT_IMAGES)
      : [];
    setImages(productImages);
    
    setStock(product.stock?.toString() || '0');
    setIsActive(Boolean(product.is_active));
    setCanAddText(Boolean(product.customization_options?.canAddText));
    setCanAddImage(Boolean(product.customization_options?.canAddImage));
    setTags(product.tags?.join(', ') || '');

    const catalogProduct = phoneCatalogProducts.find((entry) => entry.id === product.id);
    if (normalizeProductCategory(product.category) === 'phone-cover') {
      setPhoneCoverTypeId(catalogProduct?.cover_type_id || 'none');
      setPhoneModelOptions(
        catalogProduct?.models?.length
          ? catalogProduct.models.map((option) => ({ ...option }))
          : (catalogProduct?.supported_model_ids || []).map((model_id) => ({ model_id })),
      );
      setPhoneFeatured(Boolean(catalogProduct?.is_featured));
      setPhoneRequiresImage(catalogProduct?.requires_image !== false);
      setPhoneSortOrder(String(catalogProduct?.sort_order || 0));
    } else {
      setPhoneCoverTypeId('none');
      setPhoneModelOptions([]);
      setPhoneFeatured(false);
      setPhoneRequiresImage(true);
      setPhoneSortOrder('0');
    }
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl sm:text-2xl">Products Management ({products.length})</CardTitle>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open && !saving) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto p-4 sm:p-6">
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
                    <Select
                      value={category}
                      onValueChange={(value) => {
                        setCategory(value);
                      }}
                    >
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

                {isPhoneCase && (
                  <Card className="border-accent/40 bg-accent/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Smartphone className="h-5 w-5 text-accent" />
                        Phone Case Configuration
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Configure the case type and compatible phone models. These options control both the shop and customizer.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {phoneCatalogLoading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading phone catalog…
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-5 lg:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Case type *</Label>
                              <Select value={phoneCoverTypeId} onValueChange={setPhoneCoverTypeId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a case type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Select a case type</SelectItem>
                                  {phoneCoverTypes.map((coverType) => (
                                    <SelectItem key={coverType.id} value={coverType.id}>
                                      {coverType.name} · ₹{Number(coverType.price || 0).toFixed(2)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="phone-sort-order">Catalog display order</Label>
                              <Input
                                id="phone-sort-order"
                                type="number"
                                value={phoneSortOrder}
                                onChange={(event) => setPhoneSortOrder(event.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4">
                              <span>
                                <span className="block font-medium">Featured product</span>
                                <span className="block text-xs text-muted-foreground">Show before other phone cases</span>
                              </span>
                              <Switch checked={phoneFeatured} onCheckedChange={setPhoneFeatured} />
                            </label>
                            <label className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4">
                              <span>
                                <span className="block font-medium">Customer image required</span>
                                <span className="block text-xs text-muted-foreground">Require an uploaded design</span>
                              </span>
                              <Switch
                                checked={canAddImage && phoneRequiresImage}
                                disabled={!canAddImage}
                                onCheckedChange={setPhoneRequiresImage}
                              />
                            </label>
                          </div>

                          <div className="space-y-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                              <div>
                                <Label>Compatible brands and models</Label>
                                <p className="text-xs text-muted-foreground">
                                  Leave every model unchecked to make the case available for all models.
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Select value={phoneBrandFilter} onValueChange={setPhoneBrandFilter}>
                                  <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Filter brand" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All brands</SelectItem>
                                    {phoneBrands.map((brand) => (
                                      <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {phoneModelOptions.length > 0 && (
                                  <Button type="button" variant="outline" onClick={() => setPhoneModelOptions([])}>
                                    Clear ({phoneModelOptions.length})
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="max-h-96 space-y-4 overflow-y-auto rounded-xl border bg-background p-3">
                              {phoneBrands
                                .filter((brand) => phoneBrandFilter === 'all' || brand.id === phoneBrandFilter)
                                .map((brand) => {
                                  const brandModels = phoneModels.filter((model) => model.brand_id === brand.id);
                                  if (!brandModels.length) return null;
                                  return (
                                    <div key={brand.id} className="space-y-2">
                                      <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold">{brand.name}</p>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            const allSelected = brandModels.every((model) =>
                                              phoneModelOptions.some((option) => option.model_id === model.id),
                                            );
                                            brandModels.forEach((model) => togglePhoneModel(model.id, !allSelected));
                                          }}
                                        >
                                          Select brand
                                        </Button>
                                      </div>
                                      {brandModels.map((model) => {
                                        const option = phoneModelOptions.find((entry) => entry.model_id === model.id);
                                        return (
                                          <div key={model.id} className="rounded-lg border p-3">
                                            <label className="flex cursor-pointer items-center gap-3">
                                              <Checkbox
                                                checked={Boolean(option)}
                                                onCheckedChange={(checked) => togglePhoneModel(model.id, checked === true)}
                                              />
                                              <span className="font-medium">{model.name}</span>
                                            </label>
                                            {option && (
                                              <div className="mt-3 grid gap-2 pl-7 sm:grid-cols-3">
                                                <Input
                                                  aria-label={`${model.name} SKU`}
                                                  placeholder="SKU"
                                                  value={option.sku || ''}
                                                  onChange={(event) => updatePhoneModelOption(model.id, 'sku', event.target.value)}
                                                />
                                                <Input
                                                  aria-label={`${model.name} price override`}
                                                  type="number"
                                                  min="0"
                                                  step="0.01"
                                                  placeholder="Price override"
                                                  value={option.price_override ?? ''}
                                                  onChange={(event) => updatePhoneModelOption(model.id, 'price_override', event.target.value)}
                                                />
                                                <Input
                                                  aria-label={`${model.name} stock override`}
                                                  type="number"
                                                  min="0"
                                                  placeholder="Stock override"
                                                  value={option.stock_override ?? ''}
                                                  onChange={(event) => updatePhoneModelOption(model.id, 'stock_override', event.target.value)}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                              {phoneModels.length === 0 && (
                                <p className="py-6 text-center text-sm text-muted-foreground">No phone models yet. Add one below.</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3 rounded-xl border border-dashed bg-background p-4">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-accent" />
                              <h4 className="font-semibold">Quick add catalog data</h4>
                            </div>
                            <div className="grid gap-4 xl:grid-cols-3">
                              <div className="space-y-2 rounded-lg border p-3">
                                <Label htmlFor="quick-brand">New brand</Label>
                                <Input id="quick-brand" value={newBrandName} onChange={(event) => setNewBrandName(event.target.value)} placeholder="e.g. Apple" />
                                <Button type="button" size="sm" className="w-full" onClick={createPhoneBrand} disabled={!newBrandName.trim() || quickCreating !== null}>
                                  {quickCreating === 'brand' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                  Add brand
                                </Button>
                              </div>

                              <div className="space-y-2 rounded-lg border p-3">
                                <Label>New phone model</Label>
                                <Select value={newModelBrandId} onValueChange={setNewModelBrandId}>
                                  <SelectTrigger><SelectValue placeholder="Choose brand" /></SelectTrigger>
                                  <SelectContent>
                                    {phoneBrands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                <Input value={newModelName} onChange={(event) => setNewModelName(event.target.value)} placeholder="e.g. iPhone 16 Pro" />
                                <Button type="button" size="sm" className="w-full" onClick={createPhoneModel} disabled={!newModelName.trim() || !newModelBrandId || quickCreating !== null}>
                                  {quickCreating === 'model' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                  Add model
                                </Button>
                              </div>

                              <div className="space-y-2 rounded-lg border p-3">
                                <Label>New case type</Label>
                                <Input value={newCoverTypeName} onChange={(event) => setNewCoverTypeName(event.target.value)} placeholder="e.g. Silicone Case" />
                                <Input type="number" min="0" step="0.01" value={newCoverTypePrice} onChange={(event) => setNewCoverTypePrice(event.target.value)} placeholder="Default price" />
                                <Button type="button" size="sm" className="w-full" onClick={createPhoneCoverType} disabled={!newCoverTypeName.trim() || newCoverTypePrice === '' || quickCreating !== null}>
                                  {quickCreating === 'type' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                  Add case type
                                </Button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Label>Product Images</Label>
                      <p className="text-xs text-muted-foreground">
                        Add up to {MAX_PRODUCT_IMAGES} images. The first image is the primary product image.
                      </p>
                    </div>
                    {images.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearImages}
                        disabled={saving || uploading}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove all
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Input 
                      type="file" 
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      disabled={uploading || saving || images.length >= MAX_PRODUCT_IMAGES}
                    />

                    {images.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {images.map((image, index) => (
                          <div
                            key={`${image}-${index}`}
                            className="overflow-hidden rounded-xl border bg-muted/30"
                          >
                            <div className="relative aspect-square bg-muted">
                              <img
                                src={image}
                                alt={`${name || 'Product'} image ${index + 1}`}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = 'none';
                                  event.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden h-full w-full items-center justify-center">
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                              </div>
                              {index === 0 && (
                                <Badge className="absolute left-2 top-2 gap-1 shadow-sm">
                                  <Star className="h-3 w-3 fill-current" />
                                  Primary
                                </Badge>
                              )}
                              <Badge variant="secondary" className="absolute right-2 top-2">
                                {index + 1}/{images.length}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between gap-1 p-2">
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => moveImage(index, -1)}
                                  disabled={index === 0 || saving || uploading}
                                  title="Move image left"
                                  aria-label={`Move image ${index + 1} left`}
                                >
                                  <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => moveImage(index, 1)}
                                  disabled={index === images.length - 1 || saving || uploading}
                                  title="Move image right"
                                  aria-label={`Move image ${index + 1} right`}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => makePrimaryImage(index)}
                                  disabled={index === 0 || saving || uploading}
                                  title="Make primary image"
                                  aria-label={`Make image ${index + 1} primary`}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-destructive hover:text-destructive"
                                  onClick={() => removeImage(index)}
                                  disabled={saving || uploading}
                                  title="Remove image"
                                  aria-label={`Remove image ${index + 1}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {uploading && (
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Uploading product images...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch checked={canAddText} onCheckedChange={setCanAddText} />
                    <Label className="text-sm">Allow Custom Text</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={canAddImage}
                      onCheckedChange={(checked) => {
                        setCanAddImage(checked);
                        if (!checked) setPhoneRequiresImage(false);
                      }}
                    />
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

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                  <Button 
                    type="submit" 
                    className="min-h-11 flex-1"
                    disabled={
                      saving ||
                      uploading ||
                      phoneCatalogLoading ||
                      !name.trim() ||
                      !price ||
                      !category ||
                      (isPhoneCase && phoneCoverTypeId === 'none')
                    }
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingProduct ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingProduct
                        ? isPhoneCase ? 'Update Phone Case' : 'Update Product'
                        : isPhoneCase ? 'Create Phone Case' : 'Create Product'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 w-full sm:w-auto"
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
            <>
              <div className="hidden rounded-md border md:block">
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
                            disabled={phoneCatalogLoading && normalizeProductCategory(p.category) === 'phone-cover'}
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

              <div className="space-y-3 md:hidden">
                {products.map((p) => {
                  const productImage = getProductImage(p);
                  return (
                    <article key={p.id} className="rounded-xl border bg-card p-4 shadow-sm">
                      <div className="flex min-w-0 items-start gap-3">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={p.name}
                            className="h-16 w-16 shrink-0 rounded-lg border object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-7 w-7 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words font-semibold leading-tight">{p.name}</h3>
                          <p className="mt-1 break-words text-xs capitalize text-muted-foreground">
                            {p.category || 'Uncategorized'}
                          </p>
                          <div className="mt-2 flex flex-wrap items-baseline gap-2">
                            <span className="font-mono font-bold">₹{p.price}</span>
                            {p.original_price && (
                              <span className="text-xs text-muted-foreground line-through">₹{p.original_price}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge variant={p.stock > 0 ? 'default' : 'destructive'}>
                          {p.stock === 0 ? 'Out of Stock' : `${p.stock} available`}
                        </Badge>
                        <Badge
                          variant={p.is_active ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(p)}
                        >
                          {p.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
                        <Button
                          variant="outline"
                          className="min-h-11"
                          onClick={() => populateForm(p)}
                          disabled={phoneCatalogLoading && normalizeProductCategory(p.category) === 'phone-cover'}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="min-h-11 text-destructive hover:text-destructive"
                          onClick={() => {
                            setProductToDelete(p);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
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
