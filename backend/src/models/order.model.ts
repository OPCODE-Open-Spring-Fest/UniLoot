import mongoose, { Schema, Types, Document } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingCharges: number;
  tax: number;
  finalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    shippingCharges: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: "India" },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", orderSchema);

