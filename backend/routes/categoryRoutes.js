import express from "express";
import Category from "../models/categoryModel.js"; // make sure you have this schema

const router = express.Router();

// @desc Get all categories
// @route GET /api/categories
// @access Public
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to load categories", error });
  }
});

export default router;
