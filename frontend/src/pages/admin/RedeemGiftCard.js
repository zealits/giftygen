import React, { useState } from "react";
import axios from "axios";
import QRScanner from "./QRScanner.js";
import "./RedeemGiftCard.css";

const RedeemGiftCard = () => {
  // Define state for originalAmount and updatedBalance
  const [giftCard, setGiftCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [updatedBalance, setUpdatedBalance] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [qrUniqueCode, setqrUniqueCode] = useState(null);
  const [isOtpSuccessModalOpen, setOtpSuccessModalOpen] = useState(false);
  const [isRedeemSuccessModalOpen, setRedeemSuccessModalOpen] = useState(false);

  // New state for alert modals
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "error" or "warning"

  // Function to show alert modal instead of using alert()
  const showAlert = (message, type = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setIsAlertModalOpen(true);
    // Auto close after 3 seconds
    setTimeout(() => {
      setIsAlertModalOpen(false);
    }, 3000);
  };

  // Handle QR scan
  const handleQRScan = (code) => {
    if (!code || code.trim() === "") {
      console.error("Invalid QR Code detected");
      showAlert("Invalid QR Code. Please scan again.");
      return;
    }
    console.log("QR Code Scanned:", code);
    fetchGiftCard(code);
  };

  const fetchGiftCard = async (data) => {
    try {
      let cardId;
      console.log("data :", data);
      setqrUniqueCode(data);

      // Check if data is a URL or plain text
      if (data.startsWith("http")) {
        const url = new URL(data);
        cardId = url.pathname.split("/").pop();
      } else {
        cardId = data.trim();
      }

      if (!cardId) {
        showAlert("Invalid QR code data.");
        return;
      }

      console.log("Fetching Gift Card for ID:", cardId);

      const { data: giftCard } = await axios.get(`/api/v1/admin/scan-giftcard/${cardId}`);

      setGiftCard(giftCard);

      // Open modal to display card details
      setIsModalOpen(true);

      // Search for the buyer matching the scanned QR code
      const scannedBuyer = giftCard.buyers.find((buyer) => buyer.qrCode.uniqueCode === data);

      if (scannedBuyer) {
        setSelectedBuyer(scannedBuyer);
        setUpdatedBalance(scannedBuyer.remainingBalance || giftCard.amount); // Set balance to remaining balance
      } else {
        showAlert("No buyer found for the scanned QR code.");
      }

      console.log("Gift Card Details:", giftCard);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Gift card not found.";
      showAlert(`Error: ${errorMessage}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGiftCard(null);
    setRedeemAmount("");
    setIsOtpSent(false);
    setOtp("");
    setIsOtpVerified(false);
    setSelectedBuyer(null);
  };

  const handleSendOTP = async () => {
    try {
      console.log(qrUniqueCode);
      const buyerEmail = selectedBuyer?.selfInfo?.email;
      const recipientEmail = selectedBuyer?.giftInfo?.recipientEmail;

      if (!buyerEmail && !recipientEmail) {
        showAlert("Buyer or recipient email is missing. Cannot send OTP.");
        return;
      }

      const emailToSendOtp = recipientEmail || buyerEmail;

      if (!redeemAmount || redeemAmount <= 0) {
        showAlert("Enter a valid redeem amount before sending OTP.", "warning");
        return;
      }

      console.log("Sending OTP to:", emailToSendOtp, "with redeem amount:", redeemAmount);

      // Make API call to the backend to send OTP
      const response = await axios.post("/api/v1/admin/send-otp-redeem", {
        email: emailToSendOtp,
        redeemAmount,
        qrUniqueCode,
        // Assuming selectedBuyer has the giftCardId
      });

      console.log("Server response:", response.data);

      if (response.data.success) {
        setIsOtpSent(true);
        setOtpSuccessModalOpen(true);
        setTimeout(() => {
          setOtpSuccessModalOpen(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMessage = error.response?.data?.message || "Failed to send OTP.";
      showAlert(errorMessage);
    }
  };

  const handleRedeemGiftCard = async (qrCode, amount) => {
    try {
      console.log("Initiating redeem process...");

      // Debug 1: Check if OTP is provided
      if (!otp) {
        showAlert("OTP is missing.");
        console.error("Error: OTP is missing.");
        return;
      }

      // Debug 2: Verify buyer's email
      const buyerEmail = selectedBuyer?.selfInfo?.email;
      const recipientEmail = selectedBuyer?.giftInfo?.recipientEmail;
      const emailToVerifyOtp = recipientEmail || buyerEmail;
      console.log("Buyer email:", buyerEmail);
      console.log("Recipient email:", recipientEmail);
      console.log("Email used for OTP verification:", emailToVerifyOtp);

      if (!emailToVerifyOtp) {
        showAlert("Email is missing. Cannot verify OTP.");
        console.error("Error: Email is missing.");
        return;
      }

      // Debug 3: Log OTP verification payload
      console.log("OTP verification payload:", {
        email: emailToVerifyOtp,
        qrUniqueCode,
        otp,
      });

      // Call the backend to verify OTP
      const otpResponse = await axios.post("/api/v1/admin/verify-otp-redeem", {
        email: emailToVerifyOtp,
        qrUniqueCode,
        otp,
      });

      // Debug 4: Log OTP verification response
      console.log("OTP verification response:", otpResponse.data);

      if (otpResponse.data.success) {
        console.log("OTP verified successfully.");

        // OTP verification successful, now redeem the gift card
        console.log("Redeeming gift card...");
        console.log("Redeem payload:", { qrCode, amount });

        if (!qrCode || !amount || amount <= 0) {
          showAlert("Invalid QR code or redeem amount.", "warning");
          console.error("Error: Invalid QR code or redeem amount.");
          return;
        }

        // Debug 5: Log redeem request payload
        console.log("Redeem request payload:", { qrCode, amount });

        // Call the backend to redeem the gift card
        const response = await axios.post("/api/v1/admin/redeem", {
          qrCode,
          amount,
        });

        // Debug 6: Log redemption response
        console.log("Redemption response:", response.data);

        const { buyer } = response.data;

        // Update the selected buyer's state
        console.log("Updating selected buyer...");
        setSelectedBuyer((prevBuyer) => ({
          ...prevBuyer,
          ...buyer,
          remainingBalance: buyer.remainingBalance,
          redemptionHistory: buyer.redemptionHistory,
        }));

        // Update the gift card state with the updated buyer data
        console.log("Updating gift card state...");
        setGiftCard((prevCard) => {
          const updatedBuyers = prevCard.buyers.map((b) =>
            b.qrCode.uniqueCode === qrCode ? { ...b, ...buyer, redemptionHistory: buyer.redemptionHistory } : b
          );

          return {
            ...prevCard,
            buyers: updatedBuyers,
          };
        });

        setRedeemAmount(""); // Clear redeem amount field
        console.log("Redeem process completed successfully.");

        // Show success modal and auto-close after 3 seconds
        setRedeemSuccessModalOpen(true);
        setTimeout(() => {
          setRedeemSuccessModalOpen(false);
          handleCloseModal(); // Close the main modal after success modal
        }, 3000);
      } else {
        showAlert(otpResponse.data.message);
        console.error("OTP verification failed:", otpResponse.data.message);
      }
    } catch (error) {
      // Debug 7: Log errors during the process
      console.error("Error during OTP verification or redemption:", error);
      console.error("Error response from server:", error.response?.data);

      const errorMessage = error.response?.data?.message || "Failed to process redemption.";
      showAlert(errorMessage);
    }
  };

  return (
    <div>
      <h1 className="heading">Redeem GiftCard</h1>
      <QRScanner onScan={handleQRScan} />
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="redeem-form-close-btn" onClick={handleCloseModal}>
              &times;
            </button>
            <h3 className="redeem-form-heading">Gift Card Details</h3>
            <div className="form-container">
              <form className="redeem-form">
                <div className="form-group">
                  <div className="form-group-title">Card Information</div>
                  <label>
                    Gift Card Name:
                    <input type="text" value={giftCard.giftCardName} readOnly />
                  </label>
                  <label>
                    Tag:
                    <input type="text" value={giftCard.giftCardTag} readOnly />
                  </label>
                  <label>
                    Description:
                    <textarea value={giftCard.description} readOnly />
                  </label>
                </div>

                <div className="form-group">
                  <div className="form-group-title">Card Status</div>
                  <label>
                    Amount:
                    <input type="number" value={giftCard.amount} readOnly />
                  </label>
                  <label>
                    Remaining Balance:
                    <input type="number" value={selectedBuyer.remainingBalance || giftCard.amount} readOnly />
                  </label>
                  <label>
                    Status:
                    <input type="text" value={giftCard.status} readOnly />
                  </label>
                  <label>
                    Expiration Date:
                    <input type="text" value={new Date(giftCard.expirationDate).toLocaleDateString()} readOnly />
                  </label>
                </div>
                <div className="form-group">
                  <div className="form-group-title">
                    {selectedBuyer?.giftInfo?.recipientEmail ? "Recipient Details" : "Buyer Details"}
                  </div>
                  <label>
                    {selectedBuyer?.giftInfo?.recipientEmail ? "Recipient Name" : "Buyer Name"}:
                    <input
                      type="text"
                      value={selectedBuyer?.giftInfo?.recipientName || selectedBuyer?.selfInfo?.name || ""}
                      readOnly
                    />
                  </label>

                  <label>
                    {selectedBuyer?.giftInfo?.recipientEmail ? "Recipient Email" : "Buyer Email"}:
                    <input
                      type="text"
                      value={selectedBuyer?.giftInfo?.recipientEmail || selectedBuyer?.selfInfo?.email || ""}
                      readOnly
                    />
                  </label>
                </div>

                <div className="redeem-amount-group">
                  <label>
                    Enter Amount to Redeem:
                    <input
                      type="number"
                      placeholder="Enter amount to redeem"
                      value={redeemAmount}
                      onChange={(e) => {
                        const enteredAmount = Number(e.target.value);
                        const availableBalance = selectedBuyer?.remainingBalance ?? giftCard.amount;

                        if (enteredAmount > 0 && enteredAmount <= availableBalance) {
                          setRedeemAmount(enteredAmount);
                        } else if (enteredAmount > availableBalance) {
                          showAlert("Redeem amount exceeds the available balance.", "error");
                        } else {
                          setRedeemAmount("");
                        }
                      }}
                    />
                  </label>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#856404",
                      marginTop: "8px",
                      textAlign: "center",
                    }}
                  >
                    Available Balance: ${selectedBuyer?.remainingBalance ?? giftCard.amount}
                  </div>
                </div>

                <button type="button" className="send-otp-btn" onClick={handleSendOTP}>
                  Send OTP
                </button>

                {isOtpSent && (
                  <div className="form-group">
                    <div className="form-group-title">OTP Verification</div>
                    <label>
                      Enter OTP:
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                      />
                    </label>
                  </div>
                )}

                {isOtpVerified && <p>OTP verified successfully!</p>}

                {isOtpSent && !isOtpVerified && otp && (
                  <button
                    type="button"
                    className="redeem-btn"
                    onClick={() => handleRedeemGiftCard(selectedBuyer?.qrCode?.uniqueCode, redeemAmount)}
                  >
                    Redeem Gift Card
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* OTP Success Modal */}
      {isOtpSuccessModalOpen && (
        <div className="otp-success-modal-overlay">
          <div className="otp-success-modal-container">
            <div className="otp-success-modal-content">
              <div className="otp-success-modal-icon">
                <svg viewBox="0 0 24 24" className="otp-checkmark-svg">
                  <path
                    className="otp-checkmark-path"
                    d="M3.7 14.3l5.6 5.6L20.3 4.7"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2 className="otp-success-modal-title">OTP Sent!</h2>
              <p className="otp-success-modal-message">OTP has been sent successfully</p>
              <div className="otp-success-modal-ripple"></div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Success Modal */}
      {isRedeemSuccessModalOpen && (
        <div className="redeem-success-modal-overlay">
          <div className="redeem-success-modal-container">
            <div className="redeem-success-modal-content">
              <div className="redeem-success-modal-icon">
                <svg viewBox="0 0 24 24" className="redeem-checkmark-svg">
                  <path
                    className="redeem-checkmark-path"
                    d="M3.7 14.3l5.6 5.6L20.3 4.7"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2 className="redeem-success-modal-title">Success!</h2>
              <p className="redeem-success-modal-message">Gift Card Redeemed Successfully</p>
              <div className="redeem-success-modal-confetti"></div>
            </div>
          </div>
        </div>
      )}

      {/* New Alert Modal */}
      {isAlertModalOpen && (
        <div className="alert-modal-overlay">
          <div className="alert-modal-container">
            <div className={`alert-modal-content ${alertType}`}>
              <div className="alert-modal-icon">
                {alertType === "error" ? (
                  <svg viewBox="0 0 24 24" className="alert-icon-svg">
                    <path
                      className="alert-icon-path"
                      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.5"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="alert-icon-svg">
                    <path
                      className="alert-icon-path"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </div>
              <h2 className="alert-modal-title">{alertType === "error" ? "Error" : "Warning"}</h2>
              <p className="alert-modal-message">{alertMessage}</p>
              <div className="alert-modal-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedeemGiftCard;
