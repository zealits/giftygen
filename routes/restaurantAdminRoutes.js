const express = require("express");
const {
  sendOtp,
  registerRestaurantAdmin,
  loginRestaurantAdmin,
  requestPasswordReset,
  verifyOTP,
  getUserDetails,
  logout,
  updateBusinessSettings,
  captureRegistrationInterest,
  changePassword,
  getBusinessBySlug,
} = require("../controllers/restaurantAdminController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const upload = require("../middleware/multer");

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
router.post("/registration-interest", captureRegistrationInterest);

router.get("/logout", logout);

// Update business settings
router.put("/settings", isAuthenticatedUser, authorizeRoles("Admin"), updateBusinessSettings);

// Change password
router.put("/change-password", isAuthenticatedUser, authorizeRoles("Admin"), changePassword);

// Upload logo
const { uploadBusinessLogo, generateQrPoster } = require("../controllers/restaurantAdminController");
router.post("/settings/logo", isAuthenticatedUser, authorizeRoles("Admin"), upload.single("logo"), uploadBusinessLogo);

// Generate QR poster
router.get("/settings/qr-poster", isAuthenticatedUser, authorizeRoles("Admin"), generateQrPoster);

// Public endpoint to get business information by slug
router.get("/business/:businessSlug", getBusinessBySlug);

module.exports = router;
