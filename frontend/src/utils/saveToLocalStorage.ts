import type { CartItemType } from "../features/cart/cartSlice";

const CART_KEY = "guest_cart";

let hasHydrated = false;

export const markCartHydrated = () => {
    hasHydrated = true;
};

export const canPersistCart = () => hasHydrated;

export const saveCartToStorage = (cart: CartItemType[]) => {
    if (!hasHydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const loadCartFromStorage = (): CartItemType[] => {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
};