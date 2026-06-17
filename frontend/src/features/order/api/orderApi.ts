import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../../api/baseQuery";
import type { Order, CreateOrderBody, UpdateOrderStatusBody } from "../types";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery,
    tagTypes: ["Order"],

    endpoints: (builder) => ({
        createOrder: builder.mutation<
            Order,
            CreateOrderBody
        >({
            query: (body) => ({
                url: "/orders",
                method: "POST",
                body,
            }),

            invalidatesTags: ["Order"],
        }),

        getOrderById: builder.query<
            Order,
            string
        >({
            query: (orderId) =>
                `/orders/${orderId}`,

            providesTags: (_r, _e, orderId) => [
                { type: "Order", id: orderId },
            ],
        }),

        getUserOrders: builder.query<
            Order[],
            void
        >({
            query: () => "/orders/my-orders",

            providesTags: (result) =>
                result
                    ? [
                        ...result.map((order) => ({
                            type: "Order" as const,
                            id: order.id,
                        })),
                        { type: "Order", id: "LIST" },
                    ]
                    : [{ type: "Order", id: "LIST" }],
        }),

        updateOrderStatus: builder.mutation<
            Order,
            {
                orderId: string;
                data: UpdateOrderStatusBody;
            }
        >({
            query: ({ orderId, data }) => ({
                url: `/orders/${orderId}/status`,
                method: "PATCH",
                body: data,
            }),

            invalidatesTags: (_r, _e, { orderId }) => [
                { type: "Order", id: orderId },
                { type: "Order", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetOrderByIdQuery,
    useGetUserOrdersQuery,
    useUpdateOrderStatusMutation,
} = orderApi;