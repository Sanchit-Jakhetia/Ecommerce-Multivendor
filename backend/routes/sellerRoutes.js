import express from "express";
import {
  getSellerProducts,
  getSellerOrders,
  getSellerStats
} from "../controllers/sellerController.js";

const router = express.Router();

// Get all products for a seller
router.get("/:sellerId/products", getSellerProducts);
// Get recent orders for a seller
router.get("/:sellerId/orders", getSellerOrders);
// Get seller stats (product count, avg rating, total sales)
router.get("/:sellerId/stats", getSellerStats);

export default router;
