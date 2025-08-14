const mongoose = require("mongoose");

const registrationRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: false }, // Not required initially, will be filled during registration
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    restaurantName: { type: String },
    businessType: { type: String },
    website: { type: String },
    restaurantAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpire: { type: Date },
    notes: { type: String }, // For super admin to add notes
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
    reviewedAt: { type: Date },
    source: { type: String, default: "registration_form" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RegistrationRequest", registrationRequestSchema);
