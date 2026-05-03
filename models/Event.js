const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    eventType: {
      type: String,
      required: true,
      enum: [
        "distribution",
        "fundraising",
        "awareness",
        "food_package",
        "medical_aid",
        "job_opportunity",
        "other",
      ],
      default: "other",
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    eventDate: {
      type: Date,
      default: null,
    },

    location: {
      type: String,
      default: "",
    },

    imageUrls: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      required: true,
      enum: ["draft", "upcoming", "ongoing", "completed", "cancelled"],
      default: "draft",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    targetAmount: {
      type: Number,
      default: null,
    },

    collectedAmount: {
      type: Number,
      default: 0,
    },

    organizedBy: {
      type: String,
      default: "",
    },

    participantCount: {
      type: Number,
      default: 0,
    },

    outcomeSummary: {
      type: String,
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    parentEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    campaignCode: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // allows many empty values but unique if provided
    },

    // Relations (references)
    donations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donation",
      },
    ],

    supportHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Support",
      },
    ],
    _count: {
      donation: {type: Number, default: 0},
      supportHistory: {type: Number, default: 0},
    }
  },
  { timestamps: true }
);

// Virtual field: childEvents (Events that have this as parentEventId)
eventSchema.virtual("childEvents", {
  ref: "Event",
  localField: "_id",
  foreignField: "parentEventId",
});

// Enable virtuals in JSON output
eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);