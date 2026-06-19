import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../../api/baseQuery";
import type { CartItemType } from "../cartSlice";

export const cartApi = createApi({
    reducerPath: "cartApi",
    baseQuery,
    tagTypes: ["Cart"],
    endpoints: (builder) => ({
        getCart: builder.query<{ items: CartItemType[] }, void>({
            query: () => "/cart/me",
            providesTags: ["Cart"],
        }),

        mergeCart: builder.mutation<void, CartItemType[]>({
            query: (cart) => ({
                url: "/cart/merge",
                method: "POST",
                body: {
                    items: cart.map((item) => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                    })),
                },
            }),
            invalidatesTags: ["Cart"],
        }),

        removeItem: builder.mutation<void, string>({
            query: (productId) => ({
                url: `/cart/items/delete/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),

        updateItem: builder.mutation<
            void,
            { productId: string; quantity: number }
        >({
            query: ({ productId, quantity }) => ({
                url: `/cart/items/update/${productId}`,
                method: "PATCH",
                body: { quantity },
            }),
            invalidatesTags: ["Cart"],
        }),

        addItem: builder.mutation<
            void,
            { productId: string; quantity: number }
        >({
            query: ({ productId, quantity }) => ({
                url: `/cart/items/add/`,
                method: "POST",
                body: {
                    productId,
                    quantity,
                },
            }),
            invalidatesTags: ["Cart"],
        }),
    }),
});

export const {
    useMergeCartMutation,
    useGetCartQuery,
    useRemoveItemMutation,
    useUpdateItemMutation,
    useAddItemMutation
} = cartApi;