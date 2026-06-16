import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import { authApi } from "../features/auth/api/authApi";
import cartReducer from "../features/cart/cartSlice";
import { productsApi } from "../features/products/api/productsApi";
import { saveCartToStorage } from "../features/cart/utils/saveToLocalStorage";
import { cartApi } from "../features/cart/api/cartApi";
import { checkoutApi } from "../features/checkout/api/checkoutApi";
import { paymentApi } from "../features/payment/api/paymentApi";
import { orderApi } from "../features/order/api/orderApi";
import { accountApi } from "../features/account/api/accountApi";
import { addressesApi } from "../features/addresses/api/addressesApi";
import uiReducer from "../features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,

    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [checkoutApi.reducerPath]: checkoutApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [addressesApi.reducerPath]: addressesApi.reducer,
    ui: uiReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      productsApi.middleware,
      cartApi.middleware,
      checkoutApi.middleware,
      paymentApi.middleware,
      orderApi.middleware,
      accountApi.middleware,
      addressesApi.middleware,
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