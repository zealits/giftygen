const express = require("express");
const router = express.Router();
const {
  getInvoice,
  getInvoicesByBusiness,
  downloadInvoicePDF,
} = require("../controllers/invoiceController");

// Get invoice by ID
router.get("/:invoiceId", getInvoice);

// Get all invoices for a business
router.get("/business/:businessSlug", getInvoicesByBusiness);

// Download invoice PDF
router.get("/:invoiceId/download", downloadInvoicePDF);

module.exports = router;







