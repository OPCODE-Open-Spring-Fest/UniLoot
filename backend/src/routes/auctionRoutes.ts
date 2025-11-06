import express from "express";
import {
  createAuction,
  placeBid,
  acceptHighestBid,
} from "../controllers/auction.controller";
import { authenticate, authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();

// Create a new auction (only sellers)
router.post("/", authenticate, authorizeRole("seller"), createAuction);

// Place a bid (only buyers)
router.post("/:id/bid", authenticate, authorizeRole("buyer"), placeBid);

// Seller accepts the highest bid
router.post("/:id/accept", authenticate, authorizeRole("seller"), acceptHighestBid);

export default router;
