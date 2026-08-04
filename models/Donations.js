const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: [true, "Donor is required"],
    },

    donorName:{
      type: String,
      required: true
    },

    donationType: {
      type: String,
      enum: ["monetary", "in_kind"],
      default: "monetary",
      required: true,
    },

    amount: {
      type: Number,
      min: 0,
      default: null,
    },

    currency: {
      type: String,
      enum: ["ETB", "USD", "EUR", "GBP"],
      default: "ETB",
    },

    status: {
      type: String,
      enum: ["received", "pledged"],
      default: "received",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", ""],
      default: "",
    },

    donationReference: {
      type: String,
      // required: true,
      trim: true,
      default: "",
      unique: true,
      sparse: true, // allows empty/duplicate "" values but enforces uniqueness when provided
    },

    // Where the donation originated: "chapa" (online payment) or "manual" (staff entry).
    // Used by the frontend to lock Chapa donations from editing.
    source: {
      type: String,
      enum: ["chapa", "manual"],
      default: "manual",
    },

    // Chapa transaction reference (tx-...). Links a Chapa donation back to its
    // Transaction record so the internal receipt can be rendered from the
    // stored verification data. Empty for manual donations.
    tx_ref: {
      type: String,
      // No default: manual donations leave this unset (undefined), which a
      // sparse index does NOT index — so multiple manual donations never
      // collide. Chapa donations set a real tx_ref.
      // Unique + sparse = DB-level safety net against duplicate donations from
      // repeated Chapa callbacks / browser hits on /api/paymentComplete.
      unique: true,
      sparse: true,
    },

    receivedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      default: null,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    // Family classification this donation is earmarked for
    // (orphan | disabled_disease | old_age | single_mother). null = general fund.
    familyClassification: {
      type: String,
      enum: ["orphan", "disabled_disease", "old_age", "single_mother"],
      default: null,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    usageNote: {
      type: String,
      trim: true,
      default: "",
    },

    receiptUrl: {
      type: String,
      default: "",
    },

    // Source of the receipt: "chapa" (auto-generated for online donations) | "manual" (staff upload)
    receiptType: {
      type: String,
      enum: ["chapa", "manual"],
      default: null,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Validation rule: if donationType is monetary, amount must exist
donationSchema.pre("save", function (next) {
  if (this.donationType === "monetary" && (!this.amount || this.amount <= 0)) {
    return next(new Error("Amount is required for monetary donations"));
  }

  if (this.donationType === "in_kind" && !this.description.trim()) {
    return next(new Error("Description is required for in-kind donations"));
  }

  next();
});

module.exports = donationSchema;
module.exports = mongoose.model("Donation", donationSchema);
