const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
    businessSlug: { type: String, required: true, index: true },
    restaurantName: { type: String },
    businessEmail: { type: String },
    businessAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
    },
    planType: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentId: { type: String },
    orderId: { type: String },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["paid", "pending", "cancelled"],
      default: "paid",
    },
    pdfUrl: { type: String }, // Optional: if storing PDF in cloud storage
  },
  { timestamps: true }
);

// Generate unique invoice number before saving
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    this.invoiceNumber = `INV-${timestamp}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);








