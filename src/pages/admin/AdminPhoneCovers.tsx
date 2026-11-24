import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Layers, Loader2, Package, Pencil, Plus, Settings2, Trash2 } from 'lucide-react';
import { apiFetch, endpoints } from '@/lib/api';
import type {
  PhoneCoverCatalogProduct,
  PhoneCoverPageSettings,
  PhoneCoverProductModel,
} from '@/lib/phoneCoverCatalog';

interface Brand {
  id: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  is_active?: boolean | number;
  sort_order?: number;
}

interface Model {
  id: string;
  brand_id: string;
  name: string;
  brand_name?: string;
  image_url?: string | null;
  release_year?: number | null;
  is_active?: boolean | number;
  sort_order?: number;
}

interface CoverType {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  image_url?: string | null;
  is_active?: boolean | number;
  sort_order?: number;
}

const DEFAULT_SETTINGS: PhoneCoverPageSettings = {
  hero_badge: 'Phone Cover Studio',
  hero_title: 'Design Your Phone Cover',
  hero_description: 'Choose a product, phone model and cover type, then upload your design.',
  instructions_title: 'Special Instructions',
  instructions_text: 'Upload a high-resolution image and keep important details away from the edges.',
  max_upload_mb: 10,
  min_image_width: 1200,
  min_image_height: 1600,
  is_enabled: true,
};

const AdminPhoneCovers = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [coverTypes, setCoverTypes] = useState<CoverType[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<PhoneCoverCatalogProduct[]>([]);
  const [settings, setSettings] = useState<PhoneCoverPageSettings>(DEFAULT_SETTINGS);

  /* ---- Brand form ---- */
  const [brandDialog, setBrandDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [brandActive, setBrandActive] = useState(true);
  const [brandSortOrder, setBrandSortOrder] = useState('0');

  /* ---- Model form ---- */
  const [modelDialog, setModelDialog] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelName, setModelName] = useState('');
  const [modelBrandId, setModelBrandId] = useState('');
  const [modelImageUrl, setModelImageUrl] = useState('');
  const [modelReleaseYear, setModelReleaseYear] = useState('');
  const [modelActive, setModelActive] = useState(true);
  const [modelSortOrder, setModelSortOrder] = useState('0');

  /* ---- Cover type form ---- */
  const [coverDialog, setCoverDialog] = useState(false);
  const [editingCover, setEditingCover] = useState<CoverType | null>(null);
  const [coverName, setCoverName] = useState('');
  const [coverDescription, setCoverDescription] = useState('');
  const [coverPrice, setCoverPrice] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverActive, setCoverActive] = useState(true);
  const [coverSortOrder, setCoverSortOrder] = useState('0');

  /* ---- Model ↔ cover type mapping ---- */
  const [mappingDialog, setMappingDialog] = useState(false);
  const [mappingModel, setMappingModel] = useState<Model | null>(null);
  const [mappingIds, setMappingIds] = useState<string[]>([]);
  const [mappingLoading, setMappingLoading] = useState(false);

  /* ---- Product catalog configuration ---- */
  const [productDialog, setProductDialog] = useState(false);
  const [editingCatalogProduct, setEditingCatalogProduct] = useState<PhoneCoverCatalogProduct | null>(null);
  const [productCoverTypeId, setProductCoverTypeId] = useState('none');
  const [productModelOptions, setProductModelOptions] = useState<PhoneCoverProductModel[]>([]);
  const [productFeatured, setProductFeatured] = useState(false);
  const [productRequiresImage, setProductRequiresImage] = useState(true);
  const [productSortOrder, setProductSortOrder] = useState('0');

  const loadAll = async () => {
    try {
      const [brandRows, modelRows, coverRows, productRows, settingsRow] = await Promise.all([
        apiFetch<Brand[]>(endpoints.admin.phoneCover.brands),
        apiFetch<Model[]>(endpoints.admin.phoneCover.models),
        apiFetch<CoverType[]>(endpoints.admin.phoneCover.coverTypes),
        apiFetch<PhoneCoverCatalogProduct[]>(endpoints.admin.phoneCover.catalogProducts),
        apiFetch<PhoneCoverPageSettings>(endpoints.admin.phoneCover.settings),
      ]);
      setBrands(brandRows);
      setModels(modelRows);
      setCoverTypes(coverRows);
      setCatalogProducts(productRows);
      setSettings({ ...DEFAULT_SETTINGS, ...settingsRow, is_enabled: Boolean(settingsRow.is_enabled) });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* ================= BRANDS ================= */

  const openCreateBrand = () => {
    setEditingBrand(null);
    setBrandName('');
    setBrandDescription('');
    setBrandLogoUrl('');
    setBrandActive(true);
    setBrandSortOrder('0');
    setBrandDialog(true);
  };

  const openEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandDescription(brand.description || '');
    setBrandLogoUrl(brand.logo_url || '');
    setBrandActive(brand.is_active !== 0 && brand.is_active !== false);
    setBrandSortOrder(String(brand.sort_order || 0));
    setBrandDialog(true);
  };

  const submitBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBrand) {
        await apiFetch(endpoints.admin.phoneCover.brand, {
          args: [editingBrand.id],
          method: 'PUT',
          body: JSON.stringify({
            name: brandName,
            description: brandDescription,
            logo_url: brandLogoUrl,
            is_active: brandActive,
            sort_order: Number(brandSortOrder) || 0,
          }),
        });
        toast({ title: 'Brand updated' });
      } else {
        await apiFetch(endpoints.admin.phoneCover.brands, {
          method: 'POST',
          body: JSON.stringify({
            name: brandName,
            description: brandDescription,
            logo_url: brandLogoUrl,
            is_active: brandActive,
            sort_order: Number(brandSortOrder) || 0,
          }),
        });
        toast({ title: 'Brand created' });
      }
      setBrandDialog(false);
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteBrand = async (brand: Brand) => {
    if (!confirm(`Delete "${brand.name}" and all its models? This cannot be undone.`)) return;
    try {
      await apiFetch(endpoints.admin.phoneCover.brand, {
        args: [brand.id],
        method: 'DELETE',
      });
      toast({ title: 'Brand deleted' });
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  /* ================= MODELS ================= */

  const openCreateModel = () => {
    setEditingModel(null);
    setModelName('');
    setModelBrandId(brands[0]?.id || '');
    setModelImageUrl('');
    setModelReleaseYear('');
    setModelActive(true);
    setModelSortOrder('0');
    setModelDialog(true);
  };

  const openEditModel = (model: Model) => {
    setEditingModel(model);
    setModelName(model.name);
    setModelBrandId(model.brand_id);
    setModelImageUrl(model.image_url || '');
    setModelReleaseYear(model.release_year ? String(model.release_year) : '');
    setModelActive(model.is_active !== 0 && model.is_active !== false);
    setModelSortOrder(String(model.sort_order || 0));
    setModelDialog(true);
  };

  const submitModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelBrandId) {
      toast({ title: 'Select a brand', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: modelName,
        brand_id: modelBrandId,
        image_url: modelImageUrl,
        release_year: modelReleaseYear ? Number(modelReleaseYear) : null,
        is_active: modelActive,
        sort_order: Number(modelSortOrder) || 0,
      };
      if (editingModel) {
        await apiFetch(endpoints.admin.phoneCover.model, {
          args: [editingModel.id],
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Model updated' });
      } else {
        await apiFetch(endpoints.admin.phoneCover.models, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Model created' });
      }
      setModelDialog(false);
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteModel = async (model: Model) => {
    if (!confirm(`Delete "${model.name}"? This cannot be undone.`)) return;
    try {
      await apiFetch(endpoints.admin.phoneCover.model, {
        args: [model.id],
        method: 'DELETE',
      });
      toast({ title: 'Model deleted' });
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  /* ================= COVER TYPES ================= */

  const openCreateCover = () => {
    setEditingCover(null);
    setCoverName('');
    setCoverDescription('');
    setCoverPrice('');
    setCoverImageUrl('');
    setCoverActive(true);
    setCoverSortOrder('0');
    setCoverDialog(true);
  };

  const openEditCover = (cover: CoverType) => {
    setEditingCover(cover);
    setCoverName(cover.name);
    setCoverDescription(cover.description || '');
    setCoverPrice(String(cover.price));
    setCoverImageUrl(cover.image_url || '');
    setCoverActive(cover.is_active !== 0 && cover.is_active !== false);
    setCoverSortOrder(String(cover.sort_order || 0));
    setCoverDialog(true);
  };

  const submitCover = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: coverName,
        description: coverDescription,
        price: Number(coverPrice),
        image_url: coverImageUrl,
        is_active: coverActive,
        sort_order: Number(coverSortOrder) || 0,
      };
      if (editingCover) {
        await apiFetch(endpoints.admin.phoneCover.coverType, {
          args: [editingCover.id],
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Cover type updated' });
      } else {
        await apiFetch(endpoints.admin.phoneCover.coverTypes, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Cover type created' });
      }
      setCoverDialog(false);
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteCover = async (cover: CoverType) => {
    if (!confirm(`Delete "${cover.name}"? This cannot be undone.`)) return;
    try {
      await apiFetch(endpoints.admin.phoneCover.coverType, {
        args: [cover.id],
        method: 'DELETE',
      });
      toast({ title: 'Cover type deleted' });
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  /* ================= MAPPING ================= */

  const openMapping = async (model: Model) => {
    setMappingModel(model);
    setMappingDialog(true);
    setMappingLoading(true);
    try {
      const ids = await apiFetch<string[]>(endpoints.admin.phoneCover.modelCoverTypes, {
        args: [model.id],
      });
      setMappingIds(Array.isArray(ids) ? ids : []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setMappingLoading(false);
    }
  };

  const toggleMapping = (coverTypeId: string, checked: boolean) => {
    setMappingIds((prev) =>
      checked ? [...prev, coverTypeId] : prev.filter((id) => id !== coverTypeId)
    );
  };

  const saveMapping = async () => {
    if (!mappingModel) return;
    setSaving(true);
    try {
      await apiFetch(endpoints.admin.phoneCover.modelCoverTypes, {
        args: [mappingModel.id],
        method: 'PUT',
        body: JSON.stringify({ coverTypeIds: mappingIds }),
      });
      toast({ title: 'Cover types updated' });
      setMappingDialog(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openCatalogProduct = (product: PhoneCoverCatalogProduct) => {
    setEditingCatalogProduct(product);
    setProductCoverTypeId(product.cover_type_id || 'none');
    setProductModelOptions(
      product.models?.length
        ? product.models.map((model) => ({ ...model }))
        : (product.supported_model_ids || []).map((model_id) => ({ model_id })),
    );
    setProductFeatured(Boolean(product.is_featured));
    setProductRequiresImage(product.requires_image !== false);
    setProductSortOrder(String(product.sort_order || 0));
    setProductDialog(true);
  };

  const toggleProductModel = (modelId: string, checked: boolean) => {
    setProductModelOptions((current) =>
      checked
        ? current.some((option) => option.model_id === modelId)
          ? current
          : [...current, { model_id: modelId }]
        : current.filter((option) => option.model_id !== modelId),
    );
  };

  const updateProductModelOption = (
    modelId: string,
    field: 'sku' | 'price_override' | 'stock_override',
    value: string,
  ) => {
    setProductModelOptions((current) => current.map((option) => {
      if (option.model_id !== modelId) return option;
      if (field === 'sku') return { ...option, sku: value || null };
      return {
        ...option,
        [field]: value === '' ? null : Number(value),
      };
    }));
  };

  const saveCatalogProduct = async () => {
    if (!editingCatalogProduct) return;
    setSaving(true);
    try {
      await apiFetch(endpoints.admin.phoneCover.catalogProduct, {
        args: [editingCatalogProduct.id],
        method: 'PUT',
        body: JSON.stringify({
          ...editingCatalogProduct,
          original_price: editingCatalogProduct.original_price || null,
          cover_type_id: productCoverTypeId === 'none' ? null : productCoverTypeId,
          requires_image: productRequiresImage,
          is_featured: productFeatured,
          sort_order: Number(productSortOrder) || 0,
          models: productModelOptions,
          is_active: editingCatalogProduct.is_active !== false,
          customization_options: { canAddImage: true },
        }),
      });
      toast({ title: 'Catalog product updated' });
      setProductDialog(false);
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiFetch(endpoints.admin.phoneCover.settings, {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      toast({ title: 'Customizer page settings updated' });
      await loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Phone Covers</h1>
          <p className="text-muted-foreground">
            Manage products, compatibility, brands, models, cover types, and customer-facing page content.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mr-3 text-primary" />
            <span>Loading catalog...</span>
          </div>
        ) : (
          <Tabs defaultValue="products" className="min-w-0">
            <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <TabsList className="w-max min-w-full justify-start sm:min-w-0">
                <TabsTrigger value="products" className="shrink-0">Products ({catalogProducts.length})</TabsTrigger>
                <TabsTrigger value="brands" className="shrink-0">Brands ({brands.length})</TabsTrigger>
                <TabsTrigger value="models" className="shrink-0">Models ({models.length})</TabsTrigger>
                <TabsTrigger value="cover-types" className="shrink-0">Cover Types ({coverTypes.length})</TabsTrigger>
                <TabsTrigger value="settings" className="shrink-0">Page Settings</TabsTrigger>
              </TabsList>
            </div>

            {/* ---------- Catalog products ---------- */}
            <TabsContent value="products">
              <Card>
                <CardHeader className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Phone-cover Catalog</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Products here are shared by the shop and phone-cover customizer.
                    </p>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <Link to="/admin/products">
                      <Plus className="mr-2 h-4 w-4" />
                      Add or edit product
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {catalogProducts.map((product) => (
                      <article key={product.id} className="overflow-hidden rounded-xl border bg-card">
                        <div className="flex gap-4 p-4">
                          <img
                            src={product.preview_image_url || product.images[0] || '/placeholder.svg'}
                            alt=""
                            className="h-20 w-20 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="break-words font-semibold">{product.name}</h3>
                              {product.is_featured && <Badge>Featured</Badge>}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {product.cover_type_name || 'No cover type'} · ₹{Number(product.price).toFixed(2)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {product.supported_model_ids.length || 'All'} compatible models
                            </p>
                          </div>
                        </div>
                        <div className="border-t p-3">
                          <Button variant="outline" className="w-full" onClick={() => openCatalogProduct(product)}>
                            <Package className="mr-2 h-4 w-4" />
                            Configure catalog & compatibility
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {catalogProducts.length === 0 && (
                    <div className="rounded-xl border border-dashed p-10 text-center">
                      <Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                      <p className="font-medium">No phone-cover products yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Create a product in Products Management and choose Phone Covers as its category.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------- Brands ---------- */}
            <TabsContent value="brands">
              <Card>
                <CardHeader className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Brands</CardTitle>
                  <Button className="w-full sm:w-auto" onClick={openCreateBrand}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Brand
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="hidden md:block">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Models</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {models.filter((m) => m.brand_id === brand.id).length}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-1">
                            <Button size="icon" variant="ghost" onClick={() => openEditBrand(brand)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteBrand(brand)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {brands.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            No brands yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-3 md:hidden">
                    {brands.map((brand) => (
                      <article key={brand.id} className="rounded-xl border p-4 shadow-sm">
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words font-semibold">{brand.name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {models.filter((m) => m.brand_id === brand.id).length} models
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {models.filter((m) => m.brand_id === brand.id).length}
                          </Badge>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
                          <Button variant="outline" className="min-h-11" onClick={() => openEditBrand(brand)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="min-h-11 text-destructive hover:text-destructive"
                            onClick={() => deleteBrand(brand)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </article>
                    ))}
                    {brands.length === 0 && (
                      <p className="py-8 text-center text-muted-foreground">No brands yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------- Models ---------- */}
            <TabsContent value="models">
              <Card>
                <CardHeader className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Models</CardTitle>
                  <Button className="w-full sm:w-auto" onClick={openCreateModel} disabled={brands.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Model
                  </Button>
                </CardHeader>
                <CardContent>
                  {brands.length === 0 && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a brand first before adding models.
                    </p>
                  )}
                  <div className="hidden md:block">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="w-44">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell>{model.brand_name || '-'}</TableCell>
                          <TableCell className="space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openMapping(model)}
                            >
                              <Layers className="w-4 h-4 mr-1" />
                              Cover types
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => openEditModel(model)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteModel(model)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {models.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            No models yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-3 md:hidden">
                    {models.map((model) => (
                      <article key={model.id} className="rounded-xl border p-4 shadow-sm">
                        <div className="min-w-0">
                          <h3 className="break-words font-semibold">{model.name}</h3>
                          <p className="mt-1 break-words text-sm text-muted-foreground">
                            {model.brand_name || 'No brand'}
                          </p>
                        </div>
                        <div className="mt-4 space-y-2 border-t pt-4">
                          <Button
                            variant="outline"
                            className="min-h-11 w-full"
                            onClick={() => openMapping(model)}
                          >
                            <Layers className="mr-2 h-4 w-4" />
                            Cover types
                          </Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="min-h-11" onClick={() => openEditModel(model)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              className="min-h-11 text-destructive hover:text-destructive"
                              onClick={() => deleteModel(model)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))}
                    {models.length === 0 && (
                      <p className="py-8 text-center text-muted-foreground">No models yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------- Cover types ---------- */}
            <TabsContent value="cover-types">
              <Card>
                <CardHeader className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Cover Types</CardTitle>
                  <Button className="w-full sm:w-auto" onClick={openCreateCover}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cover Type
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="hidden md:block">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coverTypes.map((cover) => (
                        <TableRow key={cover.id}>
                          <TableCell className="font-medium">{cover.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {cover.description || '-'}
                          </TableCell>
                          <TableCell className="font-mono">
                            ₹{Number(cover.price).toFixed(2)}
                          </TableCell>
                          <TableCell className="space-x-1">
                            <Button size="icon" variant="ghost" onClick={() => openEditCover(cover)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteCover(cover)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {coverTypes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No cover types yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-3 md:hidden">
                    {coverTypes.map((cover) => (
                      <article key={cover.id} className="rounded-xl border p-4 shadow-sm">
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="break-words font-semibold">{cover.name}</h3>
                            <p className="mt-1 break-words text-sm text-muted-foreground">
                              {cover.description || 'No description'}
                            </p>
                          </div>
                          <span className="shrink-0 font-mono font-semibold">
                            ₹{Number(cover.price).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
                          <Button variant="outline" className="min-h-11" onClick={() => openEditCover(cover)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="min-h-11 text-destructive hover:text-destructive"
                            onClick={() => deleteCover(cover)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </article>
                    ))}
                    {coverTypes.length === 0 && (
                      <p className="py-8 text-center text-muted-foreground">No cover types yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------- Customer page settings ---------- */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Customizer Page Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                    <div>
                      <p className="font-medium">Customizer enabled</p>
                      <p className="text-sm text-muted-foreground">Turn off the public phone-cover customizer temporarily.</p>
                    </div>
                    <Switch
                      checked={settings.is_enabled}
                      onCheckedChange={(checked) => setSettings((current) => ({ ...current, is_enabled: checked }))}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="settings-badge">Hero badge</Label>
                      <Input id="settings-badge" value={settings.hero_badge} onChange={(event) => setSettings((current) => ({ ...current, hero_badge: event.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="settings-title">Hero title</Label>
                      <Input id="settings-title" value={settings.hero_title} onChange={(event) => setSettings((current) => ({ ...current, hero_title: event.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="settings-description">Hero description</Label>
                    <Textarea id="settings-description" value={settings.hero_description} onChange={(event) => setSettings((current) => ({ ...current, hero_description: event.target.value }))} />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="settings-instructions-title">Instructions title</Label>
                      <Input id="settings-instructions-title" value={settings.instructions_title} onChange={(event) => setSettings((current) => ({ ...current, instructions_title: event.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="settings-max-upload">Maximum upload size (MB)</Label>
                      <Input id="settings-max-upload" type="number" min="1" value={settings.max_upload_mb} onChange={(event) => setSettings((current) => ({ ...current, max_upload_mb: Number(event.target.value) || 1 }))} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="settings-instructions">Upload instructions</Label>
                    <Textarea id="settings-instructions" value={settings.instructions_text} onChange={(event) => setSettings((current) => ({ ...current, instructions_text: event.target.value }))} />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="settings-min-width">Recommended minimum width</Label>
                      <Input id="settings-min-width" type="number" min="1" value={settings.min_image_width} onChange={(event) => setSettings((current) => ({ ...current, min_image_width: Number(event.target.value) || 1 }))} />
                    </div>
                    <div>
                      <Label htmlFor="settings-min-height">Recommended minimum height</Label>
                      <Input id="settings-min-height" type="number" min="1" value={settings.min_image_height} onChange={(event) => setSettings((current) => ({ ...current, min_image_height: Number(event.target.value) || 1 }))} />
                    </div>
                  </div>

                  <Button onClick={saveSettings} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save page settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* ---------- Catalog product dialog ---------- */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure {editingCatalogProduct?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label>Cover type</Label>
              <Select value={productCoverTypeId} onValueChange={setProductCoverTypeId}>
                <SelectTrigger><SelectValue placeholder="Select cover type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific cover type</SelectItem>
                  {coverTypes.map((cover) => (
                    <SelectItem key={cover.id} value={cover.id}>{cover.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center justify-between gap-3 rounded-xl border p-4">
                <span>
                  <span className="block font-medium">Featured</span>
                  <span className="block text-xs text-muted-foreground">Show before other catalog products</span>
                </span>
                <Switch checked={productFeatured} onCheckedChange={setProductFeatured} />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border p-4">
                <span>
                  <span className="block font-medium">Image required</span>
                  <span className="block text-xs text-muted-foreground">Customer must upload a design</span>
                </span>
                <Switch checked={productRequiresImage} onCheckedChange={setProductRequiresImage} />
              </label>
            </div>

            <div>
              <Label htmlFor="product-sort-order">Display order</Label>
              <Input id="product-sort-order" type="number" value={productSortOrder} onChange={(event) => setProductSortOrder(event.target.value)} />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <Label>Compatible phone models</Label>
                  <p className="text-xs text-muted-foreground">Leave all unchecked to make this product available for every model.</p>
                </div>
                {productModelOptions.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setProductModelOptions([])}>Clear all</Button>
                )}
              </div>
              <div className="max-h-72 space-y-4 overflow-y-auto rounded-xl border p-3">
                {brands.map((brand) => {
                  const brandModels = models.filter((model) => model.brand_id === brand.id);
                  if (!brandModels.length) return null;
                  return (
                    <div key={brand.id}>
                      <p className="mb-2 text-sm font-semibold">{brand.name}</p>
                      <div className="space-y-2">
                        {brandModels.map((model) => {
                          const option = productModelOptions.find((entry) => entry.model_id === model.id);
                          return (
                            <div key={model.id} className="rounded-lg border p-3 hover:bg-muted/30">
                              <label className="flex cursor-pointer items-center gap-3">
                                <Checkbox
                                  checked={Boolean(option)}
                                  onCheckedChange={(checked) => toggleProductModel(model.id, checked === true)}
                                />
                                <span className="text-sm font-medium">{model.name}</span>
                              </label>
                              {option && (
                                <div className="mt-3 grid gap-2 pl-7 sm:grid-cols-3">
                                  <Input
                                    aria-label={`${model.name} SKU`}
                                    placeholder="SKU (optional)"
                                    value={option.sku || ''}
                                    onChange={(event) => updateProductModelOption(model.id, 'sku', event.target.value)}
                                  />
                                  <Input
                                    aria-label={`${model.name} price override`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Price override"
                                    value={option.price_override ?? ''}
                                    onChange={(event) => updateProductModelOption(model.id, 'price_override', event.target.value)}
                                  />
                                  <Input
                                    aria-label={`${model.name} stock override`}
                                    type="number"
                                    min="0"
                                    placeholder="Stock override"
                                    value={option.stock_override ?? ''}
                                    onChange={(event) => updateProductModelOption(model.id, 'stock_override', event.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {models.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Create phone models first.</p>}
              </div>
            </div>

            <Button className="w-full" onClick={saveCatalogProduct} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save catalog configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- Brand dialog ---------- */}
      <Dialog open={brandDialog} onOpenChange={setBrandDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitBrand} className="space-y-4">
            <div>
              <Label htmlFor="brand-name">Brand name</Label>
              <Input
                id="brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Apple"
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="brand-description">Description</Label>
              <Textarea id="brand-description" value={brandDescription} onChange={(event) => setBrandDescription(event.target.value)} placeholder="Short customer-facing brand description" />
            </div>
            <div>
              <Label htmlFor="brand-logo">Logo URL</Label>
              <Input id="brand-logo" value={brandLogoUrl} onChange={(event) => setBrandLogoUrl(event.target.value)} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-[1fr_auto] items-end gap-4">
              <div>
                <Label htmlFor="brand-sort">Display order</Label>
                <Input id="brand-sort" type="number" value={brandSortOrder} onChange={(event) => setBrandSortOrder(event.target.value)} />
              </div>
              <label className="flex h-10 items-center gap-2 rounded-md border px-3">
                <Switch checked={brandActive} onCheckedChange={setBrandActive} />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={saving || !brandName.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingBrand ? 'Update Brand' : 'Create Brand'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------- Model dialog ---------- */}
      <Dialog open={modelDialog} onOpenChange={setModelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModel ? 'Edit Model' : 'Add Model'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitModel} className="space-y-4">
            <div>
              <Label>Brand</Label>
              <Select value={modelBrandId} onValueChange={setModelBrandId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="model-name">Model name</Label>
              <Input
                id="model-name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. iPhone 15"
                required
              />
            </div>
            <div>
              <Label htmlFor="model-image">Device image URL</Label>
              <Input id="model-image" value={modelImageUrl} onChange={(event) => setModelImageUrl(event.target.value)} placeholder="https://..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="model-year">Release year</Label>
                <Input id="model-year" type="number" min="2000" max="2100" value={modelReleaseYear} onChange={(event) => setModelReleaseYear(event.target.value)} placeholder="2026" />
              </div>
              <div>
                <Label htmlFor="model-sort">Display order</Label>
                <Input id="model-sort" type="number" value={modelSortOrder} onChange={(event) => setModelSortOrder(event.target.value)} />
              </div>
            </div>
            <label className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Visible to customers</span>
              <Switch checked={modelActive} onCheckedChange={setModelActive} />
            </label>
            <Button
              type="submit"
              className="w-full"
              disabled={saving || !modelName.trim() || !modelBrandId}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingModel ? 'Update Model' : 'Create Model'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------- Cover type dialog ---------- */}
      <Dialog open={coverDialog} onOpenChange={setCoverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCover ? 'Edit Cover Type' : 'Add Cover Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCover} className="space-y-4">
            <div>
              <Label htmlFor="cover-name">Name</Label>
              <Input
                id="cover-name"
                value={coverName}
                onChange={(e) => setCoverName(e.target.value)}
                placeholder="e.g. Hard Plastic Case"
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="cover-description">Description</Label>
              <Textarea
                id="cover-description"
                value={coverDescription}
                onChange={(e) => setCoverDescription(e.target.value)}
                placeholder="Short description shown to customers"
              />
            </div>
            <div>
              <Label htmlFor="cover-price">Price (₹)</Label>
              <Input
                id="cover-price"
                type="number"
                step="0.01"
                min="0"
                value={coverPrice}
                onChange={(e) => setCoverPrice(e.target.value)}
                placeholder="299"
                required
              />
            </div>
            <div>
              <Label htmlFor="cover-image">Cover type image URL</Label>
              <Input id="cover-image" value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-[1fr_auto] items-end gap-4">
              <div>
                <Label htmlFor="cover-sort">Display order</Label>
                <Input id="cover-sort" type="number" value={coverSortOrder} onChange={(event) => setCoverSortOrder(event.target.value)} />
              </div>
              <label className="flex h-10 items-center gap-2 rounded-md border px-3">
                <Switch checked={coverActive} onCheckedChange={setCoverActive} />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={saving || !coverName.trim() || coverPrice === ''}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCover ? 'Update Cover Type' : 'Create Cover Type'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------- Mapping dialog ---------- */}
      <Dialog open={mappingDialog} onOpenChange={setMappingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Cover types for {mappingModel?.name}
            </DialogTitle>
          </DialogHeader>

          {mappingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : coverTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No cover types available. Create cover types first.
            </p>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {coverTypes.map((cover) => (
                <label
                  key={cover.id}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                >
                  <Checkbox
                    checked={mappingIds.includes(cover.id)}
                    onCheckedChange={(checked) => toggleMapping(cover.id, checked === true)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{cover.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{Number(cover.price).toFixed(2)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <Button className="min-h-11 w-full" onClick={saveMapping} disabled={saving || mappingLoading}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPhoneCovers;
