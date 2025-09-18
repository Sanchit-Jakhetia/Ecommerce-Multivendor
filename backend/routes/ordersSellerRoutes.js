import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

const router = express.Router();

// GET /api/orders/seller/:sellerId?status=...
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status } = req.query;

    // Find all orders, optionally filter by status
    const orderQuery = status ? { status } : {};
    const orders = await Order.find(orderQuery)
      .populate({
        path: "items.productId",
        select: "name price images sellerId",
        model: Product
      })
      .populate({ path: "buyerId", select: "name email" });

    // Filter each order's items to only those belonging to this seller
    const sellerOrders = orders
      .map(order => {
        // Only keep items where productId.sellerId matches sellerId
        const filteredItems = order.items.filter(item => {
          // item.productId may be null if product was deleted
          return (
            item.productId &&
            item.productId.sellerId &&
            item.productId.sellerId.toString() === sellerId
          );
        });
        if (filteredItems.length === 0) return null;
        // Return a new order object with only the seller's items
        return {
          _id: order._id,
          buyer: order.buyerId,
          items: filteredItems,
          total: filteredItems.reduce((sum, i) => sum + (i.price * i.quantity), 0),
          status: order.status,
          createdAt: order.createdAt
        };
      })
      .filter(Boolean); // Remove nulls

    res.json(sellerOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch seller orders", error: err.message });
  }
});

export default router;
