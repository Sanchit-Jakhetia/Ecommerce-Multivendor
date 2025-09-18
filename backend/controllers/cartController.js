import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Get cart for a user
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ buyerId: userId }).populate('items.productId');
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get cart', error: err.message });
  }
};

// Add or update items in cart
export const updateCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body; // [{ productId, quantity }]
    let cart = await Cart.findOne({ buyerId: userId });
    if (!cart) {
      cart = new Cart({ buyerId: userId, items });
    } else {
      cart.items = items;
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart', error: err.message });
  }
};

// Merge local cart with server cart
export const mergeCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body; // [{ productId, quantity }]
    let cart = await Cart.findOne({ buyerId: userId });
    if (!cart) {
      cart = new Cart({ buyerId: userId, items });
    } else {
      // Merge logic: sum quantities for same product
      const itemMap = new Map();
      cart.items.forEach(item => itemMap.set(String(item.productId), item.quantity));
      items.forEach(item => {
        const pid = String(item.productId);
        itemMap.set(pid, (itemMap.get(pid) || 0) + item.quantity);
      });
      cart.items = Array.from(itemMap.entries()).map(([productId, quantity]) => ({ productId, quantity }));
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to merge cart', error: err.message });
  }
};

// Remove item from cart
export const removeItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    let cart = await Cart.findOne({ buyerId: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => String(item.productId) !== productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item', error: err.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ buyerId: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart', error: err.message });
  }
};
