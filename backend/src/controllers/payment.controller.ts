import { Request, Response } from "express";
import mongoose from "mongoose";
import { razorpay, RAZORPAY_CONFIG } from "../config/razorpay.config";
import Order, { OrderStatus, PaymentStatus } from "../models/order.model";
import Cart from "../models/cart.model";
import crypto from "crypto";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}
export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false,
        message: "Unauthorized - User ID not found" 
      });
      return;
    }

    console.log("Creating order for user:", userId);
    let cart;
    try {
      cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    } catch (cartError: any) {
      console.error("Cart lookup error:", cartError);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve cart",
        error: cartError.message,
      });
      return;
    }

    if (!cart) {
      res.status(400).json({ 
        success: false,
        message: "Cart not found. Please add items to your cart first." 
      });
      return;
    }

    if (cart.items.length === 0) {
      res.status(400).json({ 
        success: false,
        message: "Cart is empty. Please add items to your cart first." 
      });
      return;
    }

    console.log("Cart found with", cart.items.length, "items");

    // Calc amounts
    const totalAmount = cart.totalPrice || 0;
    if (totalAmount <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid cart total. Please check your cart items.",
      });
      return;
    }

    const shippingCharges = totalAmount > 0 ? 99 : 0;
    const tax = Math.round(totalAmount * 0.18);
    const finalAmount = totalAmount + shippingCharges + tax;
    if (finalAmount < 1) {
      res.status(400).json({
        success: false,
        message: "Order amount is too small. Minimum order value is ₹1.",
      });
      return;
    }
    const amountInPaise = Math.round(finalAmount * 100);
    console.log("Order amount:", finalAmount, "INR (", amountInPaise, "paise)");
    if (!RAZORPAY_CONFIG.keyId || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay configuration missing");
      res.status(500).json({
        success: false,
        message: "Payment gateway configuration error. Please contact support.",
        error: "Razorpay credentials not configured",
      });
      return;
    }

    // Create Razorpay order
    let razorpayOrder;
    try {
      console.log("Creating Razorpay order...");
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: RAZORPAY_CONFIG.currency,
        receipt: `order_${Date.now()}_${userId.substring(0, 8)}`,
        notes: {
          userId,
          cartId: cart._id.toString(),
        },
      });
      console.log("Razorpay order created:", razorpayOrder.id);
    } catch (razorpayError: any) {
      console.error("Razorpay order creation error:", razorpayError);
      
      let errorMessage = "Payment gateway error";
      if (razorpayError.error?.description) {
        errorMessage = razorpayError.error.description;
      } else if (razorpayError.message) {
        errorMessage = razorpayError.message;
      }

      res.status(500).json({
        success: false,
        message: "Failed to create payment order",
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? razorpayError : undefined,
      });
      return;
    }

    // Create order in database
    let order;
    try {
      order = new Order({
        userId: new mongoose.Types.ObjectId(userId),
        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
        shippingCharges,
        tax,
        finalAmount,
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        razorpayOrderId: razorpayOrder.id,
      });

      await order.save();
      console.log("Order saved to database:", order._id.toString());
    } catch (orderError: any) {
      console.error("Database order creation error:", orderError);
      res.status(500).json({
        success: false,
        message: "Failed to create order in database",
        error: orderError.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      orderId: order._id.toString(),
      key: RAZORPAY_CONFIG.keyId,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message || "Unknown error occurred",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const verifyPayment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
      return;
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
      return;
    }

    console.log("Verifying payment for order:", razorpay_order_id);

    let order;
    try {
      const query: any = {
        razorpayOrderId: razorpay_order_id,
        userId: new mongoose.Types.ObjectId(userId),
      };
      
      if (orderId) {
        try {
          query._id = new mongoose.Types.ObjectId(orderId);
        } catch (e) {
        }
      }

      order = await Order.findOne(query);
    } catch (findError: any) {
      console.error("Order lookup error:", findError);
      res.status(500).json({
        success: false,
        message: "Failed to find order",
        error: findError.message,
      });
      return;
    }

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      console.error("Razorpay secret not configured");
      res.status(500).json({
        success: false,
        message: "Payment verification configuration error",
      });
      return;
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("Invalid payment signature");
      order.paymentStatus = PaymentStatus.FAILED;
      await order.save();

      res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
      return;
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = PaymentStatus.SUCCESS;
    order.orderStatus = OrderStatus.CONFIRMED;
    await order.save();

    console.log("Payment verified successfully for order:", order._id.toString());

    try {
      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (cart) {
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();
        console.log("Cart cleared for user:", userId);
      }
    } catch (cartError) {
      console.warn("Failed to clear cart:", cartError);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order._id.toString(),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        finalAmount: order.finalAmount,
      },
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message || "Unknown error occurred",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { orderId } = req.params;

    if (!orderId) {
      res.status(400).json({ message: "Order ID is required" });
      return;
    }

    let order;
    try {
      order = await Order.findOne({
        _id: orderId,
        userId: new mongoose.Types.ObjectId(userId),
      }).populate("items.productId");
    } catch (findError: any) {
      res.status(400).json({ 
        message: "Invalid order ID",
        error: findError.message,
      });
      return;
    }

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({
      success: true,
      order: {
        id: order._id.toString(),
        items: order.items,
        totalAmount: order.totalAmount,
        shippingCharges: order.shippingCharges,
        tax: order.tax,
        finalAmount: order.finalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Get order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order status",
      error: error.message || "Unknown error occurred",
    });
  }
};

export const getUserOrders = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const orders = await Order.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        id: order._id.toString(),
        items: order.items,
        totalAmount: order.totalAmount,
        shippingCharges: order.shippingCharges,
        tax: order.tax,
        finalAmount: order.finalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message || "Unknown error occurred",
    });
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!orderId) {
      res.status(400).json({ message: "Order ID is required" });
      return;
    }

    let order;
    try {
      order = await Order.findOne({
        _id: orderId,
        userId: new mongoose.Types.ObjectId(userId),
      });
    } catch (findError: any) {
      res.status(400).json({ 
        message: "Invalid order ID",
        error: findError.message,
      });
      return;
    }

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (orderStatus && Object.values(OrderStatus).includes(orderStatus)) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: {
        id: order._id.toString(),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error: any) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message || "Unknown error occurred",
    });
  }
};
