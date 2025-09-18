import express from "express";
import {
  getCart,
  updateCart,
  mergeCart,
  removeItem,
  clearCart
} from "../controllers/cartController.js";

const router = express.Router();

// Get cart for user
router.get("/:userId", getCart);
// Update/replace cart for user
router.put("/:userId", updateCart);
// Merge local cart with server cart
router.post("/merge/:userId", mergeCart);
// Remove item from cart
router.delete("/:userId/item/:productId", removeItem);
// Clear cart
router.delete("/:userId/clear", clearCart);

export default router;
