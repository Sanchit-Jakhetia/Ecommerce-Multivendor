import Review from "../models/Review.js";

// GET /api/reviews?productId=...
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'name' });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
