import React, { useState, useEffect } from "react";
import "./GiftCardForm.css";
import { purchaseGiftCard } from "../../services/Actions/giftCardActions";
import { useDispatch, useSelector } from "react-redux";
import SquarePaymentForm from "./SquarePaymentForm.js";
import GoogleWalletIcon from "../../assets/paymenticons/google-wallet.png";
import AppleWalletIcon from "../../assets/paymenticons/64px-Apple_Wallet_Icon.svg.png";

const GiftCardForm = ({ giftCardName, amount, discount, id, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [purchaseType, setPurchaseType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [walletUrl, setWalletUrl] = useState("");
  const [appleWalletUrl, setAppleWalletUrl] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [isDownloadingApplePass, setIsDownloadingApplePass] = useState(false);

  const [errors, setErrors] = useState({
    selfInfo: {
      name: "",
      email: "",
      phone: "",
    },
    giftInfo: {
      recipientName: "",
      recipientEmail: "",
      message: "",
      senderName: "",
      senderEmail: "",
      senderPhone: "",
    },
  });

  const dispatch = useDispatch();
  const { paymentData } = useSelector((state) => state.payment);

  useEffect(() => {
    if (paymentData?.payment) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        paymentDetails: {
          transactionId: paymentData.payment.id || "",
          paymentMethod: paymentData.payment.sourceType || "",
          paymentamount: paymentData.payment.amountMoney?.amount || "",
          currency: paymentData.payment.amountMoney?.currency || "",
          status: paymentData.payment.status || "",
          receiptNumber: paymentData.payment.receiptNumber || "",
          receiptUrl: paymentData.payment.receiptUrl || "",
          paymentdAt: paymentData.payment.updatedAt || "",
        },
      }));
    }
  }, [paymentData]);

  const [formData, setFormData] = useState({
    id: id,
    purchaseType: "",
    selfInfo: {
      name: "",
      email: "",
      phone: "",
    },
    giftInfo: {
      recipientName: "",
      recipientEmail: "",
      message: "",
      senderName: "",
      senderEmail: "",
      senderPhone: "",
    },
    paymentDetails: {
      transactionId: "",
      paymentMethod: "",
      paymentamount: "",
      currency: "",
      status: "",
      receiptNumber: "",
      receiptUrl: "",
      paymentdAt: "",
    },
  });

  const totalSteps = 3;

  const handlePurchaseTypeSelect = (type) => {
    setPurchaseType(type);

    // Reset form data based on selected type
    setFormData((prev) => ({
      ...prev,
      purchaseType: type,
      // Reset both selfInfo and giftInfo when switching types
      selfInfo: {
        name: "",
        email: "",
        phone: "",
      },
      giftInfo: {
        recipientName: "",
        recipientEmail: "",
        message: "",
        senderName: "",
        senderEmail: "",
        senderPhone: "",
      },
    }));

    // Reset errors completely for both sections
    setErrors({
      selfInfo: {
        name: "",
        email: "",
        phone: "",
      },
      giftInfo: {
        recipientName: "",
        recipientEmail: "",
        message: "",
        senderName: "",
        senderEmail: "",
        senderPhone: "",
      },
    });

    // Reset error display
    setShowErrors(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return false;

    // Check if the phone number matches the expected format: (XXX) XXX-XXXX
    const phonePattern = /^\(\d{3}\)\s\d{3}-\d{4}$/;

    if (phonePattern.test(phone)) {
      return true;
    }

    // Fallback: check if it has at least 10 digits
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;

    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limitedDigits = phoneNumber.slice(0, 10);

    // Format the phone number consistently
    if (limitedDigits.length === 0) {
      return "";
    } else if (limitedDigits.length < 4) {
      return `(${limitedDigits}`;
    } else if (limitedDigits.length < 7) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6, 10)}`;
    }
  };
  const handleInputChange = (section, field, value) => {
    if (field === "phone" || field === "senderPhone") {
      // For phone fields, format the input
      const formattedPhone = formatPhoneNumber(value);
      // Store formatted value in state
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: formattedPhone,
        },
      }));
    } else {
      // Handle other fields as before
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }

    // Clear errors when field is not empty or when format becomes valid
    let newErrors = { ...errors };

    if (value) {
      switch (field) {
        case "email":
        case "recipientEmail":
        case "senderEmail":
          if (validateEmail(value)) {
            newErrors[section][field] = "";
          } else {
            newErrors[section][field] = "Please enter a valid email address";
          }
          break;

        case "phone":
        case "senderPhone":
          const digitsOnly = value.replace(/\D/g, "");
          if (validatePhone(value)) {
            newErrors[section][field] = "";
          } else {
            newErrors[section][field] = "Please enter a valid phone number";
          }
          break;

        default:
          newErrors[section][field] = "";
          break;
      }
    } else {
      if (showErrors) {
        newErrors[section][field] = "This field is mandatory";
      }
    }

    setErrors(newErrors);
  };

  const validateStep = (step) => {
    let isValid = true;
    let newErrors = { ...errors };

    switch (step) {
      case 1:
        if (!purchaseType) {
          isValid = false;
          alert("Please select a purchase type");
        }
        break;

      case 2:
        if (purchaseType === "self") {
          // Validate self purchase fields
          const selfFields = {
            name: formData.selfInfo.name,
            email: formData.selfInfo.email,
            phone: formData.selfInfo.phone,
          };

          Object.entries(selfFields).forEach(([field, value]) => {
            if (!value) {
              newErrors.selfInfo[field] = "This field is mandatory";
              isValid = false;
            } else if (field === "email" && !validateEmail(value)) {
              newErrors.selfInfo[field] = "Please enter a valid email address";
              isValid = false;
            } else if (field === "phone" && !validatePhone(value)) {
              newErrors.selfInfo[field] = "Please enter a valid phone number";
              isValid = false;
            }
          });

          // Clear gift info errors when in self mode
          newErrors.giftInfo = {
            recipientName: "",
            recipientEmail: "",
            message: "",
            senderName: "",
            senderEmail: "",
            senderPhone: "",
          };
        } else if (purchaseType === "gift") {
          // Validate both recipient and sender information for gift purchase
          const giftFields = {
            recipientName: formData.giftInfo.recipientName,
            recipientEmail: formData.giftInfo.recipientEmail,
          };

          const senderFields = {
            name: formData.selfInfo.name,
            email: formData.selfInfo.email,
            phone: formData.selfInfo.phone,
          };

          // Validate recipient fields
          Object.entries(giftFields).forEach(([field, value]) => {
            if (!value) {
              newErrors.giftInfo[field] = "This field is mandatory";
              isValid = false;
            } else if (field.includes("Email") && !validateEmail(value)) {
              newErrors.giftInfo[field] = "Please enter a valid email address";
              isValid = false;
            }
          });

          // Validate sender fields
          Object.entries(senderFields).forEach(([field, value]) => {
            if (!value) {
              newErrors.selfInfo[field] = "This field is mandatory";
              isValid = false;
            } else if (field === "email" && !validateEmail(value)) {
              newErrors.selfInfo[field] = "Please enter a valid email address";
              isValid = false;
            } else if (field === "phone" && !validatePhone(value)) {
              newErrors.selfInfo[field] = "Please enter a valid phone number";
              isValid = false;
            }
          });
        }
        break;

      case 3:
        const cardNumber = document.getElementById("card-number")?.value;
        const expiryDate = document.getElementById("expiry-date")?.value;
        const cvv = document.getElementById("cvv")?.value;
        if (!cardNumber || !expiryDate || !cvv) {
          isValid = false;
          alert("Please fill in all payment details");
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    setShowErrors(true);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      setShowErrors(false);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setShowErrors(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let updatedFormData = { ...formData }; // Start with existing formData

    try {
      console.log("Started wallet pass generation...");

      // Step 1: Try to generate wallet pass
      const response = await fetch("/api/wallet/generate-wallet-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("========== WALLET PASS RESPONSE ==========");
        console.log("Full response:", data);
        console.log("Google Wallet URL:", data.googleWalletUrl);
        console.log("Apple Wallet URL:", data.appleWalletUrl);
        console.log("Unique Code:", data.uniqueCode);
        console.log("===========================================");

        // Update formData with both URLs
        updatedFormData.walletUrl = data.googleWalletUrl;
        updatedFormData.appleWalletUrl = data.appleWalletUrl;
        updatedFormData.barcodeUnicode = data.uniqueCode;
      } else {
        console.error("❌ Wallet pass generation failed, proceeding without it.");
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error generating wallet pass, proceeding anyway:", error);
    }

    console.log(updatedFormData);

    // Step 2: Proceed with gift card purchase, even if wallet API fails
    try {
      console.log("Updated formData: ", updatedFormData);
      dispatch(purchaseGiftCard(updatedFormData));

      // Set both wallet URLs
      if (updatedFormData.walletUrl) {
        console.log("Setting Google Wallet URL:", updatedFormData.walletUrl);
        setWalletUrl(updatedFormData.walletUrl);
      }
      if (updatedFormData.appleWalletUrl) {
        console.log("Setting Apple Wallet URL:", updatedFormData.appleWalletUrl);
        setAppleWalletUrl(updatedFormData.appleWalletUrl);
      }

      setShowModal(true);
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handlePurchaseModal = () => {
    setShowModal(false);
    onClose(false);
  };

  // Detect if user is on iOS Safari
  const isIOSSafari = () => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    return isIOS && isSafari;
  };

  const handleAppleWalletDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("========== APPLE WALLET BUTTON CLICKED ==========");
    console.log("Apple Wallet URL:", appleWalletUrl);
    console.log("Is iOS Safari:", isIOSSafari());

    if (appleWalletUrl) {
      setIsDownloadingApplePass(true);
      console.log("✅ Downloading Apple Wallet pass:", appleWalletUrl);

      try {
        // For iOS Safari, use direct navigation instead of programmatic download
        if (isIOSSafari()) {
          console.log("📱 iOS Safari detected - using direct navigation");

          // Add cache-busting parameters
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const cacheBustedUrl = `${appleWalletUrl}?t=${timestamp}&r=${randomSuffix}`;

          // Open in new tab/window for iOS Safari
          const newWindow = window.open(cacheBustedUrl, "_blank");

          if (!newWindow) {
            // If popup blocked, fall back to direct navigation
            console.log("Popup blocked, using direct navigation");
            window.location.href = cacheBustedUrl;
          }

          console.log("✅ iOS Safari download initiated via direct navigation");

          // Show user-friendly message for iOS
          setTimeout(() => {
            alert(
              "The Apple Wallet pass should open in a new tab. If it doesn't download automatically, tap and hold the link and select 'Download Linked File'."
            );
          }, 500);

          setIsDownloadingApplePass(false);
          return;
        }

        // For other browsers, use the original programmatic download method
        console.log("🖥️ Desktop/Android browser - using programmatic download");
        // Add a small delay to prevent browser blocking rapid downloads
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Use fetch to download the file with cache-busting
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const cacheBustedUrl = `${appleWalletUrl}?t=${timestamp}&r=${randomSuffix}`;

        const response = await fetch(cacheBustedUrl, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
        console.log("Fetch response status:", response.status);
        console.log("Fetch response headers:", response.headers);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Download failed:", errorData);
          alert(`Failed to download: ${errorData.error}`);
          return;
        }

        // Get the blob
        const blob = await response.blob();
        console.log("✅ Blob received, size:", blob.size);

        // Create download link with unique filename
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.style.display = "none";

        // Create more unique filename with timestamp
        try {
          const passIdFromUrl = (appleWalletUrl.split("/").pop() || "").split("?")[0] || "giftcard";
          const uniqueFilename = `giftcard-${passIdFromUrl}-${timestamp}.pkpass`;
          link.download = uniqueFilename;
        } catch (_) {
          link.download = `giftcard-${timestamp}.pkpass`;
        }

        document.body.appendChild(link);
        console.log("Triggering download...");

        // Trigger download
        link.click();

        // Clean up with a delay to ensure download starts
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log("✅ Download completed and cleaned up!");
        }, 1000);

        // Show success message
        console.log("✅ Apple Wallet pass download initiated successfully!");
      } catch (error) {
        console.error("❌ Error downloading file:", error);
        alert("Failed to download Apple Wallet pass. Please try again.");
      } finally {
        setIsDownloadingApplePass(false);
      }
    } else {
      console.error("❌ Apple Wallet URL is missing!");
      alert("Apple Wallet pass is not available. Please contact support.");
    }
    console.log("========================================");
  };

  const ErrorMessage = ({ message }) =>
    showErrors && message ? (
      <div className="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="error-icon">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        {message}
      </div>
    ) : null;

  const RequiredField = () => <span style={{ color: "red", marginLeft: "4px" }}>*</span>;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const overlay = document.querySelector(".purchase-modal-open-overlay");
    const container = document.querySelector(".purchase-modal-container");

    setTimeout(() => {
      overlay?.classList.add("active");
      container?.classList.add("active");
    }, 10);

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="purchase-modal-open-overlay">
      <div className="purchase-modal-container">
        {showForm ? (
          <div className="giftCardContainer">
            <span className="purchase-modal-close" onClick={onClose}>
              &times;
            </span>
            <h1>{giftCardName}</h1>

            <div className="purchase-progress-bar">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={`progress-step ${
                    index + 1 === currentStep ? "active" : index + 1 < currentStep ? "completed" : ""
                  }`}
                  data-step={index + 1}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            <form id="gift-card-form" className={showErrors ? "show-errors" : ""} onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="form-section">
                  <h2>Select Purchase Type</h2>
                  <div className="purchase-type-options">
                    <div
                      className={`purchase-option ${purchaseType === "self" ? "active" : ""}`}
                      onClick={() => handlePurchaseTypeSelect("self")}
                    >
                      <div className="icon">👤</div>
                      <h3>For Myself</h3>
                      <p>I want to purchase a gift card for my own use</p>
                    </div>
                    <div
                      className={`purchase-option ${purchaseType === "gift" ? "active" : ""}`}
                      onClick={() => handlePurchaseTypeSelect("gift")}
                    >
                      <div className="icon">🎁</div>
                      <h3>As a Gift</h3>
                      <p>I want to send this gift card to someone else</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-section">
                  {purchaseType === "self" && (
                    <div id="self-purchase-form">
                      <h2>Enter Your Details</h2>
                      <div className="form-group">
                        <label htmlFor="self-name">
                          Your Name
                          <RequiredField />
                        </label>
                        <input
                          type="text"
                          id="self-name"
                          required
                          className={showErrors && errors.selfInfo.name ? "error" : ""}
                          value={formData.selfInfo.name}
                          onChange={(e) => handleInputChange("selfInfo", "name", e.target.value)}
                        />
                        <ErrorMessage message={errors.selfInfo.name} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="self-email">
                          Your Email
                          <RequiredField />
                        </label>
                        <input
                          type="email"
                          id="self-email"
                          required
                          className={showErrors && errors.selfInfo.email ? "error" : ""}
                          value={formData.selfInfo.email}
                          onChange={(e) => handleInputChange("selfInfo", "email", e.target.value)}
                        />
                        <ErrorMessage message={errors.selfInfo.email} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="self-phone">
                          Your Phone Number
                          <RequiredField />
                        </label>
                        <input
                          type="tel"
                          id="self-phone"
                          required
                          title="Please enter a valid US phone number like (555) 123-4567"
                          className={showErrors && errors.selfInfo.phone ? "error" : ""}
                          value={formData.selfInfo.phone}
                          onChange={(e) => handleInputChange("selfInfo", "phone", e.target.value)}
                          placeholder="(123) 456-7890"
                        />
                        <ErrorMessage message={errors.selfInfo.phone} />
                      </div>
                    </div>
                  )}
                  {purchaseType === "gift" && (
                    <div id="gift-purchase-form">
                      <div>
                        <h2>Recipient Information</h2>
                        <div className="form-group">
                          <label htmlFor="recipient-name">
                            Recipient's Name
                            <RequiredField />
                          </label>
                          <input
                            type="text"
                            id="recipient-name"
                            required
                            className={showErrors && errors.giftInfo.recipientName ? "error" : ""}
                            value={formData.giftInfo.recipientName}
                            onChange={(e) => handleInputChange("giftInfo", "recipientName", e.target.value)}
                          />
                          <ErrorMessage message={errors.giftInfo.recipientName} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="recipient-email">
                            Recipient's Email
                            <RequiredField />
                          </label>
                          <input
                            type="email"
                            id="recipient-email"
                            required
                            className={showErrors && errors.giftInfo.recipientEmail ? "error" : ""}
                            value={formData.giftInfo.recipientEmail}
                            onChange={(e) => handleInputChange("giftInfo", "recipientEmail", e.target.value)}
                          />
                          <ErrorMessage message={errors.giftInfo.recipientEmail} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="message">Personal Message</label>
                          <textarea
                            id="message"
                            rows="4"
                            className={errors.giftInfo.message ? "error" : ""}
                            placeholder="Add a personal message for the recipient"
                            value={formData.giftInfo.message}
                            onChange={(e) => handleInputChange("giftInfo", "message", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <h2>Enter Your Details</h2>
                        <div className="form-group">
                          <label htmlFor="self-name">
                            Your Name
                            <RequiredField />
                          </label>
                          <input
                            type="text"
                            id="self-name"
                            required
                            className={showErrors && errors.selfInfo.name ? "error" : ""}
                            value={formData.selfInfo.name}
                            onChange={(e) => handleInputChange("selfInfo", "name", e.target.value)}
                          />
                          <ErrorMessage message={errors.selfInfo.name} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="self-email">
                            Your Email
                            <RequiredField />
                          </label>
                          <input
                            type="email"
                            id="self-email"
                            required
                            className={showErrors && errors.selfInfo.email ? "error" : ""}
                            value={formData.selfInfo.email}
                            onChange={(e) => handleInputChange("selfInfo", "email", e.target.value)}
                          />
                          <ErrorMessage message={errors.selfInfo.email} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="self-phone">
                            Your Phone Number (10 digits)
                            <RequiredField />
                          </label>
                          <input
                            type="tel"
                            id="self-phone"
                            required
                            title="Please enter a valid US phone number like (555) 123-4567"
                            className={showErrors && errors.selfInfo.phone ? "error" : ""}
                            value={formData.selfInfo.phone}
                            onChange={(e) => handleInputChange("selfInfo", "phone", e.target.value)}
                            placeholder="(123) 123-4567"
                          />
                          <ErrorMessage message={errors.selfInfo.phone} />
                          <small className="form-hint">Format: (XXX) XXX-XXXX</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="form-section">
                  <SquarePaymentForm />
                </div>
              )}

              <div className="navigation-buttons">
                {currentStep > 1 && (
                  <button type="button" className="giftFormBtn btn-secondary" onClick={handlePrev}>
                    Previous
                  </button>
                )}
                {currentStep < totalSteps && (
                  <button type="button" className="giftFormBtn" onClick={handleNext}>
                    Next
                  </button>
                )}
                {currentStep === totalSteps && (
                  <button type="submit" className="giftFormBtn">
                    Complete Purchase
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          showModal && (
            <div className="purchase-modal-overlay" onClick={handlePurchaseModal}>
              <div className="purchase-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Purchase Completed Successfully!</h2>
                <p>Thank you for your purchase. A confirmation email has been sent to your inbox.</p>
                <div className="wallet-buttons-container">
                  <a
                    href={walletUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wallet-button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={GoogleWalletIcon} alt="Google Wallet" className="wallet-icon" />
                    <span>Add to Google Wallet</span>
                  </a>
                  <button
                    className="wallet-button"
                    onClick={handleAppleWalletDownload}
                    disabled={isDownloadingApplePass}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: isDownloadingApplePass ? "not-allowed" : "pointer",
                      opacity: isDownloadingApplePass ? 0.7 : 1,
                    }}
                  >
                    <img src={AppleWalletIcon} alt="Apple Wallet" className="wallet-icon" />
                    <span>{isDownloadingApplePass ? "Downloading..." : "Add to Apple Wallet"}</span>
                  </button>
                </div>
                <button className="purchase-modal-close-btn" onClick={handlePurchaseModal}>
                  Close
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GiftCardForm;
