import reducer, {
    addToCart,
    removeFromCart,
    updateItemQuantity,
    setCart,
    clearCart,
    type CartItemType,
} from "./cartSlice";

import type { Product } from "../products/productTypes";

const product: Product = {
    id: "p1",
    name: "Keyboard",
    slug: "keyboard",
    description: "mechanical keyboard",
    price: 100,
    category: "RAM",
    image: "img.jpg",
    stock: 10,
};

const item: CartItemType = {
    product,
    quantity: 2,
};

describe("cartSlice", () => {
    it("should return initial state", () => {
        expect(reducer(undefined, { type: "unknown" })).toEqual({
            list: [],
        });
    });

    it("adds item to cart", () => {
        const state = reducer(undefined, addToCart(item));

        expect(state.list).toHaveLength(1);
        expect(state.list[0]).toEqual(item);
    });

    it("does not add duplicate product", () => {
        const state1 = reducer(undefined, addToCart(item));
        const state2 = reducer(state1, addToCart(item));

        expect(state2.list).toHaveLength(1);
    });

    it("removes item from cart", () => {
        const state1 = reducer(undefined, addToCart(item));
        const state2 = reducer(state1, removeFromCart(product.id));

        expect(state2.list).toHaveLength(0);
    });

    it("updates item quantity", () => {
        const state1 = reducer(undefined, addToCart(item));
        const state2 = reducer(
            state1,
            updateItemQuantity({ id: product.id, quantity: 5 })
        );

        expect(state2.list[0].quantity).toBe(5);
    });

    it("does nothing if item not found on update", () => {
        const state = reducer(
            undefined,
            updateItemQuantity({ id: "unknown", quantity: 5 })
        );

        expect(state.list).toEqual([]);
    });

    it("sets cart", () => {
        const state = reducer(undefined, setCart([item]));

        expect(state.list).toEqual([item]);
    });

    it("clears cart", () => {
        const state1 = reducer(undefined, addToCart(item));
        const state2 = reducer(state1, clearCart());

        expect(state2.list).toEqual([]);
    });

    it("handles multiple items correctly", () => {
        const item2: CartItemType = {
            product: {
                ...product,
                id: "p2",
            },
            quantity: 1,
        };

        const state1 = reducer(undefined, addToCart(item));
        const state2 = reducer(state1, addToCart(item2));

        expect(state2.list).toHaveLength(2);
    });

    it("does not crash on empty update", () => {
        const state = reducer(undefined, updateItemQuantity({ id: "", quantity: 0 }));

        expect(state.list).toEqual([]);
    });
});