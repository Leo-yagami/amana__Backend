const mongoose = require("mongoose");
const {donationSchema} = require('./Donations')

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // allows multiple docs with empty/null email
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          if (!value) return true; // allow empty phone
          return /^(?:\+251[79]\d{8}|0[79]\d{8})$/.test(value);
        },
        message:
          "Phone number must be in Ethiopian format: +2519XXXXXXXX, +2517XXXXXXXX, 09XXXXXXXX, or 07XXXXXXXX",
      },
    },

    donorType: {
      type: String,
      enum: ["Individual", "Corporate", "Foundation", "Organization"],
      default: "Individual",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    donorCode: {
      type: String,
      unique: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },
    totalDonated: {
      type: Number,
      default: 0
    },
    lastDonated: {
      type: Date, 
      default: Date.now
    },
    donationCount: {
      type: Number,
      default: 0
    },
    donations: {
      type: [donationSchema],
      default: [],
    }
  },
  { timestamps: true }
);

// Auto-generate donorCode if not provided
donorSchema.pre("save", function (next) {
  if (!this.donorCode) {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    this.donorCode = `DON-${randomCode}`;
  }
  next();
});

module.exports = mongoose.model("Donor", donorSchema);
