import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, FileText, ShoppingBag, Sparkles, Smartphone, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { apiFetch, apiUpload, endpoints } from '@/lib/api';
import productPhoneFallback from '@/assets/product-phone.jpg';
import type {
  PhoneCoverBrand,
  PhoneCoverCatalogProduct,
  PhoneCoverModel,
  PhoneCoverPageSettings,
  PhoneCoverType,
} from '@/lib/phoneCoverCatalog';

interface PhoneCoverCustomizerProps {
  product?: PhoneCoverCatalogProduct | null;
  initialBrandId?: string;
  initialModelId?: string;
  settings?: PhoneCoverPageSettings;
}

export function PhoneCoverCustomizer({
  product,
  initialBrandId = '',
  initialModelId = '',
  settings,
}: PhoneCoverCustomizerProps) {
  const [uploading, setUploading] = useState(false);
  const [brands, setBrands] = useState<PhoneCoverBrand[]>([]);
  const [models, setModels] = useState<PhoneCoverModel[]>([]);
  const [coverTypes, setCoverTypes] = useState<PhoneCoverType[]>([]);
  const [selectedBrand, setSelectedBrand] = useState(initialBrandId);
  const [selectedModel, setSelectedModel] = useState(initialModelId);
  const [selectedCoverType, setSelectedCoverType] = useState(product?.cover_type_id || '');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const { toast } = useToast();

  useEffect(() => {
    apiFetch<PhoneCoverBrand[]>(endpoints.phoneCover.brands)
      .then(setBrands)
      .catch(() => toast({ title: 'Failed to load phone brands', variant: 'destructive' }));
  }, [toast]);

  useEffect(() => {
    if (initialBrandId) setSelectedBrand(initialBrandId);
    if (initialModelId) setSelectedModel(initialModelId);
  }, [initialBrandId, initialModelId]);

  useEffect(() => {
    setSelectedCoverType(product?.cover_type_id || '');
    setUploadedImage(null);
    setSpecialInstructions('');
  }, [product?.id, product?.cover_type_id]);

  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel('');
      setCoverTypes([]);
      setSelectedCoverType('');
      return;
    }

    apiFetch<PhoneCoverModel[]>(endpoints.phoneCover.models, { args: [selectedBrand] })
      .then((modelRows) => {
        const supportedIds = new Set(product?.supported_model_ids || []);
        const compatibleRows = supportedIds.size
          ? modelRows.filter((model) => supportedIds.has(model.id))
          : modelRows;
        setModels(compatibleRows);
        setSelectedModel((current) => {
          const preferred = initialModelId || current;
          return compatibleRows.some((model) => model.id === preferred) ? preferred : '';
        });
        setSelectedCoverType('');
      })
      .catch(() => {
        setModels([]);
        toast({ title: 'Failed to load phone models', variant: 'destructive' });
      });
  }, [initialModelId, product, selectedBrand, toast]);

  useEffect(() => {
    if (!selectedModel) {
      setCoverTypes([]);
      setSelectedCoverType('');
      return;
    }

    apiFetch<PhoneCoverType[]>(endpoints.phoneCover.coverTypes, { args: [selectedModel] })
      .then((rows) => {
        let compatibleRows = product?.cover_type_id
          ? rows.filter((cover) => cover.id === product.cover_type_id)
          : rows;
        if (product?.cover_type_id && compatibleRows.length === 0) {
          compatibleRows = [{
            id: product.cover_type_id,
            name: product.cover_type_name || 'Phone Cover',
            description: product.description,
            price: product.price,
          }];
        }
        setCoverTypes(compatibleRows);
        setSelectedCoverType(
          compatibleRows.some((cover) => cover.id === product?.cover_type_id)
            ? product?.cover_type_id || ''
            : compatibleRows.length === 1
              ? compatibleRows[0].id
              : '',
        );
      })
      .catch(() => {
        setCoverTypes([]);
        toast({ title: 'Failed to load compatible case types', variant: 'destructive' });
      });
  }, [product, selectedModel, toast]);

  const selectedBrandData = brands.find((brand) => brand.id === selectedBrand);
  const selectedModelData = models.find((model) => model.id === selectedModel);
  const selectedCoverData = coverTypes.find((cover) => cover.id === selectedCoverType);
  const selectedProductModel = product?.models.find((model) => model.model_id === selectedModel);
  const selectedPrice = Number(
    selectedProductModel?.price_override ?? product?.price ?? selectedCoverData?.price ?? 0,
  );
  const availableStock = Number(
    selectedProductModel?.stock_override ?? product?.stock ?? 1,
  );
  const previewImage = uploadedImage || product?.preview_image_url || product?.images?.[0] || productPhoneFallback;
  const allowsImage =
    product?.customization_options?.canAddImage ??
    product?.customization_options?.allowImage ??
    true;
  const requiresImage = allowsImage && (product?.requires_image ?? true);
  const instructionStep = allowsImage ? 4 : 3;

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxUploadMb = settings?.max_upload_mb || 10;
    if (file.size > maxUploadMb * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Please upload an image under ${maxUploadMb}MB`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const data = await apiUpload<{ imageUrl: string }>(endpoints.upload, formData);
      setUploadedImage(data.imageUrl);
      toast({ title: 'Image uploaded', description: 'Your preview is ready.' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }, [settings?.max_upload_mb, toast]);

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddToCart = () => {
    if (!selectedBrand || !selectedModel || !selectedCoverType) {
      toast({
        title: 'Complete your phone details',
        description: 'Select the brand, model, and compatible case type.',
        variant: 'destructive',
      });
      return;
    }
    if (requiresImage && !uploadedImage) {
      toast({
        title: 'Upload your design',
        description: 'This product requires an image before it can be added to the cart.',
        variant: 'destructive',
      });
      return;
    }
    if (availableStock <= 0) {
      toast({
        title: 'Out of stock',
        description: 'This cover is not available for the selected model.',
        variant: 'destructive',
      });
      return;
    }

    const summary = `${selectedBrandData?.name} ${selectedModelData?.name} · ${selectedCoverData?.name}`;
    addItem({
      productId: product?.id || 'customize-phone-cover',
      name: product?.name || 'Custom Phone Cover',
      price: selectedPrice,
      quantity: 1,
      image: uploadedImage || previewImage || '/placeholder.svg',
      customization: {
        text: summary,
        imageUrl: uploadedImage || undefined,
        ...(product ? {} : { color: selectedCoverType }),
        brand: selectedBrandData?.name,
        brandId: selectedBrand,
        model: selectedModelData?.name,
        modelId: selectedModel,
        coverType: selectedCoverData?.name,
        coverTypeId: selectedCoverType,
        specialInstructions: specialInstructions.trim() || undefined,
      },
    });

    setShowSuccess(true);
    window.setTimeout(() => {
      setShowSuccess(false);
      openCart();
    }, 900);
  };

  const isComplete = Boolean(
    selectedBrand &&
    selectedModel &&
    selectedCoverType &&
    (!requiresImage || uploadedImage) &&
    availableStock > 0,
  );

  const completionHint = !selectedBrand
    ? 'Select your phone brand to begin.'
    : !selectedModel
      ? 'Now choose the exact phone model.'
      : !selectedCoverType
        ? 'Choose an available case type.'
        : requiresImage && !uploadedImage
          ? 'Upload your design to continue.'
          : availableStock <= 0
            ? 'This option is currently out of stock.'
            : 'Everything looks good.';

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-2 lg:order-1 lg:sticky lg:top-24"
        >
          <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="relative aspect-[4/3] max-h-[380px] bg-muted/40 p-5 sm:p-6">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={product?.name || 'Phone cover preview'}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = productPhoneFallback;
                  }}
                  className="h-full w-full rounded-2xl object-contain"
                />
              ) : (
                <div className="grid h-full place-items-center text-center text-muted-foreground">
                  <div>
                    <Smartphone className="mx-auto mb-3 h-14 w-14 opacity-40" />
                    <p>Product preview</p>
                  </div>
                </div>
              )}
              {uploadedImage && (
                <span className="absolute bottom-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold shadow backdrop-blur">
                  Your uploaded design
                </span>
              )}
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {product?.cover_type_name || 'Phone cover'}
                </p>
                <h3 className="mt-1 line-clamp-2 text-xl font-bold">{product?.name || 'Custom Phone Cover'}</h3>
              </div>

              {(selectedBrandData || selectedModelData || selectedCoverData) && (
                <div className="flex flex-wrap gap-2">
                  {selectedBrandData && <span className="rounded-full bg-muted px-3 py-1 text-xs">{selectedBrandData.name}</span>}
                  {selectedModelData && <span className="rounded-full bg-muted px-3 py-1 text-xs">{selectedModelData.name}</span>}
                  {selectedCoverData && <span className="rounded-full bg-muted px-3 py-1 text-xs">{selectedCoverData.name}</span>}
                </div>
              )}

              <div className="flex items-end justify-between gap-4 border-t pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">₹{selectedPrice.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!isComplete}
                className="h-12 w-full text-base"
              >
                {showSuccess ? (
                  <><Check className="mr-2 h-5 w-5" />Added to cart</>
                ) : (
                  <><ShoppingBag className="mr-2 h-5 w-5" />Add to cart</>
                )}
              </Button>
              <p className={`text-center text-xs ${isComplete ? 'text-accent' : 'text-muted-foreground'}`}>
                {completionHint}
              </p>
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-1 space-y-4 lg:order-2"
        >
          <section className="rounded-2xl border bg-card p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-bold text-accent-foreground">1</span>
              <div>
                <h3 className="font-semibold">Choose your phone</h3>
                <p className="text-xs text-muted-foreground">We will only show compatible models.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>Brand</span>
                <select
                  value={selectedBrand}
                  onChange={(event) => {
                    setSelectedBrand(event.target.value);
                    setSelectedModel('');
                    setSelectedCoverType('');
                  }}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Model</span>
                <select
                  value={selectedModel}
                  disabled={!selectedBrand}
                  onChange={(event) => setSelectedModel(event.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select model</option>
                  {models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section className={`rounded-2xl border bg-card p-4 transition-opacity sm:p-6 ${!selectedModel ? 'pointer-events-none opacity-50' : ''}`}>
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-bold text-accent-foreground">2</span>
              <div>
                <h3 className="font-semibold">Confirm case type</h3>
                <p className="text-xs text-muted-foreground">Availability can differ by phone model.</p>
              </div>
            </div>

            {coverTypes.length === 1 ? (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-accent/40 bg-accent/5 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{coverTypes[0].name}</p>
                  {coverTypes[0].description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{coverTypes[0].description}</p>
                  )}
                </div>
                <Check className="h-5 w-5 shrink-0 text-accent" />
              </div>
            ) : coverTypes.length > 1 ? (
              <RadioGroup value={selectedCoverType} onValueChange={setSelectedCoverType} className="grid gap-3">
                {coverTypes.map((cover) => (
                  <Label
                    key={cover.id}
                    htmlFor={cover.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${selectedCoverType === cover.id ? 'border-accent bg-accent/5' : 'hover:border-accent/40'}`}
                  >
                    <RadioGroupItem value={cover.id} id={cover.id} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{cover.name}</p>
                      {cover.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{cover.description}</p>}
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            ) : (
              <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Select a phone model to load its case type.</p>
            )}
          </section>

          {allowsImage && (
            <section className={`rounded-2xl border bg-card p-4 transition-opacity sm:p-6 ${!selectedModel ? 'pointer-events-none opacity-50' : ''}`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-bold text-accent-foreground">3</span>
                <div>
                  <h3 className="font-semibold">Upload your design {requiresImage ? '' : '(optional)'}</h3>
                  <p className="text-xs text-muted-foreground">Use a clear, high-resolution JPG or PNG.</p>
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {uploadedImage ? (
                <div className="relative overflow-hidden rounded-xl border bg-muted/30 p-3">
                  <img src={uploadedImage} alt="Uploaded design" className="aspect-video w-full rounded-lg object-contain" />
                  <div className="absolute right-5 top-5 flex gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-1 h-4 w-4" />Change
                    </Button>
                    <Button type="button" size="icon" variant="destructive" onClick={removeImage} aria-label="Remove uploaded image">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full rounded-xl border-2 border-dashed p-7 text-center transition hover:border-accent/60 hover:bg-accent/5 disabled:opacity-60"
                >
                  {uploading ? <Sparkles className="mx-auto mb-3 h-9 w-9 animate-pulse text-accent" /> : <Upload className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />}
                  <p className="font-medium">{uploading ? 'Uploading…' : 'Choose an image'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Up to {settings?.max_upload_mb || 10}MB</p>
                </button>
              )}
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                {settings?.instructions_text || `Recommended size: ${settings?.min_image_width || 1200} × ${settings?.min_image_height || 1600}px.`}
              </p>
            </section>
          )}

          <section className={`rounded-2xl border bg-card p-4 transition-opacity sm:p-6 ${!selectedModel ? 'pointer-events-none opacity-50' : ''}`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-bold text-accent-foreground">{instructionStep}</span>
              <div>
                <h3 className="font-semibold">Order notes <span className="font-normal text-muted-foreground">(optional)</span></h3>
                <p className="text-xs text-muted-foreground">Add placement or printing instructions for our team.</p>
              </div>
            </div>
            <Textarea
              placeholder="For example: keep faces centered and avoid cropping the top edge."
              value={specialInstructions}
              onChange={(event) => setSpecialInstructions(event.target.value.slice(0, 500))}
              className="min-h-24 resize-none"
              maxLength={500}
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />Shared with production</span>
              <span>{specialInstructions.length}/500</span>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
