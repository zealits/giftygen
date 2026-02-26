const crypto = require("crypto");
const Razorpay = require("razorpay");
const Subscription = require("../models/subscriptionSchema");
const RestaurantAdmin = require("../models/restaurantAdminSchema");
const razorpay = require("../config/razorpay");
const { createInvoice, sendInvoiceEmail } = require("../controllers/invoiceController");
const { getTaxBreakdown } = require("../utils/taxCalculator");

const PLAN_DEFINITIONS = {
  // Small Business
  monthly: { amount: 1499, currency: "INR", duration: 1, durationType: "months" },
  quarterly: { amount: 3999, currency: "INR", duration: 3, durationType: "months" },
  biannual: { amount: 6999, currency: "INR", duration: 6, durationType: "months" },
  yearly: { amount: 11999, currency: "INR", duration: 12, durationType: "months" },
  // Medium Business
  medium_quarterly: { amount: 5999, currency: "INR", duration: 3, durationType: "months" },
  medium_biannual: { amount: 9999, currency: "INR", duration: 6, durationType: "months" },
  medium_yearly: { amount: 16999, currency: "INR", duration: 12, durationType: "months" },
  // Large Business
  large_quarterly: { amount: 8999, currency: "INR", duration: 3, durationType: "months" },
  large_biannual: { amount: 15999, currency: "INR", duration: 6, durationType: "months" },
  large_yearly: { amount: 24999, currency: "INR", duration: 12, durationType: "months" },
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
  // Calculate amounts with tax for display
  const plansWithTax = {};
  Object.keys(PLAN_DEFINITIONS).forEach((planType) => {
    const plan = PLAN_DEFINITIONS[planType];
    const taxBreakdown = getTaxBreakdown(plan.amount);
    plansWithTax[planType] = {
      ...plan,
      baseAmount: plan.amount,
      taxAmount: taxBreakdown.taxAmount,
      totalAmount: taxBreakdown.totalAmount,
      taxRate: taxBreakdown.taxRate,
    };
  });
  res.status(200).json({ plans: plansWithTax });
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
    const { planType, businessSlug, promoCode } = req.body;

    if (!planType || !businessSlug) {
      return res.status(400).json({ message: "Plan type and business slug are required" });
    }

    const plan = PLAN_DEFINITIONS[planType];
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    // ── Apply promo code discount if provided ──────────────────────────────
    let discountPercent = 0;
    let appliedPromoCode = null;

    if (promoCode) {
      const PromoCode = require("../models/promoCodeSchema");
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase().trim() });

      if (!promo || !promo.isActive) {
        return res.status(400).json({ message: "Invalid or inactive promo code" });
      }
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Promo code has expired" });
      }
      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        return res.status(400).json({ message: "Promo code usage limit reached" });
      }
      // Check if already used by this business
      const alreadyUsed = promo.usedBy.some((u) => u.businessSlug === businessSlug);
      if (alreadyUsed) {
        return res.status(400).json({ message: "Promo code already used by this business" });
      }
      if (promo.applicablePlanTypes.length > 0 && !promo.applicablePlanTypes.includes(planType)) {
        return res.status(400).json({ message: "Promo code is not valid for this plan" });
      }

      discountPercent = promo.discountPercent;
      appliedPromoCode = promo;
    }

    // ── Calculate discounted amount ────────────────────────────────────────
    const discountedAmount = Math.round(plan.amount * (1 - discountPercent / 100));
    const taxBreakdown = getTaxBreakdown(discountedAmount);

    const totalAmountRounded = Math.round(taxBreakdown.totalAmount * 100); // 100% discount means this is 0

    // ── Bypass Razorpay if 100% discount (FREE) ────────────────────────────
    if (totalAmountRounded === 0) {
      const subscription = await Subscription.create({
        businessSlug,
        planType,
        amount: 0,
        taxAmount: 0,
        totalAmount: 0,
        currency: plan.currency || "INR",
        status: "active",
        isActive: true,
        startDate: new Date(),
        endDate: calculateEndDate(new Date(), plan),
        razorpayOrderId: `free_${businessSlug}_${Date.now()}`,
        paymentHistory: [{
          paymentId: "FREE_PROMO",
          orderId: `free_${businessSlug}_${Date.now()}`,
          amount: 0,
          status: "success",
          date: new Date(),
        }],
      });

      if (appliedPromoCode) {
        appliedPromoCode.usedCount += 1;
        appliedPromoCode.usedBy.push({ businessSlug, usedAt: new Date() });
        await appliedPromoCode.save();
      }

      // Generate Invoice
      try {
        const RestaurantAdmin = require("../models/restaurantAdminSchema");
        const businessInfo = await RestaurantAdmin.findOne({ businessSlug });
        
        if (businessInfo) {
          const { createInvoice } = require("./invoiceController");
          const invoice = await createInvoice(subscription, businessInfo);
          
          if (invoice) {
            const { sendInvoiceEmail } = require("../utils/sendEmail");
            sendInvoiceEmail(invoice, businessInfo).catch((err) => 
              console.error("Error sending free invoice email:", err)
            );
          }
        }
      } catch (invoiceError) {
        console.error("Error creating free invoice:", invoiceError);
      }

      return res.status(200).json({
        isFree: true,
        subscription,
        discount: { percent: 100, originalAmount: plan.amount, discountedAmount: 0, saved: plan.amount },
      });
    }

    // ── Create Razorpay order if amount > 0 ────────────────────────────────
    const razorpayInstance = await getRazorpayInstance(businessSlug);

    const notes = {
      planType,
      businessSlug,
      baseAmount: discountedAmount.toString(),
      originalAmount: plan.amount.toString(),
      discountPercent: discountPercent.toString(),
      taxAmount: taxBreakdown.taxAmount.toString(),
      totalAmount: taxBreakdown.totalAmount.toString(),
    };
    if (promoCode) notes.promoCode = promoCode.toUpperCase().trim();

    const order = await razorpayInstance.orders.create({
      amount: totalAmountRounded, 
      currency: plan.currency || "INR",
      receipt: `sub_${businessSlug}_${Date.now()}`,
      notes,
    });

    const subscription = await Subscription.create({
      businessSlug,
      planType,
      amount: discountedAmount,
      taxAmount: taxBreakdown.taxAmount,
      totalAmount: taxBreakdown.totalAmount,
      currency: plan.currency || "INR",
      status: "pending",
      isActive: false,
      razorpayOrderId: order.id,
      // Store the promo code string temporarily so we know which one to mark as used upon successful payment
      promoCode: appliedPromoCode ? appliedPromoCode.code : undefined,
    });

    res.status(200).json({
      order,
      subscription,
      discount: discountPercent > 0 ? {
        percent: discountPercent,
        originalAmount: plan.amount,
        discountedAmount,
        saved: plan.amount - discountedAmount,
      } : null,
    });
  } catch (error) {
    console.error("Error creating subscription order:", error);
    res.status(500).json({ 
      message: "Failed to create subscription order", 
      error: error.error || error.message || error 
    });
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

    // Use the stored totalAmount from subscription (which includes tax)
    const paymentAmount = subscription.totalAmount || subscription.amount;

    subscription.paymentHistory.push({
      paymentId,
      orderId: effectiveOrderId,
      amount: paymentAmount, // Total amount including tax
      status: "success",
      date: new Date(),
    });

    // Mark promo code as used if one was applied
    if (subscription.promoCode) {
      const PromoCode = require("../models/promoCodeSchema");
      const promo = await PromoCode.findOne({ code: subscription.promoCode });
      if (promo) {
        promo.usedCount += 1;
        promo.usedBy.push({ businessSlug, usedAt: new Date() });
        await promo.save();
      }
    }

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

    // Generate and send invoice after successful subscription
    try {
      const businessInfo = await RestaurantAdmin.findOne({
        businessSlug: subscription.businessSlug,
      });

      if (businessInfo) {
        const invoice = await createInvoice(subscription, businessInfo);
        // Send invoice via email (non-blocking - don't fail subscription if email fails)
        sendInvoiceEmail(invoice, businessInfo).catch((emailError) => {
          console.error("Error sending invoice email:", emailError);
          // Don't throw - invoice is created, just email failed
        });
      }
    } catch (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      // Don't fail the subscription verification if invoice creation fails
      // The subscription is already active, invoice can be generated later if needed
    }

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

