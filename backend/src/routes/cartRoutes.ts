import express, { Router } from "express";
import {
  addItem,
  updateQuantity,
  removeItem,
  getCart,
  checkout,
} from "../controllers/cart.controller";
import { authenticate } from "../middleware/authMiddleware";

const router: Router = express.Router();

//Protected routes
router.post("/", authenticate, addItem);
router.patch("/:itemId", authenticate, updateQuantity);
router.delete("/:itemId", authenticate, removeItem);
router.get("/", authenticate, getCart);
router.post("/checkout", authenticate, checkout);

export default router;