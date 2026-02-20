import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Upload, ShoppingBag, Check, X,
  Search, ChevronDown, Sparkles, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

export function PhoneCoverCustomizer() {

  const API = "http://localhost:5000/api";

  const [uploading, setUploading] = useState(false);

  // 🔥 Dynamic Data
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [coverTypes, setCoverTypes] = useState<any[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedCoverType, setSelectedCoverType] = useState<string>('');

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const { toast } = useToast();

  // ============================
  // 🔥 LOAD BRANDS
  // ============================
  useEffect(() => {
    fetch(`${API}/brands`)
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(() => toast({ title: "Failed to load brands", variant: "destructive" }));
  }, []);

  // ============================
  // 🔥 LOAD MODELS
  // ============================
  useEffect(() => {
    if (!selectedBrand) return;

    fetch(`${API}/models/${selectedBrand}`)
      .then(res => res.json())
      .then(data => {
        setModels(data);
        setSelectedModel('');
        setSelectedCoverType('');
      });
  }, [selectedBrand]);

  // ============================
  // 🔥 LOAD COVER TYPES
  // ============================
  useEffect(() => {
    if (!selectedModel) return;

    fetch(`${API}/cover-types/${selectedModel}`)
      .then(res => res.json())
      .then(data => {
        setCoverTypes(data);
        setSelectedCoverType('');
      });
  }, [selectedModel]);

  const selectedBrandData = brands.find(b => b.id === selectedBrand);
  const selectedModelData = models.find(m => m.id === selectedModel);
  const selectedCoverData = coverTypes.find(c => c.id === selectedCoverType);

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  // ============================
  // IMAGE UPLOAD
  // ============================
  const handleImageUpload = useCallback(async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      setUploadedImage(data.imageUrl);

      toast({
        title: "Image uploaded successfully",
        description: "Your design is ready!"
      });

    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [toast]);

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddToCart = () => {
    if (!selectedBrand || !selectedModel || !selectedCoverType) {
      toast({
        title: "Select Complete Details",
        description: "Please select brand, model and cover type",
        variant: "destructive"
      });
      return;
    }

    if (!uploadedImage) {
      toast({
        title: "Upload Image",
        description: "Please upload an image",
        variant: "destructive"
      });
      return;
    }

    const customText = `Custom Phone Cover: ${selectedBrandData?.name} ${selectedModelData?.name}, ${selectedCoverData?.name}`;

    addItem({
      productId: "customize-phone-cover",
      name: "Custom Phone Cover",
      price: Number(selectedCoverData?.price || 0),
      quantity: 1,
      image: uploadedImage,
      customization: {
        text: customText,
        imageUrl: uploadedImage,
        color: selectedCoverType,
      },
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      openCart();
    }, 1500);
  };

  const isComplete = selectedBrand && selectedModel && selectedCoverType && uploadedImage;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="order-2 lg:order-1"
        >
          <div className="bg-card border border-border p-6 rounded-3xl sticky top-24">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-accent" />
              Cover Preview
            </h3>

            {/* Phone Cover Preview */}
            <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded-3xl overflow-hidden relative flex items-center justify-center">
              {uploadedImage ? (
                <div className="w-full h-full relative">
                  <img
                    src={uploadedImage}
                    alt="Cover design"
                    className="w-full h-full object-cover"
                  />
                  {/* Phone frame overlay */}
                  <div className="absolute inset-0 border-[12px] border-black/20 rounded-3xl pointer-events-none" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/30 rounded-full" />
                </div>
              ) : (
                <div className="text-center p-8">
                  <Smartphone className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Upload an image to see preview</p>
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {(selectedBrand || selectedModel) && (
              <div className="mt-4 p-4 bg-muted/30 rounded-xl space-y-2">
                {selectedBrand && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Brand:</span>
                 <span className="font-medium">{selectedBrandData?.name}</span>

                  </div>
                )}
                {selectedModel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{selectedModelData?.name}</span>

                  </div>
                )}
                {selectedCoverData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cover Type:</span>
                    <span className="font-medium">{selectedCoverData.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Price & Add to Cart */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Price</span>
                <span className="text-3xl font-bold">₹{selectedCoverData?.price || 299}</span>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!isComplete}
                className="w-full h-14 text-lg bg-accent-gradient hover:opacity-90"
              >
                {showSuccess ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Right: Configuration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="order-1 lg:order-2 space-y-6"
        >
          {/* Step 1: Select Brand */}
          <div className="bg-card border border-border p-6 rounded-2xl" style={{ overflow: 'visible' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">1</div>
              <h3 className="font-semibold">Select Phone Brand</h3>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowBrandDropdown(!showBrandDropdown);
                  setShowModelDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 border border-border rounded-xl hover:border-accent transition-colors"
              >
                <span className={selectedBrand ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedBrandData?.name || 'Choose brand...'}

                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showBrandDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showBrandDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute w-full mt-2 rounded-xl shadow-2xl overflow-hidden border border-border"
                    style={{
                      zIndex: 9999,
                      isolation: 'isolate',
                      backgroundColor: 'hsl(240 10% 8%)',
                      backdropFilter: 'none'
                    }}
                  >
                    <div className="p-2 border-b border-border" style={{ backgroundColor: 'hsl(240 10% 8%)' }}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search brands..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto" style={{ backgroundColor: 'hsl(240 10% 8%)' }}>
                      {filteredBrands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => {
                            setSelectedBrand(brand.id);
                            setSelectedModel('');
                            setShowBrandDropdown(false);
                            setBrandSearch('');
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between text-foreground ${selectedBrand === brand.id ? 'bg-accent/10 text-accent' : ''
                            }`}
                        >
                          <span>{brand.name}</span>
                          <span className="text-xs text-muted-foreground">Brand</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Step 2: Select Model */}
          <div className={`bg-card border border-border p-6 rounded-2xl transition-opacity ${!selectedBrand ? 'opacity-50 pointer-events-none' : ''}`} style={{ overflow: 'visible' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">2</div>
              <h3 className="font-semibold">Select Phone Model</h3>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowModelDropdown(!showModelDropdown);
                  setShowBrandDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 border border-border rounded-xl hover:border-accent transition-colors"
              >
                <span className={selectedModel ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedModelData?.name || 'Choose model...'}

                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showModelDropdown && selectedBrandData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute w-full mt-2 rounded-xl shadow-2xl overflow-hidden border border-border"
                    style={{
                      zIndex: 9999,
                      isolation: 'isolate',
                      backgroundColor: 'hsl(240 10% 8%)',
                      backdropFilter: 'none'
                    }}
                  >
                    <div className="p-2 border-b border-border" style={{ backgroundColor: 'hsl(240 10% 8%)' }}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search models..."
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto" style={{ backgroundColor: 'hsl(240 10% 8%)' }}>
                      {filteredModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setShowModelDropdown(false);
                            setModelSearch('');
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors text-foreground ${selectedModel === model.id ? 'bg-accent/10 text-accent' : ''
                            }`}
                        >
                          {model.name}
                        </button>
                      ))}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Step 3: Select Cover Type */}
          <div className={`bg-card border border-border p-6 rounded-2xl transition-opacity ${!selectedModel ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">3</div>
              <h3 className="font-semibold">Select Cover Type</h3>
            </div>

            <RadioGroup
              value={selectedCoverType}
              onValueChange={setSelectedCoverType}
              className="grid gap-3"
            >
              {coverTypes.map((cover) => (
                <Label
                  key={cover.id}
                  htmlFor={cover.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedCoverType === cover.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-muted-foreground/50'
                    }`}
                >
                  <RadioGroupItem value={cover.id} id={cover.id} />
                  <div className="flex-1">
                    <p className="font-medium">{cover.name}</p>
                    <p className="text-sm text-muted-foreground">{cover.description}</p>
                  </div>
                  <span className="font-bold text-accent">₹{cover.price}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Step 4: Upload Image */}
          <div className={`bg-card border border-border p-6 rounded-2xl transition-opacity ${!selectedModel ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">4</div>
              <h3 className="font-semibold">Upload Your Photo</h3>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full aspect-video object-contain rounded-xl bg-muted/30"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Change
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-all"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Click or drag to upload</p>
                <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </button>
            )}

            <div className="mt-4 p-3 bg-accent/10 rounded-lg">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>For best results, use high-resolution images (at least 1200x1600 pixels). Your design will be printed edge-to-edge on the cover.</span>
              </p>
            </div>
          </div>

          {/* Step 5: Special Instructions */}
          <div className={`bg-card border border-border p-6 rounded-2xl transition-opacity ${!selectedModel ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">5</div>
              <h3 className="font-semibold">Special Instructions (Optional)</h3>
            </div>

            <Textarea
              placeholder="Add any special instructions for your order (e.g., specific placement, color adjustments, text to add...)"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 500))}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />

            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <p className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Tell us how you'd like your design customized
              </p>
              <span>{specialInstructions.length}/500</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
