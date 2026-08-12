"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { User, MapPin, FileText, CreditCard, Lock, Check, ShoppingCart } from "lucide-react";
import { AppImage } from "@/app/components/ui/AppImage";
import { CreatePaymentIntentSchema } from "@/app/features/checkout/schemas/checkout.schema";
import { useCreatePaymentIntent, useVerifyPaymentMutation } from "@/app/features/checkout/hooks/checkout.hooks";
import type { VerifiedPaymentOrder } from "@/app/features/checkout/types/checkout-response.types";
import type { CreatePaymentIntentPayload } from "@/app/features/checkout/types/checkout.type";
import { CartItem } from "../cart/types/cart";
import { modals } from "@/hooks/store/useModalStore"

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CheckoutFormProps {
  onSuccess: (order: VerifiedPaymentOrder) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const POLL_MAX_ATTEMPTS = 8
const POLL_DELAY_MS     = 1500

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCartItemImageUrl = (item: CartItem): string | null => {
  if (item.image) {
    return typeof item.image === "object" ? (item.image as any)?.url ?? null : item.image;
  }
  if (item.image?.length > 0) {
    const first = item.image[0];
    return typeof first === "object" ? (first as any)?.url ?? null : first;
  }
  return null;
};

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Component ────────────────────────────────────────────────────────────────
const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
  const stripe   = useStripe();
  const elements = useElements();

  const createIntentMutation  = useCreatePaymentIntent();
  const verifyPaymentMutation = useVerifyPaymentMutation();

  const [cartItems,     setCartItems]     = useState<CartItem[]>([]);
  const [cardComplete,  setCardComplete]  = useState(false);
  const [isProcessing,  setIsProcessing]  = useState(false);

  const [formData, setFormData] = useState({
    customerName:  "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: {
      address1:   "",
      address2:   "",
      city:       "",
      state:      "",
      postalCode: "",
      country:    "Pakistan",
    },
    orderNotes: "",
  });

  // ── Load cart from localStorage ──────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setCartItems(JSON.parse(raw));
    } catch {
      setCartItems([]);
    }
  }, []);

  // ── Derived totals ───────────────────────────────────────────────────────
  const subtotal         = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryCharges  = cartItems.reduce((s, i) => s + (Number(i.deliveryCharges) || 0), 0);
  const totalAmount      = subtotal + deliveryCharges;
  const itemCount        = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const uniqueProductsCount = cartItems.length;

  // ── Input handler ────────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name.startsWith("shipping.")) {
        const field = name.split(".")[1];
        setFormData(prev => ({
          ...prev,
          shippingAddress: { ...prev.shippingAddress, [field]: value },
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    },
    [],
  );

  // ── Polling: webhook ke baad order DB mein aane ka wait karo ────────────
  const pollForOrder = useCallback(
    async (piId: string): Promise<VerifiedPaymentOrder> => {
      for (let attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt++) {
        if (attempt > 1) await sleep(POLL_DELAY_MS);

        try {
          const res = await verifyPaymentMutation.mutateAsync({ paymentIntentId: piId });

          // ✅ Order mil gaya
          if (res.order) return res.order;

          // ⏳ Webhook still processing
          if (res.status === "processing") {
            console.log(`⏳ Attempt ${attempt}/${POLL_MAX_ATTEMPTS}: Order still processing...`);
            continue;
          }

          throw new Error(res.message || "Verification failed");

        } catch (err: any) {
          if (attempt === POLL_MAX_ATTEMPTS) throw err;
          console.warn(`⚠️ Attempt ${attempt} failed, retrying...`, err.message);
        }
      }

      // Sab attempts khatam — payment tha lekin order delayed
      throw new Error(
        "Your payment was received but order confirmation is delayed. " +
        "Check your email for confirmation — do not pay again.",
      );
    },
    [verifyPaymentMutation],
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Guard checks ────────────────────────────────────────────────────
    if (isProcessing || createIntentMutation.isPending || verifyPaymentMutation.isPending) return;

    if (!stripe || !elements) {
      modals.alert({ title: "Not Ready", description: "Payment system is initializing. Please wait.", variant: "info" });
      return;
    }

    if (cartItems.length === 0) {
      modals.alert({ title: "Empty Cart", description: "Please add items before checkout.", variant: "warning" });
      return;
    }

    if (!cardComplete) {
      modals.alert({ title: "Incomplete Card", description: "Please fill in complete card details.", variant: "warning" });
      return;
    }

    // ── Build payload ────────────────────────────────────────────────────
    const unvalidatedPayload: CreatePaymentIntentPayload = {
      customerName:  formData.customerName.trim(),
      customerEmail: formData.customerEmail.trim(),
      customerPhone: formData.customerPhone.trim(),
      shippingAddress: {
        address1:   formData.shippingAddress.address1.trim(),
        address2:   formData.shippingAddress.address2.trim() || undefined,
        city:       formData.shippingAddress.city.trim(),
        state:      formData.shippingAddress.state.trim(),
        postalCode: formData.shippingAddress.postalCode.trim(),
        country:    formData.shippingAddress.country || "Pakistan",
      },
      items: cartItems.map(item => ({
        product:        String(item.id),
        productName:    String(item.name),
        price:          typeof item.price === "number" ? item.price : Number(item.price) || 0,
        quantity:       Number(item.quantity) || 1,
        isSubscription: false,
      })),
      orderNotes: formData.orderNotes.trim() || undefined,
    };

    // ── Zod validation ───────────────────────────────────────────────────
    const validation = CreatePaymentIntentSchema.safeParse(unvalidatedPayload);
    if (!validation.success) {
      const msg = validation.error?.issues?.[0]?.message ?? "Validation error in form inputs";
      modals.alert({ title: "Validation Error", description: msg, variant: "warning" });
      return;
    }

    setIsProcessing(true);

    try {
      // ── Step 1: Create payment intent ────────────────────────────────
      const intentResponse = await createIntentMutation.mutateAsync(validation.data);
      if (!intentResponse?.clientSecret) {
        throw new Error(intentResponse?.message ?? "Failed to initialize payment intent.");
      }

      // ── Step 2: Confirm card payment with Stripe ─────────────────────
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found.");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentResponse.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name:    formData.customerName,
              email:   formData.customerEmail,
              phone:   formData.customerPhone,
              address: {
                line1:       formData.shippingAddress.address1,
                line2:       formData.shippingAddress.address2 || "",
                city:        formData.shippingAddress.city,
                state:       formData.shippingAddress.state,
                postal_code: formData.shippingAddress.postalCode,
                country:     "PK",
              },
            },
          },
        },
      );

      if (stripeError) throw new Error(stripeError.message);

      // ── Step 3: Poll until order is confirmed in DB ──────────────────
      console.log("✅ Stripe payment confirmed — polling for order...");
      const confirmedOrder = await pollForOrder(paymentIntent.id);

      // ── Step 4: Success ──────────────────────────────────────────────
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      onSuccess(confirmedOrder);

    } catch (err: any) {
      const message = err?.message ?? "Payment processing failed. Please try again.";
      modals.alert({ title: "Payment Failed", description: message, variant: "danger" });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || createIntentMutation.isPending || verifyPaymentMutation.isPending;



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#faf8f5] px-[clamp(16px,5vw,48px)] py-8">
   

      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#3E2723] font-inter tracking-[-0.5px] mb-2">
            Secure Checkout
          </h1>
          <p className="text-[#8D6E63] font-inter">Complete your order with confidence</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit} className="relative">
              {isLoading && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]">
                  <div className="bg-[#FEFDFB] rounded-3xl p-10 text-center max-w-md animate-[fadeIn_0.3s_ease]">
                    <div className="w-12 h-12 border-3 border-[#E8DFD6] border-t-[#8B5A3C] rounded-full animate-spin mx-auto mb-5" />
                    <h4 className="text-lg font-semibold text-[#3E2723] mb-2">
                      Processing Your Payment
                    </h4>
                    <p className="text-[#8D6E63]">Please do not close this page...</p>
                  </div>
                </div>
              )}

              <div className="bg-[#FEFDFB] rounded-2xl border border-[#E8DFD6] p-6 sm:p-7 mb-6 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b-2 border-[#E8DFD6]">
                  <User size={24} className="text-[#8B5A3C]" />
                  <h3 className="text-lg font-semibold text-[#3E2723] font-inter m-0">
                    Customer Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                      Full Name <span className="text-[#8D6E63] font-normal">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3.5 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl text-[#3E2723] font-inter transition-all focus:outline-none focus:border-[#8B5A3C] focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)] disabled:bg-[#F5F1EB] disabled:cursor-not-allowed"
                      autoComplete="name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                        Email Address <span className="text-[#8D6E63] font-normal">*</span>
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3.5 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl text-[#3E2723] font-inter transition-all focus:outline-none focus:border-[#8B5A3C] focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)] disabled:bg-[#F5F1EB] disabled:cursor-not-allowed"
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                        Phone Number <span className="text-[#8D6E63] font-normal">*</span>
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        placeholder="+92 300 1234567"
                        className="w-full px-4 py-3.5 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl text-[#3E2723] font-inter transition-all focus:outline-none focus:border-[#8B5A3C] focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)] disabled:bg-[#F5F1EB] disabled:cursor-not-allowed"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FEFDFB] rounded-2xl border border-[#E8DFD6] p-6 sm:p-7 mb-6 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b-2 border-[#E8DFD6]">
                  <MapPin size={24} className="text-[#8B5A3C]" />
                  <h3 className="text-lg font-semibold text-[#3E2723] font-inter m-0">
                    Shipping Address
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                      Address Line 1 <span className="text-[#8D6E63] font-normal">*</span>
                    </label>
                    <input
                      type="text"
                      name="shipping.address1"
                      value={formData.shippingAddress.address1}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      placeholder="Street address"
                      className="w-full px-4 py-3.5 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl text-[#3E2723] font-inter transition-all focus:outline-none focus:border-[#8B5A3C] focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)] disabled:bg-[#F5F1EB] disabled:cursor-not-allowed"
                      autoComplete="address-line1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                      Address Line 2 <span className="text-[#8D6E63] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="shipping.address2"
                      value={formData.shippingAddress.address2}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Apartment, suite, etc."
                      className="w-full px-4 py-3.5 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl text-[#3E2723] font-inter transition-all focus:outline-none focus:border-[#8B5A3C] focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)] disabled:bg-[#F5F1EB] disabled:cursor-not-allowed"
                      autoComplete="address-line2"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                        City <span className="text-[#8D6E63] font-normal">*</span>
                      </label>
                      <input
                        type="text"
                        name="shipping.city"
                        value={formData.shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        placeholder="City"
                        className="w-full px-4 py-3.5 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl text-[#3E2723] font-inter transition-all focus:outline-none focus:border-[#8B5A3C] focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)] disabled:bg-[#F5F1EB] disabled:cursor-not-allowed"
                        autoComplete="address-level2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                        State <span className="text-[#8D6E63] font-normal">*</span>
                      </label>
                      <input
                        type="text"
                        name="shipping.state"
                        value={formData.shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        placeholder="State / Province"
                        className="w-full px-4 py-3.5 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl text-[#3E2723] font-inter transition-all focus:outline-none focus:border-[#8B5A3C] focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)] disabled:bg-[#F5F1EB] disabled:cursor-not-allowed"
                        autoComplete="address-level1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                      Postal Code <span className="text-[#8D6E63] font-normal">*</span>
                    </label>
                    <input
                      type="text"
                      name="shipping.postalCode"
                      value={formData.shippingAddress.postalCode}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      placeholder="Postal code"
                      className="w-full px-4 py-3.5 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl text-[#3E2723] font-inter transition-all focus:outline-none focus:border-[#8B5A3C] focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)] disabled:bg-[#F5F1EB] disabled:cursor-not-allowed"
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#FEFDFB] rounded-2xl border border-[#E8DFD6] p-6 sm:p-7 mb-6 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b-2 border-[#E8DFD6]">
                  <FileText size={24} className="text-[#8B5A3C]" />
                  <h3 className="text-lg font-semibold text-[#3E2723] font-inter m-0">
                    Order Notes
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Any special requests or delivery instructions..."
                    className="w-full px-4 py-3.5 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl text-[#3E2723] font-inter resize-y min-h-[100px] transition-all focus:outline-none focus:border-[#8B5A3C] focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)] disabled:bg-[#F5F1EB] disabled:cursor-not-allowed"
                    rows={3}
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="bg-[#FEFDFB] rounded-2xl border border-[#E8DFD6] p-6 sm:p-7 mb-6 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b-2 border-[#E8DFD6]">
                  <CreditCard size={24} className="text-[#8B5A3C]" />
                  <h3 className="text-lg font-semibold text-[#3E2723] font-inter m-0">
                    Payment Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#6D4C41] mb-2 font-inter">
                    Card Details <span className="text-[#8D6E63] font-normal">*</span>
                  </label>
                  <div className="p-2 bg-[#FEFDFB] border-[1.5px] border-[#E8DFD6] rounded-xl transition-all focus-within:border-[#8B5A3C] focus-within:shadow-[0_0_0_3px_rgba(139,90,60,0.1)]">
                    <CardElement
                      onChange={(e) => setCardComplete(e.complete)}
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#3E2723",
                            fontFamily: '"Inter", -apple-system, sans-serif',
                            "::placeholder": { color: "#8D6E63" },
                          },
                          invalid: {
                            color: "#C62828",
                            iconColor: "#C62828",
                          },
                        },
                        hidePostalCode: true,
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] text-[#FEFDFB] border-none rounded-xl text-base font-bold font-inter cursor-pointer transition-all flex items-center justify-center gap-2.5 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay $${totalAmount.toFixed(2)}`
                )}
              </button>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 py-4 text-xs text-[#8D6E63] font-inter">
                <span className="flex items-center gap-1.5">
                  <Lock size={18} className="text-[#2E7D32]" />
                  Secure Payment
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={18} className="text-[#2E7D32]" />
                  SSL Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={18} className="text-[#2E7D32]" />
                  PCI Compliant
                </span>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-[380px] flex-shrink-0 sticky top-32 bg-[#FEFDFB] rounded-2xl border border-[#E8DFD6] overflow-hidden shadow-lg">
            <div className="flex justify-between items-center p-5 bg-[#F5F1EB] border-b border-[#E8DFD6]">
              <h3 className="text-lg font-semibold text-[#3E2723] font-inter m-0">
                Order Summary
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8D6E63] bg-[#FEFDFB] px-2.5 py-1 rounded-full">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
                <span className="text-xs text-[#8D6E63] bg-[#F5F1EB] px-2 py-1 rounded-full">
                  ({uniqueProductsCount} {uniqueProductsCount === 1 ? "product" : "products"})
                </span>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto py-2">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-4 px-5 py-4 border-b border-[#E8DFD6]"
                >
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <AppImage
                      src={getCartItemImageUrl(item)}
                      alt={item.name}
                      width={56}
                      height={56}
                      iconSize={20}
                      className="w-full h-full rounded-xl overflow-hidden"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 bg-[#8B5A3C] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full z-10">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#3E2723] font-inter truncate m-0">
                      {item.name}
                    </h4>
                    {item.deliveryCharges && item.deliveryCharges > 0 ? (
                      <span className="text-xs text-[#8D6E63] bg-[#F5F1EB] px-2 py-0.5 rounded-full">
                        +${Number(item.deliveryCharges).toFixed(2)} delivery
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm font-bold text-[#8B5A3C] font-inter whitespace-nowrap">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-[#E8DFD6] bg-[#F5F1EB]">
              <div className="flex justify-between items-center mb-3 text-sm text-[#6D4C41] font-inter">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3 text-sm text-[#6D4C41] font-inter">
                <span>Delivery</span>
                <span className={deliveryCharges === 0 ? "text-[#2E7D32] font-semibold" : ""}>
                  {deliveryCharges === 0 ? "FREE" : `$${deliveryCharges.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-[#C9A27B] text-lg font-bold text-[#3E2723] font-inter">
                <span>Total</span>
                <span className="text-[#8B5A3C] text-2xl">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutForm;