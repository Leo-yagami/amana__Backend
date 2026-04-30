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
