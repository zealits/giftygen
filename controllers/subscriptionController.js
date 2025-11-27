const crypto = require("crypto");
const Razorpay = require("razorpay");
const Subscription = require("../models/subscriptionSchema");
const RestaurantAdmin = require("../models/restaurantAdminSchema");
const razorpay = require("../config/razorpay");

const PLAN_DEFINITIONS = {
  monthly: { amount: 1499, currency: "INR", duration: 1, durationType: "months" },
  quarterly: { amount: 3999, currency: "INR", duration: 3, durationType: "months" },
  yearly: { amount: 14999, currency: "INR", duration: 12, durationType: "months" },
};

const calculateEndDate = (startDate, plan) => {
  const endDate = new Date(startDate);
  if (plan.durationType === "months") {
    endDate.setMonth(endDate.getMonth() + plan.duration);
  } else if (plan.durationType === "years") {
    endDate.setFullYear(endDate.getFullYear() + plan.duration);
  } else {
    endDate.setDate(endDate.getDate() + (plan.duration || 30));
  }
  return endDate;
};

const getRazorpayInstance = async (businessSlug) => {
  if (businessSlug) {
    const admin = await RestaurantAdmin.findOne({ businessSlug });
    if (admin && admin.razorpayKeyId && admin.razorpayKeySecret) {
      const decryptedKeySecret = admin.getDecryptedRazorpayKeySecret();
      const decryptedKeyId = admin.getDecryptedRazorpayKeyId();

      return new Razorpay({
        key_id: decryptedKeyId || admin.razorpayKeyId,
        key_secret: decryptedKeySecret || admin.razorpayKeySecret,
      });
    }
  }

  return razorpay;
};

const getRazorpayKeySecret = async (businessSlug) => {
  if (businessSlug) {
    const admin = await RestaurantAdmin.findOne({ businessSlug });
    if (admin && admin.razorpayKeySecret) {
      return admin.getDecryptedRazorpayKeySecret() || admin.razorpayKeySecret;
    }
  }
  return process.env.RAZORPAY_KEY_SECRET;
};

exports.getPlans = (req, res) => {
  res.status(200).json({ plans: PLAN_DEFINITIONS });
};

exports.getCurrentSubscription = async (req, res) => {
  try {
    const { businessSlug } = req.params;

    if (!businessSlug) {
      return res.status(400).json({ message: "Business slug is required" });
    }

    const now = new Date();
    const subscription = await Subscription.findOne({
      businessSlug,
      endDate: { $gte: now },
      status: { $ne: "cancelled" },
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(200).json({ subscription: null, message: "No active subscription found" });
    }

    res.status(200).json({ subscription });
  } catch (error) {
    console.error("Error fetching current subscription:", error);
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
};

exports.createSubscriptionOrder = async (req, res) => {
  try {
    const { planType, businessSlug } = req.body;

    if (!planType || !businessSlug) {
      return res.status(400).json({ message: "Plan type and business slug are required" });
    }

    const plan = PLAN_DEFINITIONS[planType];
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    const razorpayInstance = await getRazorpayInstance(businessSlug);

    const order = await razorpayInstance.orders.create({
      amount: plan.amount * 100,
      currency: plan.currency || "INR",
      receipt: `sub_${businessSlug}_${Date.now()}`,
      notes: {
        planType,
        businessSlug,
      },
    });

    const subscription = await Subscription.create({
      businessSlug,
      planType,
      amount: plan.amount,
      currency: plan.currency || "INR",
      status: "pending",
      isActive: false,
      razorpayOrderId: order.id,
    });

    res.status(200).json({ order, subscription });
  } catch (error) {
    console.error("Error creating subscription order:", error);
    res.status(500).json({ message: "Failed to create subscription order" });
  }
};

exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, subscriptionId, businessSlug } = req.body;

    // We need at minimum: paymentId and signature.
    // Subscription can be located either by subscriptionId or by orderId + businessSlug.
    if (!paymentId || !signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment verification data" });
    }

    let subscription = null;

    if (subscriptionId) {
      subscription = await Subscription.findById(subscriptionId);
    } else if (orderId && businessSlug) {
      subscription = await Subscription.findOne({
        businessSlug,
        razorpayOrderId: orderId,
      }).sort({ createdAt: -1 });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found for given identifiers",
      });
    }

    const effectiveOrderId = orderId || subscription.razorpayOrderId;

    if (!effectiveOrderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID not available for verification" });
    }

    if (subscription.razorpayOrderId && subscription.razorpayOrderId !== effectiveOrderId) {
      return res.status(400).json({ success: false, message: "Order ID mismatch" });
    }

    const keySecret = await getRazorpayKeySecret(businessSlug);
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${effectiveOrderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const plan = PLAN_DEFINITIONS[subscription.planType];
    const startDate = new Date();
    const endDate = calculateEndDate(startDate, plan);

    subscription.status = "active";
    subscription.isActive = true;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.razorpayPaymentId = paymentId;
    subscription.paymentHistory.push({
      paymentId,
      orderId: effectiveOrderId,
      amount: plan.amount,
      status: "success",
      date: new Date(),
    });

    await subscription.save();

    // Mark previous subscriptions as expired
    await Subscription.updateMany(
      {
        businessSlug: subscription.businessSlug,
        _id: { $ne: subscription._id },
        status: { $in: ["active", "pending"] },
      },
      { status: "expired", isActive: false }
    );

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error("Error verifying subscription payment:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    subscription.status = "cancelled";
    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({ message: "Subscription cancelled", subscription });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ message: "Failed to cancel subscription" });
  }
};

