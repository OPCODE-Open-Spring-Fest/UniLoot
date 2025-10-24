import express, { Router } from "express";
import {
  addItem,
  updateQuantity,
  removeItem,
  getCart,
  checkout,
} from "../controllers/cart.controller";

const router: Router = express.Router();

router.post("/", addItem);
router.patch("/:itemId", updateQuantity);
router.delete("/:itemId", removeItem);
router.get("/", getCart);
router.post("/checkout", checkout);

export default router;
