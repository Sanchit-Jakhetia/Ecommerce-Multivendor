import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  images: { type: [String], default: [] },
  price: { type: Number, required: true },
  mrp: Number,
  discount: Number,
  rating: { type: Number, default: 0 },
  ratingTotal: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  sellerId: String,
  categoryId: String,
  productUrl: String,
  createdAt: { type: Date, default: Date.now }, // ✅ use date from DB if present
  updatedAt: { type: Date, default: Date.now }
});

// ✅ Ensure updatedAt gets refreshed on save
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
