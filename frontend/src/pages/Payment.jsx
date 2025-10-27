import React, { useState, useContext } from "react";
import { CartContext } from "../components/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Payment = () => {
  const { state, dispatch } = useContext(CartContext);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    upiId: "",
    wallet: "",
    bank: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  const tax = total * 0.18;
  const shipping = 99;
  const finalTotal = total + tax + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    // Format expiry date
    if (name === "expiry") {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      dispatch({ type: "CLEAR_CART" });
      navigate("/success");
    }, 3000);
  };

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: "💳", color: "from-blue-500 to-blue-700" },
    { id: "upi", name: "UPI Payment", icon: "📱", color: "from-green-500 to-green-700" },
    { id: "wallet", name: "Wallet", icon: "👛", color: "from-purple-500 to-purple-700" },
    { id: "netbanking", name: "Net Banking", icon: "🏦", color: "from-orange-500 to-orange-700" },
  ];

  const wallets = [
    { id: "paytm", name: "Paytm", icon: "📲" },
    { id: "phonepe", name: "PhonePe", icon: "📳" },
    { id: "amazonpay", name: "Amazon Pay", icon: "🛒" },
    { id: "other", name: "Other Wallets", icon: "💰" },
  ];

  const banks = [
    { id: "sbi", name: "State Bank of India" },
    { id: "hdfc", name: "HDFC Bank" },
    { id: "icici", name: "ICICI Bank" },
    { id: "axis", name: "Axis Bank" },
    { id: "kotak", name: "Kotak Mahindra Bank" },
    { id: "other", name: "Other Banks" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 dark:from-slate-900 dark:via-black dark:to-slate-900 dark:text-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Secure Checkout
          </h1>
          <p className="text-gray-600 text-lg">
            Complete your purchase with secure payment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Select Payment Method
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {paymentMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        paymentMethod === method.id
                          ? `border-blue-500 bg-gradient-to-r ${method.color} text-white shadow-lg`
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium text-sm text-center">{method.name}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  {paymentMethod === "card" && "Card Details"}
                  {paymentMethod === "upi" && "UPI Payment"}
                  {paymentMethod === "wallet" && "Digital Wallet"}
                  {paymentMethod === "netbanking" && "Net Banking"}
                </h3>

                <form onSubmit={handlePayment}>
                  <AnimatePresence mode="wait">
                    {/* Card Payment */}
                    {paymentMethod === "card" && (
                      <motion.div
                        key="card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              name="expiry"
                              value={formData.expiry}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              maxLength="5"
                              className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              maxLength="3"
                              className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                          <span className="text-2xl">🔒</span>
                          <div>
                            <p className="font-medium text-blue-800">Secure Payment</p>
                            <p className="text-blue-600 text-sm">Your card details are encrypted and secure</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* UPI Payment */}
                    {paymentMethod === "upi" && (
                      <motion.div
                        key="upi"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            UPI ID
                          </label>
                          <input
                            type="text"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleInputChange}
                            placeholder="yourname@upi"
                            className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-lg"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            className="p-4 border-2 border-green-500 rounded-xl text-green-600 font-semibold hover:bg-green-50 transition-all duration-200"
                          >
                            📱 PhonePe
                          </button>
                          <button
                            type="button"
                            className="p-4 border-2 border-blue-500 rounded-xl text-blue-600 font-semibold hover:bg-blue-50 transition-all duration-200"
                          >
                            📲 Google Pay
                          </button>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                              <p className="font-medium text-yellow-800">Quick Payment</p>
                              <p className="text-yellow-700 text-sm">You'll be redirected to your UPI app to complete the payment</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Wallet Payment */}
                    {paymentMethod === "wallet" && (
                      <motion.div
                        key="wallet"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            Select Your Wallet
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            {wallets.map(wallet => (
                              <button
                                key={wallet.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, wallet: wallet.id }))}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                  formData.wallet === wallet.id
                                    ? "border-purple-500 bg-purple-50 text-purple-700"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-2xl">{wallet.icon}</span>
                                  <span className="font-medium text-sm">{wallet.name}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {formData.wallet && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-purple-50 border border-purple-200 rounded-xl p-4"
                          >
                            <p className="text-purple-700 text-sm text-center">
                              You'll be redirected to {wallets.find(w => w.id === formData.wallet)?.name} to complete your payment
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* Net Banking */}
                    {paymentMethod === "netbanking" && (
                      <motion.div
                        key="netbanking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Your Bank
                          </label>
                          <select
                            name="bank"
                            value={formData.bank}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                            required
                          >
                            <option value="">Choose your bank</option>
                            {banks.map(bank => (
                              <option key={bank.id} value={bank.id}>
                                {bank.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
                          <div className="text-4xl mb-4">🏦</div>
                          <h4 className="font-semibold text-orange-800 mb-2">
                            Secure Net Banking
                          </h4>
                          <p className="text-orange-700 text-sm">
                            You'll be redirected to your bank's secure portal to complete the payment
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pay Button */}
                  <motion.button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full mt-8 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      isProcessing
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                    } text-white shadow-lg hover:shadow-xl`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      `Pay ₹${finalTotal.toLocaleString()}`
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {state.cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 py-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-gray-600 text-sm">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({state.cart.length} items)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{shipping}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total Amount</span>
                    <span className="text-xl text-blue-600">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Back to Cart */}
              <Link
                to="/cart"
                className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 mt-6"
              >
                ← Back to Cart
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Security Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: "🔒", text: "256-bit SSL Secure" },
            { icon: "🛡️", text: "PCI DSS Compliant" },
            { icon: "💰", text: "100% Money Back" },
            { icon: "⚡", text: "Instant Refund" }
          ].map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default Payment;