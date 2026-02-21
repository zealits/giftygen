const express = require("express");
const {
  sendOtp,
  registerRestaurantAdmin,
  loginRestaurantAdmin,
  requestPasswordReset,
  resetPassword,
  verifyOTP,
  getUserDetails,
  logout,
  updateBusinessSettings,
  uploadBusinessLogo,
  uploadBusinessPhotos,
  generateQrPoster,
  captureRegistrationInterest,
  changePassword,
  getBusinessBySlug,
  submitContactForm,
  getIndustries,
  getBusinessesByIndustry,
  getAllBusinesses,
} = require("../controllers/restaurantAdminController");
const {
  getReviewsByBusinessSlug,
  createReview,
} = require("../controllers/reviewController");
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

// Route to reset password with token
router.put("/password-reset/:token", resetPassword);

// Route to verify OTP
router.post("/verify-otp", verifyOTP);

// Public endpoint for landing page to capture registration/demo interest
router.post("/registration-interest", captureRegistrationInterest);

// Public endpoint for contact form submission
router.post("/contact", submitContactForm);

router.get("/logout", logout);

// Update business settings
router.put("/settings", isAuthenticatedUser, authorizeRoles("Admin"), updateBusinessSettings);

// Change password
router.put("/change-password", isAuthenticatedUser, authorizeRoles("Admin"), changePassword);

// Upload logo
router.post("/settings/logo", isAuthenticatedUser, authorizeRoles("Admin"), upload.single("logo"), uploadBusinessLogo);

// Upload additional business photos (up to 10)
router.post(
  "/settings/photos",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  upload.array("photos", 10),
  uploadBusinessPhotos,
);

// Generate QR poster
router.get("/settings/qr-poster", isAuthenticatedUser, authorizeRoles("Admin"), generateQrPoster);

// Public endpoint to get business information by slug
router.get("/business/:businessSlug", getBusinessBySlug);

// Public endpoints for end-user reviews (by business slug)
router.get("/business/:businessSlug/reviews", getReviewsByBusinessSlug);
router.post("/business/:businessSlug/reviews", createReview);

// Public endpoint to get all industries
router.get("/industries", getIndustries);

// Public endpoint to get businesses by industry
router.get("/industries/:industry", getBusinessesByIndustry);

// Public endpoint to get all businesses
router.get("/businesses", getAllBusinesses);

module.exports = router;
