import { Request, Response } from "express";
import Auction from "../models/auction.model";
import Bid from "../models/bid.model";
import Product from "../models/product.model";
import mongoose from "mongoose";

//new auction
export const createAuction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { productId, startPrice, minIncrement, durationHours } = req.body;
    if (!productId || !startPrice) {
      res.status(400).json({ message: "Product ID and start price are required" });
      return;
    }
    //if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    const existingAuction = await Auction.findOne({ productId: new mongoose.Types.ObjectId(productId), status: "active" });
    if (existingAuction) {
      res.status(400).json({ message: "An active auction already exists for this product" });
      return;
    }
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (durationHours || 48));

    const auction = new Auction({
      productId: new mongoose.Types.ObjectId(productId),
      itemName: product.name,
      itemDescription: product.description,
      startPrice,
      currentHighestBid: startPrice,
      minIncrement: minIncrement || 100,
      seller: new mongoose.Types.ObjectId(userId),
      expiresAt,
      status: "active",
    });
    await auction.save();
    res.status(201).json(auction);
  } catch (error: any) {
    console.error("Create auction error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const placeBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: "Valid bid amount is required" });
      return;
    }
    let auction = await Auction.findById(id);
    if (!auction) {
      auction = await Auction.findOne({ productId: new mongoose.Types.ObjectId(id), status: "active" });
    }

    if (!auction) {
      res.status(404).json({ message: "Auction not found or not active" });
      return;
    }

    if (auction.status !== "active") {
      res.status(400).json({ message: "Auction is not active" });
      return;
    }

    // Check if expired
    if (new Date() > auction.expiresAt) {
      auction.status = "expired";
      await auction.save();
      res.status(400).json({ message: "Auction has expired" });
      return;
    }
    if (auction.seller.toString() === userId) {
      res.status(400).json({ message: "You cannot bid on your own auction" });
      return;
    }
    const minBid = auction.currentHighestBid + (auction.minIncrement || 100);
    if (amount < minBid) {
      res.status(400).json({ message: `Bid must be at least ₹${minBid}` });
      return;
    }
    const bid = new Bid({
      auctionId: auction._id,
      bidder: new mongoose.Types.ObjectId(userId),
      amount,
    });

    await bid.save();
    auction.currentHighestBid = amount;
    auction.highestBidder = new mongoose.Types.ObjectId(userId);
    await auction.save();

    res.status(201).json({
      message: "Bid placed successfully",
      bid,
      auction: {
        currentHighestBid: auction.currentHighestBid,
        highestBidder: auction.highestBidder,
      },
    });
  } catch (error: any) {
    console.error("Place bid error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
export const acceptHighestBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    let auction = await Auction.findById(id);
    if (!auction) {
      auction = await Auction.findOne({ productId: new mongoose.Types.ObjectId(id), status: "active" });
    }

    if (!auction) {
      res.status(404).json({ message: "Auction not found" });
      return;
    }

    if (auction.seller.toString() !== userId) {
      res.status(403).json({ message: "Only the seller can accept bids" });
      return;
    }

    if (!auction.highestBidder) {
      res.status(400).json({ message: "No bids to accept" });
      return;
    }
    // Mark auction as sold
    auction.status = "sold";
    auction.soldTo = auction.highestBidder;
    auction.soldPrice = auction.currentHighestBid;
    await auction.save();

    res.status(200).json({
      message: "Bid accepted successfully",
      auction,
    });
  } catch (error: any) {
    console.error("Accept bid error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get auction by product ID
export const getAuctionByProductId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const auction = await Auction.findOne({
      productId: new mongoose.Types.ObjectId(productId),
      status: "active",
    }).populate("seller", "name email").populate("highestBidder", "name email");

    if (!auction) {
      res.status(404).json({ message: "No active auction found for this product" });
      return;
    }

    //time left
    const now = new Date();
    const expiresAt = new Date(auction.expiresAt);
    const timeLeftMs = expiresAt.getTime() - now.getTime();
    const timeLeftHours = Math.max(0, Math.floor(timeLeftMs / (1000 * 60 * 60)));
    const timeLeftMinutes = Math.max(0, Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60)));

    res.status(200).json({
      ...auction.toObject(),
      timeLeft: timeLeftMs > 0 ? `${timeLeftHours}h ${timeLeftMinutes}m` : "Expired",
      isExpired: timeLeftMs <= 0,
    });
  } catch (error: any) {
    console.error("Get auction error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get all bids for an auction
export const getAuctionBids = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let auction = await Auction.findById(id);
    if (!auction) {
      auction = await Auction.findOne({ productId: new mongoose.Types.ObjectId(id) });
    }

    if (!auction) {
      res.status(404).json({ message: "Auction not found" });
      return;
    }

    const bids = await Bid.find({ auctionId: auction._id })
      .populate("bidder", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(bids);
  } catch (error: any) {
    console.error("Get bids error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

