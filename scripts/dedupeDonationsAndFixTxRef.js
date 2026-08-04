// One-off migration to support the unique+sparse index on Donation.tx_ref.
//
// Two problems this fixes:
//   1. Older donations stored tx_ref: "" (empty string). A sparse unique index
//      still indexes "", so multiple such docs would break the index build.
//      We $unset empty tx_ref values so they become truly absent (not indexed).
//   2. The old code could create duplicate donations for a single Chapa payment
//      (repeated callbacks / browser hits). We keep the earliest donation per
//      tx_ref and remove the later duplicates so the unique index can build.
//
// Usage: node scripts/dedupeDonationsAndFixTxRef.js
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
  console.log("Connected.");

  // 1. Unset empty-string tx_ref so the sparse index ignores manual donations.
  const unsetResult = await Donation.updateMany(
    { tx_ref: "" },
    { $unset: { tx_ref: "" } }
  );
  console.log(
    `Cleared empty tx_ref on ${unsetResult.modifiedCount ?? unsetResult.nModified} donation(s).`
  );

  // 2. Find duplicate tx_ref groups (real Chapa refs only) and remove extras.
  const dupes = await Donation.aggregate([
    { $match: { tx_ref: { $exists: true, $nin: [null, ""] } } },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: "$tx_ref",
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  let removed = 0;
  for (const group of dupes) {
    // Keep the first (earliest created), delete the rest.
    const [, ...extras] = group.ids;
    if (extras.length) {
      const del = await Donation.deleteMany({ _id: { $in: extras } });
      removed += del.deletedCount ?? 0;
      console.log(
        `tx_ref ${group._id}: kept 1, removed ${extras.length} duplicate(s).`
      );
    }
  }
  console.log(`Removed ${removed} duplicate donation(s) total.`);

  // 3. Repair duplicate donationReference values (pre-existing bad data from the
  //    old duplicate-donation bug). donationReference has a unique index, so
  //    collisions block index builds. Keep the earliest; re-key the rest with a
  //    fresh unique DON- reference derived from their own _id.
  const refDupes = await Donation.aggregate([
    { $match: { donationReference: { $exists: true, $nin: [null, ""] } } },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: "$donationReference",
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  let rekeyed = 0;
  for (const group of refDupes) {
    const [, ...extras] = group.ids;
    for (const dupId of extras) {
      // Derive a fresh reference from the doc's own _id, and guarantee
      // uniqueness by appending a short suffix if it still collides.
      let newRef = `DON-${dupId.toString().slice(4, 11)}`;
      let attempt = 0;
      while (await Donation.exists({ donationReference: newRef })) {
        attempt += 1;
        newRef = `DON-${dupId.toString().slice(4, 11)}-${attempt}`;
      }
      await Donation.updateOne({ _id: dupId }, { $set: { donationReference: newRef } });
      rekeyed += 1;
      console.log(`donationReference ${group._id}: re-keyed ${dupId} -> ${newRef}`);
    }
  }
  console.log(`Re-keyed ${rekeyed} duplicate donationReference(s) total.`);

  // 4. Ensure the new indexes are built now that data is clean.
  await Donation.syncIndexes();
  console.log("Indexes synced.");

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
})().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
