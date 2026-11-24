import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Heart, ShoppingBag, Plus, Minus, Upload, Type
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { ProductDetailSkeleton } from '@/components/ui/product-skeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useProduct, useProducts, Product } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore, WishlistItem } from '@/store/wishlistStore';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { apiUpload, endpoints } from '@/lib/api';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { isInWishlist, toggleItem } = useWishlistStore();

  // All state properly defined
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [customText, setCustomText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <ProductDetailSkeleton />
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-dvh min-h-dvh items-center justify-center px-4">
        <div>Product not found</div>
      </div>
    );
  }

  const galleryImages = product.images.filter(
    (image) => typeof image === 'string' && image.trim().length > 0,
  );
  if (!galleryImages.length) galleryImages.push('/placeholder.svg');

  const selectedProductImage =
    galleryImages[selectedImageIndex] || galleryImages[0] || '/placeholder.svg';

  const showPreviousImage = () => {
    setSelectedImageIndex((current) =>
      (current - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const showNextImage = () => {
    setSelectedImageIndex((current) => (current + 1) % galleryImages.length);
  };

  const handleGalleryTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleGalleryTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = touchStartX.current - touchEndX;
    touchStartX.current = null;

    if (Math.abs(distance) < 45 || galleryImages.length < 2) return;
    if (distance > 0) showNextImage();
    else showPreviousImage();
  };

  const productToWishlistItem = (p: Product): WishlistItem => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images[0] || '/placeholder.svg',
    category: p.category,
  });

  const handleWishlistToggle = () => {
    const wishlistItem = productToWishlistItem(product);
    toggleItem(wishlistItem);
    toast({
      title: isInWishlist(product.id) 
        ? 'Removed from wishlist' 
        : 'Added to wishlist',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await apiUpload<{ imageUrl: string }>(endpoints.upload, formData);

      const uploadedUrl = res.imageUrl;
      setUploadedImage(uploadedUrl);
      toast({ title: 'Image uploaded successfully' });
    } catch (err: unknown) {
      toast({ 
        title: 'Upload failed', 
        description: getErrorMessage(err),
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: galleryImages[0] || '/placeholder.svg',
      customization: {
        text: customText || undefined,
        color: selectedColor || undefined,
        imageUrl: uploadedImage || undefined,
      },
    });
    openCart();
    toast({ title: `Added ${quantity} item(s) to cart` });
  };

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const isCustomizable = product.customizationOptions?.canAddText || 
                        product.customizationOptions?.canAddImage;

  return (
    <div className="min-h-dvh min-h-dvh overflow-x-clip bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pb-12 pt-20 sm:pb-16 sm:pt-24">
        <div className="container mx-auto px-3 min-[360px]:px-4 lg:px-8">
          <Link 
            to="/shop" 
            className="mb-6 inline-flex min-h-11 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
            {/* Product image gallery */}
            <div className="min-w-0 space-y-3">
              <div
                className="glass-card relative aspect-square min-w-0 touch-pan-y select-none overflow-hidden rounded-2xl sm:rounded-3xl"
                onTouchStart={handleGalleryTouchStart}
                onTouchEnd={handleGalleryTouchEnd}
                aria-label={`${product.name} image gallery`}
              >
                <motion.img
                  key={selectedProductImage}
                  src={selectedProductImage}
                  alt={`${product.name} - image ${selectedImageIndex + 1}`}
                  className="h-full w-full object-cover"
                  initial={{ opacity: 0.45 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  draggable={false}
                  onError={(event) => {
                    event.currentTarget.src = '/placeholder.svg';
                  }}
                />

                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-lg backdrop-blur transition hover:bg-background"
                      aria-label="Show previous product image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-lg backdrop-blur transition hover:bg-background"
                      aria-label="Show next product image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-3 right-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold shadow backdrop-blur">
                      {selectedImageIndex + 1} / {galleryImages.length}
                    </div>
                  </>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Choose product image">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-24 ${
                        selectedImageIndex === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      aria-label={`Show product image ${index + 1}`}
                      aria-current={selectedImageIndex === index ? 'true' : undefined}
                    >
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                        draggable={false}
                        onError={(event) => {
                          event.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="min-w-0 space-y-5 sm:space-y-6">
              {/* Header with wishlist */}
              <div className="flex min-w-0 items-start justify-between gap-3">
                <h1 className="min-w-0 break-words text-2xl font-bold leading-tight min-[360px]:text-3xl">{product.name}</h1>
                <button
                  onClick={handleWishlistToggle}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isInWishlist(product.id)
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                      : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                  }`}
                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-label={`${isInWishlist(product.id) ? 'Remove' : 'Add'} ${product.name} ${isInWishlist(product.id) ? 'from' : 'to'} wishlist`}
                  aria-pressed={isInWishlist(product.id)}
                >
                  <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Description & Price */}
              <p className="break-words text-base leading-relaxed text-muted-foreground sm:text-lg">{product.description}</p>
              
              <div className="space-y-2">
                <div className="break-words text-3xl font-bold text-foreground min-[360px]:text-4xl">
                  ₹{product.price.toLocaleString()}
                </div>
                {product.originalPrice && (
                <div className="break-words text-lg text-muted-foreground line-through min-[360px]:text-xl">
                    ₹{product.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Customization */}
              {isCustomizable && (
                <div className="p-6 glass-card rounded-2xl space-y-4">
                  {product.customizationOptions?.canAddText && (
                    <div>
                      <label className="flex items-center gap-2 mb-3 font-medium">
                        <Type className="w-4 h-4" />
                        Custom Text
                      </label>
                      <input
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter your custom text (max 50 chars)..."
                        maxLength={50}
                      />
                    </div>
                  )}

                  {product.customizationOptions?.canAddImage && (
                    <div>
                      <label className="flex items-center gap-2 mb-3 font-medium block">
                        <Upload className="w-4 h-4" />
                        Upload Your Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="uploadImg"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="uploadImg"
                        className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary ${
                          uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading ? (
                          <>
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <span className="text-muted-foreground">Uploading...</span>
                          </>
                        ) : uploadedImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={uploadedImage}
                              alt="preview"
                              className="w-32 h-32 object-cover rounded-xl border-2 border-primary shadow-md"
                            />
                            <span className="text-green-600 font-medium">✅ Ready to customize</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                            <div className="space-y-1">
                              <p className="font-medium">Click to upload image</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG (max 5MB)</p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center bg-background border rounded-xl p-2 space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted rounded-lg transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-16 text-center font-mono text-xl font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted rounded-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-2xl font-bold text-primary">
                  ₹{(product.price * quantity).toLocaleString()}
                </div>
              </div>

              {/* Add to Cart */}
              <motion.button
                onClick={handleAddToCart}
                disabled={uploading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all border-0"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag className="w-6 h-6" />
                Add {quantity > 1 ? `${quantity}x ` : ''}to Cart
              </motion.button>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="text-2xl font-bold mb-8">You might also like</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}

          <ProductReviews productId={product.id} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
