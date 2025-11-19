// controllers/paymentController.js
// SQUARE API COMMENTED OUT
// const paymentsApi = require("../config/square.js");
// const { Client, Environment } = require("square");
const RestaurantAdmin = require("../models/restaurantAdminSchema");
const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
const razorpay = require("../config/razorpay"); // Global fallback
const crypto = require("crypto");

/**
 * Get Razorpay instance - checks for per-business credentials first, falls back to global env
 * @param {String} businessSlug - Optional business slug to look up per-business credentials
 * @returns {Object} Razorpay instance
 */
const getRazorpayInstance = async (businessSlug) => {
  // If businessSlug is provided, check for per-business credentials
  if (businessSlug) {
    const admin = await RestaurantAdmin.findOne({ businessSlug });
    if (admin && admin.razorpayKeyId && admin.razorpayKeySecret) {
      // Decrypt the key secret before using it
      const decryptedKeySecret = admin.getDecryptedRazorpayKeySecret();
      const decryptedKeyId = admin.getDecryptedRazorpayKeyId();
      
      // Create Razorpay instance with per-business credentials
      return new Razorpay({
        key_id: decryptedKeyId || admin.razorpayKeyId,
        key_secret: decryptedKeySecret || admin.razorpayKeySecret,
      });
    }
  }
  
  // Fall back to global environment variables
  return razorpay;
};

// SQUARE PAYMENT FUNCTION COMMENTED OUT
// exports.createPayment = async (req, res) => {
//   console.log("Trigger createPayment");
//   const { sourceId, amount, businessSlug } = req.body;
//   console.log(sourceId, amount);

//   try {
//     // Determine which Square credentials to use
//     let clientToUse = null;
//     if (businessSlug) {
//       const admin = await RestaurantAdmin.findOne({ businessSlug });
//       if (admin && admin.squareAccessToken) {
//         const client = new Client({ accessToken: admin.squareAccessToken, environment: Environment.Sandbox });
//         clientToUse = client.paymentsApi;
//       }
//     }
//     const api = clientToUse || paymentsApi;

//     const response = await api.createPayment({
//       sourceId,
//       idempotencyKey: `${Date.now()}`,
//       amountMoney: {
//         amount: amount,
//         currency: "USD",
//       },
//     });

//     // Handle BigInt serialization
//     const result = JSON.parse(
//       JSON.stringify(response.result, (key, value) => (typeof value === "bigint" ? value.toString() : value))
//     );

//     console.log("Response: ", response);
//     console.log("Result: ", result);

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error: ", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Razorpay Payment Methods

/**
 * Create Razorpay Order
 * This endpoint creates an order in Razorpay
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes, businessSlug } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Get Razorpay instance (per-business or global)
    const razorpayInstance = await getRazorpayInstance(businessSlug);

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    // For INR, it's paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error: ", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create Razorpay order",
    });
  }
};

/**
 * Verify Razorpay Payment
 * This endpoint verifies the payment signature
 */
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, amount, currency = "INR", businessSlug } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        error: "Order ID, Payment ID, and Signature are required",
      });
    }

    // Get Razorpay instance to get the key secret for verification
    const razorpayInstance = await getRazorpayInstance(businessSlug);
    
    // Get the key secret (from per-business or global env)
    let keySecret;
    if (businessSlug) {
      const admin = await RestaurantAdmin.findOne({ businessSlug });
      if (admin && admin.razorpayKeySecret) {
        // Decrypt the key secret before using it
        keySecret = admin.getDecryptedRazorpayKeySecret();
      } else {
        keySecret = process.env.RAZORPAY_KEY_SECRET;
      }
    } else {
      keySecret = process.env.RAZORPAY_KEY_SECRET;
    }

    // Create the expected signature
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    // Compare signatures
    if (expectedSignature === signature) {
      // Fetch payment details from Razorpay
      const payment = await razorpayInstance.payments.fetch(paymentId);

      res.status(200).json({
        success: true,
        payment: {
          id: payment.id,
          orderId: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          description: payment.description,
          createdAt: payment.created_at,
          captured: payment.captured,
        },
        message: "Payment verified successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }
  } catch (error) {
    console.error("Razorpay Payment Verification Error: ", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify payment",
    });
  }
};

/**
 * Get Razorpay Payment Details
 * This endpoint fetches payment details from Razorpay
 */
exports.getRazorpayPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { businessSlug } = req.query; // Get businessSlug from query params

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Payment ID is required",
      });
    }

    // Get Razorpay instance (per-business or global)
    const razorpayInstance = await getRazorpayInstance(businessSlug);
    const payment = await razorpayInstance.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        createdAt: payment.created_at,
        captured: payment.captured,
        email: payment.email,
        contact: payment.contact,
      },
    });
  } catch (error) {
    console.error("Razorpay Payment Fetch Error: ", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch payment details",
    });
  }
};

/**
 * Get Razorpay Key ID
 * This endpoint returns the Razorpay key ID for frontend initialization
 */
exports.getRazorpayKey = async (req, res) => {
  try {
    const { businessSlug } = req.query; // Get businessSlug from query params
    
    let keyId = process.env.RAZORPAY_KEY_ID; // Global fallback
    
    // If businessSlug is provided, check for per-business key
    if (businessSlug) {
      const admin = await RestaurantAdmin.findOne({ businessSlug });
      if (admin && admin.razorpayKeyId) {
        // Decrypt the key ID if it's encrypted (though typically it's not)
        keyId = admin.getDecryptedRazorpayKeyId() || admin.razorpayKeyId;
      }
    }
    
    res.status(200).json({
      success: true,
      keyId: keyId,
    });
  } catch (error) {
    console.error("Error getting Razorpay key: ", error);
    res.status(500).json({
      success: false,
      error: "Failed to get Razorpay key",
    });
  }
};
