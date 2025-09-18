import express from "express";
import { getReviewsByProduct } from "../controllers/reviewController.js";

const router = express.Router();

// GET /api/reviews?productId=...
router.get("/", getReviewsByProduct);

export default router;
