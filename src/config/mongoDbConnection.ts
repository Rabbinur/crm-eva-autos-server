import mongoose from "mongoose";
import { envConfig } from ".";
import dotenv from "dotenv";

dotenv.config();

const mongodbConnection = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    console.log("✅ MongoDB already connected.");
    return;
  }
  console.log("⏳ Connecting MongoDB Database...");
  try {
    await mongoose.connect(envConfig.database.mongodb_url, {
      retryWrites: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected Successfully!");

    try {
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db
          .listCollections({ name: "products" })
          .toArray();
        if (collections.length > 0) {
          // Drop unique name index if it exists to allow products with same name in different categories
          const indexes = await db.collection("products").indexes();
          const hasUniqueNameIndex = indexes.some(
            (index) => index.name === "name_1" && index.unique
          );
          if (hasUniqueNameIndex) {
            await db.collection("products").dropIndex("name_1");
            console.log(
              "🗑️ Dropped unique index 'name_1' on products collection."
            );
          }
        }
      }
    } catch (indexError: any) {
      console.warn(
        "⚠️ Warning: Could not check or drop unique name index on products collection:",
        indexError.message
      );
    }
  } catch (error: any) {
    console.error(`Failed to connect to MongoDB. Error: ${error?.message}`);
  }
};

export default mongodbConnection;
