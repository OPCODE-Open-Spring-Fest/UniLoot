import { Request, Response } from "express";
import { Server as SocketIOServer } from "socket.io";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import Notification from "../models/notification.model.js";
import { Types } from "mongoose";

// ✅ Custom Request interface with Socket.IO support and generics
interface SocketRequest<P = any, ResBody = any, ReqBody = any> extends Request<P, ResBody, ReqBody> {
  io?: SocketIOServer;
}

// ✅ Bid request body type
interface BidRequestBody {
  auctionId: string;
  bidderId: string;
  amount: number;
}

// ✅ Place Bid Controller
export const placeBid = async (req: SocketRequest<{}, {}, BidRequestBody>, res: Response) => {
  try {
    const { auctionId, bidderId, amount } = req.body;

    // 🔍 Find auction and validate
    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== "active") {
      return res.status(400).json({ message: "Auction not active or invalid" });
    }

    // 💰 Check if bid is higher
    if (amount <= auction.currentHighestBid) {
      return res.status(400).json({ message: "Bid must be higher than current bid" });
    }

    const previousBidder = auction.highestBidder;

    // 🏷️ Update auction with new bid
    auction.currentHighestBid = amount;
    auction.highestBidder = new Types.ObjectId(bidderId);
    await auction.save();

    // 🧾 Record the bid
    await Bid.create({ auctionId, bidder: bidderId, amount });

    // 🔔 Notify previous bidder (if exists)
    if (previousBidder) {
      await Notification.create({
        userId: previousBidder,
        type: "OUTBID",
        message: `You have been outbid on "${auction.itemName}".`,
      });

      // 👇 Emit real-time Socket.IO notification
      if (req.io) {
        req.io.to(previousBidder.toString()).emit("notification", {
          type: "OUTBID",
          message: `You have been outbid on "${auction.itemName}".`,
        });
      }
    }

    res.status(200).json({ message: "Bid placed successfully" });
  } catch (error: any) {
    console.error("❌ Error placing bid:", error);
    res.status(500).json({ message: "Error placing bid", error: error.message });
  }
};
