const RestaurantAdmin = require("../models/restaurantAdminSchema");
const RegistrationRequest = require("../models/registrationRequestSchema");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail"); // Utility for sending emails
const catchAsyncErrors = require("../middleware/catchAsyncErrors"); // Middleware for handling async errors
const sendToken = require("../utils/jwtToken");
const ErrorHander = require("../utils/errorhander");

// Send OTP for email verification
exports.sendOtp = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);

  // Check if email already exists in RestaurantAdmin
  let restaurantAdmin = await RestaurantAdmin.findOne({ email });

  // Check if email already exists in RegistrationRequest
  let registrationRequest = await RegistrationRequest.findOne({ email });

  if (!restaurantAdmin) {
    restaurantAdmin = new RestaurantAdmin({ email });
  }

  if (!registrationRequest) {
    registrationRequest = new RegistrationRequest({ email });
  }

  const otp = restaurantAdmin.generateVerificationCode();

  // Save OTP to both models
  await restaurantAdmin.save({ validateBeforeSave: false });

  // Update registration request with OTP
  registrationRequest.verificationCode = restaurantAdmin.verificationCode;
  registrationRequest.verificationCodeExpire = restaurantAdmin.verificationCodeExpire;
  await registrationRequest.save({ validateBeforeSave: false });

  console.log(otp); // Log the OTP for testing purposes (remove in production)
  const message = `Your OTP for email verification is: ${otp}. It will expire in 10 minutes.`;

  try {
    // Send the OTP via email
    await sendEmail({
      email: restaurantAdmin.email,
      subject: "Email Verification OTP for Restaurant Admin",
      message,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email} successfully`,
    });
  } catch (error) {
    restaurantAdmin.verificationCode = undefined;
    restaurantAdmin.verificationCodeExpire = undefined;
    registrationRequest.verificationCode = undefined;
    registrationRequest.verificationCodeExpire = undefined;

    await restaurantAdmin.save({ validateBeforeSave: false });
    await registrationRequest.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

// Register Restaurant Admin after OTP verification
exports.registerRestaurantAdmin = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, phone, restaurantName, restaurantAddress, otp } = req.body;

  // Check if email already exists in the database
  let admin = await RestaurantAdmin.findOne({ email });
  let registrationRequest = await RegistrationRequest.findOne({ email });

  // If the admin already exists, check if OTP is valid
  if (admin) {
    if (!admin.verificationCode || admin.verificationCodeExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or has expired",
      });
    }

    // Verify OTP
    const isOtpValid = await admin.verifyOTP(otp);
    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // If OTP is valid, update the existing admin
    admin.name = name;
    admin.password = password;
    admin.phone = phone;
    admin.restaurantName = restaurantName;
    admin.restaurantAddress = restaurantAddress;

    await admin.save();

    // Update registration request with complete details
    if (registrationRequest) {
      registrationRequest.name = name;
      registrationRequest.phone = phone;
      registrationRequest.restaurantName = restaurantName;
      registrationRequest.restaurantAddress = restaurantAddress;
      registrationRequest.isVerified = true;
      registrationRequest.status = "pending"; // Set to pending for super admin review
      await registrationRequest.save();
    }

    const token = admin.getJWTToken(); // Generate JWT token for the updated admin

    return res.status(200).json({
      success: true,
      message: "Restaurant admin updated successfully",
      token,
      admin,
    });
  }

  // If no admin found, create a new one
  admin = await RestaurantAdmin.create({
    name,
    email,
    password,
    phone,
    restaurantName,
    restaurantAddress,
  });

  // Update registration request with complete details
  if (registrationRequest) {
    registrationRequest.name = name;
    registrationRequest.phone = phone;
    registrationRequest.restaurantName = restaurantName;
    registrationRequest.restaurantAddress = restaurantAddress;
    registrationRequest.isVerified = true;
    registrationRequest.status = "pending"; // Set to pending for super admin review
    await registrationRequest.save();
  }

  // Generate JWT token
  const token = admin.getJWTToken();

  sendToken(admin, 200, res);
});

// Login Restaurant Admin
exports.loginRestaurantAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await RestaurantAdmin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Compare password
    const isPasswordMatched = await admin.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = admin.getJWTToken();

    sendToken(admin, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Password Reset - Request Token
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if admin exists
    const admin = await RestaurantAdmin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Generate password reset token
    const resetToken = admin.getResetPasswordToken();
    await admin.save({ validateBeforeSave: false });

    // In a real app, send resetToken via email
    res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Verify OTP for Email Verification
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await RestaurantAdmin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isOtpValid = await admin.verifyOTP(otp);
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Capture Registration Interest (Landing page: Register your business / Request demo)
exports.captureRegistrationInterest = catchAsyncErrors(async (req, res, next) => {
  const { businessName, businessType, contactName, email, phone, website, notes } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  // Compose notes to include additional fields not present in the schema
  const composedNotesParts = [];
  if (businessType) composedNotesParts.push(`Business type: ${businessType}`);
  if (website) composedNotesParts.push(`Website: ${website}`);
  if (notes) composedNotesParts.push(`Notes: ${notes}`);
  const composedNotes = composedNotesParts.join(" | ");

  let registrationRequest = await RegistrationRequest.findOne({ email });

  if (!registrationRequest) {
    registrationRequest = await RegistrationRequest.create({
      name: contactName,
      email,
      phone,
      restaurantName: businessName,
      notes: composedNotes,
      source: "landing_request_demo",
      status: "pending",
    });
  } else {
    registrationRequest.name = contactName || registrationRequest.name;
    registrationRequest.phone = phone || registrationRequest.phone;
    registrationRequest.restaurantName = businessName || registrationRequest.restaurantName;
    registrationRequest.source = registrationRequest.source || "landing_request_demo";
    // Append notes while preserving previous ones
    const notePieces = [];
    if (registrationRequest.notes) notePieces.push(registrationRequest.notes);
    if (composedNotes) notePieces.push(composedNotes);
    registrationRequest.notes = notePieces.join(" | ");
    await registrationRequest.save();
  }

  return res.status(200).json({ success: true, message: "Request received" });
});

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  console.log("triggered");
  console.log(req.cookies);
  const user = await RestaurantAdmin.findById(req.user.id);
  console.log("adfd df : ", user);
  res.status(200).json({
    success: true,
    user,
  });
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});
