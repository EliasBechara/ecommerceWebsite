import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { useGetCartQuery } from "../api/cartApi";

export const useCart = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const guestCart = useSelector((state: RootState) => state.cart.list);

    const { data, isLoading } = useGetCartQuery(undefined, {
        skip: !user,
    });

    const items = user ? data?.items ?? [] : guestCart;


    return {
        items,
        isLoading: user ? isLoading : false,
        isGuest: !user,
    };
};