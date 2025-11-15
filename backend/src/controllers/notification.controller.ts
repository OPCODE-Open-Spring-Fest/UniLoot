import { Request, Response } from "express";
import Notification from "../models/notification.model";
import mongoose from "mongoose";

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { read, limit = 50, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (read !== undefined) {
      query.read = read === "true";
    }

    const notifications = await Notification.find(query)
      .populate("auctionId", "itemName")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      read: false,
    });

    res.status(200).json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      unreadCount,
    });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error: any) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        read: false,
      },
      { read: true }
    );

    res.status(200).json({
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error: any) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const count = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      read: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (error: any) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

