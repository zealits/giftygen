// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { generateWalletPass } = require("../controllers/walletController.js");
const downloadApplePass = require("../controllers/appleWalletController.js");

router.post("/generate-wallet-pass", generateWalletPass);
router.get("/download-apple-pass/:passId", downloadApplePass);

module.exports = router;
