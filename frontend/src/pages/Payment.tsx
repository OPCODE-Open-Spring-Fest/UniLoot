import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../components/CartContext";
import { useNotification } from "../components/NotificationContext";
import { createPaymentOrder, verifyPayment } from "../lib/api";
import { loadScript } from "../lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment: React.FC = () => {
  const { state, clearCart, refreshFromServer, syncToBackend } = useCart();
  const navigate = useNavigate();
  const { notifyBuyItem } = useNotification();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "wallet" | "netbanking">("card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    upiId: "",
    wallet: "",
    bank: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(total * 0.18);
  const shipping = total > 0 ? 99 : 0;
  const finalTotal = total + tax + shipping;

  // Load Razorpay script
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      setIsLoading(true);
      try {
        if (isMounted) {
          await refreshFromServer();
        }
        if (window.Razorpay) {
          if (isMounted) setRazorpayLoaded(true);
        } else {
          await loadScript("https://checkout.razorpay.com/v1/checkout.js");
          if (isMounted) setRazorpayLoaded(true);
        }
      } catch (error) {
        console.error("Failed to initialize:", error);
        if (isMounted) {
          setError("Failed to load payment gateway. Please refresh the page.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initialize();
    
    return () => {
      isMounted = false;
    };
  }, []); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "cardNumber") {
      const formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    if (name === "expiry") {
      const formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    try {
      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error("Payment gateway not loaded. Please refresh the page.");
      }

      if (state.items.length === 0) {
        throw new Error("Your cart is empty. Please add items to cart before proceeding to payment.");
      }
      try {
        await syncToBackend();
        await refreshFromServer();
      } catch (syncError) {
        console.warn("Cart sync warning:", syncError);
      }

      let orderResponse;
      try {
        orderResponse = await createPaymentOrder();
        setOrderId(orderResponse.orderId);
      } catch (orderError: any) {
        if (orderError.status === 401 || orderError.message?.includes("authenticated")) {
          setError("Your session has expired. Please login again.");
          setTimeout(() => {
            navigate("/signin");
          }, 2000);
          setIsProcessing(false);
          return;
        }
        throw orderError;
      }

      //Initialize Razorpay payment
      const options = {
        key: orderResponse.key,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: "UniLoot",
        description: `Order for ${state.items.length} item(s)`,
        order_id: orderResponse.order.id,
        prefill: {
          name: formData.cardName || "Customer",
          email: "", 
          contact: "", 
        },
        theme: {
          color: "#4F46E5",
        },
        handler: async (response: any) => {
          // Payment successful-verify on backend
          try {
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderResponse.orderId,
            });

            if (verifyResponse.success) {
              state.items.forEach(item => {
                notifyBuyItem(item.name, item.price * item.quantity);
              });
              
              await clearCart();
              navigate("/cart", { 
                replace: true,
              });
            } else {
              setError("Payment verification failed. Please contact support.");
              setIsProcessing(false);
              setTimeout(() => {
                navigate("/cart", { replace: true });
              }, 2000);
            }
          } catch (verifyError: any) {
            console.error("Payment verification error:", verifyError);
            setError(verifyError.message || "Payment verification failed. Please contact support.");
            setIsProcessing(false);
            setTimeout(() => {
              navigate("/cart", { replace: true });
            }, 2000);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        setError(`Payment failed: ${response.error.description || "Unknown error"}`);
        setIsProcessing(false);
        setTimeout(() => {
          navigate("/cart", { replace: true });
        }, 2000);
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.message || "Failed to process payment. Please try again.");
      setIsProcessing(false);
      setTimeout(() => {
        navigate("/cart", { replace: true });
      }, 2000);
    }
  };

  if (isLoading || !razorpayLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment gateway...</p>
        </div>
      </div>
    );
  }

  //if cart is empty
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Please add items to your cart before proceeding to payment.</p>
          <Link
            to="/cart"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Go to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 dark:from-slate-900 dark:via-black dark:to-slate-900 dark:text-gray-200">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Secure Checkout</h1>
          <p className="text-gray-600 text-lg">Complete your purchase with secure payment</p>
        </motion.div>

        {error && (
          <motion.div
            className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <p>{error}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div className="bg-white rounded-2xl shadow-lg overflow-hidden" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "card", name: "Credit/Debit Card", icon: "💳", color: "from-blue-500 to-blue-700" },
                    { id: "upi", name: "UPI Payment", icon: "📱", color: "from-green-500 to-green-700" },
                    { id: "wallet", name: "Wallet", icon: "👛", color: "from-purple-500 to-purple-700" },
                    { id: "netbanking", name: "Net Banking", icon: "🏦", color: "from-orange-500 to-orange-700" },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        paymentMethod === method.id
                          ? `border-blue-500 bg-gradient-to-r ${method.color} text-white shadow-lg`
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium text-sm text-center">{method.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> All payment methods will be processed securely through Razorpay. You will be redirected to Razorpay's secure payment gateway.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div className="bg-white rounded-2xl shadow-lg overflow-hidden" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Payment Details</h3>

                <form onSubmit={handlePayment}>
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🔒</span>
                        <div>
                          <p className="font-semibold text-blue-800">Secure Payment Gateway</p>
                          <p className="text-blue-600 text-sm">Powered by Razorpay</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        Click the button below to proceed to Razorpay's secure payment gateway. 
                        You can pay using Credit/Debit Cards, UPI, Wallets, or Net Banking.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="font-medium text-green-800">100% Secure Transactions</p>
                        <p className="text-green-600 text-sm">Your payment information is encrypted and secure</p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isProcessing || state.items.length === 0}
                    className={`w-full mt-8 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      isProcessing || state.items.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                    } text-white shadow-lg hover:shadow-xl`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Payment...
                      </div>
                    ) : (
                      `Pay ₹${finalTotal.toLocaleString()}`
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b">Order Summary</h3>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {state.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2">
                    <img src={item.image || "/placeholder.png"} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-gray-600 text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-600"><span>Subtotal ({state.items.length} items)</span><span>₹{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>₹{shipping}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (18%)</span><span>₹{tax.toLocaleString()}</span></div>
                <div className="border-t pt-3 mt-3"><div className="flex justify-between text-lg font-bold text-gray-800"><span>Total Amount</span><span className="text-xl text-blue-600">₹{finalTotal.toLocaleString()}</span></div></div>
              </div>

              <Link to="/cart" className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 mt-6">← Back to Cart</Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
