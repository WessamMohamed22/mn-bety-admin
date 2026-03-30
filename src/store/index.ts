import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./slices/categorySlice";

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    // We will add products, users, and orders here later!
  },
});

// These types are strictly for TypeScript so it knows exactly what is in our state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;