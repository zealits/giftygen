const express = require("express");
const { describeGiftcard, generateGiftcardImage } = require("../controllers/aiController");

const router = express.Router();

// POST /api/ai/describe
router.post("/describe", describeGiftcard);

// POST /api/ai/image - proxy for AI gift card image generation (avoids CORS)
router.post("/image", generateGiftcardImage);

module.exports = router;

