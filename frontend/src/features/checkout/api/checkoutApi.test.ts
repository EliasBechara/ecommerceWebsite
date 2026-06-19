import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import { checkoutApi } from "./checkoutApi";
import { server } from "../../../tests/server";

const createStore = () =>
    configureStore({
        reducer: {
            [checkoutApi.reducerPath]: checkoutApi.reducer,
        },
        middleware: (gDM) => gDM().concat(checkoutApi.middleware),
    });

describe("checkoutApi", () => {
    const baseUrl = "http://localhost/api/checkout";

    // ==================== CREATE SESSION ====================
    describe("createSession", () => {
        it("sends a POST request to create a checkout session", async () => {
            const mockResponse = { id: "session_123", status: "open" };

            server.use(
                http.post(baseUrl, () => HttpResponse.json(mockResponse))
            );

            const store = createStore();
            const result = await store.dispatch(
                checkoutApi.endpoints.createSession.initiate()
            );

            expect(result.data).toEqual(mockResponse);
        });

        it("handles errors during session creation gracefully", async () => {
            server.use(
                http.post(baseUrl, () =>
                    HttpResponse.json({ message: "Bad Request" }, { status: 400 })
                )
            );

            const store = createStore();
            const result = await store.dispatch(
                checkoutApi.endpoints.createSession.initiate()
            );

            expect(result.error).toEqual({
                status: 400,
                data: { message: "Bad Request" },
            });
        });
    });

    // ==================== GET SESSION ====================
    describe("getSession", () => {
        it("fetches the checkout session by ID", async () => {
            const mockResponse = { id: "123", status: "open" };

            server.use(
                http.get(`${baseUrl}/123`, () => HttpResponse.json(mockResponse))
            );

            const store = createStore();
            const result = await store.dispatch(
                checkoutApi.endpoints.getSession.initiate("123")
            );

            expect(result.data).toEqual(mockResponse);
        });
    });

    // ==================== GET SUMMARY ====================
    describe("getSummary", () => {
        it("fetches the summary for a specific session", async () => {
            const mockResponse = { total: 1500, itemsCount: 3 };

            server.use(
                http.get(`${baseUrl}/123/summary`, () => HttpResponse.json(mockResponse))
            );

            const store = createStore();
            const result = await store.dispatch(
                checkoutApi.endpoints.getSummary.initiate("123")
            );

            expect(result.data).toEqual(mockResponse);
        });
    });

    // ==================== UPDATE ADDRESS ====================
    describe("updateAddress", () => {
        it("sends a PATCH request with the correct payload to update the address", async () => {
            const mockResponse = { id: "123", addressId: "addr_abc" };

            server.use(
                http.patch(`${baseUrl}/123/address`, async ({ request }) => {
                    const body = await request.json();
                    expect(body).toEqual({ addressId: "addr_abc" });
                    return HttpResponse.json(mockResponse);
                })
            );

            const store = createStore();
            const result = await store.dispatch(
                checkoutApi.endpoints.updateAddress.initiate({
                    sessionId: "123",
                    addressId: "addr_abc",
                })
            );

            expect(result.data).toEqual(mockResponse);
        });
    });

    // ==================== CONFIRM CHECKOUT ====================
    describe("confirmCheckout", () => {
        it("sends a POST request to confirm the checkout session", async () => {
            const mockResponse = { success: true, orderId: "order_999" };

            server.use(
                http.post(`${baseUrl}/123/confirm`, () => HttpResponse.json(mockResponse))
            );

            const store = createStore();
            const result = await store.dispatch(
                checkoutApi.endpoints.confirmCheckout.initiate("123")
            );

            expect(result.data).toEqual(mockResponse);
        });
    });

    // ==================== EXPIRE SESSION ====================
    describe("expireSession", () => {
        it("sends a PATCH request to manually expire the session", async () => {
            const mockResponse = { id: "123", status: "expired" };

            server.use(
                http.patch(`${baseUrl}/123/expire`, () => HttpResponse.json(mockResponse))
            );

            const store = createStore();
            const result = await store.dispatch(
                checkoutApi.endpoints.expireSession.initiate("123")
            );

            expect(result.data).toEqual(mockResponse);
        });

        it("normalizes structural network dropouts cleanly", async () => {
            server.use(
                http.patch(`${baseUrl}/123/expire`, () => HttpResponse.error())
            );

            const store = createStore();
            const result = await store.dispatch(
                checkoutApi.endpoints.expireSession.initiate("123")
            );

            expect(result.error).toEqual({
                status: "FETCH_ERROR",
                data: {
                    message: "Network error. Please check your connection.",
                },
            });
        });
    });
});