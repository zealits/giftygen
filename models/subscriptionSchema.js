const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    businessSlug: { type: String, required: true, index: true },
    planType: { type: String, required: true },
    amount: { type: Number, required: true }, // Base amount before tax
    taxAmount: { type: Number, default: 0 }, // Tax amount
    totalAmount: { type: Number }, // Total amount including tax (calculated if not provided)
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "active", "cancelled", "expired"],
      default: "pending",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: false },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    promoCode: { type: String }, // Store promo code used for this order
    paymentHistory: [paymentHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);







