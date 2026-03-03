import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./subscriptionManagement.css";

/* ──────────────────────────────────────────────
   PLAN CONFIGURATION
   ────────────────────────────────────────────── */
const PLAN_CARDS = [
  {
    id: "small",
    label: "Starter",
    tagline: "Great for getting started",
    isPopular: false,
    isEnterprise: false,
    giftCardLimit: "Up to 500",
    marketplaceCommission: "10%",
    commissionColor: "red",
    onboarding: "₹1,999",
    onboardingAmount: 1999,
    features: [
      "Unlimited gift card promotions",
      "QR Code & Shareable Link",
      "Marketplace Listing",
      "Full dashboard access",
      "Real-time analytics",
      "Email support",
      "Order management",
    ],
    periods: [
      { key: "quarterly", label: "3 Months", amount: 3999, duration: "3 months", savings: null },
      { key: "biannual", label: "6 Months", amount: 6999, duration: "6 months", savings: "Save ₹999" },
      { key: "yearly", label: "1 Year", amount: 11999, duration: "1 year", savings: "Save ₹3,997" },
    ],
  },
  {
    id: "medium",
    label: "Growth",
    tagline: "Our most popular choice",
    isPopular: true,
    isEnterprise: false,
    giftCardLimit: "Up to 2,000",
    marketplaceCommission: "6%",
    commissionColor: "red",
    onboarding: "₹3,999",
    onboardingAmount: 3999,
    features: [
      "Unlimited gift card promotions",
      "QR Code & Shareable Link",
      "Marketplace Listing",
      "Full dashboard access",
      "Real-time analytics",
      "Priority email support",
      "Order management",
    ],
    periods: [
      { key: "medium_quarterly", label: "3 Months", amount: 5999, duration: "3 months", savings: null },
      { key: "medium_biannual", label: "6 Months", amount: 9999, duration: "6 months", savings: "Save ₹1,999" },
      { key: "medium_yearly", label: "1 Year", amount: 16999, duration: "1 year", savings: "Save ₹6,997" },
    ],
  },
  {
    id: "large",
    label: "Scale",
    tagline: "Unlimited scale, best rates",
    isPopular: false,
    isEnterprise: true,
    giftCardLimit: "Unlimited",
    marketplaceCommission: "3%",
    commissionColor: "green",
    onboarding: "₹9,999",
    onboardingAmount: 9999,
    features: [
      "Unlimited gift card promotions",
      "QR Code & Shareable Link",
      "Marketplace Listing",
      "Full dashboard access",
      "Real-time analytics",
      "Priority support",
      "Order management",
      "Dedicated account manager",
    ],
    periods: [], // Contact Sales
  },
];

const PLAN_DISPLAY_NAMES = {
  quarterly: "Small Business — 3 Months",
  biannual: "Small Business — 6 Months",
  yearly: "Small Business — 1 Year",
  medium_quarterly: "Medium Business — 3 Months",
  medium_biannual: "Medium Business — 6 Months",
  medium_yearly: "Medium Business — 1 Year",
  monthly: "Monthly",
  onboarding: "One-Time Onboarding",
};

/* ──────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────── */
const SubscriptionManagement = () => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [razorpayKey, setRazorpayKey] = useState("");
  const [processingPaymentPlan, setProcessingPaymentPlan] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);

  // Period selection per card (0‑based index)
  const [selectedPeriods, setSelectedPeriods] = useState({ small: 0, medium: 0 });
  const [openDropdown, setOpenDropdown] = useState(null); // "small" | "medium" | null
  const [showPlans, setShowPlans] = useState(false);

  // Promo‑code handling
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(null); // { code, discountPercent, applicablePlanTypes? }
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [promoValidating, setPromoValidating] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";
  const hasFetched = useRef(false);
  const dropdownRefs = useRef({});

  /* ── Dropdown outside‑click handling ── */
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        openDropdown &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown].contains(e.target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openDropdown]);

  /* ── FETCH CURRENT SUBSCRIPTION, RAZORPAY KEY & INVOICES ── */
  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      const subResponse = await axios.get(`/api/v1/subscription/${businessSlug}/current`);
      setCurrentSubscription(subResponse.data.subscription || null);

      const keyResponse = await axios.get(`/api/v1/payment/razorpay/key?businessSlug=${businessSlug}`);
      setRazorpayKey(keyResponse.data.keyId);

      // Invoices
      try {
        const invoicesResponse = await axios.get(`/api/v1/invoices/business/${businessSlug}`);
        if (invoicesResponse.data.success) setInvoices(invoicesResponse.data.invoices || []);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    } finally {
      setLoading(false);
    }
  }, [businessSlug]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchSubscriptionData();
  }, [businessSlug, fetchSubscriptionData]);

  /* ── LOAD RAZORPAY SDK ── */
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* ── SUBSCRIBE / PAYMENT FLOW ── */
  const handleSubscribe = async (planKey, cardLabel) => {
    // -----------------------------------------------------------------
    // 1️⃣  Guard – prevent double‑clicks
    // -----------------------------------------------------------------
    if (processingPaymentPlan) return;

    // -----------------------------------------------------------------
    // 2️⃣  Basic sanity checks (helps during dev / catches empty slug)
    // -----------------------------------------------------------------
    if (!planKey) {
      console.warn("[handleSubscribe] No planKey supplied");
      return;
    }
    if (!businessSlug) {
      alert("Business identifier missing – cannot create an order.");
      console.warn("[handleSubscribe] businessSlug is empty");
      return;
    }

    try {
      setProcessingPaymentPlan(planKey);

      // -----------------------------------------------------------------
      // 3️⃣  Load Razorpay SDK (show a friendly message if it fails)
      // -----------------------------------------------------------------
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please refresh the page.");
        setProcessingPaymentPlan(null);
        return;
      }

      // -----------------------------------------------------------------
      // 4️⃣  Build the payload – we send BOTH `planKey` and `planType`
      //     because some back‑ends still expect the older name.
      // -----------------------------------------------------------------
      const payload = {
        planKey,               // backward‑compatibility
        planType: planKey,     // current API surface
        businessSlug,
        promoCode: promoDiscount?.code || "",
      };

      // -----------------------------------------------------------------
      // 5️⃣  Create the order on the server, handling 400/422 errors
      // -----------------------------------------------------------------
      const orderResponse = await axios.post("/api/v1/subscription/create-order", payload);
      const responseData = orderResponse?.data || {};

      // Normalise order object – the API may return `order` or `orderDetails`
      const order =
        responseData.order ||
        responseData.orderDetails ||
        {
          amount: responseData.amount,
          currency: responseData.currency,
          id: responseData.id || responseData.orderId,
        };

      const subscription = responseData.subscription;

      // -----------------------------------------------------------------
      // 6️⃣  Validate the order payload before passing it to Razorpay
      // -----------------------------------------------------------------
      if (!order || typeof order.amount === "undefined") {
        console.error("Invalid order payload from server:", responseData);
        throw new Error("Unable to create payment order. Please try again later.");
      }

      // -----------------------------------------------------------------
      // 6b  Ensure Razorpay key is available (prevents cryptic failure when opening checkout)
      // -----------------------------------------------------------------
      if (!razorpayKey || razorpayKey.trim() === "") {
        console.error("Razorpay key missing – check backend env RAZORPAY_KEY_ID or per-business keys.");
        alert("Payment gateway is not configured. Please contact support.");
        setProcessingPaymentPlan(null);
        return;
      }

      // -----------------------------------------------------------------
      // 7️⃣  Initialise Razorpay UI
      // -----------------------------------------------------------------
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Gift Card Platform",
        description: `${cardLabel} Subscription`,
        // Razorpay expects `order_id`; we map from the normalized order.
        order_id: order.id || order.orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post("/api/v1/subscription/verify-payment", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              subscriptionId: subscription?._id,
              businessSlug,
            });
            if (verifyResponse.data.success) {
              // Refetch subscription state after a successful payment
              hasFetched.current = false;
              fetchSubscriptionData();
            }
          } catch (err) {
            console.error("Payment verification failed:", err);
          } finally {
            setProcessingPaymentPlan(null);
          }
        },
        prefill: {
          name: user?.user?.name || "",
          email: user?.user?.email || "",
          contact: user?.user?.phone || "",
        },
        theme: { color: "#7c3aed" },
        modal: { ondismiss: () => setProcessingPaymentPlan(null) },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      // -----------------------------------------------------------------
      // 8️⃣  Show a **human‑readable** message – include server‑side details
      // -----------------------------------------------------------------
      console.error("Error initiating subscription:", error);

      const data = error?.response?.data;
      const serverMessage =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        (data?.error?.message) ||
        (error?.message);
      const friendlyMsg = serverMessage
        ? `Failed to start subscription: ${serverMessage}`
        : "Failed to initiate subscription. Please try again. Check the browser console for details.";
      alert(friendlyMsg);
      setProcessingPaymentPlan(null);
    }
  };

  /* ── CONTACT‑SALES ── */
  const handleContactSales = () => {
    window.location.href =
      "mailto:sales@giftcardplatform.com?subject=Large Business Plan Enquiry";
  };

  /* ── CANCEL SUBSCRIPTION ── */
  const handleCancelSubscription = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel your subscription? You will still have access until the end of your billing period."
      )
    )
      return;
    try {
      await axios.put(`/api/v1/subscription/${currentSubscription._id}/cancel`);
      hasFetched.current = false;
      fetchSubscriptionData();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };

  /* ── UTILITIES ── */
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((end - now) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
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
    } catch {
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const getCurrentSubscriptionInvoice = () => {
    if (!currentSubscription || !invoices.length) return null;
    return (
      invoices.find(
        (inv) =>
          inv.subscriptionId &&
          (inv.subscriptionId._id === currentSubscription._id ||
            inv.subscriptionId.toString() === currentSubscription._id.toString())
      ) || invoices[0]
    );
  };

  const formatPlanType = (planType) => PLAN_DISPLAY_NAMES[planType] || planType;

  /* ── LOADING STATE ── */
  if (loading) {
    return (
      <div className="subscription-container">
        <div className="subscription-hero">
          <h1 className="subscription-heading">Subscription</h1>
        </div>
        <div className="loading-container">
          <div className="skeleton-loader" />
          <div className="skeleton-loader" />
          <div className="skeleton-loader" />
        </div>
      </div>
    );
  }

  const invoice = getCurrentSubscriptionInvoice();

  /* ── MAIN RENDER ── */
  return (
    <div className="subscription-container">
      {/* ── Hero Header ── */}
      <div className="subscription-hero">
        <h1 className="subscription-heading">SUBSCRIPTION</h1>
        <p className="subscription-subheading">
          Choose the right plan to grow your gift card business
        </p>
        <div className="subscription-hero-divider" />
      </div>

      {/* ── Active Subscription Banner ── */}
      {currentSubscription?.isActive && (
        <div className="current-subscription-card">
          <div className="subscription-header">
            <h2>Current Subscription</h2>
            <span className={`status-badge ${currentSubscription.status}`}>
              {currentSubscription.status.toUpperCase()}
            </span>
          </div>

          <div className="subscription-details">
            <div className="detail-item">
              <span className="detail-label">Plan</span>
              <span className="detail-value">{formatPlanType(currentSubscription.planType)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Amount Paid</span>
              <span className="detail-value">
                ₹{currentSubscription.amount?.toLocaleString("en-IN")}
              </span>
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
            <button onClick={() => setShowPlans(true)} className="upgrade-btn">
              🚀 Upgrade / Renew
            </button>
            {invoice && (
              <button
                onClick={() => handleDownloadInvoice(invoice._id, invoice.invoiceNumber)}
                disabled={downloadingInvoice === invoice._id}
                className="download-invoice-btn"
              >
                {downloadingInvoice === invoice._id ? "Downloading…" : "📥 Download Invoice"}
              </button>
            )}
            {currentSubscription.status !== "cancelled" && (
              <button onClick={handleCancelSubscription} className="cancel-subscription-btn">
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Plan Cards (hidden if user has active sub unless they clicked Upgrade) ── */}
      {(!currentSubscription?.isActive || showPlans) && (
          <div className="plans-section">
          <div className="plans-section-header">
            <h2 className="plans-heading">Available Plans</h2>
            <p className="plans-subheading">
              All plans include a one‑time onboarding fee&nbsp;·&nbsp;0% commission on your own QR customers
            </p>
          </div>

          {/* ── Promo Code Input ── */}
          <div className="promo-code-section">
            <div className="promo-code-input-row">
              <input
                type="text"
                className="promo-code-input"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError("");
                  setPromoSuccess("");
                }}
              />
              <button
                className="promo-apply-btn"
                disabled={!promoCode.trim() || promoValidating}
                onClick={async () => {
                  setPromoValidating(true);
                  setPromoError("");
                  setPromoSuccess("");
                  setPromoDiscount(null);
                  try {
                    const res = await axios.post("/api/v1/promo-code/validate", { code: promoCode });
                    if (res.data.success) {
                      const promoInfo = res.data.promoCode || {};
                      setPromoDiscount(promoInfo);

                      const plansList = Array.isArray(promoInfo.applicablePlanTypes)
                        ? promoInfo.applicablePlanTypes
                        : [];
                      const appliedToText =
                        plansList.length > 0
                          ? `Applied on: ${plansList.map((p) => formatPlanType(p)).join(", ")}`
                          : "Applied on all plans";

                      setPromoSuccess(
                        `🎉 ${promoInfo.discountPercent}% discount applied! ${appliedToText}`,
                      );
                    } else {
                      setPromoError(res.data.message);
                    }
                  } catch (err) {
                    setPromoError(err?.response?.data?.message || "Failed to validate promo code");
                  } finally {
                    setPromoValidating(false);
                  }
                }}
              >
                {promoValidating ? "Validating…" : "Apply"}
              </button>
              {promoDiscount && (
                <button
                  className="promo-remove-btn"
                  onClick={() => {
                    setPromoCode("");
                    setPromoDiscount(null);
                    setPromoSuccess("");
                    setPromoError("");
                  }}
                >
                  ✕ Remove
                </button>
              )}
            </div>
            {promoError && <p className="promo-error">{promoError}</p>}
            {promoSuccess && <p className="promo-success">{promoSuccess}</p>}
          </div>

          {/* ── Grid of Plan Cards ── */}
          <div className="plans-grid">
            {PLAN_CARDS.map((card) => {
              const periodIdx = selectedPeriods[card.id] || 0;
              const activePeriod = card.periods[periodIdx] || null;
              const isCurrentPlanKey =
                activePeriod && currentSubscription?.isActive && currentSubscription?.planType === activePeriod.key;
              const isProcessing = activePeriod && processingPaymentPlan === activePeriod.key;

              const promoApplies =
                !!promoDiscount &&
                (!Array.isArray(promoDiscount.applicablePlanTypes) ||
                  promoDiscount.applicablePlanTypes.length === 0 ||
                  (activePeriod && promoDiscount.applicablePlanTypes.includes(activePeriod.key)));

              const discountPercent = promoApplies ? Number(promoDiscount.discountPercent || 0) : 0;
              const discountedAmount =
                promoApplies && activePeriod
                  ? Math.max(0, Math.round(activePeriod.amount * (1 - discountPercent / 100)))
                  : null;

              return (
                <div
                  key={card.id}
                  className={[
                    "plan-card",
                    card.isEnterprise ? "enterprise" : "",
                    isCurrentPlanKey ? "current-plan" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isCurrentPlanKey && <div className="current-plan-badge">✓ Current Plan</div>}

                  {/* Header */}
                  <div className="plan-header">
                    <h3 className="plan-name">{card.label}</h3>
                    <p className="plan-tagline">{card.tagline}</p>
                  </div>

                  {/* Period dropdown – only for non‑enterprise cards */}
                  {!card.isEnterprise && card.periods.length > 0 && (
                    <>
                      <div className="sb-period-label">Period</div>
                      <div
                        className="sb-dropdown-wrapper"
                        ref={(el) => {
                          dropdownRefs.current[card.id] = el;
                        }}
                      >
                        <button
                          className="sb-dropdown-trigger"
                          onClick={() =>
                            setOpenDropdown(openDropdown === card.id ? null : card.id)
                          }
                          type="button"
                        >
                          <span>{activePeriod?.label}</span>
                          <span className={`sb-chevron ${openDropdown === card.id ? "open" : ""}`}>▾</span>
                        </button>

                        {openDropdown === card.id && (
                          <div className="sb-dropdown-menu">
                            {card.periods.map((p, idx) => (
                              <button
                                key={p.key}
                                className={`sb-dropdown-item ${idx === periodIdx ? "active" : ""}`}
                                onClick={() => {
                                  setSelectedPeriods((prev) => ({
                                    ...prev,
                                    [card.id]: idx,
                                  }));
                                  setOpenDropdown(null);
                                }}
                                type="button"
                              >
                                <span>{p.label}</span>
                                <span className="sb-dropdown-item-right">
                                  <span className="sb-dropdown-price">
                                    ₹{p.amount.toLocaleString("en-IN")}
                                  </span>
                                  {p.savings && <span className="sb-save-badge">{p.savings}</span>}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Price display */}
                  {!card.isEnterprise && activePeriod ? (
                    <>
                      <div className="sb-price-row">
                        <div className="sb-price-main">
                          {activePeriod.savings && (
                            <span className="sb-save-badge sb-save-badge--inline">
                              {activePeriod.savings}
                            </span>
                          )}
                          {promoApplies && discountedAmount !== null ? (
                            <>
                              <div className="plan-price plan-price--promo">
                                <span className="currency">₹</span>
                                <span className="original-amount">
                                  {activePeriod.amount.toLocaleString("en-IN")}
                                </span>
                                <span className="discount-arrow">→</span>
                                <span className="currency">₹</span>
                                <span className="discounted-amount">
                                  {discountedAmount.toLocaleString("en-IN")}
                                </span>
                                <span className="period">/{activePeriod.duration}</span>
                              </div>
                              <div className="promo-chip-inline">
                                {discountPercent}% discount applied
                              </div>
                            </>
                          ) : (
                            <div className="plan-price">
                              <span className="currency">₹</span>
                              <span className="amount">
                                {activePeriod.amount.toLocaleString("en-IN")}
                              </span>
                              <span className="period">/{activePeriod.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="plan-price-contact">
                      <span>Contact Sales</span>
                    </div>
                  )}

                  {/* Onboarding fee */}
                  {(() => {
                    const promoAppliesToOnboarding =
                      !!promoDiscount &&
                      (!Array.isArray(promoDiscount.applicablePlanTypes) ||
                        promoDiscount.applicablePlanTypes.length === 0 ||
                        promoDiscount.applicablePlanTypes.includes("onboarding"));
                    const onboardingAmount = card.onboardingAmount ?? 0;
                    const discountedOnboarding =
                      promoAppliesToOnboarding && onboardingAmount > 0
                        ? Math.max(
                            0,
                            Math.round(
                              onboardingAmount * (1 - Number(promoDiscount?.discountPercent || 0) / 100),
                            ),
                          )
                        : null;
                    return (
                      <div className="plan-onboarding">
                        <span className="plan-onboarding-label">One‑Time Onboarding</span>
                        {promoAppliesToOnboarding && discountedOnboarding !== null ? (
                          <span className="plan-onboarding-value">
                            <span className="plan-onboarding-original">{card.onboarding}</span>
                            {" → "}
                            <span className="plan-onboarding-discounted">
                              ₹{discountedOnboarding.toLocaleString("en-IN")}
                            </span>
                          </span>
                        ) : (
                          <span className="plan-onboarding-value">{card.onboarding}</span>
                        )}
                      </div>
                    );
                  })()}

                  {/* Feature list */}
                  <ul className="plan-features">
                    <li>
                      <span className="feature-icon check">✓</span>
                      Gift cards
                      <span
                        className={`feature-value ${card.giftCardLimit === "Unlimited" ? "green" : "highlight"}`}
                      >
                        {card.giftCardLimit}
                      </span>
                    </li>
                    {card.features.map((f, i) => (
                      <li key={i}>
                        <span className="feature-icon check">✓</span>
                        {f}
                      </li>
                    ))}
                    <li>
                      <span className="feature-icon check">✓</span>
                      Marketplace Commission
                      <span
                        className={`feature-value ${card.commissionColor === "green" ? "green" : "highlight"}`}
                      >
                        {card.marketplaceCommission}
                      </span>
                    </li>
                    <li>
                      <span className="feature-icon check">✓</span>
                      Own QR Commission
                      <span className="feature-value green">0%</span>
                    </li>
                  </ul>

                  {/* CTA button */}
                  {card.isEnterprise ? (
                    <button onClick={handleContactSales} className="subscribe-btn contact-btn">
                      Contact Sales →
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (activePeriod?.key) {
                          handleSubscribe(activePeriod.key, card.label);
                        }
                      }}
                      disabled={!activePeriod || isCurrentPlanKey || isProcessing}
                      className={[
                        "subscribe-btn",
                        card.isPopular ? "popular-btn" : "",
                        !activePeriod || isCurrentPlanKey || isProcessing ? "disabled" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {isCurrentPlanKey
                        ? "✓ Current Plan"
                        : isProcessing
                          ? "Processing…"
                          : "Subscribe Now"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Payment History ── */}
      {currentSubscription?.paymentHistory?.length > 0 && (
        <div className="payment-history-section">
          <div className="payment-history-header">
            <h2>Payment History</h2>
            <span className="payment-history-count">
              {currentSubscription.paymentHistory.length} record
              {currentSubscription.paymentHistory.length !== 1 ? "s" : ""}
            </span>
          </div>
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
                {currentSubscription.paymentHistory.map((payment, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(payment.date)}</td>
                    <td className="payment-id">{payment.paymentId}</td>
                    <td>₹{payment.amount}</td>
                    <td>
                      <span className={`payment-status ${payment.status}`}>{payment.status}</span>
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
