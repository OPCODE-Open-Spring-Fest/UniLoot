import express, { Router } from "express";
import {
  addItem,
  updateQuantity,
  removeItem,
  getCart,
  checkout,
} from "../controllers/cart.controller";
import { protect } from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import {
  addItemSchema,
  removeItemSchema,
  updateQuantitySchema,
  getCartSchema,
  checkoutSchema,
} from "../validations/cartValidation";

const router: Router = express.Router();

//Protected routes
router.post("/add", protect, validateRequest(addItemSchema), addItem);
router.patch("/:itemId", protect, validateRequest(updateQuantitySchema), updateQuantity);
router.delete("/:itemId", protect, removeItem);
router.get("/", protect, getCart);
router.post("/checkout", protect, validateRequest(checkoutSchema), checkout);

export default router;