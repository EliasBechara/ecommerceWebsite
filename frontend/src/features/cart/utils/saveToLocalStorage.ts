import type { CartItemType } from "../cartSlice";

const CART_KEY = "guest_cart";

export const saveCartToStorage = (cart: CartItemType[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const loadCartFromStorage = (): CartItemType[] => {
    try {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const clearCartStorage = () => {
    localStorage.removeItem(CART_KEY);
};