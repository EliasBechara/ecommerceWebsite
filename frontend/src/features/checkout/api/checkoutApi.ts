import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../auth/api/baseQuery";

import type {
    CheckoutSession,
    CheckoutSummary,
    ConfirmCheckoutResponse,
} from "../types";

export const checkoutApi = createApi({
    reducerPath: "checkoutApi",
    baseQuery,
    tagTypes: ["Checkout"],

    endpoints: (builder) => ({
        createSession: builder.mutation<CheckoutSession, void>({
            query: () => ({
                url: "/checkout",
                method: "POST",
            }),

            invalidatesTags: ["Checkout"],
        }),

        getSession: builder.query<CheckoutSession, string>({
            query: (sessionId) => `/checkout/${sessionId}`,

            providesTags: (_r, _e, sessionId) => [
                { type: "Checkout", id: sessionId },
            ],
        }),

        getSummary: builder.query<CheckoutSummary, string>({
            query: (sessionId) =>
                `/checkout/${sessionId}/summary`,

            providesTags: (_r, _e, sessionId) => [
                { type: "Checkout", id: sessionId },
            ],
        }),

        updateAddress: builder.mutation<
            CheckoutSession,
            { sessionId: string; addressId: string }
        >({
            query: ({ sessionId, addressId }) => ({
                url: `/checkout/${sessionId}/address`,
                method: "PATCH",
                body: { addressId },
            }),
            invalidatesTags: (_r, _e, { sessionId }) => [
                { type: "Checkout", id: sessionId },
            ],
        }),

        confirmCheckout: builder.mutation<ConfirmCheckoutResponse, string>({
            query: (sessionId) => ({
                url: `/checkout/${sessionId}/confirm`,
                method: "POST",
            }),
            invalidatesTags: ["Checkout"],
        }),

        expireSession: builder.mutation<
            CheckoutSession,
            string
        >({
            query: (sessionId) => ({
                url: `/checkout/${sessionId}/expire`,
                method: "PATCH",
            }),

            invalidatesTags: ["Checkout"],
        }),
    }),
});

export const {
    useCreateSessionMutation,
    useGetSessionQuery,
    useGetSummaryQuery,
    useUpdateAddressMutation,
    useConfirmCheckoutMutation,
    useExpireSessionMutation,
} = checkoutApi;