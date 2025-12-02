const express = require("express");
const {
  getSalesReport,
  getRevenueReport,
  getCustomerReport,
  getGiftCardPerformanceReport,
  getRedemptionReport,
  getFinancialSummaryReport,
} = require("../controllers/reportController.js");

const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

// Report routes - accessible to authenticated admins
router.get("/sales", isAuthenticatedUser, authorizeRoles("Admin"), getSalesReport);
router.get("/revenue", isAuthenticatedUser, authorizeRoles("Admin"), getRevenueReport);
router.get("/customers", isAuthenticatedUser, authorizeRoles("Admin"), getCustomerReport);
router.get("/giftcard-performance", isAuthenticatedUser, authorizeRoles("Admin"), getGiftCardPerformanceReport);
router.get("/redemption", isAuthenticatedUser, authorizeRoles("Admin"), getRedemptionReport);
router.get("/financial-summary", isAuthenticatedUser, authorizeRoles("Admin"), getFinancialSummaryReport);

module.exports = router;

