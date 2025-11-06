import { Request, Response } from "express";
import { Types } from "mongoose";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import Notification from "../models/notification.model.js";

// ✅ Extend Express Request type to include Socket.IO instance and user
interface SocketRequest extends Request {
  io?: import("socket.io").Server;
  user?: { id: string; username: string; role: string };
}

// ------------------ Create Auction ------------------
export const createAuction = async (req: SocketRequest, res: Response) => {
  try {
    const { itemName, itemDescription, startPrice, expiresAt } = req.body;
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({ message: "Unauthorized. Please log in again." });
    }

    // ✅ Convert to ObjectId for Mongo
    const auction = await Auction.create({
      itemName,
      itemDescription,
      startPrice,
      expiresAt,
      seller: new Types.ObjectId(sellerId),
    });

    res.status(201).json(auction);
  } catch (error: any) {
    console.error("❌ Error creating auction:", error);
    res.status(500).json({ message: "Error creating auction" });
  }
};

// ------------------ Place a Bid ------------------
export const placeBid = async (req: SocketRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const bidderId = req.user?.id;

    if (!bidderId) {
      return res.status(401).json({ message: "Unauthorized. Please log in again." });
    }

    const auction = await Auction.findById(id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.status !== "active")
      return res.status(400).json({ message: "Auction is not active" });
    if (amount <= auction.currentHighestBid)
      return res.status(400).json({ message: "Bid must be higher than current bid" });

    const previousHighestBidder = auction.highestBidder;

    // 💰 Update auction
    auction.currentHighestBid = amount;
    auction.highestBidder = new Types.ObjectId(bidderId);
    await auction.save();

    // 📝 Record the bid
    await Bid.create({
      auctionId: new Types.ObjectId(id),
      bidder: new Types.ObjectId(bidderId),
      amount,
    });

    // 🔔 Notify previous highest bidder
    if (previousHighestBidder) {
      const notification = await Notification.create({
        userId: previousHighestBidder,
        type: "OUTBID",
        message: `You’ve been outbid on "${auction.itemName}".`,
      });

      // 👇 Emit real-time event if socket instance is attached
      req.io?.to(previousHighestBidder.toString()).emit("notification", notification);
    }

    res.status(200).json({ message: "Bid placed successfully", auction });
  } catch (error: any) {
    console.error("❌ Error placing bid:", error);
    res.status(500).json({ message: "Error placing bid" });
  }
};

// ------------------ Accept Highest Bid ------------------
export const acceptHighestBid = async (req: SocketRequest, res: Response) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id).populate("seller highestBidder");

    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.status !== "active")
      return res.status(400).json({ message: "Auction is not active" });

    if (!auction.highestBidder)
      return res.status(400).json({ message: "No bids yet to accept" });

    auction.status = "sold";
    // @ts-ignore – populated docs
    auction.soldTo = auction.highestBidder._id;
    auction.soldPrice = auction.currentHighestBid;
    await auction.save();

    // 🔔 Notify seller
    const sellerNotification = await Notification.create({
      // @ts-ignore
      userId: auction.seller._id,
      type: "SALE",
      message: `Your item "${auction.itemName}" sold for ₹${auction.currentHighestBid}.`,
    });

    // 🔔 Notify buyer
    const buyerNotification = await Notification.create({
      // @ts-ignore
      userId: auction.highestBidder._id,
      type: "AUCTION_WON",
      message: `You won the auction for "${auction.itemName}" at ₹${auction.currentHighestBid}.`,
    });

    // 👇 Emit real-time via Socket.IO if available
    req.io?.to(auction.seller._id.toString()).emit("notification", sellerNotification);
    req.io?.to(auction.highestBidder._id.toString()).emit("notification", buyerNotification);

    res.status(200).json({ message: "Auction sold successfully", auction });
  } catch (error: any) {
    console.error("❌ Error accepting bid:", error);
    res.status(500).json({ message: "Error accepting bid" });
  }
};
