const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const supportSchema = new mongoose.Schema(
  {
    supportType: {
      type: String,
      required: true,
      enum: [
        "financial",
        "food",
        "clothing",
        "education",
        "medical",
        "housing",
        "other",
      ],
    },

    supportDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    targetType: {
      type: String,
      required: true,
      enum: ["family", "beneficiary", "event"],
    },

    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      default: null,
    },

    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beneficiary",
      default: null,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    amountValue: {
      type: Number,
      default: null,
      min: 0,
    },

    currency: {
      type: String,
      default: "ETB",
      enum: ["ETB", "USD", "EUR"],
    },

    itemsProvided: {
      type: [itemSchema],
      default: [],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Optional: Validate correct targetId is set depending on targetType
supportSchema.pre("save", function (next) {
  if (this.targetType === "family" && !this.familyId) {
    return next(new Error("familyId is required when targetType is family"));
  }

  if (this.targetType === "beneficiary" && !this.beneficiaryId) {
    return next(
      new Error("beneficiaryId is required when targetType is beneficiary")
    );
  }

  if (this.targetType === "event" && !this.eventId) {
    return next(new Error("eventId is required when targetType is event"));
  }

  next();
});

const Support = mongoose.model("Support", supportSchema);

module.exports = Support;