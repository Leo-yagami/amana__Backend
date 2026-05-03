const mongoose = require("mongoose");
const crypto = require("crypto");

const phoneRegex = /^(?:\+251|0)(?:9|7)\d{8}$/;

const MemberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },

    // age as category choice from frontend
    ageGroup: { type: String, enum: ["child", "teen", "adult"], required: true },

    gender: { type: String, enum: ["male", "female", "other"], default: "other" },

    // keep orphan flow as requested (relevant for child/teen; can still store for all)
    isOrphan: { type: Boolean, default: false },
    orphanType: { type: String, enum: ["none", "mother", "father", "both"], default: "none" },

    photoUrl: { type: String, default: "" },
  },
  { _id: false }
);

const FamilySchema = new mongoose.Schema(
  {
    familyCode: { type: String, required: true, unique: true, index: true },
    familyName: { type: String, required: true, trim: true },
    familyHead: { type: String, required: false, trim: true },
    primaryPhone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => phoneRegex.test(v),
        message: "Invalid phone format",
      },
    },

    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // family-level verification (you already use this concept)
    isVerified: { type: Boolean, default: false },
    registrationStatus: {
      type: String,
      enum: ["incomplete", "pending", "verified"],
      default: function(){
        return this.registrationType === "quick"? "incomplete" : "pending";
      },
    },
    verifiedBy: { type: String, default: "" },
    verifiedAt: { type: Date },

    notes: { type: String, default: "" },

    //quick registration fields
    registrationCompleted: {type: Boolean, default: true},

    registrationType: {type: String, default: "complete"},

    // embedded members
    members: {
      type: [MemberSchema],
      default: [],
      validate: {
        validator: function (arr) {
          if (this.registrationType === "quick") return true;
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "At least one family member is required",
      },
    },

    // support tracking (optional)
    lastSupportedAt: { type: Date },
  },
  { timestamps: true }
);

// Generates something like: FAM-7K3D9Q2A
function makeFamilyCode() {
  return "FAM-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

FamilySchema.pre("validate", async function () {
  // Only generate on create / when missing
  if (this.familyCode) return;

  // Try a few times to avoid collisions
  for (let i = 0; i < 10; i++) {
    const code = makeFamilyCode();

    // Check uniqueness
    const exists = await this.constructor.exists({ familyCode: code });
    if (!exists) {
      this.familyCode = code;
      return;
    }
  }

  // If we somehow couldn't generate a unique code
  throw new Error("Failed to generate unique familyCode");
});

/**
 * Stats needed by Families.tsx
 */
FamilySchema.statics.countTotal = function () {
  return this.countDocuments({});
};

FamilySchema.statics.countVerified = function () {
  return this.countDocuments({ registrationStatus: "verified" });
};

FamilySchema.statics.countPending = function () {
  return this.countDocuments({ registrationStatus: "pending" });
};

FamilySchema.statics.countIncomplete = function () {
  return this.countDocuments({ registrationStatus: "incomplete" });
};

// Urgent in your Families.tsx = high OR critical
FamilySchema.statics.countUrgent = function () {
  return this.countDocuments({ urgencyLevel: { $in: ["high", "critical"] } });
};

// If you specifically need critical-only as well:
FamilySchema.statics.countCritical = function () {
  return this.countDocuments({ urgencyLevel: "critical" });
};

// One-call helper to get everything at once
FamilySchema.statics.getFamiliesPageStats = async function () {
  const [total, verified, pending, incomplete, urgent] = await Promise.all([
    this.countTotal(),
    this.countVerified(),
    this.countPending(),
    this.countIncomplete(),
    this.countUrgent(),
  ]);

  return { total, verified, pending, incomplete, urgent };
};

module.exports = mongoose.model("Family", FamilySchema);