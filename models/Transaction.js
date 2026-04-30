const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // Transaction reference from Chapa
    tx_ref: {
      type: String,
      required: false,
      unique: true,
      index: true,
    },

    // Payment details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'ETB',
    },

    // Customer info
    email: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
    },
    phone_number: {
      type: String,
      required: true,
    },

    // Payment method
    paymentMethod: {
      type: String,
      default: null,
    },

    // Chapa response data
    chapa_reference: {
      type: String,
      default: null,
    },
    receipt_url: {
      type: String,
      default: null,
    },

    // URLs
    callback_url: {
      type: String,
      default: null,
    },
    return_url: {
      type: String,
      default: null,
    },

    // Payment status tracking
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
    },

    // Verification details
    verified_at: {
      type: Date,
      default: null,
    },
    verification_response: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Timestamps for creation and updates
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Static method to create from initialization payload
transactionSchema.statics.createFromPayload = async function (payload) {
  return this.create({
    tx_ref: payload.tx_ref,
    amount: parseFloat(payload.amount),
    currency: payload.currency,
    email: payload.email,
    first_name: payload.first_name,
    last_name: payload.last_name,
    phone_number: payload.phone_number,
    callback_url: payload.callback_url,
    return_url: payload.return_url,
    status: 'pending',
  });
};

// Static method to update after verification
transactionSchema.statics.updateAfterVerification = async function (
  tx_ref,
  chapaData
) {
  return this.findOneAndUpdate(
    { tx_ref },
    {
      status: chapaData.status === 'success' ? 'success' : 'failed',
      chapa_reference: chapaData.reference || null,
      receipt_url: chapaData.receipt_url || null,
      verified_at: new Date(),
      verification_response: chapaData,
    },
    { new: true }
  );
};

// Instance method to check if payment is successful
transactionSchema.methods.isSuccessful = function () {
  return this.status === 'success';
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;