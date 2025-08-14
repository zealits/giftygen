import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { CreditCard, GooglePay, CashAppPay, PaymentForm } from "react-square-web-payments-sdk";
import GpayIcon from "../../assets/paymenticons/google-pay.png";
import creditcardIcon from "../../assets/paymenticons/credit-card.png";
import { createPayment } from "../../services/Actions/paymentActions";

const SquarePaymentForm = () => {
  const [error, setError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const ENVIRONMENT = "sandbox";

  const dispatch = useDispatch();
  const { businessSlug } = useParams();

  // Get the payment status from the state
  const { paymentData } = useSelector((state) => state.payment);
  const paymentStatus = paymentData?.payment?.status;

  useEffect(() => {
    return () => {
      // Reset state when component unmounts
      setSelectedMethod(null);
      setError(null);
    };
  }, []);

  // If payment status is COMPLETED, do not show payment methods
  if (paymentStatus === "COMPLETED") {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600">Payment Completed</h2>
        <p className="text-gray-600">Your payment has been successfully completed.</p>
      </div>
    );
  }

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError(null); // Clear any previous error messages
  };

  const handlePaymentComplete = async (token, buyer) => {
    const result = token.token;
    dispatch(createPayment(result, 1, businessSlug || ""));
  };

  // Separate payment requests for different payment methods
  const createCashAppPaymentRequest = () => ({
    countryCode: "US",
    currencyCode: "USD",
    total: {
      amount: "100", // $1.00 USD
      label: "Total",
    },
  });

  const createGooglePaymentRequest = () => {
    return {
      countryCode: "US",
      currencyCode: "USD",
      total: {
        amount: "1.00",
        label: "Total",
      },
    };
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2>Payment Method</h2>
        <p className="text-gray-600">Choose your payment method</p>
        <div className="payment-methods">
          <div
            className={`payment-method ${selectedMethod === "credit-card" ? "active" : ""}`}
            onClick={() => handleMethodSelect("credit-card")}
          >
            <img src={creditcardIcon} alt="Credit Card" />
          </div>
          <div
            className={`payment-method ${selectedMethod === "google-pay" ? "active" : ""}`}
            onClick={() => handleMethodSelect("google-pay")}
          >
            <img src={GpayIcon} alt="Google Pay" />
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}

      {selectedMethod === "cash-app" && (
        <PaymentForm
          key={`cash-app-${selectedMethod}-${Date.now()}`}
          applicationId="sandbox-sq0idb-KKtnWs0ZX9C0vGFpeL6dEQ"
          locationId="L0TCSMSRY7SEA"
          cardTokenizeResponseReceived={handlePaymentComplete}
          createPaymentRequest={createCashAppPaymentRequest}
          createVerificationDetails={() => ({
            amount: "100",
            currencyCode: "USD",
            intent: "CHARGE",
            billingContact: {
              familyName: "Doe",
              givenName: "John",
              addressLines: ["123 Main Street"],
              city: "New York",
              countryCode: "US",
            },
          })}
          callbacks={{
            onCashAppPayError: (error) => {
              console.error("Cash App Pay error:", error);
              setError("Cash App Pay payment failed. Try another method.");
            },
          }}
        >
          <div className="mb-4">
            <CashAppPay
              redirectURL={window.location.origin + "/payment-callback"}
              referenceId={`payment-${Date.now()}`}
            />
          </div>
        </PaymentForm>
      )}

      {selectedMethod === "google-pay" && (
        <PaymentForm
          applicationId="sandbox-sq0idb-KKtnWs0ZX9C0vGFpeL6dEQ"
          locationId="L0TCSMSRY7SEA"
          cardTokenizeResponseReceived={handlePaymentComplete}
          createPaymentRequest={createGooglePaymentRequest}
        >
          <div className="mb-4">
            <GooglePay buttonColor="black" buttonType="long" buttonSizeMode="fill" />
          </div>
        </PaymentForm>
      )}

      {selectedMethod === "credit-card" && (
        <PaymentForm
          applicationId="sandbox-sq0idb-KKtnWs0ZX9C0vGFpeL6dEQ"
          locationId="L0TCSMSRY7SEA"
          cardTokenizeResponseReceived={handlePaymentComplete}
          createVerificationDetails={() => ({
            amount: "100",
            currencyCode: "USD",
            intent: "CHARGE",
            billingContact: {
              familyName: "Doe",
              givenName: "John",
              addressLines: ["123 Main Street"],
              city: "New York",
              countryCode: "US",
            },
          })}
        >
          <div className="border rounded-lg p-4">
            <CreditCard
              buttonProps={{
                isLoading: false,
                css: {
                  backgroundColor: "#4F46E5",
                  fontSize: "16px",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#4338CA",
                  },
                },
              }}
            />
          </div>
        </PaymentForm>
      )}
    </div>
  );
};

export default SquarePaymentForm;

{
  /* Apple Pay Form (USD) */
}
//  <PaymentForm
//  applicationId="sandbox-sq0idb-KKtnWs0ZX9C0vGFpeL6dEQ"
//  locationId="L0TCSMSRY7SEA"
//  cardTokenizeResponseReceived={handlePaymentComplete}
//  createPaymentRequest={createApplePaymentRequest}
//  createVerificationDetails={() => ({
//    amount: "100",
//    currencyCode: "USD",
//    intent: "CHARGE",
//    billingContact: {
//      familyName: "Doe",
//      givenName: "John",
//      addressLines: ["123 Main Street"],
//      city: "New York",
//      countryCode: "US",
//    },
//  })}
// >
//  <div className="mb-4">
//    <ApplePay />
//  </div>
// </PaymentForm>

// const createApplePaymentRequest = () => ({
//     countryCode: "US",
//     currencyCode: "USD",
//     total: {
//       amount: "100", // $1.00 USD
//       label: "Total",
//     },
//     lineItems: [
//       {
//         label: "Subtotal",
//         amount: "100",
//       },
//     ],
//   });
