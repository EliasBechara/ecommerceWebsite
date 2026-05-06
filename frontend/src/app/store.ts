import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import authReducer from "../features/auth/authSlice";
import { authApi } from "../features/auth/api/authApi";
import cartReducer from "../features/cart/cartSlice";
import { productsApi } from "../features/products/api/productsApi";
import { canPersistCart, saveCartToStorage } from "../utils/saveToLocalStorage";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, productsApi.middleware),
});

store.subscribe(() => {
  if (!canPersistCart()) return;

  const state = store.getState();
  saveCartToStorage(state.cart.list);
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
