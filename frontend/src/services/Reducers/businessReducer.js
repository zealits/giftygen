import {
  FETCH_BUSINESS_REQUEST,
  FETCH_BUSINESS_SUCCESS,
  FETCH_BUSINESS_FAIL,
  CLEAR_BUSINESS_ERRORS,
} from "../Constants/businessConstants";

const initialState = {
  business: null,
  loading: false,
  error: null,
};

export const businessReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BUSINESS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_BUSINESS_SUCCESS:
      return {
        ...state,
        loading: false,
        business: action.payload,
        error: null,
      };
    case FETCH_BUSINESS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case CLEAR_BUSINESS_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};
