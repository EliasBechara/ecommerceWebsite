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

    const add = async (product: Product, quantity: number) => {
        if (!user) {
            dispatch(addToCart({ product, quantity }));
            return;
        }

        await dispatch(
            cartApi.endpoints.addItem.initiate({
                productId: product.id,
                quantity,
            })
        ).unwrap();
    };

    const remove = async (productId: string) => {
        if (!user) {
            dispatch(removeFromCart(productId));
            return;
        }

        await dispatch(
            cartApi.endpoints.removeItem.initiate(productId)
        ).unwrap();
    };

    const update = async (productId: string, quantity: number) => {
        if (!user) {
            dispatch(updateItemQuantity({ id: productId, quantity }));
            return;
        }

        await dispatch(
            cartApi.endpoints.updateItem.initiate({
                productId,
                quantity,
            })
        ).unwrap();
    };

    return { add, remove, update };
};