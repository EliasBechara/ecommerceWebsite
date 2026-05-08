import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../products/productTypes";

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
        (item) => item.product.id === action.payload.product.id
      );

      if (exists) return;

      state.list.push(action.payload);
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.list = state.list.filter(
        (item) => item.product.id !== action.payload
      );
    },

    updateItemQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const item = state.list.find(
        (item) => item.product.id === action.payload.id
      );

      if (item) {
        item.quantity = action.payload.quantity;
      }
    },

    setCart(state, action: PayloadAction<CartItemType[]>) {
      state.list = action.payload;
    },

    clearCart(state) {
      state.list = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateItemQuantity,
  setCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
