import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Loader2, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

export const CouponInput = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getTotalPrice,
    getDiscount,
  } = useCartStore();

  const { toast } = useToast();

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      toast({
        title: 'Enter Coupon Code',
        description: 'Please enter a valid coupon code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // ✅ FIXED: Match backend route /coupons/validate/:code
     const res = await fetch(
  `http://localhost:5000/coupons/validate/${code.toUpperCase().trim()}`
);


      if (!res.ok) {
        throw new Error('Invalid coupon');
      }

      const coupon = await res.json();

      const now = new Date();

      // Validity dates
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        throw new Error('Coupon not active yet');
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        throw new Error('Coupon expired');
      }

      // Usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        throw new Error('Coupon usage limit reached');
      }

      // Minimum order
      const subtotal = getTotalPrice();
      if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
        throw new Error(
          `Minimum order of ₹${coupon.min_order_amount} required`
        );
      }

      applyCoupon({
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        maxDiscount: coupon.max_discount || undefined,
        description: coupon.description || undefined,
      });

      setCode('');

      toast({
        title: 'Coupon Applied! 🎉',
        description:
          coupon.description || `${coupon.code} has been applied to your order.`,
      });
    } catch (err: any) {
      toast({
        title: 'Invalid Coupon',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(true);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast({
      title: 'Coupon Removed',
      description: 'The coupon has been removed from your order.',
    });
  };

  const discount = getDiscount();

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {appliedCoupon ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-green-500 text-sm">
                  {appliedCoupon.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  {appliedCoupon.discountType === 'free_shipping'
                    ? 'Free Shipping'
                    : `Saving ₹${discount.toFixed(2)}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent focus:outline-none transition-colors text-sm uppercase"
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApplyCoupon}
              disabled={loading}
              className="px-4 py-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
