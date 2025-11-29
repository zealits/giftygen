const express = require("express");
const {
  getPlans,
  getCurrentSubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  cancelSubscription,
} = require("../controllers/subscriptionController");

const router = express.Router();

router.get("/plans", getPlans);
router.post("/create-order", createSubscriptionOrder);
router.post("/verify-payment", verifySubscriptionPayment);
router.put("/:subscriptionId/cancel", cancelSubscription);
router.get("/:businessSlug/current", getCurrentSubscription);

module.exports = router;






