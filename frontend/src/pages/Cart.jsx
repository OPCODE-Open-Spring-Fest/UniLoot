import React, { useContext } from "react";
import { CartContext } from "../components/CartContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { state, dispatch } = useContext(CartContext);

  // Group items by ID and calculate quantities
  const cartItems = state.cart.reduce((acc, item) => {
    const existingItem = acc.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.totalPrice = existingItem.quantity * existingItem.price;
    } else {
      acc.push({ ...item, quantity: 1, totalPrice: item.price });
    }
    return acc;
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Find all items with this ID
    const items = state.cart.filter(item => item.id === id);
    
    if (newQuantity > items.length) {
      // Add more items
      const itemToAdd = items[0];
      dispatch({ type: "ADD_ITEM", payload: itemToAdd });
    } else if (newQuantity < items.length) {
      // Remove items
      const itemsToRemove = items.length - newQuantity;
      for (let i = 0; i < itemsToRemove; i++) {
        const lastIndex = state.cart.map((item, index) => ({ item, index }))
          .filter(({ item }) => item.id === id)
          .pop().index;
        dispatch({ type: "REMOVE_ITEM", payload: lastIndex });
      }
    }
  };

  const removeItemCompletely = (id) => {
    const itemsToRemove = state.cart
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.id === id)
      .map(({ index }) => index)
      .reverse(); // Remove from end to avoid index issues

    itemsToRemove.forEach(index => {
      dispatch({ type: "REMOVE_ITEM", payload: index });
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 dark:from-slate-900 dark:via-black dark:to-slate-900 dark:text-gray-200">
      {/* Header */}
      <motion.div
        className="max-w-6xl mx-auto text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Your Shopping Cart
        </h1>
        <p className="text-gray-600 text-lg">
          {cartItems.length === 0 ? "Your cart is waiting to be filled! 🛍️" : `You have ${cartItems.length} unique item${cartItems.length > 1 ? 's' : ''} in your cart`}
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          {cartItems.length === 0 ? (
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Your cart is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Discover amazing products and add them to your cart!
              </p>
              <Link
                to="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Cart Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Cart Items ({state.cart.length})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-2 transition-colors duration-200"
                >
                  <span>🗑️</span>
                  Clear Cart
                </button>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="p-6 flex flex-col sm:flex-row items-center gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            ₹{item.price.toLocaleString()} each
                          </p>
                          <div className="flex items-center justify-center sm:justify-start gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors duration-200 text-lg font-bold"
                                disabled={item.quantity <= 1}
                              >
                                −
                              </button>
                              <span className="font-semibold text-gray-800 min-w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors duration-200 text-lg font-bold"
                              >
                                +
                              </button>
                            </div>

                            {/* Total Price for this item */}
                            <div className="text-lg font-bold text-blue-600">
                              ₹{(item.totalPrice).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItemCompletely(item.id)}
                          className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all duration-200 transform hover:scale-110"
                          title="Remove all"
                        >
                          <span className="text-xl">🗑️</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Order Summary - Only show when cart has items */}
        {cartItems.length > 0 && (
          <motion.div
            className="lg:w-96"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b">
                Order Summary
              </h3>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({state.cart.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping > 0 ? `₹${shipping}` : "Free"}</span>
                </div>
                {shipping > 0 && subtotal < 999 && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    🚚 Add ₹{(999 - subtotal).toLocaleString()} more for free shipping!
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-2xl text-blue-600">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to="/payment"
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Proceed to Payment
                </Link>
                <Link
                  to="/"
                  className="block w-full border-2 border-gray-300 text-gray-700 text-center py-3 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
                  <span>🔒</span>
                  <span>Secure Checkout</span>
                </div>
                <p className="text-xs text-gray-400">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default Cart;