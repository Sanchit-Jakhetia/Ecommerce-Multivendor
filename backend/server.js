import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";


import productRoutes from "./routes/productRoutes.js"; // ✅ Import routes
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import ordersSellerRoutes from "./routes/ordersSellerRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// ✅ API routes



app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/orders", ordersSellerRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is missing in .env file");
      process.exit(1);
    }

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
