import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const MONGO_URL = process.env.MONGO_URI;
if (!MONGO_URL) {
  throw new Error("❌ MONGO_URL is missing in .env file");
}

// Some generic comments to randomly pick from
const genericComments = [
  "Good product",
  "Nice product",
  "Really liked it",
  "Worth the price",
  "Satisfied with the purchase",
  "Decent quality",
  "Met expectations"
];

function getRandomComment() {
  return genericComments[Math.floor(Math.random() * genericComments.length)];
}

async function updateReviews() {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(); // uses DB from URL
    const reviewsCollection = db.collection("reviews");

    const cursor = reviewsCollection.find({});
    while (await cursor.hasNext()) {
      const review = await cursor.next();

      const rating = review.rating || 0;
      const wholeRating = Math.round(rating);
      const newComment = getRandomComment();

      // Update only comment and rating
      await reviewsCollection.updateOne(
        { _id: review._id },
        { $set: { comment: newComment, rating: wholeRating } }
      );

      console.log(`✅ Updated review ${review._id}`);
    }

    console.log("🎉 All reviews updated successfully!");
  } catch (error) {
    console.error("❌ Error updating reviews:", error);
  } finally {
    await client.close();
  }
}

updateReviews();
