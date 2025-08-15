const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const restaurantAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    phone: { type: String },
    restaurantName: { type: String }, // Name of the restaurant
    businessSlug: { type: String, unique: true, sparse: true }, // URL-friendly business identifier
    logoUrl: { type: String }, // Business logo stored on Cloudinary
    restaurantAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
    },
    role: { type: String, default: "Admin" }, // Role of the user
    isVerified: { type: Boolean, default: false }, // For OTP verification
    verificationCode: { type: String }, // Hashed OTP
    verificationCodeExpire: { type: Date }, // OTP expiration
    resetPasswordToken: { type: String }, // Password reset token
    resetPasswordExpire: { type: Date }, // Password reset expiration
    // Square (per-business) configuration
    squareApplicationId: { type: String },
    squareLocationId: { type: String },
    squareAccessToken: { type: String },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Hash password before saving
restaurantAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// JWT Token generation
restaurantAdminSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare password
restaurantAdminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate password reset token
restaurantAdminSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

  return resetToken;
};

// Generate OTP for email verification
restaurantAdminSchema.methods.generateVerificationCode = function () {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otpCode); // Log the plain OTP

  this.verificationCode = crypto.createHash("sha256").update(otpCode).digest("hex");
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

  return otpCode;
};

// Verify OTP
restaurantAdminSchema.methods.verifyOTP = async function (enteredOtp) {
  console.log(enteredOtp);
  const hashedOtp = crypto.createHash("sha256").update(enteredOtp).digest("hex");
  console.log(hashedOtp);
  console.log(this.verificationCode);
  if (hashedOtp === this.verificationCode && this.verificationCodeExpire > Date.now()) {
    console.log(this.verificationCode);
    console.log(this.verificationCodeExpire);
    this.isVerified = true;
    this.verificationCode = undefined;
    this.verificationCodeExpire = undefined;
    // await this.save();

    return true;
  } else {
    return false;
  }
};

module.exports = mongoose.model("RestaurantAdmin", restaurantAdminSchema);
