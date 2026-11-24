import { lazy, Suspense, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Type, Palette, RotateCcw, ShoppingBag, 
  Coffee, Frame, Smartphone, Gift,
  Sparkles, Check, X, Move, ZoomIn, RotateCw,
  Minus, Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCartStore } from '@/store/cartStore';
import { Slider } from '@/components/ui/slider';

const ProductViewer3D = lazy(() => import('@/components/3d/ProductViewer3D'));
const MugCustomizer = lazy(() =>
  import('@/components/mug-editor/MugCustomizer').then((module) => ({
    default: module.MugCustomizer,
  })),
);

const EditorLoadingState = ({ compact = false }: { compact?: boolean }) => (
  <div
    className={`glass-card grid place-items-center rounded-3xl ${compact ? 'h-[340px] sm:min-h-[450px]' : 'min-h-[34rem]'}`}
    role="status"
    aria-label="Loading design preview"
  >
    <div className="h-12 w-12 animate-pulse rounded-full border border-accent/40 bg-accent/15" />
  </div>
);

const productTypes = [
  { id: 'mug', name: 'Magic Cup', icon: Coffee, price: 349 },
  { id: 'frame', name: 'Fibre Photo Frame 7x5', icon: Frame, price: 299 },
  { id: 'keychain-heart', name: 'Keychain Heart Shape', icon: Gift, price: 149 },
  { id: 'keychain-circle', name: 'Keychain Circle', icon: Gift, price: 129 },
  { id: 'keychain-square', name: 'Keychain Square', icon: Gift, price: 129 },
  { id: 'phone', name: 'Phone Cover', icon: Smartphone, price: 399 },
  { id: 'night-lamp', name: 'Night Lamp', icon: Sparkles, price: 599 },
  { id: 'frame-6x8', name: 'Fibre Photo Frame 6x8', icon: Frame, price: 349 },
  { id: 'keychain-cubes', name: 'Keychain Cubes', icon: Gift, price: 199 },
] as const;

const productColors = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Forest', value: '#166534' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Gold', value: '#ca8a04' },
];

const fonts = [
  { name: 'Modern', value: 'Poppins, sans-serif' },
  { name: 'Classic', value: 'Georgia, serif' },
  { name: 'Script', value: 'cursive' },
  { name: 'Bold', value: 'Impact, sans-serif' },
];

const textColors = [
  '#ffffff', '#000000', '#dc2626', '#2563eb', 
  '#16a34a', '#ca8a04', '#9333ea', '#ec4899'
];

type ProductType = typeof productTypes[number]['id'];

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const Customize = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('mug');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState(fonts[0].value);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeControl, setActiveControl] = useState<'position' | 'scale' | 'rotation'>('position');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image transform state
  const [imageTransform, setImageTransform] = useState<ImageTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const currentProduct = productTypes.find(p => p.id === selectedProduct)!;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setImageTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: `custom-${selectedProduct}-${Date.now()}`,
      name: `Custom ${currentProduct.name}`,
      price: currentProduct.price,
      quantity: 1,
      image: '/placeholder.svg',
      customization: {
        text: customText,
        imageUrl: uploadedImage || undefined,
        color: selectedColor,
      },
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      openCart();
    }, 1500);
  };

  const resetCustomization = () => {
    setCustomText('');
    setTextColor('#000000');
    setSelectedFont(fonts[0].value);
    setUploadedImage(null);
    setSelectedColor('#ffffff');
    setImageTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImageTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateTransform = (key: keyof ImageTransform, delta: number) => {
    setImageTransform(prev => ({
      ...prev,
      [key]: Math.max(
        key === 'scale' ? 0.3 : key === 'rotation' ? -180 : -1,
        Math.min(
          key === 'scale' ? 2 : key === 'rotation' ? 180 : 1,
          prev[key] + delta
        )
      )
    }));
  };

  const setTransformValue = (key: keyof ImageTransform, value: number) => {
    setImageTransform(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-20 pb-16">
        <div className="container mx-auto min-w-0 px-3 sm:px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 md:py-12"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Design Studio</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-bold">
              Create Your <span className="text-gradient-accent">Masterpiece</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Upload your photos, add text, and watch your design come to life in realistic 3D
            </p>
          </motion.div>

          {/* Magic Cup gets special Fabric.js + 3D editor */}
          {selectedProduct === 'mug' ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="min-w-0 lg:col-span-4"
            >
              <Suspense fallback={<EditorLoadingState />}>
                <MugCustomizer />
              </Suspense>
            </motion.div>
          ) : (
          /* Original layout for other products */
          <>
          <div className="grid min-w-0 gap-6 lg:grid-cols-5 lg:gap-8">
            {/* Left Sidebar - Product Selection (hidden since already shown above) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="min-w-0 lg:col-span-1"
            >
              <div className="glass-card rounded-2xl p-3 sm:p-4 lg:sticky lg:top-24">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  Select Product
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {productTypes.map((product) => {
                    const Icon = product.icon;
                    return (
                      <motion.button
                        key={product.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedProduct(product.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          selectedProduct === product.id
                            ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/25'
                            : 'bg-muted/50 hover:bg-muted text-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className={`text-xs ${selectedProduct === product.id ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
                            ₹{product.price}
                          </p>
                        </div>
                        {selectedProduct === product.id && (
                          <Check className="w-4 h-4" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Center - 3D Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="min-w-0 lg:col-span-2"
            >
              <div className="glass-card min-w-0 rounded-3xl p-3 sm:p-4 md:p-6">
                <div className="relative h-[340px] min-w-0 sm:h-auto sm:aspect-square">
                  <Suspense fallback={<EditorLoadingState compact />}>
                    <ProductViewer3D
                      productType={selectedProduct}
                      color={selectedColor}
                      customImage={uploadedImage}
                      customText={customText}
                      textColor={textColor}
                      fontFamily={selectedFont}
                      imageTransform={imageTransform}
                    />
                  </Suspense>
                </div>
                
                {/* Color Selection */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Product Color
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {productColors.map((color) => (
                      <motion.button
                        key={color.value}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.value
                            ? 'border-accent scale-110 shadow-lg'
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        aria-label={`Use ${color.name} product color`}
                        aria-pressed={selectedColor === color.value}
                      >
                        {selectedColor === color.value && (
                          <Check className={`w-4 h-4 mx-auto ${color.value === '#ffffff' || color.value === '#ca8a04' ? 'text-black' : 'text-white'}`} />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Sidebar - Customization Controls */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="min-w-0 space-y-4 lg:col-span-2"
            >
              {/* Image Upload */}
              <div className="glass-card min-w-0 rounded-2xl p-4 sm:p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-accent" />
                  Upload Your Photo
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {uploadedImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-full aspect-video object-contain rounded-xl bg-muted/50"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Change uploaded image"
                          title="Change uploaded image"
                          className="p-2 rounded-lg bg-accent text-accent-foreground"
                        >
                          <Upload className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={removeImage}
                          aria-label="Remove uploaded image"
                          title="Remove uploaded image"
                          className="p-2 rounded-lg bg-destructive text-destructive-foreground"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Image Position Controls */}
                    <div className="space-y-4 rounded-xl bg-muted/30 p-3 sm:p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Move className="w-4 h-4 text-accent" />
                          Image Controls
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(['position', 'scale', 'rotation'] as const).map((control) => (
                            <button
                              key={control}
                              onClick={() => setActiveControl(control)}
                              className={`flex min-h-10 items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                                activeControl === control 
                                  ? 'bg-accent text-accent-foreground' 
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {control === 'position' && <Move className="w-3 h-3" />}
                              {control === 'scale' && <ZoomIn className="w-3 h-3" />}
                              {control === 'rotation' && <RotateCw className="w-3 h-3" />}
                              <span className="capitalize">{control}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <AnimatePresence mode="wait">
                        {activeControl === 'position' && (
                          <motion.div
                            key="position"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-center">
                              <div className="grid grid-cols-3 gap-1">
                                <div />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateTransform('y', 0.1)}
                                  aria-label="Move image up"
                                  title="Move image up"
                                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </motion.button>
                                <div />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateTransform('x', -0.1)}
                                  aria-label="Move image left"
                                  title="Move image left"
                                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </motion.button>
                                <button
                                  onClick={() => setImageTransform(prev => ({ ...prev, x: 0, y: 0 }))}
                                  aria-label="Center image position"
                                  title="Center image position"
                                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/20 text-xs font-medium text-accent"
                                >
                                  ⊙
                                </button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateTransform('x', 0.1)}
                                  aria-label="Move image right"
                                  title="Move image right"
                                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </motion.button>
                                <div />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateTransform('y', -0.1)}
                                  aria-label="Move image down"
                                  title="Move image down"
                                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </motion.button>
                                <div />
                              </div>
                            </div>
                            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                              <span>X: {imageTransform.x.toFixed(1)}</span>
                              <span>Y: {imageTransform.y.toFixed(1)}</span>
                            </div>
                          </motion.div>
                        )}
                        
                        {activeControl === 'scale' && (
                          <motion.div
                            key="scale"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateTransform('scale', -0.1)}
                                aria-label="Shrink image"
                                title="Shrink image"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                <Minus className="w-4 h-4" />
                              </motion.button>
                              <div className="flex-1">
                                <Slider
                                  value={[imageTransform.scale]}
                                  min={0.3}
                                  max={2}
                                  step={0.05}
                                  onValueChange={([value]) => setTransformValue('scale', value)}
                                  className="w-full"
                                />
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateTransform('scale', 0.1)}
                                aria-label="Enlarge image"
                                title="Enlarge image"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <div className="text-center text-xs text-muted-foreground">
                              Scale: {(imageTransform.scale * 100).toFixed(0)}%
                            </div>
                          </motion.div>
                        )}
                        
                        {activeControl === 'rotation' && (
                          <motion.div
                            key="rotation"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateTransform('rotation', -15)}
                                aria-label="Rotate image counterclockwise"
                                title="Rotate image counterclockwise"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </motion.button>
                              <div className="flex-1">
                                <Slider
                                  value={[imageTransform.rotation]}
                                  min={-180}
                                  max={180}
                                  step={5}
                                  onValueChange={([value]) => setTransformValue('rotation', value)}
                                  className="w-full"
                                />
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateTransform('rotation', 15)}
                                aria-label="Rotate image clockwise"
                                title="Rotate image clockwise"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                <RotateCw className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                              {[-90, -45, 0, 45, 90].map((angle) => (
                                <button
                                  key={angle}
                                  onClick={() => setTransformValue('rotation', angle)}
                                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                                    imageTransform.rotation === angle 
                                      ? 'bg-accent text-accent-foreground' 
                                      : 'bg-muted hover:bg-muted/80'
                                  }`}
                                >
                                  {angle}°
                                </button>
                              ))}
                            </div>
                            <div className="text-center text-xs text-muted-foreground">
                              Rotation: {imageTransform.rotation}°
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-foreground font-medium">
                      Click to upload your image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </motion.button>
                )}
              </div>

              {/* Text Customization */}
              <div className="glass-card min-w-0 rounded-2xl p-4 sm:p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-accent" />
                  Add Custom Text
                </h3>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your message..."
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  maxLength={40}
                />
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {customText.length}/40 characters
                </p>

                {/* Font Selection */}
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Font Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {fonts.map((font) => (
                      <motion.button
                        key={font.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedFont(font.value)}
                        className={`p-3 rounded-xl text-sm transition-all ${
                          selectedFont === font.value
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Text Color</label>
                  <div className="flex flex-wrap gap-2">
                    {textColors.map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setTextColor(color)}
                        aria-label={`Use text color ${color}`}
                        aria-pressed={textColor === color}
                        title={`Text color ${color}`}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          textColor === color
                            ? 'border-accent scale-110'
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="glass-card min-w-0 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="text-2xl font-bold text-gradient-accent">
                      ₹{currentProduct.price}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetCustomization}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted transition-colors hover:bg-muted/80"
                    title="Reset Design"
                    aria-label="Reset customization"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={showSuccess}
                  className="w-full btn-luxury flex items-center justify-center gap-3 py-4 disabled:opacity-70"
                >
                  <AnimatePresence mode="wait">
                    {showSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Added to Cart!
                      </motion.div>
                    ) : (
                      <motion.div
                        key="add"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Add to Cart
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          </div>
          </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Customize;
