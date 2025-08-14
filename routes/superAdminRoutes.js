const express = require("express");
const {
  loginSuperAdmin,
  getSuperAdminProfile,
  logoutSuperAdmin,
  getAllRegistrationRequests,
  getRegistrationRequest,
  updateRegistrationRequestStatus,
  getRegistrationStats,
} = require("../controllers/superAdminController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Super Admin Login
router.post("/login", loginSuperAdmin);

// Super Admin Profile (Protected)
router.get("/profile", isAuthenticatedUser, authorizeRoles("SuperAdmin"), getSuperAdminProfile);

// Super Admin Logout
router.get("/logout", isAuthenticatedUser, authorizeRoles("SuperAdmin"), logoutSuperAdmin);

// Registration Requests Management (Protected)
router.get("/registration-requests", isAuthenticatedUser, authorizeRoles("SuperAdmin"), getAllRegistrationRequests);
router.get("/registration-requests/:id", isAuthenticatedUser, authorizeRoles("SuperAdmin"), getRegistrationRequest);
router.put(
  "/registration-requests/:id/status",
  isAuthenticatedUser,
  authorizeRoles("SuperAdmin"),
  updateRegistrationRequestStatus
);

// Statistics (Protected)
router.get("/stats", isAuthenticatedUser, authorizeRoles("SuperAdmin"), getRegistrationStats);

module.exports = router;
