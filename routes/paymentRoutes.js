// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// SQUARE PAYMENT ROUTES COMMENTED OUT
// Square Payment Routes
// router.post("/create-payment", paymentController.createPayment);

// Razorpay Payment Routes
router.post("/razorpay/create-order", paymentController.createRazorpayOrder);
router.post("/razorpay/verify-payment", paymentController.verifyRazorpayPayment);
router.get("/razorpay/payment/:paymentId", paymentController.getRazorpayPaymentDetails);
router.get("/razorpay/key", paymentController.getRazorpayKey);

module.exports = router;
