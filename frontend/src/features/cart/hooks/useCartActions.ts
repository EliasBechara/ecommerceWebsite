import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { cartApi } from "../api/cartApi";
import {
    addToCart,
    removeFromCart,
    updateItemQuantity,
} from "../cartSlice";
import type { Product } from "../../products/productTypes";
import { useAppDispatch } from "../../../hooks/useAppDispatch";

export const useCartActions = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useAppDispatch();

    const add = async (
        product: Product,
        quantity: number,
    ) => {
        dispatch(addToCart({ product, quantity }));

        if (!user) return;

        try {
            await dispatch(
                cartApi.endpoints.addItem.initiate({
                    productId: product.id,
                    quantity,
                }),
            ).unwrap();
        } catch {
            dispatch(removeFromCart(product.id));
        }
    };

    const remove = async (productId: string) => {
        dispatch(removeFromCart(productId));

        if (!user) return;

        try {
            await dispatch(
                cartApi.endpoints.removeItem.initiate(productId),
            ).unwrap();
        } catch {
            // optionally refetch cart
        }
    };

    const update = async (
        productId: string,
        quantity: number,
    ) => {
        dispatch(
            updateItemQuantity({
                id: productId,
                quantity,
            }),
        );

        if (!user) return;

        try {
            await dispatch(
                cartApi.endpoints.updateItem.initiate({
                    productId,
                    quantity,
                }),
            ).unwrap();
        } catch {
        }
    };

    return { add, remove, update };
};