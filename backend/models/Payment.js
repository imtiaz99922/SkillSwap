const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
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
    enum: ["Credit Card", "Debit Card", "PayPal", "Apple Pay", "Google Pay"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
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
  merchantName: {
    type: String,
    default: "SkillSwap",
  },
  currency: {
    type: String,
    default: "USD",
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
});

module.exports = mongoose.model("Payment", PaymentSchema);
