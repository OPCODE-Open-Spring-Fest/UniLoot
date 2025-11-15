import cron from "node-cron";
import Auction from "../models/auction.model";
import {
  notifyAuctionExpiring,
  notifyAuctionExpired,
} from "./notification.service";

/**
 * Check for auctions expiring soon (within 24 hours) and send notifications
 */
const checkExpiringAuctions = async (): Promise<void> => {
  try {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Find auctions expiring in the next 24 hours that haven't been notified
    const expiringAuctions = await Auction.find({
      status: "active",
      expiresAt: {
        $gte: now,
        $lte: oneDayFromNow,
      },
    }).populate("seller", "name email");

    for (const auction of expiringAuctions) {
      const hoursLeft = Math.ceil(
        (auction.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      // Only notify if less than 24 hours remaining
      if (hoursLeft <= 24 && hoursLeft > 0) {
        try {
          await notifyAuctionExpiring(auction._id, hoursLeft);
          console.log(
            `Expiring notification sent for auction ${auction._id} (${hoursLeft}h remaining)`
          );
        } catch (error) {
          console.error(
            `Failed to send expiring notification for auction ${auction._id}:`,
            error
          );
        }
      }
    }
  } catch (error) {
    console.error("Error checking expiring auctions:", error);
  }
};

/**
 * Check for expired auctions and send notifications
 */
const checkExpiredAuctions = async (): Promise<void> => {
  try {
    const now = new Date();

    // Find auctions that have expired but are still marked as active
    const expiredAuctions = await Auction.find({
      status: "active",
      expiresAt: { $lte: now },
    }).populate("seller", "name email");

    for (const auction of expiredAuctions) {
      try {
        // Mark as expired
        auction.status = "expired";
        await auction.save();

        // Send notification
        await notifyAuctionExpired(auction._id);
        console.log(`Expired notification sent for auction ${auction._id}`);
      } catch (error) {
        console.error(
          `Failed to process expired auction ${auction._id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error checking expired auctions:", error);
  }
};

/**
 * Initialize scheduled jobs
 */
export const initializeAuctionScheduler = (): void => {
  // Check for expiring auctions every hour
  cron.schedule("0 * * * *", () => {
    console.log("Running expiring auctions check...");
    checkExpiringAuctions();
  });

  // Check for expired auctions every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    console.log("Running expired auctions check...");
    checkExpiredAuctions();
  });

  console.log("Auction scheduler initialized");
};

