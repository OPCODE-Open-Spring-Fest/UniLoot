import { Request, Response } from "express";
import Notification, { INotification } from "../models/notification.model.js";

// ➕ Create a new notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, type, message } = req.body;
    const notification: INotification = await Notification.create({
      userId,
      type,
      message,
    });
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

// 📩 Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// ✅ Mark a single notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

// 🧹 Mark all notifications for a user as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ userId }, { $set: { read: true } });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to mark all as read",
      error: error.message,
    });
  }
};

// ❌ Delete a single notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// 🗑️ Delete all notifications for a user
export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await Notification.deleteMany({ userId });
    res.status(200).json({ message: "All notifications deleted" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete all notifications",
      error: error.message,
    });
  }
};
