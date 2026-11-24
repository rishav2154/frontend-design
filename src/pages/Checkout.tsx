// Checkout.tsx (FULL FIXED WITH RAZORPAY + OTP, UI UNCHANGED)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CouponInput } from "@/components/cart/CouponInput";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { apiFetch, endpoints } from "@/lib/api";
import { BookMarked, Check } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {

  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    items,
    getTotalPrice,
    getDiscount,
    clearCart,
    appliedCoupon,
    appliedCoupons,
  } = useCartStore();


  const [checkingAuth, setCheckingAuth] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "partial" | "cod">("online");
  const [placingOrder, setPlacingOrder] = useState(false);

  // Temporary OTP bypass: set VITE_OTP_VERIFICATION_REQUIRED=false to let
  // customers order with just their phone number, without verification.
  const otpRequired =
    import.meta.env.VITE_OTP_VERIFICATION_REQUIRED !== "false";
  const phoneVerificationRequired = otpRequired && paymentMethod !== "cod";

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [address, setAddress] = useState({

    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: ""

  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string | null>(null);

  /* ===============================
     AUTH CHECK
  =============================== */

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token)
      navigate("/auth");

    else
      setCheckingAuth(false);

  }, [navigate]);
  // ===== FETCH SAVED ADDRESSES =====
  // ===== FETCH SAVED ADDRESSES (SECURE VERSION) =====
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await apiFetch(endpoints.addresses.list);
        setSavedAddresses(res || []);

        const defaultAddr = res?.find((a: any) => a.is_default === 1);
        if (defaultAddr) {
          selectSavedAddress(defaultAddr);
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      }
    };

    fetchAddresses();
  }, []);
  /* ===============================
     EMPTY CART CHECK
  =============================== */

  useEffect(() => {

    if (!checkingAuth &&
      items.length === 0)
      navigate("/cart");

  }, [items, checkingAuth, navigate]);


  const subtotal =
    getTotalPrice();

  const discount = getDiscount();
  const discountedSubtotal = subtotal - discount;
  const activeCoupons = appliedCoupons.length
    ? appliedCoupons
    : appliedCoupon
      ? [appliedCoupon]
      : [];
  const shipping = activeCoupons.some((coupon) => coupon.discountType === "free_shipping") || subtotal > 500 ? 0 : 50;
  const gst = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shipping + gst;


  /* ===============================
     LOAD RAZORPAY SCRIPT
  =============================== */

  const loadRazorpay = () => {

    return new Promise<boolean>((resolve) => {

      if (window.Razorpay)
        return resolve(true);

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload =
        () => resolve(true);

      script.onerror =
        () => resolve(false);

      document.body.appendChild(script);

    });

  };


  /* ===============================
     VALIDATE FORM
  =============================== */

  const validateForm = () => {

    if (
      !address.fullName ||
      !address.phone ||
      !address.addressLine1 ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {

      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });

      return false;

    }

    return true;

  };


  /* ===============================
     SEND OTP
  =============================== */

  const handleSendOtp = async () => {

    if (!address.phone)
      return toast({
        title: "Enter Phone Number",
        variant: "destructive"
      });

    setOtpLoading(true);

    try {

      await apiFetch(endpoints.checkout.sendOtp, {

        method: "POST",

        body: JSON.stringify({
          phone: address.phone
        })

      });

      setOtpSent(true);

      toast({
        title: "OTP sent successfully"
      });

    }
    catch (err: any) {

      toast({
        title: "Failed to send OTP",
        description: err.message,
        variant: "destructive"
      });

    }
    finally {

      setOtpLoading(false);

    }

  };


  /* ===============================
     VERIFY OTP
  =============================== */

  const handleVerifyOtp = async () => {

    if (!otp)
      return toast({
        title: "Enter OTP",
        variant: "destructive"
      });

    setOtpLoading(true);

    try {

      await apiFetch(endpoints.checkout.verifyOtp, {

        method: "POST",

        body: JSON.stringify({
          phone: address.phone,
          otp
        })

      });

      setPhoneVerified(true);

      toast({
        title: "Phone verified successfully ✅"
      });

    }
    catch (err: any) {

      toast({
        title: "OTP verification failed",
        description: err.message,
        variant: "destructive"
      });

    }
    finally {

      setOtpLoading(false);

    }

  };

  // ===== SELECT SAVED ADDRESS =====
  // ===== SELECT SAVED ADDRESS =====
  const selectSavedAddress = (addr: any) => {
    setSelectedSavedAddress(addr.id);

    setAddress({
      fullName: addr.full_name,
      phone: addr.phone || "",
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
  };
  /* ===============================
     RAZORPAY CHECKOUT (ONLINE / PARTIAL)
  =============================== */

  const PARTIAL_PREPAID_PERCENT = 50;

  const computeFinalAmount = () =>
    Number(total.toFixed(2));

  const handleRazorpayPayment = async (mode: "online" | "partial") => {

    const loaded =
      await loadRazorpay();

    if (!loaded) {

      toast({
        title: "Razorpay failed to load",
        variant: "destructive"
      });

      return;

    }

    try {
      /* ===============================
         CALCULATE PAYABLE AMOUNT
         partial = 50% advance, rest on delivery
      ================================ */

      const finalAmount = computeFinalAmount();

      const payableAmount = mode === "partial"
        ? Number((finalAmount * PARTIAL_PREPAID_PERCENT / 100).toFixed(2))
        : finalAmount;


      /* ===============================
         CREATE RAZORPAY ORDER
      ================================ */

      const razorpayOrder =
        await apiFetch(endpoints.checkout.createRazorpayOrder, {
          method: "POST",
          body: JSON.stringify({
            amount: payableAmount
          })
        });



      const options = {

        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: razorpayOrder.amount,

        currency: "INR",

        order_id: razorpayOrder.id,

        name: "Your Store",

        description: mode === "partial"
          ? "Partial Payment (50% advance)"
          : "Order Payment",

        prefill: {
          name: address.fullName,
          email: localStorage.getItem("userEmail") || "",
          contact: address.phone
        },

        notes: {
          phone: address.phone
        },

        theme: {
          color: "#6366f1"
        },

        handler: async (response: any) => {
          try {

            await apiFetch(endpoints.checkout.verifyPayment, {
              method: "POST",
              body: JSON.stringify(response)
            });

            const res = await apiFetch(endpoints.checkout.checkout, {
              method: "POST",
              body: JSON.stringify({
                items,
                shipping_address: {
                  full_name: address.fullName,
                  phone: address.phone,
                  address_line1: address.addressLine1,
                  address_line2: address.addressLine2,
                  city: address.city,
                  state: address.state,
                  pincode: address.pincode
                },
                coupon: activeCoupons[0]?.code || null,
                coupons: activeCoupons.map((coupon) => coupon.code),
                payment_method: mode,
                payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            clearCart();
            navigate(`/order-success/${res.order_id}`);

          } catch (err: any) {
            toast({
              title: "Payment verification failed",
              description: err.message,
              variant: "destructive"
            });
          }
        }

      };


      const rzp =
        new window.Razorpay(options);

      rzp.open();

    }
    catch (err: any) {

      toast({

        title: "Payment failed",

        description: err.message,

        variant: "destructive"

      });

    }

  };

  const handleCashOnDelivery = async () => {
    setPlacingOrder(true);
    try {
      const res = await apiFetch(endpoints.checkout.checkout, {
        method: "POST",
        body: JSON.stringify({
          items,
          shipping_address: {
            full_name: address.fullName,
            phone: address.phone,
            address_line1: address.addressLine1,
            address_line2: address.addressLine2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          },
          coupon: activeCoupons[0]?.code || null,
          coupons: activeCoupons.map((coupon) => coupon.code),
          payment_method: "cod",
        }),
      });

      clearCart();
      navigate(`/order-success/${res.order_id}`);
    } catch (err: any) {
      toast({
        title: "Could not place COD order",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setPlacingOrder(false);
    }
  };


  /* ===============================
     PLACE ORDER
  =============================== */

  const handlePlaceOrder = async () => {

    if (!validateForm()) return;

    if (phoneVerificationRequired && !phoneVerified)
      return toast({
        title: "Phone Not Verified",
        description: "Verify phone first",
        variant: "destructive"
      });


    if (paymentMethod === "online")
      return handleRazorpayPayment("online");

    if (paymentMethod === "partial")
      return handleRazorpayPayment("partial");

    if (paymentMethod === "cod")
      return handleCashOnDelivery();

  };


  /* ===============================
     LOADING SCREEN
  =============================== */

  if (checkingAuth)
    return (
      <div className="flex min-h-dvh min-h-dvh items-center justify-center px-4">
        <Loader2 className="animate-spin" />
      </div>
    );


  /* ===============================
     UI (UNCHANGED)
  =============================== */

  return (

    <div className="min-h-dvh min-h-dvh overflow-x-clip bg-gradient-to-br from-background via-background to-muted/30">

      <Navbar />
      <CartDrawer />

      <main className="container mx-auto max-w-7xl px-3 pb-12 pt-20 min-[360px]:px-4 sm:pb-16 sm:pt-24">

        <button
          onClick={() => navigate("/cart")}
          className="mb-6 flex min-h-11 items-center gap-2 text-muted-foreground transition hover:text-foreground sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>


        <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:gap-8">


          {/* ================= ADDRESS ================= */}

          <div className="glass-card min-w-0 rounded-2xl p-4 shadow-sm min-[360px]:p-5 sm:p-8 lg:col-span-2">
            {/* ================= SAVED ADDRESSES ================= */}
            {savedAddresses.length > 0 && (
              <div className="glass-card mb-6 min-w-0 rounded-2xl p-4 shadow-sm min-[360px]:p-5 sm:p-6">

                <div className="mb-5 flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
                    <BookMarked className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-semibold">Saved Addresses</h2>
                </div>

                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectSavedAddress(addr)}
                      className={`min-h-11 w-full rounded-xl border-2 p-3 text-left transition-all duration-200 min-[360px]:p-4 ${selectedSavedAddress === addr.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                        }`}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3 min-[360px]:gap-4">

                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium">{addr.full_name}</p>

                          <p className="mt-1 break-words text-xs text-muted-foreground">
                            {addr.address_line1}
                            {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                          </p>

                          <p className="break-words text-xs text-muted-foreground">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>

                          {addr.is_default === 1 && (
                            <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                              Default
                            </span>
                          )}
                        </div>

                        {selectedSavedAddress === addr.id && (
                          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-accent-foreground" />
                          </div>
                        )}

                      </div>
                    </button>
                  ))}

                  {/* ENTER NEW ADDRESS OPTION */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSavedAddress(null);
                      setAddress({
                        fullName: "",
                        phone: "",
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        state: "",
                        pincode: ""
                      });
                    }}
                    className={`min-h-11 w-full rounded-xl border-2 border-dashed p-3 text-left transition-all min-[360px]:p-4 ${selectedSavedAddress === null
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                      }`}
                  >
                    <p className="font-medium text-sm">+ Enter a new address</p>
                  </button>

                </div>
              </div>
            )}
            <h2 className="mb-5 text-xl font-bold min-[360px]:text-2xl sm:mb-6">
              Shipping Address
            </h2>


            {/* FULL NAME */}

            <div className="mb-4">

              <Label className="text-sm font-medium">
                Full Name
              </Label>

              <Input
                className="mt-1 h-11"
                value={address.fullName}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    fullName: e.target.value
                  })
                }
              />

            </div>



            {/* PHONE + OTP */}

            <div className="mb-4">

              <Label className="text-sm font-medium">
                Phone Number
              </Label>


              <div className="mt-1 flex min-w-0 flex-col gap-2 min-[420px]:flex-row">

                <Input
                  className="h-11 min-w-0 flex-1"
                  type="tel"
                  inputMode="tel"
                  placeholder="10-digit mobile number"
                  value={address.phone}
                  disabled={phoneVerified}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      phone: e.target.value
                    })
                  }
                />


                {phoneVerificationRequired && !phoneVerified && (

                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 w-full shrink-0 min-[420px]:w-auto"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                  >

                    {otpLoading
                      ? <Loader2 className="animate-spin w-4 h-4" />
                      : "Send OTP"}

                  </Button>

                )}

              </div>



              {phoneVerificationRequired && otpSent && !phoneVerified && (

                <div className="mt-2 flex min-w-0 flex-col gap-2 min-[420px]:flex-row">

                  <Input
                    className="h-11 min-w-0 flex-1"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <Button
                    className="h-11 w-full shrink-0 min-[420px]:w-auto"
                    onClick={handleVerifyOtp}
                  >

                    Verify

                  </Button>

                </div>

              )}



              {phoneVerified && (

                <p className="text-green-600 text-sm mt-2 font-medium">
                  ✓ Phone verified successfully
                </p>

              )}


              {!phoneVerificationRequired && (

                <p className="text-muted-foreground text-sm mt-2">
                  {paymentMethod === "cod"
                    ? "Phone OTP verification is not required for full Cash on Delivery."
                    : "Phone verification is temporarily disabled."}
                </p>

              )}

            </div>



            {/* ADDRESS FIELDS */}

            {[
              { key: "addressLine1", label: "Address Line 1" },
              { key: "addressLine2", label: "Address Line 2" },
              { key: "city", label: "City" },
              { key: "state", label: "State" },
              { key: "pincode", label: "Pincode" }

            ].map(({ key, label }) => (

              <div key={key} className="mb-4">

                <Label className="text-sm font-medium">
                  {label}
                </Label>

                <Input
                  className="mt-1 h-11"
                  value={(address as any)[key]}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      [key]: e.target.value
                    })
                  }
                />

              </div>

            ))}


          </div>



          {/* ================= PAYMENT & SUMMARY ================= */}

          <div className="min-w-0 space-y-6">


            {/* PAYMENT CARD */}

            <div className="glass-card min-w-0 rounded-2xl p-4 shadow-sm min-[360px]:p-5 sm:p-6">

              <h3 className="text-xl font-bold mb-4">
                Payment Method
              </h3>


              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >


                {/* ONLINE */}

                <label className={`flex min-h-11 min-w-0 cursor-pointer items-start justify-between rounded-xl border p-3 transition min-[360px]:p-4

${paymentMethod === "online"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/30"
                  }`}>

                  <div className="flex min-w-0 items-start gap-3">

                    <RadioGroupItem value="online" className="mt-0.5 shrink-0" />

                    <div className="min-w-0">

                      <p className="break-words font-medium">
                        Pay Online
                      </p>

                      <p className="break-words text-sm text-muted-foreground">
                        Secure payment via Razorpay
                      </p>

                    </div>

                  </div>

                </label>



                {/* PARTIAL (50% now + 50% COD) */}

                <label className={`flex min-h-11 min-w-0 cursor-pointer items-start justify-between rounded-xl border p-3 transition min-[360px]:p-4

${paymentMethod === "partial"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/30"
                  }`}>

                  <div className="flex min-w-0 items-start gap-3">

                    <RadioGroupItem value="partial" className="mt-0.5 shrink-0" />

                    <div className="min-w-0">

                      <p className="break-words font-medium">
                        Pay 50% Now, 50% on Delivery
                      </p>

                      <p className="break-words text-sm text-muted-foreground">
                        Pay half online now, rest as cash on delivery
                      </p>

                    </div>

                  </div>

                </label>

                {/* FULL CASH ON DELIVERY */}

                <label className={`flex min-h-11 min-w-0 cursor-pointer items-start justify-between rounded-xl border p-3 transition min-[360px]:p-4

${paymentMethod === "cod"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/30"
                  }`}>

                  <div className="flex min-w-0 items-start gap-3">

                    <RadioGroupItem value="cod" className="mt-0.5 shrink-0" />

                    <div className="min-w-0">

                      <p className="break-words font-medium">
                        Full Cash on Delivery
                      </p>

                      <p className="break-words text-sm text-muted-foreground">
                        Pay the complete order amount when it is delivered
                      </p>

                    </div>

                  </div>

                </label>


              </RadioGroup>

            </div>



            {/* ORDER SUMMARY */}

            <div className="glass-card min-w-0 rounded-2xl p-4 shadow-sm min-[360px]:p-5 sm:p-6">

              <h3 className="text-xl font-bold mb-4">
                Order Summary
              </h3>

              <div className="mb-5 rounded-xl border border-border bg-muted/20 p-3">
                <p className="mb-2 text-sm font-medium">Have a coupon?</p>
                <CouponInput />
              </div>


              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex min-w-0 justify-between gap-3 text-green-600">
                    <span className="min-w-0 break-words">Discount ({activeCoupons.map((coupon) => coupon.code).join(', ')})</span>
                    <span className="shrink-0">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST (8%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>


                <div className="flex items-baseline justify-between gap-3 border-t pt-3 text-base font-bold min-[360px]:text-lg">

                  <span>Total</span>

                  <span className="min-w-0 break-words text-right">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full mt-6 h-12 text-base font-semibold"
              >
                {placingOrder ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Placing Order…</>
                ) : paymentMethod === "partial" ? (
                  "Pay 50% & Place Order"
                ) : paymentMethod === "cod" ? (
                  "Place Cash on Delivery Order"
                ) : (
                  "Pay & Place Order"
                )}

              </Button>
            </div>
          </div>


        </div>

      </main>

      <Footer />

    </div>

  );


};

export default Checkout;
