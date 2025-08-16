import { configureStore } from "@reduxjs/toolkit";
import {
  giftCardCreateReducer,
  giftCardListReducer,
  giftCardUpdateReducer,
  giftCardDeleteReducer,
  giftCardDetailsReducer, // Added giftCardDetailsReducer here
} from "./services/Reducers/giftCardsReducer";
import authReducer from "./services/Reducers/authReducer.js";
import locationReducer from "./services/Reducers/locationSlice";
import { paymentReducer } from "./services/Reducers/paymentReducer.js";
import { businessReducer } from "./services/Reducers/businessReducer.js";

// Configure the store
const store = configureStore({
  reducer: {
    giftCardCreate: giftCardCreateReducer,
    giftCardList: giftCardListReducer,
    giftCardUpdate: giftCardUpdateReducer,
    giftCardDelete: giftCardDeleteReducer,
    giftCardDetails: giftCardDetailsReducer, // Added this line
    auth: authReducer,
    location: locationReducer,
    payment: paymentReducer,
    business: businessReducer,
  },
});

export default store;
