import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../products/productTypes";
import type { RootState } from "../../app/store";

export type CartItemType = {
  product: Product;
  quantity: number;
};

type CartState = {
  list: CartItemType[];
};

const initialState: CartState = {
  list: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItemType>) {
      const exists = state.list.some(
        (item) => item.product.id === action.payload.product.id,
      );

      if (exists) return;

      state.list.push(action.payload);
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.list = state.list.filter(
        (item) => item.product.id !== action.payload,
      );
    },

    updateItemQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) {
      const item = state.list.find(
        (item) => item.product.id === action.payload.id,
      );

      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
  },
});

export const { addToCart, removeFromCart, updateItemQuantity } =
  cartSlice.actions;

export default cartSlice.reducer;

export const selectTotalItems = (state: RootState) =>
  state.cart.list.reduce((total, item) => total + item.quantity, 0);

export const selectTotalPrice = (state: RootState) =>
  state.cart.list.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
