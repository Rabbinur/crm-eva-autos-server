import mongoose from "mongoose";
import { envConfig } from ".";
/**
 * Migrate all collections and their documents from an old MongoDB database
 * to a new MongoDB database using Mongoose.
 *
 * This function:
 * 1. Connects to both the old and new MongoDB databases.
 * 2. Retrieves all collection names from the old database.
 * 3. Iterates through each collection and migrates all documents in batches of 1000.
 * 4. Skips duplicate `_id` values to avoid conflicts in the new database.
 * 5. Logs migration progress, including number of documents migrated and skipped.
 * 6. Closes both database connections and exits the Node.js process when done.
 *
 * Notes:
 * - The function uses `ordered: false` during inserts to continue migration
 *   even if some documents cause duplicate key errors.
 * - Can be safely re-run; it will only insert missing documents.
 * - Uses environment variables from `envConfig` for database URLs.
 *
 * Usage:
 * ```ts
 * import { migrateDatabase } from "./migrateDatabase";
 * migrateDatabase();
 * ```
 *
 * Exits the process with:
 * - `0` on successful migration
 * - `1` if any unexpected error occurs
 */

export const migrateDatabase = async () => {
  const oldDbUrl = "";
  const newDbUrl = envConfig.database.mongodb_url;
  try {
    // --- Connect to old and new databases separately ---
    const oldConnection = await mongoose
      .createConnection(oldDbUrl, { dbName: "crm-distributor" })
      .asPromise();
    const newConnection = await mongoose.createConnection(newDbUrl).asPromise();

    console.log("✅ Connected to both databases");

    if (!oldConnection.db) {
      console.log("❌ OLD Database not found");
      return false;
    }

    // --- Get all collection names from old database ---
    const collections = await oldConnection.db.listCollections().toArray();
    console.log(`🔍 Found ${collections.length} collections to migrate`);

    for (const { name: collectionName } of collections) {
      console.log(`\n🚀 Migrating collection: ${collectionName}`);

      const oldCollection = oldConnection.collection(collectionName);
      const newCollection = newConnection.collection(collectionName);

      const cursor = oldCollection.find({});
      let batch: any[] = [];
      let migratedCount = 0;
      let skippedCount = 0;

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        if (!doc) continue;

        batch.push(doc);

        // Process in batches of 1000
        if (batch.length >= 1000) {
          try {
            await newCollection.insertMany(batch, { ordered: false });
            migratedCount += batch.length;
          } catch (err: any) {
            if (err.writeErrors) {
              const duplicates = err.writeErrors.filter((e: any) =>
                e.errmsg?.includes("E11000 duplicate key")
              );
              skippedCount += duplicates.length;
              console.log(
                `⚠️ Skipped ${duplicates.length} duplicate _id(s) in ${collectionName}`
              );
            } else {
              console.error(
                `❌ Error inserting batch in ${collectionName}:`,
                err.message
              );
            }
          }
          batch = [];
        }
      }

      // Insert remaining batch
      if (batch.length > 0) {
        try {
          await newCollection.insertMany(batch, { ordered: false });
          migratedCount += batch.length;
        } catch (err: any) {
          if (err.writeErrors) {
            const duplicates = err.writeErrors.filter((e: any) =>
              e.errmsg?.includes("E11000 duplicate key")
            );
            skippedCount += duplicates.length;
            console.log(
              `⚠️ Skipped ${duplicates.length} duplicate _id(s) in ${collectionName}`
            );
          } else {
            console.error(
              `❌ Error inserting batch in ${collectionName}:`,
              err.message
            );
          }
        }
      }

      console.log(
        `✅ Done: ${collectionName} | Migrated: ${migratedCount} | Skipped (duplicates): ${skippedCount}`
      );
    }

    await oldConnection.close();
    await newConnection.close();
    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

// Run the migration
migrateDatabase();
