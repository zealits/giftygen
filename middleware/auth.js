const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const RestaurantAdmin = require("../models/restaurantAdminSchema");
const SuperAdmin = require("../models/superAdminSchema");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token;

  // Check for token in cookies first (for existing restaurant admin routes)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check for Bearer token in Authorization header (for super admin routes)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorHander("Please Login to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in RestaurantAdmin first, then in SuperAdmin
    let user = await RestaurantAdmin.findById(decodedData.id);

    if (!user) {
      user = await SuperAdmin.findById(decodedData.id);
    }

    if (!user) {
      return next(new ErrorHander("User not found", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHander("Invalid or expired token", 401));
  }
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ErrorHander("User role not found", 403));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ErrorHander(`Role: ${req.user.role} is not allowed to access this resource`, 403));
    }

    next();
  };
};
