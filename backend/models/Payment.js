const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    creditsGranted: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMethod: {
      type: String,
      enum: [
        "bKash",
        "Nagad",
        "Credit Card",
        "Debit Card",
        "PayPal",
        "Apple Pay",
        "Google Pay",
      ],
      default: "bKash",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    // Gateway IDs
    paymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    invoiceId: {
      type: String,
      unique: true,
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Customer info
    cardLastDigits: {
      type: String,
    },
    billingAddress: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    accountEmail: {
      type: String,
    },
    // Gateway response
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Metadata
    merchantName: {
      type: String,
      default: "SkillSwap",
    },
    currency: {
      type: String,
      default: "BDT",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Index for faster lookups
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ invoiceId: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
