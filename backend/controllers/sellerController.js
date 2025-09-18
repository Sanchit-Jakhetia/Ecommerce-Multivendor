import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// Get all products for a seller
export const getSellerProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ sellerId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch seller products', error: err.message });
  }
};

// Get recent orders for a seller (orders containing seller's products)
export const getSellerOrders = async (req, res) => {
  try {
    const { sellerId } = req.params;
    // Find orders that have at least one product with this sellerId
    const orders = await Order.find({ 'items.sellerId': sellerId }).sort({ createdAt: -1 }).limit(10);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch seller orders', error: err.message });
  }
};

// Get average rating for seller's products
export const getSellerStats = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ sellerId });
    const productIds = products.map(p => p._id);
    const reviews = await Review.find({ productId: { $in: productIds } });
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
    const totalSales = products.reduce((sum, p) => sum + (p.price * (p.sales || 0)), 0);
    res.json({
      productCount: products.length,
      avgRating: avgRating.toFixed(2),
      totalSales
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch seller stats', error: err.message });
  }
};
