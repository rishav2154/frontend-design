// Checkout.tsx (FULL FIXED WITH RAZORPAY + OTP + COD, UI UNCHANGED)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
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
    clearCart,
    appliedCoupon
  } = useCartStore();


  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");

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
        const res = await apiFetch("/api/addresses");
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

      await apiFetch("/api/send-otp", {

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

      await apiFetch("/api/verify-otp", {

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
     ONLINE PAYMENT (RAZORPAY)
  =============================== */

  const handleOnlinePayment = async () => {

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
         CALCULATE FINAL AMOUNT
      ================================ */

      const shipping = 50;

      const tax = Number((subtotal * 0.08).toFixed(2));

      let discount = 0;

      if (appliedCoupon) {
        discount = Number(appliedCoupon.discount || 0);
      }

      const finalAmount = Number(
        (subtotal + shipping + tax - discount).toFixed(2)
      );


      /* ===============================
         CREATE RAZORPAY ORDER
      ================================ */

      const razorpayOrder =
        await apiFetch("/api/create-razorpay-order", {
          method: "POST",
          body: JSON.stringify({
            amount: finalAmount   // ✅ FIXED
          })
        });



      const options = {

        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: razorpayOrder.amount,

        currency: "INR",

        order_id: razorpayOrder.id,

        name: "Your Store",

        description: "Order Payment",

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

            await apiFetch("/api/verify-payment", {
              method: "POST",
              body: JSON.stringify(response)
            });

            const res = await apiFetch("/api/checkout", {
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
                coupon: appliedCoupon?.code || null,
                payment_method: "online",
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


  /* ===============================
     PLACE ORDER
  =============================== */

  const handlePlaceOrder = async () => {

    if (!validateForm()) return;

    if (!phoneVerified)
      return toast({
        title: "Phone Not Verified",
        description: "Verify phone first",
        variant: "destructive"
      });


    if (paymentMethod === "online")
      return handleOnlinePayment();


    // COD FLOW

    setLoading(true);

    try {

      const res =
        await apiFetch("/api/checkout", {

          method: "POST",

          body: JSON.stringify({

            items,

            shipping_address: {

              full_name:
                address.fullName,

              phone:
                address.phone,

              address_line1:
                address.addressLine1,

              address_line2:
                address.addressLine2,

              city:
                address.city,

              state:
                address.state,

              pincode:
                address.pincode

            },

            coupon:
              appliedCoupon?.code || null,

            payment_method: "cod"

          })

        });


      clearCart();

      navigate(
        `/order-success/${res.order_id}`
      );

    }
    catch (err: any) {

      toast({

        title: "Order Failed",

        description: err.message,

        variant: "destructive"

      });

    }
    finally {

      setLoading(false);

    }

  };


  /* ===============================
     LOADING SCREEN
  =============================== */

  if (checkingAuth)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );


  /* ===============================
     UI (UNCHANGED)
  =============================== */

  return (

    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">

      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16 container mx-auto px-4 max-w-7xl">

        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>


        <div className="grid lg:grid-cols-3 gap-8">


          {/* ================= ADDRESS ================= */}

          <div className="lg:col-span-2 glass-card p-8 rounded-2xl shadow-sm">
            {/* ================= SAVED ADDRESSES ================= */}
            {savedAddresses.length > 0 && (
              <div className="glass-card p-6 rounded-2xl shadow-sm">

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
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
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedSavedAddress === addr.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="font-medium text-sm">{addr.full_name}</p>

                          <p className="text-xs text-muted-foreground mt-1">
                            {addr.address_line1}
                            {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                          </p>

                          <p className="text-xs text-muted-foreground">
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
                    className={`w-full text-left p-4 rounded-xl border-2 border-dashed transition-all ${selectedSavedAddress === null
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                      }`}
                  >
                    <p className="font-medium text-sm">+ Enter a new address</p>
                  </button>

                </div>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-6">
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


              <div className="flex gap-2 mt-1">

                <Input
                  className="h-11"
                  value={address.phone}
                  disabled={phoneVerified}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      phone: e.target.value
                    })
                  }
                />


                {!phoneVerified && (

                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                  >

                    {otpLoading
                      ? <Loader2 className="animate-spin w-4 h-4" />
                      : "Send OTP"}

                  </Button>

                )}

              </div>



              {otpSent && !phoneVerified && (

                <div className="flex gap-2 mt-2">

                  <Input
                    className="h-11"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <Button
                    className="h-11"
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

          <div className="space-y-6">


            {/* PAYMENT CARD */}

            <div className="glass-card p-6 rounded-2xl shadow-sm">

              <h3 className="text-xl font-bold mb-4">
                Payment Method
              </h3>


              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >


                {/* COD */}

                <label className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition

${paymentMethod === "cod"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/30"
                  }`}>

                  <div className="flex items-center gap-3">

                    <RadioGroupItem value="cod" />

                    <div>

                      <p className="font-medium">
                        Cash on Delivery
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Pay when product arrives
                      </p>

                    </div>

                  </div>

                </label>



                {/* ONLINE */}

                <label className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition

${paymentMethod === "online"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/30"
                  }`}>

                  <div className="flex items-center gap-3">

                    <RadioGroupItem value="online" />

                    <div>

                      <p className="font-medium">
                        Pay Online
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Secure payment via Razorpay
                      </p>

                    </div>

                  </div>

                </label>


              </RadioGroup>

            </div>



            {/* ORDER SUMMARY */}

            <div className="glass-card p-6 rounded-2xl shadow-sm">

              <h3 className="text-xl font-bold mb-4">
                Order Summary
              </h3>


              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹50.00</span>
                </div>

                <div className="flex justify-between">
                  <span>GST</span>
                  <span>₹{(subtotal * 0.08).toFixed(2)}</span>
                </div>


                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{appliedCoupon.discount}</span>
                  </div>
                )}


                <div className="border-t pt-3 flex justify-between font-bold text-lg">

                  <span>Total</span>

                  <span>

                    ₹{(
                      subtotal
                      + 50
                      + (subtotal * 0.08)
                      - (appliedCoupon?.discount || 0)
                    ).toFixed(2)}

                  </span>
                </div>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 h-12 text-base font-semibold"
              >
                {loading
                  ? <Loader2 className="animate-spin" />
                  : paymentMethod === "online"
                    ? "Pay & Place Order"
                    : "Place Order"}

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
