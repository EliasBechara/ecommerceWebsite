/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import { paymentApi } from "./paymentApi";
import { server } from "../../../tests/server";
import type { Payment, PaymentStatus } from "../types";

const createStore = () =>
    configureStore({
        reducer: {
            [paymentApi.reducerPath]: paymentApi.reducer,
        },
        middleware: (gDM) => gDM().concat(paymentApi.middleware),
    });

describe("paymentApi", () => {
    const baseUrl = "http://localhost/api/payments";

    // ==================== CREATE PAYMENT ====================
    describe("createPayment", () => {
        it("sends a POST request with the correct payment initiation payload", async () => {
            const paymentPayload = { orderId: "order_123", amount: 1500, method: "CREDIT_CARD" };
            const mockResponse: Payment = { id: "pay_xyz", status: "PENDING", amount: 1500 } as any;

            server.use(
                http.post(baseUrl, async ({ request }) => {
                    const body = await request.json();
                    expect(body).toEqual(paymentPayload);
                    return HttpResponse.json(mockResponse);
                })
            );

            const store = createStore();
            const result = await store.dispatch(
                paymentApi.endpoints.createPayment.initiate(paymentPayload as any)
            );

            expect(result.data).toEqual(mockResponse);
        });
    });

    // ==================== CONFIRM PAYMENT ====================
    describe("confirmPayment", () => {
        it("sends a PATCH request with confirmation details to the specific payment route", async () => {
            const confirmationPayload = { token: "tok_visa_999" };
            const mockResponse: Payment = { id: "pay_123", status: "COMPLETED", amount: 1500 } as any;

            server.use(
                http.patch(`${baseUrl}/pay_123/confirm`, async ({ request }) => {
                    const body = await request.json();
                    expect(body).toEqual(confirmationPayload);
                    return HttpResponse.json(mockResponse);
                })
            );

            const store = createStore();
            const result = await store.dispatch(
                paymentApi.endpoints.confirmPayment.initiate({
                    paymentId: "pay_123",
                    data: confirmationPayload as any,
                })
            );

            expect(result.data).toEqual(mockResponse);
        });
    });

    // ==================== GET PAYMENT STATUS ====================
    describe("getPaymentStatus", () => {
        it("fetches the real-time processing status of a payment", async () => {
            const mockResponse: PaymentStatus = { id: "pay_123", status: "PROCESSING" } as any;

            server.use(
                http.get(`${baseUrl}/pay_123/status`, () => HttpResponse.json(mockResponse))
            );

            const store = createStore();
            const result = await store.dispatch(
                paymentApi.endpoints.getPaymentStatus.initiate("pay_123")
            );

            expect(result.data).toEqual(mockResponse);
        });

        it("handles standard fallback error responses from failed checks", async () => {
            server.use(
                http.get(`${baseUrl}/pay_invalid/status`, () =>
                    HttpResponse.json({ message: "Invalid payment identifier" }, { status: 422 })
                )
            );

            const store = createStore();
            const result = await store.dispatch(
                paymentApi.endpoints.getPaymentStatus.initiate("pay_invalid")
            );

            expect(result.error).toEqual({
                status: 422,
                data: { message: "Invalid payment identifier" },
            });
        });
    });
});