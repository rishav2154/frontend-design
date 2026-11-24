import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Loader2, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { apiFetch, endpoints } from '@/lib/api';

export const CouponInput = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    appliedCoupon,
    appliedCoupons,
    applyCoupon,
    removeCoupon,
    getTotalPrice,
    getDiscount,
  } = useCartStore();

  const { toast } = useToast();
  const activeCoupons = appliedCoupons.length
    ? appliedCoupons
    : appliedCoupon
      ? [appliedCoupon]
      : [];

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      toast({
        title: 'Enter Coupon Code',
        description: 'Please enter a valid coupon code.',
        variant: 'destructive',
      });
      return;
    }

    const normalizedCode = code.toUpperCase().trim();
    if (activeCoupons.some((coupon) => coupon.code.toUpperCase() === normalizedCode)) {
      toast({ title: 'Coupon already applied', description: `${normalizedCode} is already active.` });
      return;
    }
    if (activeCoupons.length >= 5) {
      toast({ title: 'Coupon limit reached', description: 'You can apply up to five coupons.' });
      return;
    }

    setLoading(true);

    try {
      // ✅ FIXED: Match backend route /coupons/validate/:code
      const coupon = await apiFetch(endpoints.coupons.validate, {
        args: [normalizedCode],
      });

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
      setLoading(false);
    }
  };

  const handleRemoveCoupon = (couponCode: string) => {
    removeCoupon(couponCode);
    toast({
      title: 'Coupon Removed',
      description: 'The coupon has been removed from your order.',
    });
  };

  const couponSaving = (coupon: typeof activeCoupons[number]) => {
    const subtotal = getTotalPrice();
    if (coupon.discountType === 'free_shipping') return 'Free Shipping';
    if (coupon.discountType === 'percentage') {
      const amount = subtotal * coupon.discountValue / 100;
      return `Saving ₹${(coupon.maxDiscount ? Math.min(amount, coupon.maxDiscount) : amount).toFixed(2)}`;
    }
    return `Saving ₹${Math.min(coupon.discountValue, subtotal).toFixed(2)}`;
  };

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {activeCoupons.map((coupon) => (
          <motion.div
            key={coupon.code}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="break-all text-sm font-medium text-green-500">
                  {coupon.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  {couponSaving(coupon)}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRemoveCoupon(coupon.code)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remove coupon ${coupon.code}`}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {activeCoupons.length < 5 && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex min-w-0 flex-col gap-2 min-[380px]:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="min-h-11 w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 text-sm uppercase transition-colors focus:border-accent focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApplyCoupon}
              disabled={loading}
              className="min-h-11 w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50 min-[380px]:w-auto"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </motion.button>
          </motion.div>
      )}

      {activeCoupons.length > 1 && (
        <p className="text-xs text-muted-foreground">
          {activeCoupons.length} coupons applied · Total saving ₹{getDiscount().toFixed(2)}
        </p>
      )}
    </div>
  );
};
