const RestaurantAdmin = require("../models/restaurantAdminSchema");
const RegistrationRequest = require("../models/registrationRequestSchema");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {
  sendEmail,
  sendRegistrationConfirmationEmail,
  sendAdminNotificationEmail,
  sendContactFormEmail,
  sendCredentialsEmail,
  sendPasswordResetEmail,
} = require("../utils/sendEmail"); // Utility for sending emails
const catchAsyncErrors = require("../middleware/catchAsyncErrors"); // Middleware for handling async errors
const sendToken = require("../utils/jwtToken");
const ErrorHander = require("../utils/errorhander");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary");
const axios = require("axios");
const QRCode = require("qrcode");

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
  const { name, email, password, phone, restaurantName, restaurantAddress, otp, businessSlug } = req.body;

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
    if (businessSlug) admin.businessSlug = businessSlug;
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
    businessSlug,
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

  // Send professional registration confirmation email
  try {
    await sendRegistrationConfirmationEmail(email, restaurantName, name);
  } catch (emailError) {
    console.error("Failed to send registration confirmation email:", emailError);
    // Don't fail the registration if email fails
  }

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

// Password Reset - Request Token (send reset link via email if registered)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if admin exists (registered user)
    const admin = await RestaurantAdmin.findOne({ email });
    if (!admin) {
      // Return same success message for security (don't reveal if email exists)
      return res.status(200).json({
        success: true,
        message: "If an account exists for this email, you will receive a password reset link shortly.",
      });
    }

    // Generate password reset token
    const resetToken = admin.getResetPasswordToken();
    await admin.save({ validateBeforeSave: false });

    // Build reset URL (frontend route)
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(email, resetUrl, admin.name);
    } catch (emailError) {
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpire = undefined;
      await admin.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "If an account exists for this email, you will receive a password reset link shortly.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Reset Password - Verify token and update password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    // Hash the token to match what's stored
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await RestaurantAdmin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
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

// Capture Registration Interest (Landing page: Register your business) – auto-creates account and sends credentials
exports.captureRegistrationInterest = catchAsyncErrors(async (req, res, next) => {
  const { businessName, businessType, contactName, email, phone, website, notes } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  // If business admin already exists for this email, ask user to sign in
  const existingAdmin = await RestaurantAdmin.findOne({ email });
  if (existingAdmin) {
    return res.status(409).json({
      success: false,
      message: "An account already exists for this email. Please sign in with your credentials.",
    });
  }

  const restaurantName = businessName || "My Business";
  const name = contactName || restaurantName;

  // Create or update registration request record (for audit)
  let registrationRequest = await RegistrationRequest.findOne({ email });
  if (!registrationRequest) {
    registrationRequest = await RegistrationRequest.create({
      name: contactName,
      email,
      phone,
      restaurantName: businessName,
      businessType,
      website,
      notes,
      source: "landing_request_demo",
      status: "approved", // Auto-approved: account created immediately
    });
  } else {
    registrationRequest.name = contactName || registrationRequest.name;
    registrationRequest.phone = phone || registrationRequest.phone;
    registrationRequest.restaurantName = businessName || registrationRequest.restaurantName;
    if (businessType) registrationRequest.businessType = businessType;
    if (website) registrationRequest.website = website;
    registrationRequest.source = registrationRequest.source || "landing_request_demo";
    if (notes) registrationRequest.notes = notes;
    registrationRequest.status = "approved";
    await registrationRequest.save();
  }

  // Generate unique business slug
  const slugFromName = (restaurantName || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const finalSlug = slugFromName.substring(0, 60);
  let uniqueSlug = finalSlug;
  let counter = 1;
  while (await RestaurantAdmin.findOne({ businessSlug: uniqueSlug })) {
    uniqueSlug = `${finalSlug}-${counter++}`;
  }

  const generatedPassword = Math.random().toString(36).slice(-10) + "A1!";

  const admin = new RestaurantAdmin({
    name,
    email,
    password: generatedPassword,
    phone: phone || undefined,
    restaurantName,
    businessSlug: uniqueSlug,
    isVerified: true,
  });
  await admin.save();

  // Send login credentials to the new business admin
  try {
    await sendCredentialsEmail(email, name, restaurantName, generatedPassword);
  } catch (emailError) {
    console.error("Failed to send credentials email:", emailError);
    // Don't fail registration if email fails – admin account is already created
  }

  // Notify internal admin about new registration
  try {
    await sendAdminNotificationEmail({
      businessName,
      businessType,
      contactName,
      email,
      phone,
      website,
      notes,
    });
  } catch (adminEmailError) {
    console.error("Failed to send admin notification email:", adminEmailError);
  }

  return res.status(201).json({
    success: true,
    message: "Registration complete. Check your email for login credentials. You can sign in now.",
  });
});

// Handle contact form submission
exports.submitContactForm = catchAsyncErrors(async (req, res, next) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message are required" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address" });
  }

  // Send contact form notification email
  try {
    await sendContactFormEmail({ name, email, message });
  } catch (emailError) {
    console.error("Failed to send contact form email:", emailError);
    return res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
  }

  return res.status(200).json({ success: true, message: "Message sent successfully" });
});

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  console.log("triggered");
  console.log(req.cookies);
  const user = await RestaurantAdmin.findById(req.user.id);
  console.log("adfd df : ", user);

  // Create a safe user object for frontend (decrypt keys for display)
  const userObj = user.toObject();

  // Decrypt Razorpay keys for display (if they exist)
  if (userObj.razorpayKeyId) {
    userObj.razorpayKeyId = user.getDecryptedRazorpayKeyId() || userObj.razorpayKeyId;
  }

  // For security, only show masked version of key secret (or decrypted if user is viewing settings)
  if (userObj.razorpayKeySecret) {
    const decryptedSecret = user.getDecryptedRazorpayKeySecret();
    // Show decrypted version for settings page (user needs to see what they entered)
    userObj.razorpayKeySecret = decryptedSecret || userObj.razorpayKeySecret;
  }

  res.status(200).json({
    success: true,
    user: userObj,
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

// Update business settings (name, slug, square config, razorpay config)
exports.updateBusinessSettings = catchAsyncErrors(async (req, res, next) => {
  // SQUARE FIELDS COMMENTED OUT
  const {
    restaurantName,
    businessSlug,
    industry,
    businessDescription,
    phone,
    restaurantAddress,
    galleryImages,
    pageCustomization,
    razorpayKeyId,
    razorpayKeySecret,
    /* , squareApplicationId, squareLocationId, squareAccessToken */
  } = req.body;
  const admin = await RestaurantAdmin.findById(req.user.id);
  if (!admin) {
    return next(new ErrorHander("Admin not found", 404));
  }

  if (restaurantName) admin.restaurantName = restaurantName;
  if (businessSlug) admin.businessSlug = businessSlug;
  if (industry !== undefined) admin.industry = industry;
  if (businessDescription !== undefined) admin.businessDescription = businessDescription;
  if (phone !== undefined) admin.phone = phone;

  // Update gallery images if provided (for removal operations)
  if (Array.isArray(galleryImages)) {
    admin.galleryImages = galleryImages.slice(0, 10);
  }

  // Update page customization if provided
  if (pageCustomization && typeof pageCustomization === "object") {
    admin.pageCustomization = { ...(admin.pageCustomization || {}), ...pageCustomization };
  }

  // Update restaurant address if provided
  if (restaurantAddress) {
    if (!admin.restaurantAddress) {
      admin.restaurantAddress = {};
    }
    if (restaurantAddress.street !== undefined) admin.restaurantAddress.street = restaurantAddress.street;
    if (restaurantAddress.city !== undefined) admin.restaurantAddress.city = restaurantAddress.city;
    if (restaurantAddress.state !== undefined) admin.restaurantAddress.state = restaurantAddress.state;
    if (restaurantAddress.zipCode !== undefined) admin.restaurantAddress.zipCode = restaurantAddress.zipCode;
    if (restaurantAddress.latitude !== undefined) admin.restaurantAddress.latitude = restaurantAddress.latitude;
    if (restaurantAddress.longitude !== undefined) admin.restaurantAddress.longitude = restaurantAddress.longitude;
  }

  // SQUARE API COMMENTED OUT
  // if (squareApplicationId !== undefined) admin.squareApplicationId = squareApplicationId;
  // if (squareLocationId !== undefined) admin.squareLocationId = squareLocationId;
  // if (squareAccessToken !== undefined) admin.squareAccessToken = squareAccessToken;

  // Razorpay (per-business) configuration
  if (razorpayKeyId !== undefined) admin.razorpayKeyId = razorpayKeyId;
  if (razorpayKeySecret !== undefined) admin.razorpayKeySecret = razorpayKeySecret;

  await admin.save();

  // Create a safe user object for response (decrypt keys for display)
  const userObj = admin.toObject();

  // Decrypt Razorpay keys for display
  if (userObj.razorpayKeyId) {
    userObj.razorpayKeyId = admin.getDecryptedRazorpayKeyId() || userObj.razorpayKeyId;
  }
  if (userObj.razorpayKeySecret) {
    userObj.razorpayKeySecret = admin.getDecryptedRazorpayKeySecret() || userObj.razorpayKeySecret;
  }

  // Ensure galleryImages is included
  if (!userObj.galleryImages) {
    userObj.galleryImages = [];
  }

  res.status(200).json({ success: true, user: userObj });
});

// Upload business logo to Cloudinary and save URL
exports.uploadBusinessLogo = catchAsyncErrors(async (req, res, next) => {
  const admin = await RestaurantAdmin.findById(req.user.id);
  if (!admin) {
    return next(new ErrorHander("Admin not found", 404));
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
  const result = await cloudinary.uploader.upload(req.file.path, {
    public_id: `business_logos/${uniqueFilename}`,
    resource_type: "image",
    folder: "business_logos",
  });

  // Cleanup temp file
  try {
    fs.unlinkSync(req.file.path);
  } catch (e) {}

  admin.logoUrl = result.secure_url;
  await admin.save();

  return res.status(200).json({ success: true, logoUrl: admin.logoUrl });
});

// Upload up to 10 additional business photos to Cloudinary and save URLs
exports.uploadBusinessPhotos = catchAsyncErrors(async (req, res, next) => {
  const admin = await RestaurantAdmin.findById(req.user.id);
  if (!admin) {
    return next(new ErrorHander("Admin not found", 404));
  }

  const files = req.files || [];
  if (!files.length) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  // Ensure existing array
  if (!Array.isArray(admin.galleryImages)) {
    admin.galleryImages = [];
  }

  const uploadedUrls = [];

  for (const file of files) {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    const result = await cloudinary.uploader.upload(file.path, {
      public_id: `business_photos/${uniqueFilename}`,
      resource_type: "image",
      folder: "business_photos",
    });

    uploadedUrls.push(result.secure_url);

    // Cleanup temp file
    try {
      fs.unlinkSync(file.path);
    } catch (e) {}
  }

  // Append new images but cap total at 10
  const combined = [...admin.galleryImages, ...uploadedUrls];
  admin.galleryImages = combined.slice(0, 10);
  await admin.save();

  return res.status(200).json({ success: true, galleryImages: admin.galleryImages });
});

// Upload a single image for room types (returns URL only; stored in pageCustomization.roomTypes[].images)
exports.uploadRoomPhoto = catchAsyncErrors(async (req, res, next) => {
  const admin = await RestaurantAdmin.findById(req.user.id);
  if (!admin) {
    return next(new ErrorHander("Admin not found", 404));
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
  const result = await cloudinary.uploader.upload(req.file.path, {
    public_id: `room_photos/${uniqueFilename}`,
    resource_type: "image",
    folder: "room_photos",
  });

  try {
    fs.unlinkSync(req.file.path);
  } catch (e) {}

  return res.status(200).json({ success: true, url: result.secure_url });
});

// Generate a QR poster PNG (base64) for the business giftcards link with branding
exports.generateQrPoster = catchAsyncErrors(async (req, res, next) => {
  const admin = await RestaurantAdmin.findById(req.user.id);
  if (!admin) {
    return next(new ErrorHander("Admin not found", 404));
  }

  const slug = admin.businessSlug;
  if (!slug) {
    return res.status(400).json({ success: false, message: "Business slug not set" });
  }

  const derivedBase = `${req.protocol}://${req.get("host")}`;
  const baseUrl = process.env.PUBLIC_BASE_URL || derivedBase;
  const link = `${baseUrl}/${slug}/giftcards`;

  const businessName = admin.restaurantName || "Our Gift Cards";

  // Generate QR Data URL
  const qrSizePx = 760;
  const qrDataUrl = await QRCode.toDataURL(link, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: qrSizePx,
    color: { dark: "#000000", light: "#FFFFFFFF" },
  });

  // Fetch and embed logo as data URL if available
  let embeddedLogo = "";
  if (admin.logoUrl) {
    try {
      const resp = await axios.get(admin.logoUrl, { responseType: "arraybuffer" });
      const mime = resp.headers["content-type"] || "image/png";
      const b64 = Buffer.from(resp.data).toString("base64");
      embeddedLogo = `data:${mime};base64,${b64}`;
    } catch (e) {
      embeddedLogo = "";
    }
  }

  // Centered SVG layout
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#A855F7"/>
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)"/>
  
  <!-- Centered content container -->
  <g transform="translate(600, 800)">
    <!-- White background card - centered at 0,0 -->
    <rect x="-500" y="-700" width="1000" height="1400" rx="32" ry="32" fill="#ffffff" opacity="0.95" filter="url(#shadow)"/>
    
         <!-- Logo (if available) -->
     ${
       embeddedLogo
         ? `<image href="${embeddedLogo}" x="-140" y="-620" height="100" width="280" preserveAspectRatio="xMidYMid meet"/>`
         : ""
     }
     
     <!-- Business name - centered -->
     <text x="0" y="${
       embeddedLogo ? "-480" : "-580"
     }" font-size="56" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#111827" text-anchor="middle">${businessName.replace(
       /&/g,
       "&amp;",
     )}</text>
    
         <!-- Subtitle - centered -->
     <text x="0" y="${
       embeddedLogo ? "-400" : "-500"
     }" font-size="28" font-family="Arial, Helvetica, sans-serif" fill="#374151" text-anchor="middle">Scan to view and buy our gift cards</text>
     
     <!-- QR code background -->
     <rect x="-420" y="${
       embeddedLogo ? "-350" : "-450"
     }" width="840" height="840" rx="24" ry="24" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="6"/>
     
     <!-- QR code - centered -->
     <image href="${qrDataUrl}" x="${-qrSizePx / 2}" y="${
       embeddedLogo ? "-330" : "-430"
     }" height="${qrSizePx}" width="${qrSizePx}"/>
    
    <!-- Link text - centered -->
    <text x="0" y="520" font-size="24" font-family="Arial, Helvetica, sans-serif" fill="#6B7280" text-anchor="middle">${link.replace(
      /&/g,
      "&amp;",
    )}</text>
    
    <!-- Divider line -->
    <rect x="-420" y="560" width="840" height="4" fill="#E5E7EB"/>
    
    <!-- Powered by text - centered -->
    <text x="0" y="620" font-size="20" font-family="Arial, Helvetica, sans-serif" fill="#111827" text-anchor="middle">Powered by Giftygen</text>
  </g>
</svg>`;

  const svgBase64 = Buffer.from(svg).toString("base64");
  return res.status(200).json({ success: true, svg: `data:image/svg+xml;base64,${svgBase64}` });
});

// Change password for restaurant admin users
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    console.log("Change password request:", { userId, hasUser: !!req.user });

    // Find the admin
    const admin = await RestaurantAdmin.findById(userId);
    if (!admin) {
      console.log("Admin not found");
      return next(new ErrorHander("Admin not found", 404));
    }

    console.log("Admin found:", admin.email);

    // Verify current password using the model's comparePassword method
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    console.log("Password validation result:", isCurrentPasswordValid);

    if (!isCurrentPasswordValid) {
      return next(new ErrorHander("Current password is incorrect", 400));
    }

    // Update password - the pre-save hook will hash it automatically
    admin.password = newPassword;
    await admin.save();

    console.log("Password updated successfully");
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return next(new ErrorHander(error.message, 500));
  }
});

// Get business information by slug (public endpoint)
exports.getBusinessBySlug = catchAsyncErrors(async (req, res, next) => {
  try {
    const { businessSlug } = req.params;

    if (!businessSlug) {
      return next(new ErrorHander("Business slug is required", 400));
    }

    const business = await RestaurantAdmin.findOne({
      businessSlug,
      isVerified: true,
    }).select("restaurantName logoUrl businessSlug restaurantAddress galleryImages businessDescription industry phone pageCustomization");

    if (!business) {
      return next(new ErrorHander("Business not found", 404));
    }

    res.status(200).json({
      success: true,
      business: {
        name: business.restaurantName,
        logoUrl: business.logoUrl,
        businessSlug: business.businessSlug,
        address: business.restaurantAddress,
        galleryImages: business.galleryImages || [],
        description: business.businessDescription,
        industry: business.industry,
        phone: business.phone,
        pageCustomization: business.pageCustomization || {},
      },
    });
  } catch (error) {
    console.error("Error fetching business by slug:", error);
    return next(new ErrorHander(error.message, 500));
  }
});

// Get all unique industries from verified businesses (public endpoint)
exports.getIndustries = catchAsyncErrors(async (req, res, next) => {
  try {
    const industries = await RestaurantAdmin.distinct("industry", {
      isVerified: true,
      industry: { $exists: true, $ne: null, $ne: "" },
    });

    res.status(200).json({
      success: true,
      industries: industries.filter(Boolean), // Remove any null/undefined values
    });
  } catch (error) {
    console.error("Error fetching industries:", error);
    return next(new ErrorHander(error.message, 500));
  }
});

// Get businesses by industry (public endpoint)
exports.getBusinessesByIndustry = catchAsyncErrors(async (req, res, next) => {
  try {
    const { industry } = req.params;

    if (!industry) {
      return next(new ErrorHander("Industry is required", 400));
    }

    const businesses = await RestaurantAdmin.find({
      industry: industry,
      isVerified: true,
    })
      .select("restaurantName logoUrl businessSlug restaurantAddress businessDescription industry")
      .sort({ restaurantName: 1 });

    res.status(200).json({
      success: true,
      businesses: businesses.map((business) => ({
        id: business.businessSlug,
        name: business.restaurantName,
        description: business.businessDescription,
        location: business.restaurantAddress?.city || business.restaurantAddress?.state || "Location not specified",
        logoUrl: business.logoUrl,
        businessSlug: business.businessSlug,
        address: business.restaurantAddress,
      })),
    });
  } catch (error) {
    console.error("Error fetching businesses by industry:", error);
    return next(new ErrorHander(error.message, 500));
  }
});

// Get all businesses (public endpoint)
exports.getAllBusinesses = catchAsyncErrors(async (req, res, next) => {
  try {
    const businesses = await RestaurantAdmin.find({
      isVerified: true,
    })
      .select("restaurantName logoUrl businessSlug restaurantAddress businessDescription industry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      businesses: businesses.map((business) => ({
        id: business.businessSlug,
        name: business.restaurantName,
        description: business.businessDescription,
        location: business.restaurantAddress?.city || business.restaurantAddress?.state || "Location not specified",
        logoUrl: business.logoUrl,
        businessSlug: business.businessSlug,
        address: business.restaurantAddress,
        industry: business.industry,
      })),
    });
  } catch (error) {
    console.error("Error fetching all businesses:", error);
    return next(new ErrorHander(error.message, 500));
  }
});
