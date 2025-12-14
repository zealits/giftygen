// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { generateWalletPass } = require("../controllers/walletController.js");
const downloadApplePass = require("../controllers/appleWalletController.js");

router.post("/generate-wallet-pass", generateWalletPass);
router.get("/download-apple-pass/:passId", downloadApplePass);
// Add to walletRoutes.js
router.get("/test-wallet-connection", async (req, res) => {
    try {
      const response = await httpClient.request({
        url: `${baseUrl}/genericClass`,
        method: 'GET',
      });
      res.json({ success: true, message: "Google Wallet API connection successful" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.response?.data 
      });
    }
  });
module.exports = router;
