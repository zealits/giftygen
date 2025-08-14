const express = require("express");
const {
  sendOtp,
  registerRestaurantAdmin,
  loginRestaurantAdmin,
  requestPasswordReset,
  verifyOTP,
  getUserDetails,
  logout,
} = require("../controllers/restaurantAdminController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Route to send OTP for email verification
router.post("/send-otp", sendOtp);

// Route to register a restaurant admin after OTP verification
router.put("/register", registerRestaurantAdmin);

// Route to login a restaurant admin
router.post("/login", loginRestaurantAdmin);

router.get("/me", isAuthenticatedUser, getUserDetails);
// Route to request password reset
router.post("/password-reset", requestPasswordReset);

// Route to verify OTP
router.post("/verify-otp", verifyOTP);

// Public endpoint for landing page to capture registration/demo interest
const { captureRegistrationInterest } = require("../controllers/restaurantAdminController");
router.post("/registration-interest", captureRegistrationInterest);

router.get("/logout", logout);

module.exports = router;
