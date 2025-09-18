import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// @desc Get all products (with optional category filter)
// @route GET /api/products
router.get("/", async (req, res) => {
  try {
    const { categoryId } = req.query; // check query param
    let filter = {};

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

// @desc Get single product by ID
// @route GET /api/products/:id
import User from "../models/User.js";

// Get single product by ID, with seller name
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    let seller = null;
    if (product.sellerId) {
      seller = await User.findById(product.sellerId, "name");
    }
    res.json({ ...product, seller: seller ? { _id: seller._id, name: seller.name } : null });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
});

export default router;
