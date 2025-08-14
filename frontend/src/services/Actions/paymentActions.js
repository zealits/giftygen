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
