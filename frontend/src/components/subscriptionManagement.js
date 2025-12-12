import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./subscriptionManagement.css";

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [razorpayKey, setRazorpayKey] = useState("");
  const [processingPaymentPlan, setProcessingPaymentPlan] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";
  const hasFetched = useRef(false);

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch plans
      const plansResponse = await axios.get("/api/v1/subscription/plans");
      setPlans(plansResponse.data.plans);

      // Fetch current subscription (200 even when empty)
      const subResponse = await axios.get(
        `/api/v1/subscription/${businessSlug}/current`
      );
      setCurrentSubscription(subResponse.data.subscription || null);

      // Fetch Razorpay key
      const keyResponse = await axios.get(
        `/api/v1/payment/razorpay/key?businessSlug=${businessSlug}`
      );
      setRazorpayKey(keyResponse.data.keyId);

      // Fetch invoices
      try {
        const invoicesResponse = await axios.get(`/api/v1/invoices/business/${businessSlug}`);
        if (invoicesResponse.data.success) {
          setInvoices(invoicesResponse.data.invoices || []);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      // Previously showed an alert to the user; now just logs the error
    } finally {
      setLoading(false);
    }
  }, [businessSlug]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchSubscriptionData();
  }, [businessSlug, fetchSubscriptionData]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planType) => {
    if (processingPaymentPlan) return;

    try {
      setProcessingPaymentPlan(planType);

      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        console.error("Failed to load payment gateway. Please try again.");
        setProcessingPaymentPlan(null);
        return;
      }

      // Create order
      const orderResponse = await axios.post(
        "/api/v1/subscription/create-order",
        {
          planType,
          businessSlug,
        }
      );

      const { order, subscription } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Gift Card Platform",
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              "/api/v1/subscription/verify-payment",
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                // Use Mongo _id explicitly; some serializers omit the virtual id field
                subscriptionId: subscription._id,
                businessSlug,
              }
            );

            if (verifyResponse.data.success) {
              console.log("Subscription activated successfully");
              hasFetched.current = false;
              fetchSubscriptionData();
            } else {
              console.error(
                "Payment verification failed on server:",
                verifyResponse.data.message || "Unknown error"
              );
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            const serverMessage =
              error.response?.data?.message ||
              error.response?.data?.error ||
              error.message;
            console.error(
              "Payment verification failed.",
              serverMessage,
              "Payment ID:",
              response.razorpay_payment_id
            );
          } finally {
            setProcessingPaymentPlan(null);
          }
        },
        prefill: {
          name: user?.user?.name || "",
          email: user?.user?.email || "",
          contact: user?.user?.phone || "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setProcessingPaymentPlan(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initiating subscription:", error);
      alert("Failed to initiate subscription. Please try again.");
      setProcessingPaymentPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel your subscription? You will still have access until the end of your billing period."
      )
    ) {
      return;
    }

    try {
      await axios.put(`/api/v1/subscription/${currentSubscription._id}/cancel`);
      console.log(
        "Subscription cancelled successfully. Access until",
        new Date(currentSubscription.endDate).toLocaleDateString()
      );
      hasFetched.current = false;
      fetchSubscriptionData();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      // Previously showed an alert; now just logs the error
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    
    // Set both dates to midnight to avoid time-of-day issues
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Calculate difference in milliseconds
    const diffTime = end - now;
    
    // Convert to days and round down (don't count partial days)
    // This gives us the number of full days remaining until the end date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If end date is today or in the past, return 0
    // Otherwise return the number of days (this includes the end date as a remaining day)
    return diffDays >= 0 ? diffDays : 0;
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      setDownloadingInvoice(invoiceId);
      const response = await axios.get(`/api/v1/invoices/${invoiceId}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceNumber || invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading invoice:", err);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Get invoice for current subscription
  const getCurrentSubscriptionInvoice = () => {
    if (!currentSubscription || !invoices.length) return null;
    // Find invoice that matches the current subscription
    return invoices.find(inv => 
      inv.subscriptionId && 
      (inv.subscriptionId._id === currentSubscription._id || 
       inv.subscriptionId.toString() === currentSubscription._id.toString())
    ) || invoices[0]; // Fallback to most recent invoice
  };

  if (loading) {
    return (
      <div className="subscription-container">
        <h1 className="subscription-heading">Subscription Management</h1>
        <div className="loading-container">
          <div className="skeleton-loader"></div>
          <div className="skeleton-loader"></div>
          <div className="skeleton-loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-container">
      <h1 className="subscription-heading">Subscription Management</h1>

      {/* Current Subscription Status */}
      {currentSubscription && currentSubscription.isActive && (
        <div className="current-subscription-card">
          <div className="subscription-header">
            <h2>Current Subscription</h2>
            <span className={`status-badge ${currentSubscription.status}`}>
              {currentSubscription.status.toUpperCase()}
            </span>
          </div>
          
          <div className="subscription-details">
            <div className="detail-item">
              <span className="detail-label">Plan Type</span>
              <span className="detail-value">
                {currentSubscription.planType.charAt(0).toUpperCase() + currentSubscription.planType.slice(1)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Amount</span>
              <span className="detail-value">₹{currentSubscription.amount}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Start Date</span>
              <span className="detail-value">{formatDate(currentSubscription.startDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">End Date</span>
              <span className="detail-value">{formatDate(currentSubscription.endDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Days Remaining</span>
              <span className="detail-value days-remaining">
                {getDaysRemaining(currentSubscription.endDate)} days
              </span>
            </div>
          </div>

          <div className="subscription-actions">
            {getCurrentSubscriptionInvoice() && (
              <button
                onClick={() => handleDownloadInvoice(
                  getCurrentSubscriptionInvoice()._id,
                  getCurrentSubscriptionInvoice().invoiceNumber
                )}
                disabled={downloadingInvoice === getCurrentSubscriptionInvoice()._id}
                className="download-invoice-btn"
              >
                {downloadingInvoice === getCurrentSubscriptionInvoice()._id 
                  ? "Downloading..." 
                  : "📥 Download Invoice"}
              </button>
            )}
            {currentSubscription.status !== "cancelled" && (
              <button
                onClick={handleCancelSubscription}
                className="cancel-subscription-btn"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* No Active Subscription Message */}
      {(!currentSubscription || !currentSubscription.isActive) && (
        <div className="no-subscription-message">
          <h3>No Active Subscription</h3>
          <p>Choose a plan below to get started with our gift card platform.</p>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="plans-section">
        <h2 className="plans-heading">Available Plans</h2>
        <div className="plans-grid">
          {plans &&
            Object.entries(plans).map(([key, plan]) => {
              const isCurrentPlan = currentSubscription?.isActive && currentSubscription?.planType === key;
              const isMostPopular = key === "quarterly";
              
              return (
                <div
                  key={key}
                  className={`plan-card ${isMostPopular ? "popular" : ""} ${isCurrentPlan ? "current-plan" : ""}`}
                >
                  {isMostPopular && <div className="popular-badge">Most Popular</div>}
                  {isCurrentPlan && <div className="current-plan-badge">Current Plan</div>}
                  
                  <h3 className="plan-name">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </h3>
                  
                  <div className="plan-price">
                    <span className="currency">₹</span>
                    <span className="amount">{plan.amount}</span>
                    <span className="period">
                      /{plan.duration} {plan.durationType === "months" ? (plan.duration === 1 ? "month" : "months") : "year"}
                    </span>
                  </div>

                  <ul className="plan-features">
                    <li>✓ Unlimited gift cards</li>
                    <li>✓ Full dashboard access</li>
                    <li>✓ Real-time analytics</li>
                    <li>✓ Email support</li>
                    <li>✓ Order management</li>
                    {key === "yearly" && <li>✓ Priority support</li>}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={isCurrentPlan || processingPaymentPlan === key}
                    className={`subscribe-btn ${isCurrentPlan || processingPaymentPlan === key ? "disabled" : ""}`}
                  >
                    {isCurrentPlan ? "Current Plan" : "Subscribe Now"}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Payment History */}
      {currentSubscription && currentSubscription.paymentHistory && currentSubscription.paymentHistory.length > 0 && (
        <div className="payment-history-section">
          <h2>Payment History</h2>
          <div className="payment-history-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Payment ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentSubscription.paymentHistory.map((payment, index) => (
                  <tr key={index}>
                    <td>{formatDate(payment.date)}</td>
                    <td className="payment-id">{payment.paymentId}</td>
                    <td>₹{payment.amount}</td>
                    <td>
                      <span className={`payment-status ${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;