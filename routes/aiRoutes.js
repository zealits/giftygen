const express = require("express");
const { describeGiftcard } = require("../controllers/aiController");

const router = express.Router();

// POST /api/ai/describe
router.post("/describe", describeGiftcard);

module.exports = router;

