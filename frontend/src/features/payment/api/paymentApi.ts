import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../auth/api/baseQuery";

import type {
    CreatePaymentBody,
    ConfirmPaymentBody,
    Payment,
    PaymentStatus,
} from "../types";

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery,
    tagTypes: ["Payment"],

    endpoints: (builder) => ({
        createPayment: builder.mutation<
            Payment,
            CreatePaymentBody
        >({
            query: (body) => ({
                url: "/payments",
                method: "POST",
                body,
            }),

            invalidatesTags: ["Payment"],
        }),

        confirmPayment: builder.mutation<
            Payment,
            {
                paymentId: string;
                data: ConfirmPaymentBody;
            }
        >({
            query: ({ paymentId, data }) => ({
                url: `/payments/${paymentId}/confirm`,
                method: "PATCH",
                body: data,
            }),

            invalidatesTags: (_r, _e, { paymentId }) => [
                { type: "Payment", id: paymentId },
            ],
        }),

        getPaymentStatus: builder.query<
            PaymentStatus,
            string
        >({
            query: (paymentId) =>
                `/payments/${paymentId}/status`,

            providesTags: (_r, _e, paymentId) => [
                { type: "Payment", id: paymentId },
            ],
        }),
    }),
});

export const {
    useCreatePaymentMutation,
    useConfirmPaymentMutation,
    useGetPaymentStatusQuery,
} = paymentApi;