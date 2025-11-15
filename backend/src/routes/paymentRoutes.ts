import express, { Router } from "express";
import {
  createOrder,
  verifyPayment,
  getOrderStatus,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/authMiddleware";

const router: Router = express.Router();

//payment routes
router.post("/create-order", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);
router.get("/orders", authenticate, getUserOrders);
router.get("/orders/:orderId", authenticate, getOrderStatus);
router.patch("/orders/:orderId/status", authenticate, updateOrderStatus);

export default router;

