import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./slices/adminSlice";
import authReducer from "./slices/authSlice";
import cleanerReducer from "./slices/cleanerSlice";
import customerReducer from "./slices/customerSlice";
import paymentReducer from "./slices/paymentSlice";
import ratingReducer from "./slices/ratingSlice";
import servicesReducer from "./slices/servicesSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    cleaner: cleanerReducer,
    customer: customerReducer,
    payments: paymentReducer,
    rating: ratingReducer,
    services: servicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
