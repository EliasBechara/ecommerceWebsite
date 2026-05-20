import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import { authApi } from "../features/auth/api/authApi";
import cartReducer from "../features/cart/cartSlice";
import { productsApi } from "../features/products/api/productsApi";
import { saveCartToStorage } from "../features/cart/utils/saveToLocalStorage";
import { cartApi } from "../features/cart/api/cartApi";
import { checkoutApi } from "../features/checkout/api/checkoutApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,

    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [checkoutApi.reducerPath]: checkoutApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      productsApi.middleware,
      cartApi.middleware,
      checkoutApi.middleware
    ),
});

store.subscribe(() => {
  const state = store.getState();

  if (!state.auth.isHydrated) return;

  if (state.auth.user) return;

  saveCartToStorage(state.cart.list);
});



setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
