import { useCart } from "./useCart";

export const useCartSummary = () => {
    const { items, isLoading, isGuest } = useCart();

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

    return { items, totalItems, totalPrice, isLoading, isGuest };
};