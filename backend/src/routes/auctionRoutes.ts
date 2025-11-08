import express from "express";
import {
  createAuction,
  placeBid,
  acceptHighestBid,
  getAuctionByProductId,
  getAuctionBids,
} from "../controllers/auction.controller";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/product/:productId", getAuctionByProductId);
router.get("/:id/bids", getAuctionBids);
router.post("/", authenticate, createAuction);

// Place a bid (authenticated)
router.post("/:id/bid", authenticate, placeBid);

// Seller accepts the highest bid (authenticated)
router.post("/:id/accept", authenticate, acceptHighestBid);

export default router;
