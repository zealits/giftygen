// actions/paymentActions.js
import axios from "axios";
import { CREATE_PAYMENT_REQUEST, CREATE_PAYMENT_SUCCESS, CREATE_PAYMENT_FAILURE } from "../Constants/paymentConstants";

export const createPayment =
  (sourceId, amount, businessSlug = "") =>
  async (dispatch) => {
    try {
      dispatch({ type: CREATE_PAYMENT_REQUEST });

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post("/api/payments/create-payment", { sourceId, amount, businessSlug }, config);

      console.log(data);

      dispatch({
        type: CREATE_PAYMENT_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: CREATE_PAYMENT_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

// Razorpay Payment Actions
export const createRazorpayOrder = (amount, currency = "INR", receipt, notes) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_PAYMENT_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(
      "/api/payments/razorpay/create-order",
      { amount, currency, receipt, notes },
      config
    );

    if (data.success) {
      return data.order;
    } else {
      throw new Error(data.error || "Failed to create order");
    }
  } catch (error) {
    dispatch({
      type: CREATE_PAYMENT_FAILURE,
      payload: error.response?.data?.error || error.message,
    });
    throw error;
  }
};

export const verifyRazorpayPayment =
  (orderId, paymentId, signature, amount, currency = "INR") =>
  async (dispatch) => {
    try {
      dispatch({ type: CREATE_PAYMENT_REQUEST });

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/payments/razorpay/verify-payment",
        { orderId, paymentId, signature, amount, currency },
        config
      );

      if (data.success) {
        dispatch({
          type: CREATE_PAYMENT_SUCCESS,
          payload: {
            payment: {
              ...data.payment,
              sourceType: "razorpay",
            },
          },
        });
        return data.payment;
      } else {
        throw new Error(data.error || "Payment verification failed");
      }
    } catch (error) {
      dispatch({
        type: CREATE_PAYMENT_FAILURE,
        payload: error.response?.data?.error || error.message,
      });
      throw error;
    }
  };