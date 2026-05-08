import { useEffect } from "react";
import { setCart } from "../cartSlice";
import { loadCartFromStorage } from "../utils/saveToLocalStorage";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { setHydrated } from "../../auth/authSlice";

export const useHydrateCart = () => {
    const dispatch = useDispatch();

    const user = useSelector((state: RootState) => state.auth.user);

    const authHydrated = useSelector(
        (state: RootState) => state.auth.isHydrated
    );

    useEffect(() => {
        if (!authHydrated) return;
        if (user) {
            dispatch(setHydrated());
            return;
        }
        const cart = loadCartFromStorage();
        if (Array.isArray(cart) && cart.length > 0) {
            dispatch(setCart(cart));
        }
        dispatch(setHydrated());
    }, [dispatch, user, authHydrated]);
};