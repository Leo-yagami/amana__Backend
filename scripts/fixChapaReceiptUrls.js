// One-off migration: blank out fabricated chapa.link receipt URLs.
//
// Older Chapa donations stored a hand-built
// "https://chapa.link/payment-receipt/<ref>" URL that 404s (it does not exist
// in test mode and the format is not guaranteed). Clearing it lets the app fall
// through to the internal receipt view. receiptType/source stay "chapa".
//
// Usage: node scripts/fixChapaReceiptUrls.js
require("dotenv").config();
const mongoose = require("mongoose");
const Donation = require("../models/Donations");

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGO_URI/MONGODB_URI in environment.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected. Scanning for chapa.link/payment-receipt URLs...");

  const result = await Donation.updateMany(
    { receiptUrl: { $regex: "chapa\\.link/payment-receipt/" } },
    { $set: { receiptUrl: "", receiptType: "chapa", source: "chapa" } }
  );

  console.log(
    `Matched ${result.matchedCount ?? result.n}, modified ${
      result.modifiedCount ?? result.nModified
    } donation(s).`
  );

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
})().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
