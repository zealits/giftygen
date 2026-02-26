const express = require("express");
const { validatePromoCode } = require("../controllers/promoCodeController");

const router = express.Router();

// Public: any user can validate a promo code (no auth needed — just returns discount info)
router.post("/validate", validatePromoCode);

module.exports = router;
