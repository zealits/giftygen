import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "./RazorpayPaymentForm.css";

const RazorpayPaymentForm = ({ amount, currency = "INR", onPaymentSuccess, onPaymentError, businessSlug }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const dispatch = useDispatch();

  // Get the payment status from the state
  const { paymentData } = useSelector((state) => state.payment);
  const paymentStatus = paymentData?.payment?.status;

  useEffect(() => {
    // Fetch Razorpay Key ID from backend (with businessSlug if available)
    const fetchRazorpayKey = async () => {
      try {
        const url = businessSlug 
          ? `/api/payments/razorpay/key?businessSlug=${businessSlug}`
          : "/api/payments/razorpay/key";
        const response = await axios.get(url);
        if (response.data.success) {
          setRazorpayKeyId(response.data.keyId);
        }
      } catch (error) {
        console.error("Error fetching Razorpay key:", error);
        setError("Failed to initialize payment gateway");
      }
    };

    fetchRazorpayKey();
  }, [businessSlug]);

  // If payment status is COMPLETED or authorized, do not show payment button
  if (paymentStatus === "COMPLETED" || paymentStatus === "authorized" || paymentStatus === "captured") {
    return (
      <div className="razorpay-payment-container">
        <div className="razorpay-success-message">
          <h2 className="text-2xl font-bold text-green-600">Payment Completed</h2>
          <p className="text-gray-600">Your payment has been successfully completed.</p>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      setError("Invalid amount");
      return;
    }

    if (!razorpayKeyId) {
      setError("Payment gateway not initialized. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Create order on backend (with businessSlug if available)
      const orderResponse = await axios.post("/api/payments/razorpay/create-order", {
        amount: amount,
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          description: "Gift Card Purchase",
        },
        ...(businessSlug && { businessSlug }),
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.error || "Failed to create order");
      }

      const order = orderResponse.data.order;

      // Step 2: Initialize Razorpay Checkout
      const options = {
        key: razorpayKeyId,
        amount: order.amount, // Amount is already in paise
        currency: order.currency,
        name: "GiftyGen",
        description: "Gift Card Purchase",
        order_id: order.id,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on backend (with businessSlug if available)
            const verifyResponse = await axios.post("/api/payments/razorpay/verify-payment", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: amount,
              currency: currency,
              ...(businessSlug && { businessSlug }),
            });

            if (verifyResponse.data.success) {
              // Dispatch payment success action
              dispatch({
                type: "CREATE_PAYMENT_SUCCESS",
                payload: {
                  payment: {
                    id: verifyResponse.data.payment.id,
                    orderId: verifyResponse.data.payment.orderId,
                    amount: verifyResponse.data.payment.amount / 100, // Convert paise to rupees
                    currency: verifyResponse.data.payment.currency,
                    status: verifyResponse.data.payment.status,
                    method: verifyResponse.data.payment.method,
                    createdAt: verifyResponse.data.payment.createdAt,
                    captured: verifyResponse.data.payment.captured,
                    sourceType: "razorpay",
                  },
                },
              });

              if (onPaymentSuccess) {
                onPaymentSuccess(verifyResponse.data.payment);
              }
            } else {
              throw new Error(verifyResponse.data.error || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setError(error.response?.data?.error || error.message || "Payment verification failed");
            if (onPaymentError) {
              onPaymentError(error);
            }
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          // You can prefill customer details if available
          // name: "Customer Name",
          // email: "customer@example.com",
          // contact: "9999999999",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError("");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        setError(response.error.description || "Payment failed");
        setLoading(false);
        if (onPaymentError) {
          onPaymentError(new Error(response.error.description || "Payment failed"));
        }
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      setError(error.response?.data?.error || error.message || "Failed to initiate payment");
      setLoading(false);
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  return (
    <div className="razorpay-payment-container">
      <div className="razorpay-payment-content">
        <h2 className="razorpay-payment-title">Payment Method</h2>
        <p className="razorpay-payment-subtitle">Pay using Razorpay</p>
        <div className="razorpay-amount-display">
          <span className="razorpay-amount-label">Amount:</span>
          <span className="razorpay-amount-value">
            {currency} {amount}
          </span>
        </div>

        {error && (
          <div className="razorpay-error-message">
            <p>{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handlePayment}
          disabled={loading || !razorpayKeyId}
          className="razorpay-pay-button"
        >
          {loading ? "Processing..." : `Pay ${currency} ${amount}`}
        </button>

        <p className="razorpay-security-note">
          Your payment is secured by Razorpay. We do not store your card details.
        </p>
      </div>
    </div>
  );
};

export default RazorpayPaymentForm;

