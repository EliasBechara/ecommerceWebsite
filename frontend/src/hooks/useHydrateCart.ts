import { useEffect } from "react";
import { setCart } from "../features/cart/cartSlice";
import { loadCartFromStorage, markCartHydrated } from "../utils/saveToLocalStorage";
import { useDispatch } from "react-redux";



export const useHydrateCart = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const cart = loadCartFromStorage();

        if (Array.isArray(cart) && cart.length > 0) {
            dispatch(setCart(cart));
        }

        markCartHydrated();
    }, [dispatch]);
}