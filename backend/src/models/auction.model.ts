import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  itemDescription: {
    type: String,
    trim: true,
  },
  startPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  minIncrement: {
    type: Number,
    default: 100,
    min: 1,
  },
  currentHighestBid: {
    type: Number,
    default: function () { return this.startPrice; },
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "expired", "sold"],
    default: "active",
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  soldPrice: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Auction", auctionSchema);
