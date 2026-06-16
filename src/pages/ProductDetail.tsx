import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, ShoppingBag, Plus, Minus, Upload, Type
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
import axios from 'axios';

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center">
        <div>Product not found</div>
      </div>
    );
  }

  // ✅ Perfect Product → WishlistItem mapper
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
    const token = localStorage.getItem('token');

    setUploading(true);
    try {
      const res = await axios.post(`https://api.thedesignhive.tech/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = res.data.imageUrl;
      setImageUrl(uploadedUrl);
      setUploadedImage(uploadedUrl);
      toast({ title: 'Image uploaded successfully' });
    } catch (err: any) {
      toast({ 
        title: 'Upload failed', 
        description: err.response?.data?.error || err.message,
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
      image: product.images[0] || '/placeholder.svg',
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Product Image */}
            <div className="aspect-square rounded-3xl overflow-hidden glass-card">
              <img
                src={product.images[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Header with wishlist */}
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-xl transition-all ${
                    isInWishlist(product.id)
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                      : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                  }`}
                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Description & Price */}
              <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
              
              <div className="space-y-2">
                <div className="text-4xl font-bold text-foreground">
                  ₹{product.price.toLocaleString()}
                </div>
                {product.originalPrice && (
                  <div className="text-xl text-muted-foreground line-through">
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
