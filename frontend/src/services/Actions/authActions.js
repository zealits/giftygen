import axios from "../../utils/axiosConfig";
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL,
  CLEAR_ERRORS,
} from "../Constants/authConstants.js";
import { FETCH_BUSINESS_REQUEST, FETCH_BUSINESS_SUCCESS, FETCH_BUSINESS_FAIL } from "../Constants/businessConstants.js";

export const loginUser = (email, password, navigate) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const res = await axios.post("/api/v1/admin/login", { email, password });

    const { token, user } = res.data;

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data, // Assuming the response data contains user info or a token
    });

    // Store token in localStorage as backup (cookie is httpOnly and handled automatically)
    if (token) {
      localStorage.setItem("token", token);
    }

    console.log("Login Successful:", res.data);
    navigate("/dashboard");
    // Handle success logic (e.g., redirect or save user data)
  } catch (err) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: err.response ? err.response.data.message : "Failed to login",
    });

    console.error("Login Failed:", err.response?.data || err.message);
  }
};

// Load User
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({ type: LOAD_USER_REQUEST });

    // Make API call - cookie will be sent automatically if axios is configured with withCredentials
    // The httpOnly cookie cannot be read by JavaScript, but axios will send it automatically
    const { data } = await axios.get(`/api/v1/admin/me`);

    dispatch({ type: LOAD_USER_SUCCESS, payload: data });
  } catch (error) {
    // For loadUser failures, don't set error messages that would show modals
    // This prevents showing "Please Login to access this resource" on the login page
    if (error.response?.status === 401) {
      // Token expired or invalid, clear localStorage backup token and user state
      localStorage.removeItem("token");
      dispatch({ type: LOAD_USER_FAIL, payload: null });
    } else {
      // Other errors (network, server errors) - set error but don't show modal
      dispatch({ type: LOAD_USER_FAIL, payload: null });
    }
  }
};

export const logout = () => async (dispatch) => {
  try {
    await axios.get(`/api/v1/admin/logout`);

    // Clear localStorage token on logout
    localStorage.removeItem("token");
    localStorage.removeItem("superAdminToken");

    dispatch({ type: LOGOUT_SUCCESS });
  } catch (error) {
    // Even if logout fails on the backend, clear the local state
    localStorage.removeItem("token");
    localStorage.removeItem("superAdminToken");
    dispatch({ type: LOGOUT_SUCCESS });
  }
};

// Clear Errors
export const clearErrors = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};

// Fetch business information by slug
export const fetchBusinessBySlug = (businessSlug) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_BUSINESS_REQUEST });

    const { data } = await axios.get(`/api/v1/admin/business/${businessSlug}`);

    dispatch({
      type: FETCH_BUSINESS_SUCCESS,
      payload: data.business,
    });

    return data.business;
  } catch (error) {
    dispatch({
      type: FETCH_BUSINESS_FAIL,
      payload: error.response?.data?.message || "Failed to fetch business information",
    });
    throw error;
  }
};
