import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications (with optional filters)
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.patch("/read-all", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;

