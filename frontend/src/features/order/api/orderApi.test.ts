/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";

import { orderApi } from "./orderApi";
import { server } from "../../../tests/server";
import type { Order } from "../types";

const createStore = () =>
    configureStore({
        reducer: {
            [orderApi.reducerPath]: orderApi.reducer,
        },
        middleware: (gDM) => gDM().concat(orderApi.middleware),
    });

describe("orderApi", () => {
    const baseUrl = "http://localhost/api/orders";

    // ==================== CREATE ORDER ====================
    describe("createOrder", () => {
        it("sends a POST request with the correct order payload", async () => {
            const orderPayload = { items: [{ productId: "p1", quantity: 2 }] };
            const mockResponse: Order = { id: "order_123", status: "PENDING", items: [] } as any;

            server.use(
                http.post(baseUrl, async ({ request }) => {
                    const body = await request.json();
                    expect(body).toEqual(orderPayload);
                    return HttpResponse.json(mockResponse);
                })
            );

            const store = createStore();
            const result = await store.dispatch(
                orderApi.endpoints.createOrder.initiate(orderPayload as any)
            );

            expect(result.data).toEqual(mockResponse);
        });
    });

    // ==================== GET ORDER BY ID ====================
    describe("getOrderById", () => {
        it("fetches a single order by its ID", async () => {
            const mockResponse: Order = { id: "order_123", status: "DELIVERED" } as any;

            server.use(
                http.get(`${baseUrl}/order_123`, () => HttpResponse.json(mockResponse))
            );

            const store = createStore();
            const result = await store.dispatch(
                orderApi.endpoints.getOrderById.initiate("order_123")
            );

            expect(result.data).toEqual(mockResponse);
        });

        it("returns a normalized 404 error if order is not found", async () => {
            server.use(
                http.get(`${baseUrl}/missing_id`, () =>
                    HttpResponse.json({ message: "Order not found" }, { status: 404 })
                )
            );

            const store = createStore();
            const result = await store.dispatch(
                orderApi.endpoints.getOrderById.initiate("missing_id")
            );

            expect(result.error).toEqual({
                status: 404,
                data: { message: "Order not found" },
            });
        });
    });

    // ==================== GET USER ORDERS ====================
    describe("getUserOrders", () => {
        it("fetches the list of orders belonging to the logged-in user", async () => {
            const mockResponse: Order[] = [
                { id: "order_1", status: "PAID" },
                { id: "order_2", status: "SHIPPED" },
            ] as any;

            server.use(
                http.get(`${baseUrl}/my-orders`, () => HttpResponse.json(mockResponse))
            );

            const store = createStore();
            const result = await store.dispatch(
                orderApi.endpoints.getUserOrders.initiate()
            );

            expect(result.data).toEqual(mockResponse);
        });

        it("handles an empty collection response seamlessly", async () => {
            server.use(
                http.get(`${baseUrl}/my-orders`, () => HttpResponse.json([]))
            );

            const store = createStore();
            const result = await store.dispatch(
                orderApi.endpoints.getUserOrders.initiate()
            );

            expect(result.data).toEqual([]);
        });
    });

    // ==================== UPDATE ORDER STATUS ====================
    describe("updateOrderStatus", () => {
        it("sends a PATCH request to update the status of a specific order", async () => {
            const statusUpdate = { status: "SHIPPED" };
            const mockResponse: Order = { id: "order_123", status: "SHIPPED" } as any;

            server.use(
                http.patch(`${baseUrl}/order_123/status`, async ({ request }) => {
                    const body = await request.json();
                    expect(body).toEqual(statusUpdate);
                    return HttpResponse.json(mockResponse);
                })
            );

            const store = createStore();
            const result = await store.dispatch(
                orderApi.endpoints.updateOrderStatus.initiate({
                    orderId: "order_123",
                    data: statusUpdate as any,
                })
            );

            expect(result.data).toEqual(mockResponse);
        });

        it("normalizes network failures elegantly", async () => {
            server.use(
                http.patch(`${baseUrl}/order_123/status`, () => HttpResponse.error())
            );

            const store = createStore();
            const result = await store.dispatch(
                orderApi.endpoints.updateOrderStatus.initiate({
                    orderId: "order_123",
                    data: { status: "SHIPPED" } as any,
                })
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