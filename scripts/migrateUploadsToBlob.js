// One-off migration: re-host the local `uploads/` folder into Vercel Blob and
// rewrite every database URL that pointed at it.
//
// Local dev wrote files to disk and stored relative `/uploads/<subdir>/<file>`
// URLs (sometimes prefixed with a dev origin). Those files never ship to
// Render, so in production the links 404. This script:
//   1. uploads each local file to Vercel Blob (requires BLOB_READ_WRITE_TOKEN)
//   2. replaces every matching URL in the DB with the new absolute blob URL
//
// Handled collections/fields:
//   - Family.documents[].url
//   - Family.members[].photoUrl
//   - User.avatar
//   - Donor.avatar
//   - Donation.receiptUrl
//   - Event.imageUrls            (comma-separated string)
//
// Usage: node scripts/migrateUploadsToBlob.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { put, head } = require("@vercel/blob");
const Family = require("../models/Family");
const User = require("../models/User");
const Donor = require("../models/Donors");
const Donation = require("../models/Donations");
const Event = require("../models/Event");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Matches the stored URL forms for a local upload:
//   /uploads/<subdir>/<file>
//   http://localhost:3000/uploads/<subdir>/<file>
//   https://anything/uploads/<subdir>/<file>
function localUrlRegex(subdir, filename) {
  return new RegExp(
    `(?:https?://[^/]*)?/uploads/${escapeRegExp(subdir)}/${escapeRegExp(filename)}`
  );
}

function collectLocalFiles() {
  const files = [];
  if (!fs.existsSync(UPLOADS_DIR)) return files;
  for (const subdir of fs.readdirSync(UPLOADS_DIR)) {
    const dir = path.join(UPLOADS_DIR, subdir);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const name of fs.readdirSync(dir)) {
      const filePath = path.join(dir, name);
      if (!fs.statSync(filePath).isFile()) continue;
      files.push({ subdir, filename: name, filePath });
    }
  }
  return files;
}

async function uploadToBlob(file) {
  // Re-run safe: if this file already landed in Blob, reuse its existing URL.
  try {
    const existing = await head(file.filename, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { ...file, blobUrl: existing.url };
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  const ext = path.extname(file.filename).toLowerCase();
  const buffer = fs.readFileSync(file.filePath);
  const blob = await put(file.filename, buffer, {
    access: "public",
    contentType: MIME_BY_EXT[ext] || "application/octet-stream",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return { ...file, blobUrl: blob.url };
}

// Returns a function oldUrl -> newUrl. `report` collects old URLs that looked
// like local uploads but had no matching file on disk (data loss candidates).
function buildRewriter(migrated, report) {
  return function rewrite(url) {
    if (typeof url !== "string" || !url) return url;
    for (const f of migrated) {
      const re = localUrlRegex(f.subdir, f.filename);
      if (re.test(url)) {
        return url.replace(re, f.blobUrl);
      }
    }
    if (/\/uploads\//.test(url)) report.push(url);
    return url;
  };
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Missing BLOB_READ_WRITE_TOKEN in environment. Cannot upload to Blob.");
    process.exit(1);
  }
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGO_URI/MONGODB_URI in environment.");
    process.exit(1);
  }

  const localFiles = collectLocalFiles();
  if (localFiles.length === 0) {
    console.log("No files found under uploads/. Nothing to migrate.");
    process.exit(0);
  }
  console.log(`Found ${localFiles.length} local file(s) to migrate.`);

  const migrated = [];
  for (const file of localFiles) {
    const result = await uploadToBlob(file);
    migrated.push(result);
    console.log(`  uploaded ${file.subdir}/${file.filename} -> ${result.blobUrl}`);
  }

  await mongoose.connect(uri);
  console.log("Connected. Rewriting database URLs...");

  const unreferenced = [];
  const rewrite = buildRewriter(migrated, unreferenced);
  const changed = (url, update) =>
    url !== undefined && url !== null && url !== "" && update !== url;

  let familyDocs = 0;
  for (const fam of await Family.find({})) {
    let touched = false;
    const documents = (fam.documents || []).map((d) => {
      const next = rewrite(d.url);
      if (next !== d.url) touched = true;
      return { ...d.toObject(), url: next };
    });
    const members = (fam.members || []).map((m) => {
      const next = rewrite(m.photoUrl);
      if (next !== m.photoUrl) touched = true;
      return { ...m.toObject(), photoUrl: next };
    });
    if (touched) {
      await Family.updateOne(
        { _id: fam._id },
        { $set: { documents, members } }
      );
      familyDocs += 1;
    }
  }
  console.log(`  Family: updated ${familyDocs} document(s).`);

  const updateField = async (Model, field, label) => {
    let count = 0;
    for (const doc of await Model.find({ [field]: /\/uploads\// })) {
      const next = rewrite(doc[field]);
      if (changed(doc[field], next)) {
        await Model.updateOne({ _id: doc._id }, { $set: { [field]: next } });
        count += 1;
      }
    }
    console.log(`  ${label}: updated ${count} document(s).`);
  };

  await updateField(User, "avatar", "User.avatar");
  await updateField(Donor, "avatar", "Donor.avatar");
  await updateField(Donation, "receiptUrl", "Donation.receiptUrl");

  let eventDocs = 0;
  for (const ev of await Event.find({ imageUrls: /\/uploads\// })) {
    const tokens = (ev.imageUrls || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map(rewrite);
    const next = tokens.join(",");
    if (changed(ev.imageUrls, next)) {
      await Event.updateOne({ _id: ev._id }, { $set: { imageUrls: next } });
      eventDocs += 1;
    }
  }
  console.log(`  Event.imageUrls: updated ${eventDocs} document(s).`);

  const uniqueUnreferenced = [...new Set(unreferenced)];
  if (uniqueUnreferenced.length) {
    console.log("\nWARNING: these stored URLs reference local uploads but no file");
    console.log("was found on disk, so they could NOT be migrated:");
    uniqueUnreferenced.forEach((u) => console.log(`  - ${u}`));
  }

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
