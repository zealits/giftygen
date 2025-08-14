const SuperAdmin = require("../models/superAdminSchema");
const RegistrationRequest = require("../models/registrationRequestSchema");
const sendToken = require("../utils/jwtToken");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");

// Login Super Admin
exports.loginSuperAdmin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is entered by user
  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  // Finding user in database
  const superAdmin = await SuperAdmin.findOne({ email }).select("+password");

  if (!superAdmin) {
    return next(new ErrorHander("Invalid Email or Password", 401));
  }

  // Check if password is correct
  const isPasswordMatched = await superAdmin.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid Email or Password", 401));
  }

  // Check if super admin is active
  if (!superAdmin.isActive) {
    return next(new ErrorHander("Account is deactivated", 401));
  }

  // Update last login
  superAdmin.lastLogin = new Date();
  await superAdmin.save();

  // For super admin, we'll send the token directly since they might not use cookies
  const token = superAdmin.getJWTToken();
  res.status(200).json({
    success: true,
    token,
    superAdmin: {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
    },
  });
});

// Get Super Admin Profile
exports.getSuperAdminProfile = catchAsyncErrors(async (req, res, next) => {
  const superAdmin = await SuperAdmin.findById(req.user.id);
  res.status(200).json({
    success: true,
    superAdmin,
  });
});

// Logout Super Admin
exports.logoutSuperAdmin = catchAsyncErrors(async (req, res, next) => {
  // For super admin, we don't need to clear cookies since they use Bearer tokens
  // The frontend will handle token removal from localStorage

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

// Get All Registration Requests
exports.getAllRegistrationRequests = catchAsyncErrors(async (req, res, next) => {
  const requests = await RegistrationRequest.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

// Get Single Registration Request
exports.getRegistrationRequest = catchAsyncErrors(async (req, res, next) => {
  const request = await RegistrationRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorHander("Registration request not found", 404));
  }

  res.status(200).json({
    success: true,
    request,
  });
});

// Update Registration Request Status
exports.updateRegistrationRequestStatus = catchAsyncErrors(async (req, res, next) => {
  const { status, notes } = req.body;

  const request = await RegistrationRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorHander("Registration request not found", 404));
  }

  request.status = status;
  request.notes = notes;
  request.reviewedBy = req.user.id;
  request.reviewedAt = new Date();

  await request.save();

  res.status(200).json({
    success: true,
    message: "Registration request status updated successfully",
    request,
  });
});

// Get Registration Request Statistics
exports.getRegistrationStats = catchAsyncErrors(async (req, res, next) => {
  const total = await RegistrationRequest.countDocuments();
  const pending = await RegistrationRequest.countDocuments({ status: "pending" });
  const approved = await RegistrationRequest.countDocuments({ status: "approved" });
  const rejected = await RegistrationRequest.countDocuments({ status: "rejected" });

  res.status(200).json({
    success: true,
    stats: {
      total,
      pending,
      approved,
      rejected,
    },
  });
});
