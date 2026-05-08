import type { RootState } from "../../../app/store";

export const selectCartItems = (state: RootState) => state.cart.list;