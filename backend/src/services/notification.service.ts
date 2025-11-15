import nodemailer from "nodemailer";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import Notification from "../models/notification.model";
import { User } from "../models/user.model";
import Auction from "../models/auction.model";
import Bid from "../models/bid.model";
import mongoose from "mongoose";

// Initialize Firebase Admin if credentials are available
let firebaseInitialized = false;
try {
  // Try loading from environment variable first
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log("Firebase Admin initialized from environment variable");
  }
  // Try loading from file if not in environment
  else {
    const serviceAccountPath = path.join(
      __dirname,
      "../../firebase-service-account.json"
    );
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, "utf8")
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log("Firebase Admin initialized from file");
    }
  }
} catch (error) {
  console.warn("Firebase Admin initialization failed (push notifications disabled):", error);
}

// Email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

interface NotificationData {
  userId: string | mongoose.Types.ObjectId;
  type: "new_bid" | "bid_accepted" | "auction_expiring" | "auction_expired";
  title: string;
  message: string;
  auctionId?: string | mongoose.Types.ObjectId;
  bidId?: string | mongoose.Types.ObjectId;
}

/**
 * Create and send notification (email + push)
 */
export const sendNotification = async (data: NotificationData): Promise<void> => {
  try {
    // Create notification record
    const notification = new Notification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      auctionId: data.auctionId,
      bidId: data.bidId,
    });

    await notification.save();

    // Get user for email
    const user = await User.findById(data.userId);
    if (!user) {
      console.error(`User not found: ${data.userId}`);
      return;
    }

    // Send email notification
    if (user.email) {
      try {
        await sendEmailNotification(user.email, data.title, data.message, data);
        notification.emailSent = true;
        await notification.save();
      } catch (error) {
        console.error("Email notification failed:", error);
      }
    }

    // Send push notification (if Firebase is initialized and user has FCM token)
    // Note: You'll need to add fcmToken field to User model if not present
    if (firebaseInitialized) {
      try {
        // This would require storing FCM tokens in user model
        // For now, we'll just mark it as attempted
        // await sendPushNotification(user.fcmToken, data.title, data.message);
        notification.pushSent = true;
        await notification.save();
      } catch (error) {
        console.error("Push notification failed:", error);
      }
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (
  email: string,
  subject: string,
  message: string,
  data: NotificationData
): Promise<void> => {
  const transporter = createEmailTransporter();

  // Create HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>UniLoot Auction Notification</h1>
        </div>
        <div class="content">
          <h2>${subject}</h2>
          <p>${message}</p>
          ${data.auctionId ? `<a href="${process.env.FRONTEND_URL}/auctions/${data.auctionId}" class="button">View Auction</a>` : ""}
        </div>
        <div class="footer">
          <p>This is an automated notification from UniLoot.</p>
          <p>You can manage your notification preferences in your account settings.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `UniLoot: ${subject}`,
    html: htmlContent,
    text: message, // Plain text fallback
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send push notification via FCM
 */
export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!firebaseInitialized) {
    console.warn("Firebase not initialized, skipping push notification");
    return;
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: data || {},
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Push notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
};

/**
 * Notify seller about new bid
 */
export const notifyNewBid = async (
  auctionId: string | mongoose.Types.ObjectId,
  bidId: string | mongoose.Types.ObjectId,
  bidAmount: number
): Promise<void> => {
  const auction = await Auction.findById(auctionId).populate("seller", "name email");
  if (!auction || !auction.seller) return;

  const bid = await Bid.findById(bidId).populate("bidder", "name");
  const bidderName = bid && (bid.bidder as any)?.name ? (bid.bidder as any).name : "Someone";

  await sendNotification({
    userId: (auction.seller as any)._id,
    type: "new_bid",
    title: "New Bid on Your Auction",
    message: `${bidderName} placed a bid of ₹${bidAmount} on your auction "${auction.itemName}".`,
    auctionId: auction._id,
    bidId: bidId,
  });
};

/**
 * Notify seller about bid acceptance
 */
export const notifyBidAccepted = async (
  auctionId: string | mongoose.Types.ObjectId
): Promise<void> => {
  const auction = await Auction.findById(auctionId)
    .populate("seller", "name email")
    .populate("highestBidder", "name");
  
  if (!auction || !auction.seller) return;

  const buyerName = auction.highestBidder && (auction.highestBidder as any)?.name 
    ? (auction.highestBidder as any).name 
    : "a buyer";

  await sendNotification({
    userId: (auction.seller as any)._id,
    type: "bid_accepted",
    title: "Bid Accepted - Auction Sold",
    message: `Your auction "${auction.itemName}" has been sold to ${buyerName} for ₹${auction.currentHighestBid}.`,
    auctionId: auction._id,
  });
};

/**
 * Notify seller about auction expiring soon
 */
export const notifyAuctionExpiring = async (
  auctionId: string | mongoose.Types.ObjectId,
  hoursLeft: number
): Promise<void> => {
  const auction = await Auction.findById(auctionId).populate("seller", "name email");
  if (!auction || !auction.seller) return;

  await sendNotification({
    userId: (auction.seller as any)._id,
    type: "auction_expiring",
    title: "Auction Expiring Soon",
    message: `Your auction "${auction.itemName}" will expire in ${hoursLeft} hour(s). Current highest bid: ₹${auction.currentHighestBid}.`,
    auctionId: auction._id,
  });
};

/**
 * Notify seller about auction expired
 */
export const notifyAuctionExpired = async (
  auctionId: string | mongoose.Types.ObjectId
): Promise<void> => {
  const auction = await Auction.findById(auctionId).populate("seller", "name email");
  if (!auction || !auction.seller) return;

  const message = auction.highestBidder
    ? `Your auction "${auction.itemName}" has expired. Highest bid was ₹${auction.currentHighestBid}. You can accept the bid or let it expire.`
    : `Your auction "${auction.itemName}" has expired with no bids.`;

  await sendNotification({
    userId: (auction.seller as any)._id,
    type: "auction_expired",
    title: "Auction Expired",
    message,
    auctionId: auction._id,
  });
};

