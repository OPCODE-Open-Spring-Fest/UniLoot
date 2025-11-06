import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/:userId", getUserNotifications);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

// ✅ Mark all as read
router.patch("/user/:userId/readAll", markAllAsRead);

// 🗑️ Delete all notifications
router.delete("/user/:userId/deleteAll", deleteAllNotifications);

export default router;
